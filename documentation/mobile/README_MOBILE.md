# 📱 Guide Développement Mobile

## Commandes

```bash
make mobile    # Configure ngrok et met à jour leenv
make run       # Lance Flutter avec l'URL ngrok
make url       # Affiche l'URL actuelle
make logs      # Logs du backend
make stop      # Arrête tout
```

## Workflow

### 1. Démarrer Docker
```bash
docker-compose up -d
```

### 2. Lancer ngrok
```bash
make mobile
```

### 3. Configurer Google OAuth (première fois seulement)
- Copier l'URL affichée
- Aller sur : https://console.cloud.google.com/apis/credentials
- Ajouter l'URL dans les URI de redirection : `https://xxx.ngrok-free.dev/auth/oauth/google/callback`

### 4. Lancer l'app
```bash
make run
```

L'URL ngrok change à chaque `make mobile` (compte gratuit)
