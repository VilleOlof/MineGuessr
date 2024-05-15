use std::{
    fs,
    sync::{Arc, Mutex},
};

use axum::{
    body::{to_bytes, Body, Bytes},
    extract::{Request, State},
    http::{uri::Uri, HeaderValue},
    response::{IntoResponse, Response},
    routing::get,
    Extension, Router,
};
use hyper::{
    header::{CACHE_STATUS, CONTENT_TYPE, USER_AGENT},
    StatusCode,
};
use hyper_tls::HttpsConnector;
use hyper_util::{client::legacy::connect::HttpConnector, rt::TokioExecutor};

use lazy_static::lazy_static;
use redis::{Commands, Connection};
use serde::{Deserialize, Serialize};
use tokio::sync::RwLock;
use tower_http::cors::{Any, CorsLayer};

type Client = hyper_util::client::legacy::Client<HttpsConnector<HttpConnector>, Body>;

#[derive(Debug, Serialize, Deserialize)]
pub struct Config {
    port: u16,
    map_url: String,
    redis_url: Option<String>,
    cache_time: Option<u64>,
}

lazy_static! {
    pub static ref SETTINGS: RwLock<Config> = RwLock::new(
        toml::from_str(&fs::read_to_string("config.toml").expect("Failed to read config.toml"))
            .expect("Failed to parse config.toml")
    );
}

#[derive(Debug, Clone)]
struct Shared {
    map_url: String,
}

#[tokio::main]
async fn main() {
    let client: Client =
        hyper_util::client::legacy::Client::<(), ()>::builder(TokioExecutor::new())
            .build(HttpsConnector::new());

    let redis_conn = match SETTINGS.read().await.redis_url.clone() {
        Some(url) => {
            let redis_client = redis::Client::open(url).expect("Failed to open redis");

            Arc::new(Mutex::new(Some(
                redis_client
                    .get_connection()
                    .expect("Failed to connect to redis"),
            )))
        }
        None => Arc::new(Mutex::new(None)),
    };

    let cors_layer = CorsLayer::new().allow_origin(Any);
    let shared = Shared {
        map_url: SETTINGS.read().await.map_url.clone(),
    };

    let app = Router::new()
        .route("/*Path", get(wildcard_handler))
        .route("/", get(root_handler))
        .layer(cors_layer)
        .layer(Extension(shared))
        .layer(Extension(redis_conn))
        .with_state(client);

    let listener =
        tokio::net::TcpListener::bind(format!("127.0.0.1:{}", SETTINGS.read().await.port))
            .await
            .unwrap();
    println!("Listening on {}", listener.local_addr().unwrap());
    axum::serve(listener, app).await.unwrap();
}

fn get_redis_content(conn: &mut Connection, path: &str) -> Option<Body> {
    let cached_content: redis::RedisResult<Vec<u8>> = conn.get(path);
    match cached_content {
        Ok(content) => {
            if content.is_empty() {
                return None;
            }

            return Some(Body::from(content));
        }
        Err(_) => return None,
    }
}

async fn set_redis_content(conn: Arc<Mutex<Option<Connection>>>, path: &str, content: Bytes) {
    let cache_time = SETTINGS.read().await.cache_time.unwrap_or(3600);

    match conn
        .lock()
        .unwrap()
        .as_mut()
        .unwrap()
        .set_ex::<&str, Vec<u8>, String>(path, content.to_vec(), cache_time)
    {
        Ok(_) => (),
        Err(err) => println!("Failed to set {} key in redis due to: {}", path, err),
    }
}

async fn internal_handler(
    State(client): State<Client>,
    Extension(redis_conn): Extension<Arc<Mutex<Option<Connection>>>>,
    mut req: Request,
) -> Result<Response, StatusCode> {
    // Redis cache handling
    let path = req.uri().path().to_owned();
    let cached = match redis_conn.lock().unwrap().as_mut() {
        Some(conn) => get_redis_content(conn, &path),
        None => None,
    };

    if let Some(cache) = cached {
        let mut res = Response::new(cache);
        res.headers_mut()
            .insert(CACHE_STATUS, HeaderValue::from_static("Cache Hit"));

        // Copy the content type headers
        let req_type = req.headers().get(CONTENT_TYPE);
        if let Some(r_type) = req_type {
            if !r_type.is_empty() {
                res.headers_mut().insert(CONTENT_TYPE, r_type.clone());
            }
        } else {
            let mime_type = match &path {
                x if x.contains("js") => Some("text/javascript"),
                x if x.contains("png") => Some("image/png"),
                x if x.contains("json") => Some("application/json"),
                _ => None,
            };

            if let Some(mime) = mime_type {
                res.headers_mut()
                    .insert(CONTENT_TYPE, HeaderValue::from_static(mime));
            }
        }

        return Ok(res);
    }

    // No cache, requesting data
    req.headers_mut().clear();
    req.headers_mut()
        .insert(USER_AGENT, HeaderValue::from_static("MineGuessr-proxy"));

    let mut res = client
        .request(req)
        .await
        .map_err(|_| StatusCode::BAD_REQUEST)?
        .into_response();

    // Handle redis cache set
    let body = std::mem::replace(res.body_mut(), Body::empty());

    let bytes = to_bytes(body, usize::MAX).await.unwrap();

    let body1 = Body::from(bytes.clone());
    let body2 = Body::from(bytes);

    *res.body_mut() = body1;

    tokio::task::spawn(async move {
        if redis_conn.lock().unwrap().is_some() {
            let bytes = to_bytes(body2, usize::MAX).await.unwrap();
            set_redis_content(redis_conn, &path, bytes).await;
        }
    });

    Ok(res)
}

async fn root_handler(
    State(client): State<Client>,
    Extension(redis_conn): Extension<Arc<Mutex<Option<Connection>>>>,
    Extension(shared): Extension<Shared>,
    mut req: Request,
) -> Result<Response, StatusCode> {
    *req.uri_mut() = Uri::try_from(shared.map_url).unwrap();

    // Insert html content type since its root page
    req.headers_mut()
        .insert(CONTENT_TYPE, HeaderValue::from_static("text/html"));

    internal_handler(State(client), Extension(redis_conn), req).await
}

async fn wildcard_handler(
    State(client): State<Client>,
    Extension(redis_conn): Extension<Arc<Mutex<Option<Connection>>>>,
    Extension(shared): Extension<Shared>,
    mut req: Request,
) -> Result<Response, StatusCode> {
    let path = req.uri().path();
    let path_query = req
        .uri()
        .path_and_query()
        .map(|v| v.as_str())
        .unwrap_or(path);

    let uri = format!("{}{}", shared.map_url, path_query);

    *req.uri_mut() = Uri::try_from(uri).unwrap();

    internal_handler(State(client), Extension(redis_conn), req).await
}
