use mongodb::Database;
use std::sync::Arc;
use std::convert::Infallible;
use crate::models::user::User;

pub async fn get_users(db: Arc<Database>) -> Result<impl warp::Reply, Infallible> {
    use futures::stream::StreamExt;
    
    let collection = db.collection::<User>("users");
    let mut users = Vec::new();
    
    match collection.find(None, None).await {
        Ok(mut cursor) => {
            while let Some(user) = cursor.next().await {
                if let Ok(u) = user {
                    users.push(u);
                }
            }
        },
        Err(_) => {}
    }
    
    Ok(warp::reply::json(&serde_json::json!({
        "users": users
    })))
}
