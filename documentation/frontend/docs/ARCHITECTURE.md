# Architecture Frontend - AREA Platform

## Table des matières

1. [Vue d'ensemble](#vue-densemble)
2. [Stack Technique](#stack-technique)
3. [Structure des Dossiers](#structure-des-dossiers)
4. [Patterns Architecturaux](#patterns-architecturaux)
5. [Gestion de l'État](#gestion-de-létat)
6. [Routing & Navigation](#routing--navigation)
7. [Authentification](#authentification)
8. [Intégration API](#intégration-api)

---

## Vue d'ensemble

L'application AREA (Action-REAction) est une plateforme d'automatisation qui permet aux utilisateurs de créer des workflows automatisés en connectant différents services (Spotify, Discord, GitHub, Google, Reddit, etc.).

### Architecture Globale

```
┌─────────────────────────────────────────────────────┐
│                   Frontend Layer                     │
│  ┌─────────────┐              ┌─────────────┐      │
│  │  Web (Nuxt) │              │   Mobile    │      │
│  │  Vue.js 3   │              │  (Flutter)  │      │
│  └─────────────┘              └─────────────┘      │
└─────────────────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────┐
│                   API Gateway                        │
│              Bearer Token Authentication             │
└─────────────────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────┐
│                Backend Microservices                 │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐          │
│  │ Spotify  │  │ Discord  │  │  GitHub  │  ...     │
│  └──────────┘  └──────────┘  └──────────┘          │
└─────────────────────────────────────────────────────┘
```

---

## Stack Technique

### Web Frontend

| Technologie | Version | Usage |
|------------|---------|-------|
| **Nuxt.js** | 4.x | Framework Vue.js full-stack |
| **Vue.js** | 3.x | Framework JavaScript réactif |
| **TypeScript** | 5.x | Typage statique |
| **Tailwind CSS** | 4.1 | Framework CSS utilitaire |
| **@nuxt/ui** | Latest | Bibliothèque de composants UI |
| **Vite** | Latest | Build tool & dev server |

### Mobile Frontend

| Technologie | Version | Usage |
|------------|---------|-------|
| **Flutter** | Latest | Framework mobile cross-platform |
| **Dart** | Latest | Langage de programmation |
| **Material Design** | Latest | Design system |
| **http** | Latest | Client HTTP |
| **shared_preferences** | Latest | Stockage local |

---

## Structure des Dossiers

### Web (`/frontend/app/`)

```
app/
├── assets/                    # Ressources statiques
│   ├── css/
│   │   └── main.css          # Styles globaux + design tokens
│   └── logo.jpeg
│
├── components/               # Composants Vue réutilisables
│   ├── AREA/                #  Composants de configuration des services
│   │   ├── SpotifyActionConfig.vue
│   │   ├── SpotifyReactionConfig.vue
│   │   ├── DiscordActionConfig.vue
│   │   ├── DiscordReactionConfig.vue
│   │   ├── GitHubActionConfig.vue
│   │   ├── GitHubReactionConfig.vue
│   │   ├── GitLabActionConfig.vue
│   │   ├── GitLabReactionConfig.vue
│   │   ├── RedditActionConfig.vue
│   │   ├── RedditReactionConfig.vue
│   │   ├── GoogleActionConfig.vue
│   │   ├── GoogleReactionConfig.vue
│   │   ├── YouTubeActionConfig.vue
│   │   ├── YouTubeReactionConfig.vue
│   │   ├── OpenAIReactionConfig.vue
│   │   └── TimerActionConfig.vue
│   │
│   ├── Areas/               # Composants liés aux AREAs
│   │   └── AreaCard.vue    # Carte d'affichage d'une AREA
│   │
│   ├── Dashboard/           # Composants du tableau de bord
│   │   ├── ActivityTimeline.vue
│   │   ├── AreaSuggestions.vue
│   │   └── QuickStats.vue
│   │
│   ├── Services/           # Composants de gestion des services
│   │   ├── AvailableServiceCard.vue
│   │   └── ConnectedServiceCard.vue
│   │
│   ├── Shared/             # Composants partagés
│   │
│   ├── Header.vue          # En-tête de l'application
│   ├── Footer.vue          # Pied de page
│   ├── LoginForm.vue       # Formulaire de connexion
│   ├── AddServiceModal.vue # Modal d'ajout de service
│   └── AreaBuilder.vue     # Constructeur d'AREA
│
├── composables/            #  Logique métier réutilisable
│   ├── useApi.ts          # Client API avec intercepteurs
│   ├── useAuthreal.ts     # Gestion authentification
│   └── useAreas.ts        # Gestion des AREAs
│
├── middleware/            # Middlewares de route
│   ├── auth.ts           # Protection des routes authentifiées
│   └── guest.ts          # Protection des routes publiques
│
├── pages/                #  Pages (routing automatique)
│   ├── index.vue        # Page d'accueil
│   ├── login.vue        # Connexion
│   ├── register.vue     # Inscription
│   ├── dashboard.vue    # Tableau de bord
│   ├── profile.vue      # Profil utilisateur
│   ├── services.vue     # Gestion des services
│   │
│   ├── areas/           # Module AREAs
│   │   ├── index.vue   # Liste des AREAs
│   │   └── create.vue  #  Wizard de création (3 étapes)
│   │
│   ├── auth/           # Module authentification
│   │   └── callback.vue # Callback OAuth
│   │
│   └── oauth/          # Module OAuth
│       └── service-connected.vue # Succès de connexion
│
├── plugins/            # Plugins Nuxt
│   └── api_client.ts  # Initialisation du client API
│
├── utils/             # Utilitaires
│   ├── constants.ts  # Constantes globales
│   ├── helpers.ts    # Fonctions utilitaires
│   └── validation.ts # Règles de validation
│
├── layouts/          # Layouts de l'application
│   └── default.vue  # Layout par défaut (Header + contenu + Footer)
│
└── app.vue          # Composant racine
```

### Mobile (`/mobile/lib/`)

```
lib/
├── main.dart                 # Point d'entrée
├── app.dart                  # Configuration de l'app
├── router.dart               # Configuration du routing
│
├── pages/                    # Pages de l'application
│   ├── welcome_page.dart
│   ├── login_page.dart
│   ├── register_page.dart
│   ├── services_page.dart
│   ├── my_areas_page.dart
│   └── create_area_page.dart
│
├── services/                 # Services métier
│   ├── http_service.dart    # Client HTTP avec auth
│   └── oauth_service.dart   # Gestion OAuth
│
├── providers/                # State management
│   └── accessibility_provider.dart # Modes accessibilité
│
├── widgets/                  # Composants réutilisables
│   ├── accessibility_button.dart
│   ├── nav_drawer.dart
│   ├── page_with_accessibility.dart
│   └── accessible_components.dart
│
├── theme/                    # Thème et design system
│   ├── theme.dart           # Configuration ThemeData
│   ├── colors.dart          # Palette de couleurs
│   └── typography.dart      # Typographie
│
├── config/                   # Configuration
│   ├── api_config.dart
│   ├── environment.dart
│   └── constants.dart
│
└── utils/
    └── service_icons.dart   # Icônes des services
```

---

## Patterns Architecturaux

### 1. Composition API (Vue 3)

Toutes les pages et composants utilisent la Composition API avec `<script setup>` :

```vue
<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';

// Props avec typage TypeScript
const props = defineProps<{
  area: Area;
  isActive: boolean;
}>();

// Emits typés
const emit = defineEmits<{
  toggle: [id: string];
  delete: [id: string];
}>();

// État réactif
const loading = ref(false);
const data = ref<Area[]>([]);

// Computed
const filteredData = computed(() => {
  return data.value.filter(item => item.isActive);
});

// Méthodes
const loadData = async () => {
  loading.value = true;
  try {
    const { $api } = useNuxtApp();
    data.value = await $api('/areas');
  } finally {
    loading.value = false;
  }
};

// Lifecycle
onMounted(() => {
  loadData();
});
</script>
```

### 2. Composables Pattern

Les composables encapsulent la logique métier réutilisable :

**Structure d'un composable :**

```typescript
// composables/useFeature.ts
export const useFeature = () => {
  // État
  const state = useState<Data>('feature.data', () => null);

  // Computed
  const isReady = computed(() => !!state.value);

  // Méthodes
  const load = async () => {
    const { $api } = useNuxtApp();
    state.value = await $api('/endpoint');
  };

  // Retourner l'API publique
  return {
    state,
    isReady,
    load,
  };
};
```

**Utilisation :**

```vue
<script setup>
const { state, isReady, load } = useFeature();

onMounted(() => {
  load();
});
</script>
```

### 3. Service Configuration Pattern

Chaque service a deux composants de configuration :

```
{Service}ActionConfig.vue    → Configure le déclencheur
{Service}ReactionConfig.vue  → Configure la réaction
```

**Pattern de configuration :**

```vue
<!-- components/AREA/SpotifyActionConfig.vue -->
<script setup lang="ts">
const props = defineProps<{
  actionType: string;
  config: Record<string, any>;
}>();

const emit = defineEmits<{
  'update:config': [config: Record<string, any>];
}>();

const localConfig = ref({ ...props.config });

// Synchroniser les changements externes
watch(() => props.config, (newConfig) => {
  localConfig.value = { ...newConfig };
}, { deep: true });

// Émettre les changements
const updateConfig = () => {
  emit('update:config', localConfig.value);
};
</script>

<template>
  <!-- Configuration conditionnelle basée sur actionType -->
  <div v-if="actionType === 'new_track_in_playlist'" class="space-y-4">
    <div>
      <label>Playlist ID</label>
      <input
        v-model="localConfig.playlistId"
        @input="updateConfig"
        class="w-full px-4 py-3 bg-white/10 rounded-xl"
      />
    </div>
  </div>

  <div v-else-if="actionType === 'new_saved_track'">
    <p class="text-white/70">Aucune configuration nécessaire</p>
  </div>
</template>
```

### 4. Middleware Pattern

Les middlewares contrôlent l'accès aux routes :

```typescript
// middleware/auth.ts
export default defineNuxtRouteMiddleware((to, from) => {
  const token = useCookie('auth-token');

  if (!token.value) {
    return navigateTo('/login');
  }
});
```

**Application sur une page :**

```vue
<script setup>
definePageMeta({
  middleware: 'auth'
});
</script>
```

### 5. Auto-Import Pattern

Nuxt 4 auto-importe :
- Tous les composants dans `/components`
- Tous les composables dans `/composables`
- Les utilitaires Vue (ref, computed, watch, etc.)
- Les utilitaires Nuxt (useState, useCookie, navigateTo, etc.)

```vue
<!-- Pas besoin d'import ! -->
<script setup>
const { $api } = useNuxtApp();     // Auto-importé
const data = ref([]);               // Auto-importé
const route = useRoute();           // Auto-importé
</script>

<template>
  <Header />  <!-- Auto-importé depuis components/Header.vue -->
</template>
```

---

## Gestion de l'État

### Web - useState (Nuxt)

Nuxt fournit `useState` pour un état partagé cross-composants :

```typescript
// Créer un état global
const user = useState<User | null>('auth.user', () => null);

// Réutiliser partout
const { user } = useAuth(); // Même instance
```

**Exemple complet (useAuthreal.ts) :**

```typescript
export const useAuth = () => {
  // État global partagé
  const user = useState<User | null>('auth.user', () => null);

  // Cookie sécurisé
  const token = useCookie('auth-token', {
    httpOnly: false,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 60 * 60 * 24 * 7, // 7 jours
  });

  // Computed
  const isAuthenticated = computed(() => !!user.value && !!token.value);

  // Méthodes
  const login = async (email: string, password: string) => {
    const { $api } = useNuxtApp();
    const response = await $api('/auth/login', {
      method: 'POST',
      body: { email, password },
    });

    user.value = response.user;
    token.value = response.token;

    await navigateTo('/dashboard');
  };

  const logout = async () => {
    user.value = null;
    token.value = null;
    await navigateTo('/login');
  };

  return {
    user,
    token,
    isAuthenticated,
    login,
    logout,
  };
};
```

### Mobile - Provider Pattern (Flutter)

```dart
// Créer un provider
class AuthProvider extends ChangeNotifier {
  User? _user;
  String? _token;

  User? get user => _user;
  bool get isAuthenticated => _user != null && _token != null;

  Future<void> login(String email, String password) async {
    final response = await HttpService().post('/auth/login', body: {
      'email': email,
      'password': password,
    });

    final data = jsonDecode(response.body);
    _user = User.fromJson(data['user']);
    _token = data['token'];

    // Persister le token
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('auth_token', _token!);

    notifyListeners(); // Déclencher rebuild
  }

  Future<void> logout() async {
    _user = null;
    _token = null;

    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('auth_token');

    notifyListeners();
  }
}

// Utilisation
class MyApp extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return ChangeNotifierProvider(
      create: (_) => AuthProvider(),
      child: MaterialApp(
        home: Consumer<AuthProvider>(
          builder: (context, auth, _) {
            return auth.isAuthenticated
              ? DashboardScreen()
              : LoginScreen();
          },
        ),
      ),
    );
  }
}
```

---

## Routing & Navigation

### Web - File-Based Routing (Nuxt)

Le routing est automatique basé sur la structure des fichiers dans `/pages` :

```
pages/
├── index.vue                 → /
├── login.vue                 → /login
├── dashboard.vue             → /dashboard
├── areas/
│   ├── index.vue            → /areas
│   └── create.vue           → /areas/create
└── auth/
    └── callback.vue         → /auth/callback
```

**Navigation programmatique :**

```typescript
// Naviguer vers une route
await navigateTo('/dashboard');

// Avec paramètres de requête
await navigateTo({
  path: '/areas',
  query: { status: 'active' }
});

// Redirection externe (OAuth)
await navigateTo('https://oauth.provider.com/authorize', {
  external: true
});
```

**Accéder aux paramètres de route :**

```vue
<script setup>
const route = useRoute();

// Query params: /areas?status=active
const status = route.query.status;

// Path params: /areas/:id
const id = route.params.id;

// Réagir aux changements
watch(() => route.query.status, (newStatus) => {
  loadAreas(newStatus);
});
</script>
```

### Mobile - Named Routes (Flutter)

```dart
// router.dart
class AppRouter {
  static Route<dynamic> generateRoute(RouteSettings settings) {
    switch (settings.name) {
      case '/':
        return MaterialPageRoute(builder: (_) => AuthCheckScreen());
      case '/welcome':
        return MaterialPageRoute(builder: (_) => WelcomeScreen());
      case '/login':
        return MaterialPageRoute(builder: (_) => LoginScreen());
      case '/services':
        return MaterialPageRoute(builder: (_) => ServicesScreen());
      case '/my-areas':
        return MaterialPageRoute(builder: (_) => MyAreasScreen());
      case '/create-area':
        final args = settings.arguments as Map<String, dynamic>?;
        return MaterialPageRoute(
          builder: (_) => CreateAreaScreen(serviceId: args?['serviceId']),
        );
      default:
        return MaterialPageRoute(
          builder: (_) => Scaffold(
            body: Center(child: Text('Route not found')),
          ),
        );
    }
  }
}

// Navigation
Navigator.pushNamed(context, '/login');

// Avec arguments
Navigator.pushNamed(
  context,
  '/create-area',
  arguments: {'serviceId': 'spotify'},
);

// Remplacer la route actuelle
Navigator.pushReplacementNamed(context, '/dashboard');
```

---

## Authentification

### Flux d'Authentification

```
┌─────────────┐
│   /login    │
└──────┬──────┘
       │
       ▼
┌─────────────────────────────┐
│ Choix : Email/Password ou   │
│ OAuth (Google, GitHub, etc) │
└──────┬──────────────────────┘
       │
       ├─────────────┬──────────────┐
       ▼             ▼              ▼
┌──────────┐  ┌──────────┐  ┌──────────┐
│  Email   │  │  Google  │  │  GitHub  │
│ Password │  │  OAuth   │  │  OAuth   │
└────┬─────┘  └────┬─────┘  └────┬─────┘
     │             │              │
     └─────────────┴──────────────┘
                   │
                   ▼
       ┌───────────────────────┐
       │ POST /auth/login ou   │
       │ Redirect to OAuth     │
       └───────────┬───────────┘
                   │
                   ▼
         ┌─────────────────┐
         │ Receive JWT     │
         │ { user, token } │
         └────────┬────────┘
                  │
                  ▼
      ┌──────────────────────┐
      │ Store in cookie:     │
      │ auth-token (7 days)  │
      └──────────┬───────────┘
                 │
                 ▼
         ┌───────────────┐
         │ Redirect to   │
         │  /dashboard   │
         └───────────────┘
```

### Web - Implémentation

**1. Login avec Email/Password :**

```typescript
// composables/useAuthreal.ts
const login = async (email: string, password: string) => {
  const { $api } = useNuxtApp();

  try {
    loading.value = true;
    error.value = null;

    const response = await $api<AuthResponse>('/auth/login', {
      method: 'POST',
      body: { email, password },
    });

    // Stocker le token dans un cookie sécurisé
    token.value = response.token;

    // Stocker l'utilisateur en mémoire
    user.value = response.user;

    // Rediriger vers le dashboard
    await navigateTo('/dashboard');
  } catch (e) {
    error.value = 'Identifiants invalides';
    throw e;
  } finally {
    loading.value = false;
  }
};
```

**2. Login avec OAuth :**

```typescript
const loginWithOAuth = (provider: 'google' | 'facebook' | 'github') => {
  const config = useRuntimeConfig();

  // Construire l'URL d'OAuth
  const redirectUrl = `${config.public.apiBaseUrl}/auth/oauth/${provider}`;

  // Stocker l'URL de retour pour après l'authentification
  const returnUrlCookie = useCookie('oauth-return-url');
  returnUrlCookie.value = useRoute().fullPath || '/dashboard';

  // Rediriger vers le provider OAuth
  navigateTo(redirectUrl, { external: true });
};
```

**3. Callback OAuth :**

```vue
<!-- pages/auth/callback.vue -->
<script setup lang="ts">
const route = useRoute();
const { token, user } = useAuth();

onMounted(async () => {
  // Récupérer le token depuis les query params
  const authToken = route.query.token as string;

  if (authToken) {
    // Stocker le token
    token.value = authToken;

    // Récupérer les infos utilisateur
    const { $api } = useNuxtApp();
    user.value = await $api('/auth/me');

    // Récupérer l'URL de retour
    const returnUrl = useCookie('oauth-return-url');

    // Rediriger
    await navigateTo(returnUrl.value || '/dashboard');
  } else {
    // Erreur d'authentification
    await navigateTo('/login?error=oauth_failed');
  }
});
</script>

<template>
  <div class="flex items-center justify-center min-h-screen">
    <div class="text-center">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
      <p class="mt-4 text-white/70">Authentification en cours...</p>
    </div>
  </div>
</template>
```

**4. Protection des Routes :**

```typescript
// middleware/auth.ts
export default defineNuxtRouteMiddleware((to, from) => {
  const token = useCookie('auth-token');

  if (!token.value) {
    // Stocker l'URL de destination pour rediriger après login
    const returnUrl = useCookie('return-url');
    returnUrl.value = to.fullPath;

    return navigateTo('/login');
  }
});
```

**Application sur une page :**

```vue
<script setup>
definePageMeta({
  middleware: 'auth'
});
</script>
```

### Mobile - Implémentation

```dart
class AuthService {
  final HttpService _http = HttpService();

  Future<void> login(String email, String password) async {
    final response = await _http.post('/auth/login', body: {
      'email': email,
      'password': password,
    });

    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      final token = data['token'];

      // Stocker le token
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString('auth_token', token);

      // Naviguer vers /services
      Navigator.pushReplacementNamed(context, '/services');
    } else {
      throw Exception('Login failed');
    }
  }

  Future<void> logout() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('auth_token');

    Navigator.pushReplacementNamed(context, '/welcome');
  }
}
```

---

## Intégration API

### Web - Client API avec Intercepteurs

```typescript
// composables/useApi.ts
export const useApi = () => {
  const config = useRuntimeConfig();
  const { token } = useAuth();
  const toast = useToast();

  // Créer une instance $fetch avec configuration
  const $api = $fetch.create({
    baseURL: config.public.apiBaseUrl,

    // Intercepteur de requête
    onRequest({ options }) {
      // Ajouter le token d'authentification
      if (token.value) {
        options.headers = {
          ...options.headers,
          Authorization: `Bearer ${token.value}`,
        };
      }
    },

    // Intercepteur de réponse
    onResponse({ response }) {
      // Log des requêtes en dev
      if (process.dev) {
        console.log('[API]', response.url, response.status);
      }
    },

    // Gestion globale des erreurs
    onResponseError({ response }) {
      // Auto-logout sur 401
      if (response.status === 401) {
        const { logout } = useAuth();
        logout();
        toast.add({
          title: 'Session expirée',
          description: 'Veuillez vous reconnecter',
          color: 'red',
        });
      }

      // Toast d'erreur sur 500+
      if (response.status >= 500) {
        toast.add({
          title: 'Erreur serveur',
          description: 'Une erreur est survenue, veuillez réessayer',
          color: 'red',
        });
      }
    },
  });

  // API helpers typés
  return {
    $api,

    // Services
    getServices: () => $api<Service[]>('/api/areas/services'),
    getAbout: () => $api<AboutResponse>('/about.json'),

    // Dashboard
    getStats: () => $api<DashboardStats>('/dashboard/stats'),
    getRecentActivity: () => $api<Activity[]>('/dashboard/activity'),

    // AREAs
    getAreas: () => $api<Area[]>('/api/areas'),
    createArea: (data: CreateAreaDto) =>
      $api<Area>('/api/areas', { method: 'POST', body: data }),
    updateArea: (id: string, data: Partial<Area>) =>
      $api<Area>(`/api/areas/${id}`, { method: 'PATCH', body: data }),
    deleteArea: (id: string) =>
      $api(`/api/areas/${id}`, { method: 'DELETE' }),
    toggleArea: (id: string, active: boolean) =>
      $api(`/api/areas/${id}`, { method: 'PATCH', body: { active } }),
    executeArea: (id: string, userId: string) =>
      $api('/api/areas/triggers/execute', {
        method: 'POST',
        body: { areaId: id, userId }
      }),
  };
};
```

**Utilisation dans les composants :**

```vue
<script setup>
const { getAreas, deleteArea } = useApi();
const areas = ref<Area[]>([]);
const loading = ref(false);

const loadAreas = async () => {
  loading.value = true;
  try {
    areas.value = await getAreas();
  } finally {
    loading.value = false;
  }
};

const handleDelete = async (id: string) => {
  await deleteArea(id);
  await loadAreas(); // Recharger la liste
};

onMounted(() => {
  loadAreas();
});
</script>
```

### Mobile - HTTP Service

```dart
class HttpService {
  static const String _baseUrl = 'http://10.0.2.2:8080'; // Android emulator

  Future<Map<String, String>> _getHeaders() async {
    final prefs = await SharedPreferences.getInstance();
    final token = prefs.getString('auth_token');

    return {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      if (token != null) 'Authorization': 'Bearer $token',
    };
  }

  Future<http.Response> get(String endpoint) async {
    final uri = Uri.parse('$_baseUrl$endpoint');
    final headers = await _getHeaders();

    final response = await http.get(uri, headers: headers);
    _handleErrors(response);
    return response;
  }

  Future<http.Response> post(
    String endpoint, {
    Map<String, dynamic>? body,
  }) async {
    final uri = Uri.parse('$_baseUrl$endpoint');
    final headers = await _getHeaders();

    final response = await http.post(
      uri,
      headers: headers,
      body: jsonEncode(body ?? {}),
    );

    _handleErrors(response);
    return response;
  }

  void _handleErrors(http.Response response) {
    if (response.statusCode == 401) {
      // Auto-logout
      SharedPreferences.getInstance().then((prefs) {
        prefs.remove('auth_token');
      });
      throw Exception('Unauthorized');
    }

    if (response.statusCode >= 500) {
      throw Exception('Server error');
    }

    if (response.statusCode >= 400) {
      throw Exception('Request failed: ${response.statusCode}');
    }
  }
}
```

---

## Configuration de l'Environnement

### Web - nuxt.config.ts

```typescript
export default defineNuxtConfig({
  runtimeConfig: {
    public: {
      apiBaseUrl: process.env.NUXT_PUBLIC_API_BASE_URL || 'http://localhost:8080',
    },
  },

  modules: ['@nuxt/ui'],

  css: ['~/assets/css/main.css'],

  // Auto-import
  imports: {
    dirs: ['composables', 'utils'],
  },

  // TypeScript
  typescript: {
    strict: true,
    typeCheck: true,
  },
});
```

**Utilisation :**

```typescript
const config = useRuntimeConfig();
console.log(config.public.apiBaseUrl); // http://localhost:8080
```

### Mobile - Configuration

```dart
class ApiConfig {
  static const String _devUrl = 'http://10.0.2.2:8080';
  static const String _prodUrl = 'https://api.relay.app';

  static Future<String> get baseUrl async {
    const isProduction = bool.fromEnvironment('dart.vm.product');
    return isProduction ? _prodUrl : _devUrl;
  }
}
```

---

## Points Clés

### Avantages de l'Architecture

1. **Séparation des préoccupations** : Composables, composants, pages séparés
2. **Réutilisabilité** : Composants et logique réutilisables
3. **Type-safety** : TypeScript pour le web, Dart pour mobile
4. **Auto-import** : Nuxt auto-importe composables et composants
5. **File-based routing** : Routing automatique basé sur la structure
6. **Gestion d'état simple** : useState (web), Provider (mobile)
7. **Intercepteurs HTTP** : Gestion centralisée des erreurs et auth

### Bonnes Pratiques

1. **Toujours typer les props et emits**
2. **Utiliser des composables pour la logique métier**
3. **Appliquer les middlewares sur les routes protégées**
4. **Gérer les erreurs API globalement**
5. **Valider les formulaires côté client ET serveur**
6. **Utiliser les cookies sécurisés pour les tokens**
7. **Auto-logout sur 401**
8. **Feedback utilisateur sur toutes les actions (toasts, loading states)**
