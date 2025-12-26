# Mobile (Flutter) – Documentation détaillée

## 1. Objectif du produit
L’application mobile Flutter constitue le client embarqué de la plateforme AREA. Elle permet à un utilisateur de :
- gérer son authentification (email/password ou OAuth) ;
- consulter et piloter ses AREA (couples action/réaction) ;
- connecter ou déconnecter des services externes (Spotify, Google, GitLab, Notion, etc.) ;
- configurer des intégrations spécifiques comme le bot Telegram ;
- bénéficier d’un environnement accessible (lecture simplifiée, contraste élevé, commandes larges).

L’application cible Android (smartphone ou tablette) et peut également être exécutée sur iOS si nécessaire. La mise au point s’est concentrée sur Android dans le contexte du projet.

---

## 2. Technologies et dépendances clés

| Composant | Version cible | Commentaires |
|-----------|---------------|--------------|
| Flutter SDK | 3.10+ | Développement mobile multiplateforme |
| Dart SDK | 3.x | Langage utilisé par Flutter |
| Android SDK | API 33+ | Exécution sur émulateur ou device physique |
| Java JDK | 17 | Requis par Gradle / Android |
| Packages Flutter | `google_fonts`, `flutter_riverpod`, `shared_preferences`, `http`, `url_launcher`, `app_links`, `flutter_secure_storage`, `provider` | Gestion de l’UI, stockage local, appels HTTP, deep links |

Vérification rapide :
```bash
flutter --version
dart --version
flutter doctor -v
```

---

## 3. Structure du dépôt mobile

```
mobile/
├── android/                       # Projet Android (Gradle)
├── ios/                           # Projet iOS (structure minimale, non utilisée en prod)
├── lib/
│   ├── app.dart                   # Configuration globale de MaterialApp et navigation
│   ├── config/                    # Gestion des environnements (API)
│   │   └── api_config.dart
│   ├── config.dart                # Constantes d’application partagées
│   ├── main.dart                  # Point d’entrée Flutter
│   ├── pages/                     # Pages (écrans principaux)
│   │   ├── welcome_page.dart
│   │   ├── login_page.dart
│   │   ├── register_page.dart
│   │   ├── services_page.dart
│   │   ├── my_areas_page.dart
│   │   └── create_area_page.dart
│   ├── providers/
│   │   └── accessibility_provider.dart
│   ├── router.dart                # Déclaration des routes nommées
│   ├── services/                  # Couche d’accès API et OAuth
│   │   ├── http_service.dart
│   │   └── oauth_service.dart
│   ├── theme/
│   │   ├── colors.dart
│   │   └── theme.dart
│   ├── utils/
│   │   └── service_icons.dart
│   └── widgets/                   # Widgets réutilisables (drawer, cartes, accessibilité…)
├── assets/
│   └── icons/app_icon.png         # Icône principale de l’application (1024×1024)
├── Mobile_Flutter_Documentation.md
├── pubspec.yaml
├── pubspec.lock
└── test/widget_test.dart
```

Points notables :
- `services_page.dart` concentre la logique de connexion aux services externes et l’intégration du bot Telegram.
- `oauth_service.dart` exploite `app_links` pour écouter les deep links `relay://oauth-callback`.
- Le thème est entièrement personnalisé (dark mode homogène, typographie via `google_fonts`).
- Les icônes de services sont définies dans `utils/service_icons.dart` et se basent sur des couleurs cohérentes par marque.

---

## 4. Préparation de l’environnement

1. **SDK** : installer Flutter 3.10+ et Android SDK (API 33 minimum).
2. **Variables d’environnement** (exemple macOS / Linux) :
   ```bash
   export FLUTTER_HOME="$HOME/flutter"
   export PATH="$FLUTTER_HOME/bin:$PATH"

   export ANDROID_HOME="$HOME/Android/Sdk"
   export PATH="$ANDROID_HOME/platform-tools:$PATH"
   export PATH="$ANDROID_HOME/emulator:$PATH"

   export JAVA_HOME="$(/usr/libexec/java_home -v 17)"
   ```
3. **Dépendances du projet** :
   ```bash
   cd mobile
   flutter pub get
   ```
4. **Backend requis** : lancer la stack Docker du projet (`docker compose up`) ou pointer l’application vers un backend distant (voir section configuration API).

---

## 5. Configuration applicative

