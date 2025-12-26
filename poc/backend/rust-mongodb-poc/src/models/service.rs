use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct Action {
    pub name: String,
    pub description: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Reaction {
    pub name: String,
    pub description: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Service {
    pub name: String,
    pub actions: Vec<Action>,
    pub reactions: Vec<Reaction>,
}

impl Service {
    pub fn facebook_service() -> Self {
        Self {
            name: "facebook".to_string(),
            actions: vec![
                Action {
                    name: "new_message_in_group".to_string(),
                    description: "A new message is posted in the group".to_string(),
                },
                Action {
                    name: "new_message_inbox".to_string(),
                    description: "A new private message is received by the user".to_string(),
                },
            ],
            reactions: vec![
                Reaction {
                    name: "like_message".to_string(),
                    description: "The user likes a message".to_string(),
                },
            ],
        }
    }
}
