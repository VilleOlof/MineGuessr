use axum::{
    body::Body,
    extract::{Request, State},
    http::{uri::Uri, HeaderValue},
    response::{IntoResponse, Response},
    routing::get,
    Router,
};
use hyper::{
    header::{ACCESS_CONTROL_ALLOW_ORIGIN, USER_AGENT},
    StatusCode,
};
use hyper_tls::HttpsConnector;
use hyper_util::{client::legacy::connect::HttpConnector, rt::TokioExecutor};

use config::Config;
use lazy_static::lazy_static;
use tokio::sync::RwLock;
use tower_http::cors::{Any, CorsLayer};

type Client = hyper_util::client::legacy::Client<HttpsConnector<HttpConnector>, Body>;

lazy_static! {
    pub static ref SETTINGS: RwLock<Config> = RwLock::new(
        Config::builder()
            .add_source(config::File::with_name("config"))
            .build()
            .unwrap()
    );
}

#[tokio::main]
async fn main() {
    let port = SETTINGS
        .read()
        .await
        .get_int("port")
        .expect("No port in Config");

    let client: Client =
        hyper_util::client::legacy::Client::<(), ()>::builder(TokioExecutor::new())
            .build(HttpsConnector::new());

    let cors_layer = CorsLayer::new().allow_origin(Any);

    let app = Router::new()
        .route("/*Path", get(wildcard_handler))
        .route("/", get(root_handler))
        .layer(cors_layer)
        .with_state(client);

    let listener = tokio::net::TcpListener::bind(format!("127.0.0.1:{}", port))
        .await
        .unwrap();
    println!("listening on {}", listener.local_addr().unwrap());
    axum::serve(listener, app).await.unwrap();
}

async fn internal_handler(
    State(client): State<Client>,
    mut req: Request,
) -> Result<Response, StatusCode> {
    req.headers_mut().clear();
    req.headers_mut()
        .insert(USER_AGENT, HeaderValue::from_static("90gqGuessr-proxy"));

    let res = Ok(client
        .request(req)
        .await
        .map_err(|_| StatusCode::BAD_REQUEST)?
        .into_response());

    res
}

async fn root_handler(
    State(client): State<Client>,
    mut req: Request,
) -> Result<Response, StatusCode> {
    let map_url = SETTINGS
        .read()
        .await
        .get_string("map_url")
        .expect("No map_url in Config");

    *req.uri_mut() = Uri::try_from(map_url).unwrap();

    internal_handler(State(client), req).await
}

async fn wildcard_handler(
    State(client): State<Client>,
    mut req: Request,
) -> Result<Response, StatusCode> {
    let path = req.uri().path();
    let path_query = req
        .uri()
        .path_and_query()
        .map(|v| v.as_str())
        .unwrap_or(path);

    let map_url = SETTINGS
        .read()
        .await
        .get_string("map_url")
        .expect("No map_url in Config");

    let uri = format!("{}{}", map_url, path_query);

    *req.uri_mut() = Uri::try_from(uri).unwrap();

    internal_handler(State(client), req).await
}
