# Documentation Mobile - Flutter AREA

## Introduction

L'application mobile AREA est développée en Flutter (Dart) et offre les mêmes fonctionnalités que la version web avec un design adapté au mobile et des fonctionnalités d'accessibilité avancées.

## Table des matières

1. [Architecture Mobile](#architecture-mobile)
2. [Installation & Setup](#installation--setup)
3. [Structure du Projet](#structure-du-projet)
4. [Thème & Design](#thème--design)
5. [Navigation](#navigation)
6. [Gestion de l'État](#gestion-de-létat)
7. [Accessibilité](#accessibilité)
8. [API Integration](#api-integration)
9. [Build & Déploiement](#build--déploiement)

---

## Architecture Mobile

### Stack Technique

| Composant | Technologie |
|-----------|-------------|
| Framework | Flutter 3.x |
| Langage | Dart 3.x |
| UI | Material Design 3 |
| State Management | Provider pattern |
| HTTP Client | `http` package |
| Stockage Local | `shared_preferences` |
| Icons | Material Design Icons |

### Fonctionnalités Clés

-  Authentification (Email/Password)
-  Gestion des services connectés
-  Création d'AREAs
-  Consultation des AREAs actives
-  Support de l'accessibilité (6 modes pour daltoniens)
-  Thème sombre (design cohérent avec la version web)

---

## Installation & Setup

### 1. Prérequis

Installez Flutter : https://flutter.dev/docs/get-started/install

Vérifiez l'installation :

```bash
flutter doctor
```

### 2. Installer les Dépendances

```bash
cd mobile
flutter pub get
```

### 3. Configuration

Le fichier `lib/config/api_config.dart` contient la configuration de l'API :

```dart
class ApiConfig {
  static const String _devUrl = 'http://10.0.2.2:8080';  // Android emulator
  static const String _prodUrl = 'https://api.relay.app';

  static Future<String> get baseUrl async {
    const isProduction = bool.fromEnvironment('dart.vm.product');
    return isProduction ? _prodUrl : _devUrl;
  }
}
```

**Note** : `10.0.2.2` est l'adresse localhost pour l'émulateur Android.

### 4. Lancer l'Application

```bash
# Lancer sur émulateur Android
flutter run

# Lancer sur iOS
flutter run -d ios

# Build debug APK
flutter build apk --debug

# Build release APK
flutter build apk --release
```

---

## Structure du Projet

```
mobile/lib/
├── main.dart                      # Point d'entrée
├── app.dart                       # Configuration de l'app
├── router.dart                    # Configuration du routing
│
├── pages/                         # Pages de l'application
│   ├── welcome_page.dart         # Page d'accueil (non connecté)
│   ├── login_page.dart           # Connexion
│   ├── register_page.dart        # Inscription
│   ├── services_page.dart        # Gestion des services
│   ├── my_areas_page.dart        # Liste des AREAs
│   └── create_area_page.dart     # Création d'AREA
│
├── services/                      # Services métier
│   ├── http_service.dart         # Client HTTP avec auth
│   └── oauth_service.dart        # Gestion OAuth
│
├── providers/                     # State management
│   └── accessibility_provider.dart # Modes accessibilité
│
├── widgets/                       # Composants réutilisables
│   ├── accessibility_button.dart
│   ├── nav_drawer.dart
│   ├── page_with_accessibility.dart
│   └── accessible_components.dart
│
├── theme/                         # Thème et design system
│   ├── theme.dart                # Configuration ThemeData
│   ├── colors.dart               # Palette de couleurs
│   └── typography.dart           # Typographie
│
├── config/                        # Configuration
│   ├── api_config.dart
│   ├── environment.dart
│   └── constants.dart
│
└── utils/
    └── service_icons.dart        # Icônes des services
```

---

## Thème & Design

### Palette de Couleurs

```dart
// lib/theme/colors.dart
class RelayColors {
  // Primary
  static const Color primary500 = Color(0xFF3B82F6);  // blue-500
  static const Color primary600 = Color(0xFF2563EB);  // blue-600
  static const Color primary700 = Color(0xFF1D4ED8);  // blue-700

  // Secondary
  static const Color indigo600 = Color(0xFF4F46E5);
  static const Color indigo700 = Color(0xFF4338CA);

  // Backgrounds
  static const Color slate900 = Color(0xFF0F172A);
  static const Color slate800 = Color(0xFF1E293B);

  // Glass surfaces
  static const Color glassWhite10 = Color(0x1AFFFFFF);   // rgba(255,255,255,0.1)
  static const Color glassWhite20 = Color(0x33FFFFFF);   // rgba(255,255,255,0.2)
  static const Color borderWhite20 = Color(0x33FFFFFF);

  // Gradients
  static const LinearGradient primary = LinearGradient(
    colors: [Color(0xFF2563EB), Color(0xFF9333EA)],
    begin: Alignment.centerLeft,
    end: Alignment.centerRight,
  );

  static const LinearGradient background = LinearGradient(
    colors: [
      Color(0xFF0F172A),  // slate-900
      Color(0xFF1E3A8A),  // blue-900
      Color(0xFF312E81),  // indigo-900
    ],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );
}
```

### ThemeData

```dart
// lib/theme/theme.dart
class RelayTheme {
  static ThemeData darkTheme = ThemeData(
    brightness: Brightness.dark,
    primaryColor: RelayColors.primary600,
    scaffoldBackgroundColor: RelayColors.slate900,

    colorScheme: const ColorScheme.dark(
      primary: RelayColors.primary600,
      secondary: RelayColors.indigo600,
      surface: RelayColors.slate800,
      background: RelayColors.slate900,
      error: Color(0xFFEF4444),  // red-500
    ),

    appBarTheme: const AppBarTheme(
      backgroundColor: RelayColors.glassWhite10,
      elevation: 0,
      centerTitle: true,
    ),

    cardTheme: CardThemeData(
      color: RelayColors.glassWhite10,
      elevation: 0,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
        side: const BorderSide(
          color: RelayColors.borderWhite20,
          width: 1,
        ),
      ),
    ),

    elevatedButtonTheme: ElevatedButtonThemeData(
      style: ElevatedButton.styleFrom(
        backgroundColor: RelayColors.primary600,
        foregroundColor: Colors.white,
        padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(12),
        ),
      ),
    ),

    inputDecorationTheme: InputDecorationTheme(
      filled: true,
      fillColor: RelayColors.glassWhite10,
      border: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: const BorderSide(color: RelayColors.borderWhite20),
      ),
      enabledBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: const BorderSide(color: RelayColors.borderWhite20),
      ),
      focusedBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: const BorderSide(color: RelayColors.primary500, width: 2),
      ),
    ),
  );
}
```

### Composant Glass Card

```dart
// Exemple de carte glassmorphique
class RelayGlassCard extends StatelessWidget {
  final Widget child;
  final VoidCallback? onTap;

  const RelayGlassCard({
    Key? key,
    required this.child,
    this.onTap,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: RelayColors.glassWhite10,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: RelayColors.borderWhite20,
          width: 1,
        ),
      ),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          onTap: onTap,
          borderRadius: BorderRadius.circular(16),
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: child,
          ),
        ),
      ),
    );
  }
}
```

---

## Navigation

### Router Configuration

```dart
// lib/router.dart
class AppRouter {
  static Route<dynamic> generateRoute(RouteSettings settings) {
    switch (settings.name) {
      case '/':
        return MaterialPageRoute(builder: (_) => const AuthCheckScreen());

      case '/welcome':
        return MaterialPageRoute(builder: (_) => const WelcomeScreen());

      case '/login':
        return MaterialPageRoute(builder: (_) => const LoginScreen());

      case '/register':
        return MaterialPageRoute(builder: (_) => const RegisterScreen());

      case '/services':
        return MaterialPageRoute(builder: (_) => const ServicesScreen());

      case '/my-areas':
        return MaterialPageRoute(builder: (_) => const MyAreasScreen());

      case '/create-area':
        final args = settings.arguments as Map<String, dynamic>?;
        return MaterialPageRoute(
          builder: (_) => CreateAreaScreen(
            serviceId: args?['serviceId'],
          ),
        );

      default:
        return MaterialPageRoute(
          builder: (_) => Scaffold(
            body: Center(
              child: Text('Route "${settings.name}" not found'),
            ),
          ),
        );
    }
  }
}
```

### Navigation Programmatique

```dart
// Naviguer vers une route
Navigator.pushNamed(context, '/login');

// Avec arguments
Navigator.pushNamed(
  context,
  '/create-area',
  arguments: {'serviceId': 'spotify'},
);

// Remplacer la route actuelle
Navigator.pushReplacementNamed(context, '/services');

// Retour
Navigator.pop(context);

// Retour avec data
Navigator.pop(context, {'created': true});
```

---

## Gestion de l'État

### Provider Pattern

#### 1. Créer un Provider

```dart
// lib/providers/auth_provider.dart
import 'package:flutter/foundation.dart';
import 'package:shared_preferences/shared_preferences.dart';

class AuthProvider extends ChangeNotifier {
  String? _token;
  Map<String, dynamic>? _user;

  String? get token => _token;
  Map<String, dynamic>? get user => _user;
  bool get isAuthenticated => _token != null;

  Future<void> login(String email, String password) async {
    // Appel API
    final response = await HttpService().post('/auth/login', body: {
      'email': email,
      'password': password,
    });

    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      _token = data['token'];
      _user = data['user'];

      // Persister le token
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString('auth_token', _token!);

      notifyListeners(); // Déclencher rebuild
    } else {
      throw Exception('Login failed');
    }
  }

  Future<void> logout() async {
    _token = null;
    _user = null;

    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('auth_token');

    notifyListeners();
  }

  Future<void> loadToken() async {
    final prefs = await SharedPreferences.getInstance();
    _token = prefs.getString('auth_token');

    if (_token != null) {
      // Optionnel : charger les infos user
      notifyListeners();
    }
  }
}
```

#### 2. Fournir le Provider

```dart
// lib/main.dart
import 'package:provider/provider.dart';

void main() {
  runApp(
    MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => AuthProvider()),
        ChangeNotifierProvider(create: (_) => AccessibilityProvider()),
      ],
      child: const MyApp(),
    ),
  );
}
```

#### 3. Consommer le Provider

```dart
// Dans un widget
class LoginScreen extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    // Écouter les changements
    final auth = Provider.of<AuthProvider>(context);

    // Ou sans écouter (pour les méthodes uniquement)
    final auth = Provider.of<AuthProvider>(context, listen: false);

    return Scaffold(
      body: Column(
        children: [
          if (auth.isAuthenticated)
            Text('Logged in as ${auth.user!['email']}'),

          ElevatedButton(
            onPressed: () async {
              await auth.login('email@example.com', 'password');
            },
            child: const Text('Login'),
          ),
        ],
      ),
    );
  }
}

// Ou avec Consumer pour rebuild optimisé
Consumer<AuthProvider>(
  builder: (context, auth, child) {
    return Text(auth.isAuthenticated ? 'Logged in' : 'Not logged in');
  },
)
```

---

## Accessibilité

### 6 Modes d'Accessibilité

L'application mobile offre un support complet pour les déficiences visuelles :

```dart
// lib/providers/accessibility_provider.dart
enum AccessibilityMode {
  normal('Mode Normal', Icons.visibility, null),
  protanopia('Protanopie', Icons.remove_red_eye, 'Rouge-vert (déficience rouge)'),
  deuteranopia('Deutéranopie', Icons.remove_red_eye, 'Rouge-vert (le plus commun)'),
  tritanopia('Tritanopie', Icons.remove_red_eye, 'Bleu-jaune'),
  achromatopsia('Achromatopsie', Icons.visibility_off, 'Vision en niveaux de gris'),
  highContrast('Contraste Élevé', Icons.contrast, 'Mode haute lisibilité');

  final String label;
  final IconData icon;
  final String? description;

  const AccessibilityMode(this.label, this.icon, this.description);
}

class AccessibilityProvider extends ChangeNotifier {
  AccessibilityMode _currentMode = AccessibilityMode.normal;

  AccessibilityMode get currentMode => _currentMode;

  Future<void> setMode(AccessibilityMode mode) async {
    _currentMode = mode;

    // Sauvegarder la préférence
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('accessibility_mode', mode.name);

    notifyListeners();
  }

  ColorFilter? get colorFilter {
    switch (_currentMode) {
      case AccessibilityMode.protanopia:
        return const ColorFilter.matrix([
          0.567, 0.433, 0, 0, 0,
          0.558, 0.442, 0, 0, 0,
          0, 0.242, 0.758, 0, 0,
          0, 0, 0, 1, 0,
        ]);

      case AccessibilityMode.deuteranopia:
        return const ColorFilter.matrix([
          0.625, 0.375, 0, 0, 0,
          0.7, 0.3, 0, 0, 0,
          0, 0.3, 0.7, 0, 0,
          0, 0, 0, 1, 0,
        ]);

      case AccessibilityMode.tritanopia:
        return const ColorFilter.matrix([
          0.95, 0.05, 0, 0, 0,
          0, 0.433, 0.567, 0, 0,
          0, 0.475, 0.525, 0, 0,
          0, 0, 0, 1, 0,
        ]);

      case AccessibilityMode.achromatopsia:
        return const ColorFilter.matrix([
          0.299, 0.587, 0.114, 0, 0,
          0.299, 0.587, 0.114, 0, 0,
          0.299, 0.587, 0.114, 0, 0,
          0, 0, 0, 1, 0,
        ]);

      default:
        return null;
    }
  }
}
```

### Bouton d'Accessibilité

```dart
// lib/widgets/accessibility_button.dart
class AccessibilityButton extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return IconButton(
      icon: const Icon(Icons.accessibility_new),
      tooltip: 'Accessibilité',
      onPressed: () {
        showModalBottomSheet(
          context: context,
          builder: (context) => const AccessibilitySheet(),
        );
      },
    );
  }
}

class AccessibilitySheet extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    final provider = Provider.of<AccessibilityProvider>(context);

    return Container(
      padding: const EdgeInsets.all(16),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          const Text(
            'Mode d\'accessibilité',
            style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 16),
          ...AccessibilityMode.values.map((mode) {
            return ListTile(
              leading: Icon(mode.icon),
              title: Text(mode.label),
              subtitle: mode.description != null
                  ? Text(mode.description!)
                  : null,
              trailing: provider.currentMode == mode
                  ? const Icon(Icons.check, color: Colors.green)
                  : null,
              onTap: () {
                provider.setMode(mode);
                Navigator.pop(context);
              },
            );
          }).toList(),
        ],
      ),
    );
  }
}
```

### Appliquer le Filtre de Couleur

```dart
// lib/widgets/page_with_accessibility.dart
class PageWithAccessibility extends StatelessWidget {
  final Widget child;

  const PageWithAccessibility({required this.child});

  @override
  Widget build(BuildContext context) {
    final accessibilityProvider = Provider.of<AccessibilityProvider>(context);
    final colorFilter = accessibilityProvider.colorFilter;

    return ColorFiltered(
      colorFilter: colorFilter ?? const ColorFilter.mode(
        Colors.transparent,
        BlendMode.multiply,
      ),
      child: child,
    );
  }
}
```

**Utilisation** :

```dart
class MyScreen extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return PageWithAccessibility(
      child: Scaffold(
        appBar: AppBar(
          title: const Text('My Screen'),
          actions: [AccessibilityButton()],
        ),
        body: // ...
      ),
    );
  }
}
```

---

## API Integration

### HTTP Service

```dart
// lib/services/http_service.dart
import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import '../config/api_config.dart';

class HttpService {
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
    final url = await ApiConfig.baseUrl;
    final uri = Uri.parse('$url$endpoint');
    final headers = await _getHeaders();

    final response = await http.get(uri, headers: headers);
    _handleErrors(response);
    return response;
  }

  Future<http.Response> post(
    String endpoint, {
    Map<String, dynamic>? body,
  }) async {
    final url = await ApiConfig.baseUrl;
    final uri = Uri.parse('$url$endpoint');
    final headers = await _getHeaders();

    final response = await http.post(
      uri,
      headers: headers,
      body: jsonEncode(body ?? {}),
    );

    _handleErrors(response);
    return response;
  }

  Future<http.Response> patch(
    String endpoint, {
    Map<String, dynamic>? body,
  }) async {
    final url = await ApiConfig.baseUrl;
    final uri = Uri.parse('$url$endpoint');
    final headers = await _getHeaders();

    final response = await http.patch(
      uri,
      headers: headers,
      body: jsonEncode(body ?? {}),
    );

    _handleErrors(response);
    return response;
  }

  Future<http.Response> delete(String endpoint) async {
    final url = await ApiConfig.baseUrl;
    final uri = Uri.parse('$url$endpoint');
    final headers = await _getHeaders();

    final response = await http.delete(uri, headers: headers);
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

### Exemple d'Utilisation

```dart
class MyWidget extends StatefulWidget {
  @override
  _MyWidgetState createState() => _MyWidgetState();
}

class _MyWidgetState extends State<MyWidget> {
  final HttpService _http = HttpService();
  List<dynamic> _areas = [];
  bool _loading = false;

  @override
  void initState() {
    super.initState();
    _loadAreas();
  }

  Future<void> _loadAreas() async {
    setState(() => _loading = true);

    try {
      final response = await _http.get('/api/areas');
      final data = jsonDecode(response.body);

      setState(() {
        _areas = data;
        _loading = false;
      });
    } catch (e) {
      setState(() => _loading = false);
      // Afficher un snackbar d'erreur
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Erreur: $e')),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_loading) {
      return const Center(child: CircularProgressIndicator());
    }

    return ListView.builder(
      itemCount: _areas.length,
      itemBuilder: (context, index) {
        final area = _areas[index];
        return ListTile(
          title: Text(area['name']),
          subtitle: Text(area['description']),
        );
      },
    );
  }
}
```

---

## Build & Déploiement

### Build Android APK

```bash
# Debug APK
flutter build apk --debug

# Release APK
flutter build apk --release

# APK se trouve dans : build/app/outputs/flutter-apk/app-release.apk
```

### Build iOS App

```bash
# Nécessite un Mac avec Xcode

flutter build ios --release

# Ouvrir Xcode pour signer et distribuer
open ios/Runner.xcworkspace
```

### Build App Bundle (Google Play)

```bash
flutter build appbundle --release

# Se trouve dans : build/app/outputs/bundle/release/app-release.aab
```

---

## Bonnes Pratiques

### 1. Async/Await

Toujours utiliser async/await pour les opérations asynchrones :

```dart
//  Bon
Future<void> loadData() async {
  try {
    final data = await httpService.get('/api/data');
    setState(() {
      _data = data;
    });
  } catch (e) {
    print('Error: $e');
  }
}

//  Mauvais (callbacks hell)
void loadData() {
  httpService.get('/api/data').then((data) {
    setState(() {
      _data = data;
    });
  }).catchError((e) {
    print('Error: $e');
  });
}
```

### 2. Const Constructors

Utiliser `const` pour les widgets statiques (optimisation) :

```dart
//  Bon
const Text('Hello World')

//  Mauvais
Text('Hello World')
```

### 3. Extract Widgets

Extraire les widgets complexes pour la lisibilité :

```dart
//  Bon
class MyComplexWidget extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        _buildHeader(),
        _buildContent(),
        _buildFooter(),
      ],
    );
  }

  Widget _buildHeader() => ...;
  Widget _buildContent() => ...;
  Widget _buildFooter() => ...;
}
```

---

## Ressources

- [Flutter Docs](https://flutter.dev/docs)
- [Dart Docs](https://dart.dev/guides)
- [Material Design 3](https://m3.material.io/)
- [Provider Package](https://pub.dev/packages/provider)

---

**Maintenu par l'équipe AREA Mobile - Dernière mise à jour : Janvier 2025**