### 5.1. Points d’accès API
- `lib/config/api_config.dart` centralise les URLs.
- Valeurs par défaut :
  - Web : `http://localhost:8080`
  - Émulateur Android : `http://10.0.2.2:8080`
  - Device physique (Wi-Fi) : `http://172.20.10.3:8080` (exemple utilisé sur le projet).
- Possibilités d’override :
  - `--dart-define=API_BASE_URL=http://192.168.1.50:8080` lors du `flutter run`.
  - Stockage local via `SharedPreferences` (paramétrage dans l’application).

### 5.2. Tokens et authentification
- Authentification email/password : token JWT reçu du backend, stocké dans `SharedPreferences` (`auth_token`).
- OAuth : les tokens sont gérés côté backend. L’appli mobile conserve uniquement l’état connecté via `/auth/profile`.

### 5.3. Deep links OAuth
- Schéma utilisé : `relay://oauth-callback`.
- `lib/services/oauth_service.dart` écoute les événements d’App Links et récupère les paramètres `token`, `service`, `status`, `name`.
- Sur Android, le schéma est déclaré dans `android/app/src/main/AndroidManifest.xml`.
- En cas de nouvel OAuth, ajouter la route côté backend puis laisser `services_page.dart` lister le service (il apparaîtra automatiquement grâce à `/about.json`).

### 5.4. Télégram Bot
- Section dédiée dans `services_page.dart`.
- Config requise côté backend : endpoints `/api/telegram/status`, `/configure`.
- L’appli stocke l’état local (succès/erreur) et force l’utilisateur à saisir le token BotFather.

---

## 6. Architecture logicielle et choix techniques

| Sujet | Choix | Justification |
|-------|-------|----------------|
| Gestion d’état | StatefulWidget + Provider simple (`accessibility_provider.dart`) | L’application manipule peu d’état global. L’accessibilité est le seul cas partagé. |
| Thème | `theme/theme.dart` + `google_fonts` | Uniformiser l’UI, fournir un mode sombre cohérent. |
| Navigation | Routes nommées via `router.dart` + `Navigator.pushNamed` | Simplifie le passage entre écrans (login → services → détails). |
| Réseau | `http` package + wrapper `HttpService` | Suffisant pour REST, centralise headers, base URL, debug logs. |
| OAuth mobile | `url_launcher` (ouverture navigateur) + `app_links` (retour deep link) | Permet de s’appuyer sur le backend existant et le schéma `relay://`. |
| Accessibilité | `PageWithAccessibility`, `accessible_components.dart` | Ajoute un calque d’outils (agrandissement, contraste, lecture vocale). |

---

## 7. Écrans et parcours principaux

1. **WelcomePage** (`welcome_page.dart`)  
   Présente l’application et dirige vers `LoginPage` ou `RegisterPage`.

2. **LoginPage / RegisterPage**  
   - Formulaire classique.
   - Authentifie via `/auth/login` ou `/auth/register`.  
   - Stocke le token JWT si succès.

3. **ServicesPage**  
   - Écran central (accessible après login).  
   - Récupère la liste des services via `/about.json`.  
   - Affiche pour chaque service : actions disponibles, réactions, état de connexion.  
   - Bouton `Connect` déclenche la séquence OAuth (URL `backend/auth/oauth/<service>?source=mobile:<userId>`).  
   - Gère le statut Telegram (formulaire et boutons `Enregistrer` / `Déconnecter`).  
   - Après chaque connexion/déconnexion, recharge le profil (`/auth/profile`).

4. **MyAreasPage / CreateAreaPage**  
   - Consultation et création d’AREA (sélection action/réaction, configuration des paramètres).  
   - S’appuient sur les endpoints backend `/api/areas`.

5. **NavDrawer** (`widgets/nav_drawer.dart`)  
   - Navigation latérale commune, fournie par `PageWithAccessibility`.

---

## 8. Communication avec le backend

- Tous les appels passent par `HttpService`. Les en-têtes incluent automatiquement le JWT si présent.
- Les erreurs sont retournées sous forme de message (`HttpService.getErrorMessage`).
- Pendant le développement, des logs détaillés (`print`) sont activés pour POST (URL, payload, réponse).
- Les services nécessitant OAuth vérifient d’abord `/auth/profile` pour afficher le statut “Connected as …”. La logique extrait les labels via `_extractConnectionLabel` dans `services_page.dart`.

---

## 9. Gestion de l’accessibilité

