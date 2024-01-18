use std::sync::{Arc, Mutex};

use axum::{
    body::{to_bytes, Body},
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

use config::Config;
use lazy_static::lazy_static;
use redis::{Commands, Connection};
use tokio::sync::RwLock;
use tower_http::cors::{Any, CorsLayer};

type Client = hyper_util::client::legacy::Client<HttpsConnector<HttpConnector>, Body>;

lazy_static! {
    pub static ref SETTINGS: RwLock<Config> = RwLock::new(
        Config::builder()
            .add_source(config::File::with_name("./config"))
            .build()
            .unwrap()
    );
}

#[derive(Debug, Clone)]
struct Shared {
    map_url: String,
}

#[tokio::main]
async fn main() {
    let port = SETTINGS
        .read()
        .await
        .get_int("port")
        .expect("No port in Config");

    let redis_url = SETTINGS
        .read()
        .await
        .get_string("redis_url")
        .expect("No redis_url in Config");

    let map_url = SETTINGS
        .read()
        .await
        .get_string("map_url")
        .expect("No map_url in Config");

    let client: Client =
        hyper_util::client::legacy::Client::<(), ()>::builder(TokioExecutor::new())
            .build(HttpsConnector::new());

    let redis_client = redis::Client::open(redis_url).expect("Failed to open redis");
    let redis_conn = Arc::new(Mutex::new(
        redis_client
            .get_connection()
            .expect("Failed to connect to redis"),
    ));

    let cors_layer = CorsLayer::new().allow_origin(Any);
    let shared = Shared { map_url };

    let app = Router::new()
        .route("/*Path", get(wildcard_handler))
        .route("/", get(root_handler))
        .layer(cors_layer)
        .layer(Extension(shared))
        .layer(Extension(redis_conn))
        .with_state(client);

    let listener = tokio::net::TcpListener::bind(format!("127.0.0.1:{}", port))
        .await
        .unwrap();
    println!("Listening on {}", listener.local_addr().unwrap());
    axum::serve(listener, app).await.unwrap();
}

fn get_redis_content(conn: Arc<Mutex<Connection>>, path: &str) -> Option<Body> {
    let cached_content: redis::RedisResult<Vec<u8>> = conn.lock().unwrap().get(path);
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

async fn set_redis_content(conn: Arc<Mutex<Connection>>, path: &str, content: Body) {
    let byte_content: Vec<u8> = to_bytes(content, usize::MAX).await.unwrap().to_vec();

    let cache_time = SETTINGS
        .read()
        .await
        .get::<u64>("cache_time")
        .unwrap_or(3600);

    match conn
        .lock()
        .unwrap()
        .set_ex::<&str, Vec<u8>, String>(path, byte_content, cache_time)
    {
        Ok(_) => (),
        Err(err) => println!("Failed to set {} key in redis due to: {}", path, err),
    }
}

async fn internal_handler(
    State(client): State<Client>,
    Extension(redis_conn): Extension<Arc<Mutex<Connection>>>,
    mut req: Request,
) -> Result<Response, StatusCode> {
    // Redis cache handling
    let path = req.uri().path().to_owned();
    let cached = get_redis_content(redis_conn.clone(), &path);

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
        .insert(USER_AGENT, HeaderValue::from_static("90gqGuessr-proxy"));

    let mut res = client
        .request(req)
        .await
        .map_err(|_| StatusCode::BAD_REQUEST)?
        .into_response();

    // Handle redis cache set
    let body = std::mem::replace(res.body_mut(), Body::empty());

    // Read the body into a Vec<u8>
    let bytes = to_bytes(body, usize::MAX).await.unwrap();

    // Create two new Body instances from the Bytes
    let body1 = Body::from(bytes.clone());
    let body2 = Body::from(bytes);

    // Replace the original body with one of the clones
    *res.body_mut() = body1;

    set_redis_content(redis_conn, &path, body2).await;

    Ok(res)
}

async fn root_handler(
    State(client): State<Client>,
    Extension(redis_conn): Extension<Arc<Mutex<Connection>>>,
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
    Extension(redis_conn): Extension<Arc<Mutex<Connection>>>,
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
