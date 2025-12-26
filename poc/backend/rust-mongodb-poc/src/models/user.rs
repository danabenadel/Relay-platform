use serde::{Deserialize, Serialize};
use mongodb::bson::oid::ObjectId;

#[derive(Debug, Serialize, Deserialize)]
pub struct User {
    #[serde(rename = "_id", skip_serializing_if = "Option::is_none")]
    pub id: Option<ObjectId>,
    pub name: String,
    pub email: String,
    pub created_at: chrono::DateTime<chrono::Utc>,
}

impl User {
    pub fn new(name: String, email: String) -> Self {
        Self {
            id: None,
            name,
            email,
            created_at: chrono::Utc::now(),
        }
    }
}
