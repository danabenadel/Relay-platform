mod models;
mod handlers;
mod database;

use warp::Filter;
use std::sync::Arc;

#[tokio::main]
async fn main() {
    println!("🦀 ACTION-REACTION POC Rust + MongoDB");
    
    // Connexion à la base de données
    let db = match database::connection::connect().await {
        Ok(database) => {
            println!("✅ MongoDB connecté !");
            
            // Test d'insertion d'un utilisateur
            test_mongodb(&database).await;
            
            Arc::new(database)
        },
        Err(e) => {
            println!("❌ Erreur MongoDB: {}", e);
            std::process::exit(1);
        }
    };

    // Routes API
    let routes = routes(db);

    println!("🚀 Serveur démarré sur http://localhost:8080");
    warp::serve(routes)
        .run(([127, 0, 0, 1], 8080))
        .await;
}

// REMPLACEZ CETTE FONCTION ⬇️
fn routes(
    db: Arc<mongodb::Database>
) -> impl Filter<Extract = impl warp::Reply, Error = warp::Rejection> + Clone {
    
    // Route racine
    let root = warp::path::end()
        .map(|| {
            warp::reply::json(&serde_json::json!({
                "message": "ACTION-REACTION POC Rust + MongoDB",
                "status": "active",
                "version": "1.0.0"
            }))
        });

    // Route about.json
    let about = warp::path("about.json")
        .and(warp::get())
        .and(warp::addr::remote())
        .map(handlers::about::about_json);

    // Routes auth
    let auth = warp::path("auth")
        .and(warp::path("users"))
        .and(warp::get())
        .and(with_db(db.clone()))
        .and_then(handlers::auth::get_users);

    // Combiner toutes les routes sous /api
    warp::path("api")
        .and(root.or(about).or(auth))
        .with(warp::cors().allow_any_origin())
}

fn with_db(
    db: Arc<mongodb::Database>
) -> impl Filter<Extract = (Arc<mongodb::Database>,), Error = std::convert::Infallible> + Clone {
    warp::any().map(move || db.clone())
}

async fn test_mongodb(db: &mongodb::Database) {
    use models::user::User;
    
    let collection = db.collection::<User>("users");
    
    // Créer un utilisateur de test
    let test_user = User::new(
        "John Doe".to_string(),
        "john@example.com".to_string(),
    );
    
    // Insérer en base
    match collection.insert_one(&test_user, None).await {
        Ok(result) => println!("✅ Utilisateur inséré: {:?}", result.inserted_id),
        Err(e) => println!("❌ Erreur insertion: {}", e),
    }
    
    // Lire les utilisateurs
    match collection.find(None, None).await {
        Ok(mut cursor) => {
            use futures::stream::StreamExt;
            while let Some(user) = cursor.next().await {
                match user {
                    Ok(u) => println!("👤 Utilisateur trouvé: {}", u.name),
                    Err(e) => println!("❌ Erreur lecture: {}", e),
                }
            }
        },
        Err(e) => println!("❌ Erreur find: {}", e),
    }
}
