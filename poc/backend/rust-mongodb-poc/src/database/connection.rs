use mongodb::{Client, Database};
use std::error::Error;

pub async fn connect() -> Result<Database, Box<dyn Error>> {
    // URL de connexion MongoDB
    let uri = "mongodb://admin:password@localhost:27017";
    
    println!("🔌 Connexion à MongoDB...");
    
    // Créer le client MongoDB
    let client = Client::with_uri_str(uri).await?;
    
    // Tester la connexion
    client
        .database("admin")
        .run_command(mongodb::bson::doc! {"ping": 1}, None)
        .await?;
    
    println!("✅ MongoDB connecté avec succès !");
    
    // Retourner la base de données du projet
    Ok(client.database("action_reaction_poc"))
}
