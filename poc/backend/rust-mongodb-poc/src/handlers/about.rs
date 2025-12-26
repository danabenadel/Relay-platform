use serde_json::json;
use std::net::SocketAddr;

pub fn about_json(addr: Option<SocketAddr>) -> impl warp::Reply {
    let client_ip = addr
        .map(|addr| addr.ip().to_string())
        .unwrap_or_else(|| "127.0.0.1".to_string());

    warp::reply::json(&json!({
        "client": {
            "host": client_ip
        },
        "server": {
            "current_time": chrono::Utc::now().timestamp(),
            "services": [{
                "name": "facebook",
                "actions": [{
                    "name": "new_message_in_group",
                    "description": "A new message is posted in the group"
                }],
                "reactions": [{
                    "name": "like_message",
                    "description": "The user likes a message"
                }]
            }]
        }
    }))
}
