
const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth');

const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());

app.use('/auth', authRoutes);

app.get('/', (req, res) => {
  res.json({ 
    message: 'POC AREA - PostgreSQL + Prisma',
    database: 'PostgreSQL',
    orm: 'Prisma',
    cache: 'Redis (ready)',
    routes: {
      'POST /auth/register': 'Créer un compte',
      'POST /auth/login': 'Se connecter', 
      'GET /auth/profile': 'Voir son profil (protégé)',
      'GET /auth/users': 'Liste des utilisateurs',
      'GET /about.json': 'Info serveur AREA'
    }
  });
});

app.get('/about.json', (req, res) => {
  res.json({
    client: { 
      host: req.ip || 'unknown'
    },
    server: {
      current_time: Math.floor(Date.now() / 1000),
      services: [
        {
          name: 'gmail',
          actions: [
            {
              name: 'new_email_received',
              description: 'A new email is received'
            }
          ],
          reactions: []
        },
        {
          name: 'slack',
          actions: [],
          reactions: [
            {
              name: 'send_message',
              description: 'Send a message to a channel'
            }
          ]
        }
      ]
    }
  });
});

app.use((error, req, res, next) => {
  console.error('Server error:', error);
  res.status(500).json({ error: 'Internal server error' });
});

app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Route not found',
    available_routes: [
      'GET /',
      'POST /auth/register',
      'POST /auth/login', 
      'GET /auth/profile',
      'GET /auth/users',
      'GET /about.json'
    ]
  });
});


app.listen(PORT, () => {
  console.log(` Serveur AREA POC démarré sur http://localhost:${PORT}`);
  console.log(' Database: PostgreSQL + Prisma');
  console.log(' Cache: Redis (ready)');
  console.log(' Prisma Studio: npm run db:studio');
  console.log('');
  console.log(' Routes disponibles:');
  console.log('   GET  /                    - Accueil');
  console.log('   POST /auth/register       - Inscription');
  console.log('   POST /auth/login          - Connexion');
  console.log('   GET  /auth/profile        - Profil (protégé)');
  console.log('   GET  /auth/users          - Liste utilisateurs');
  console.log('   GET  /about.json          - Info serveur AREA');
  console.log('');
  console.log(' Test rapide:');
  console.log('   curl http://localhost:8080/auth/users');
});