- `providers/accessibility_provider.dart` conserve les préférences (taille de police agrandie, contraste).
- `PageWithAccessibility` enveloppe chaque écran et fournit le bouton flottant d’activation.
- `accessible_components.dart` contient des widgets pré-stylés (badges, alertes) pour des retours visuels cohérents.

---

## 10. Thème, ressources et icônes

- Palette définie dans `theme/colors.dart`, gradients et boutons personnalisés dans `theme/theme.dart`.
- Typographie : principalement `GoogleFonts.quicksand` (déclaré directement dans les écrans).
- Icônes de services : `utils/service_icons.dart` mappe chaque service vers un couple icône/couleur cohérent.

### Icône d’application
1. L’asset maître est `assets/icons/app_icon.png` (1024×1024).
2. Génération des dérivés Android (si `flutter_launcher_icons` indisponible) :
   ```bash
   sips -z 48 48   assets/icons/app_icon.png --out android/app/src/main/res/mipmap-mdpi/ic_launcher.png
   sips -z 72 72   assets/icons/app_icon.png --out android/app/src/main/res/mipmap-hdpi/ic_launcher.png
   sips -z 96 96   assets/icons/app_icon.png --out android/app/src/main/res/mipmap-xhdpi/ic_launcher.png
   sips -z 144 144 assets/icons/app_icon.png --out android/app/src/main/res/mipmap-xxhdpi/ic_launcher.png
   sips -z 192 192 assets/icons/app_icon.png --out android/app/src/main/res/mipmap-xxxhdpi/ic_launcher.png
   ```
3. Couleur de fond adaptive : `android/app/src/main/res/values/colors.xml`.
4. Si les droits filesystem le permettent, on peut automatiser :
   ```bash
   flutter pub get
   dart run flutter_launcher_icons
   ```
   (`ios` est désactivé dans `pubspec.yaml` faute de structure complète).

---

## 11. Commandes de développement

| Action | Commande |
|--------|----------|
| Lancer sur un émulateur/device | `flutter run -d <deviceId>` |
| Hot reload déjà lancé | Taper `r` dans le terminal Flutter |
| Nettoyer les artefacts | `flutter clean` |
| Analyser (lint) | `flutter analyze` |
| Tests unitaires/widget | `flutter test` |
| Build APK debug | `flutter build apk --debug` |
| Build APK release | `flutter build apk --release` |

Pour que l’application communique correctement avec le backend :
```bash
docker compose up  # depuis la racine du repo
flutter run --dart-define=API_BASE_URL=http://10.0.2.2:8080  # émulateur Android
```

---

## 12. Déploiement et livraisons

1. Mettre à jour la version dans `pubspec.yaml` (`version: x.y.z+build`).
2. Nettoyer puis reconstruire :
   ```bash
   flutter clean
   flutter pub get
   flutter build apk --release
   ```
3. Signer l’APK si déploiement sur Play Store (non couvert ici).
4. Pour iOS, il faut générer un projet Xcode complet (`flutter create .` à partir de `mobile/`).

---

## 14. Problèmes connus et dépannage

| Symptôme | Cause probable | Solution |
|----------|----------------|----------|
| L’appli ne récupère pas les services | API Base URL incorrect | `flutter run --dart-define=API_BASE_URL=...` ou réinitialiser via paramètres internes |
| Impossible de compléter l’OAuth | L’intégration backend n’a pas la redirection configurée | Vérifier `GITLAB_REDIRECT_URI`, `NOTION_REDIRECT_URI`, etc. |
| Deep link non déclenché après OAuth | Schéma `relay://` non reconnu ou appli en arrière-plan | Relancer l’appli, vérifier `AndroidManifest.xml` (intent-filter). |
| Notion “Connected” mais aucune détection | Page ou base non partagée à l’intégration | Dans Notion, bouton **Share** > inviter l’intégration. |
| `flutter_launcher_icons` plante (`RangeError`) | Permissions système du SDK Flutter | Remplacer manuellement par `sips` (voir section icône). |
| Commandes réseau échouent en dev | Backend Docker non lancé ou pas accessible depuis le device | Vérifier `docker compose ps`, régler les IP (10.0.2.2 pour émulateur). |

---

## 15. Historique et contributeurs
- Structure initiale générée via `flutter create`.
- Personnalisation majeure de l’écran services, intégrations OAuth et accessibilité : Yasma Abdelkhalek.
- Ajustements récents : normalisation des statuts de connexion, icône custom, documentation.

Dernière mise à jour : 02/11/2024
Equipe mobile: Yasma ABD ELKHALEK

