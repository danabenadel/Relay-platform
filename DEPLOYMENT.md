# Deployment Guide - Relay Platform

## Architecture de déploiement recommandée

### Frontend → Vercel
### Backend → Railway/Render
### Database → Supabase/Neon/Railway

---

## 1. Déployer le Frontend sur Vercel

### Étape 1 : Préparer le frontend

```bash
cd frontend
npm install
```

### Étape 2 : Déployer avec Vercel CLI

```bash
# Installer Vercel CLI
npm install -g vercel

# Login
vercel login

# Déployer
vercel --prod
```

### Étape 3 : Configurer les variables d'environnement

Dans le dashboard Vercel (Settings → Environment Variables) :

```env
API_BASE_URL=https://your-backend-url.com
```

### Étape 4 : Build settings sur Vercel

- **Framework Preset**: Nuxt.js
- **Build Command**: `npm run build`
- **Output Directory**: `.output/public`
- **Install Command**: `npm install`

---

## 2. Déployer le Backend sur Railway

### Option A : Via CLI

```bash
# Installer Railway CLI
npm install -g @railway/cli

# Login
railway login

# Naviguer vers le backend
cd backend

# Initialiser le projet
railway init

# Déployer
railway up

# Ajouter PostgreSQL
railway add --database postgres
```

### Option B : Via GitHub

1. Connectez votre repo sur https://railway.app
2. Sélectionnez le dossier `backend`
3. Ajoutez PostgreSQL depuis l'onglet "Database"
4. Les variables d'environnement seront auto-configurées

### Variables d'environnement Railway

Railway génère automatiquement `DATABASE_URL`. Ajoutez manuellement :

```env
NODE_ENV=production
PORT=8080
ENCRYPTION_KEY=your-32-character-key

# OAuth credentials
GOOGLE_CLIENT_ID=xxx
GOOGLE_CLIENT_SECRET=xxx
GOOGLE_REDIRECT_URI=https://your-backend.railway.app/auth/oauth/google/callback

# Répétez pour tous les autres services OAuth
# (GitHub, Spotify, Discord, etc.)

OPENAI_API_KEY=xxx
TELEGRAM_BOT_TOKEN=xxx
```

---

## 3. Alternative : Déployer le Backend sur Render

### Étape 1 : Créer un Web Service

1. Allez sur https://render.com
2. Connectez votre repo GitHub
3. Créez un nouveau "Web Service"
4. Root Directory: `backend`
5. Build Command: `npm install && npx prisma generate && npm run build`
6. Start Command: `npm start`

### Étape 2 : Ajouter PostgreSQL

1. Créez une "PostgreSQL" database sur Render
2. Copiez l'URL de connexion interne
3. Ajoutez-la comme variable `DATABASE_URL`

### Étape 3 : Variables d'environnement

Ajoutez toutes les variables du fichier `.env.example`

---

## 4. Déployer la Base de Données

### Option A : Utiliser la DB fournie par Railway/Render

✅ Automatique avec le déploiement backend

### Option B : PostgreSQL managé externe

**Supabase** (gratuit, recommandé) :
1. Créez un projet sur https://supabase.com
2. Copiez la connection string PostgreSQL
3. Utilisez-la comme `DATABASE_URL`

**Neon** (serverless PostgreSQL) :
1. Créez une DB sur https://neon.tech
2. Copiez la connection string
3. Parfait pour les projets avec trafic variable

**DigitalOcean Managed Database** :
- Plus cher mais très stable
- Recommandé pour la production

---

## 5. Configuration Prisma pour la production

Assurez-vous que votre `package.json` backend contient :

```json
{
  "scripts": {
    "build": "tsc",
    "start": "node dist/index.js",
    "postinstall": "prisma generate",
    "migrate": "prisma migrate deploy"
  }
}
```

Pour appliquer les migrations en production :

```bash
# Sur Railway
railway run npm run migrate

# Sur Render (dans le build command)
npx prisma migrate deploy
```

---

## 6. Sécurité en Production

### Variables critiques à configurer :

```env
NODE_ENV=production
ENCRYPTION_KEY=<générer avec: openssl rand -base64 32 | cut -c1-32>
DATABASE_URL=<votre URL de production>
```

### CORS Configuration

Mettez à jour votre backend pour accepter uniquement votre frontend Vercel :

```typescript
// backend/src/index.ts
app.use(cors({
  origin: process.env.FRONTEND_URL || 'https://your-app.vercel.app',
  credentials: true
}));
```

Ajoutez `FRONTEND_URL` dans vos variables d'environnement.

---

## 7. Monitoring et Logs

### Railway
- Logs en temps réel : `railway logs`
- Dashboard : https://railway.app

### Render
- Logs disponibles dans le dashboard
- Alertes configurables

### Vercel
- Analytics intégré
- Logs de build et runtime disponibles

---

## 8. Workflow de déploiement continu

### Configuration Git

1. **Main branch** → Production automatique
2. **Dev branch** → Preview deployments

### Sur Vercel :
- Auto-deploy activé par défaut sur push

### Sur Railway/Render :
- Configurez le déploiement automatique depuis GitHub
- Settings → "Auto Deploy" activé

---

## 9. Tests avant déploiement

```bash
# Backend
cd backend
npm run build
npm run test

# Frontend
cd frontend
npm run build
npm run test
```

---

## 10. Checklist de déploiement

- [ ] Base de données PostgreSQL créée
- [ ] Variables d'environnement configurées (backend)
- [ ] Variables d'environnement configurées (frontend)
- [ ] Migrations Prisma appliquées
- [ ] OAuth redirect URIs mis à jour (Google, GitHub, etc.)
- [ ] CORS configuré avec l'URL frontend
- [ ] Tests réussis
- [ ] SSL/HTTPS activé (automatique sur Vercel/Railway)
- [ ] Monitoring configuré

---

## Coûts estimés

| Service | Free Tier | Paid |
|---------|-----------|------|
| Vercel (Frontend) | 100 GB bandwidth/mois | $20/mois |
| Railway (Backend + DB) | $5 crédit/mois | $10-20/mois |
| Supabase (DB seule) | 500 MB gratuit | $25/mois |
| Render (Backend + DB) | Gratuit avec limitations | $7-15/mois |

**Recommandation** : Vercel (free) + Railway (free tier) = $0/mois pour démarrer

---

## Support

Pour des questions spécifiques, consultez :
- [Vercel Docs](https://vercel.com/docs)
- [Railway Docs](https://docs.railway.app)
- [Prisma Production Guide](https://www.prisma.io/docs/guides/deployment)
