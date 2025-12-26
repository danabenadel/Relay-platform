# Mobile (Flutter)

## Prérequis

- **Flutter SDK** installé et dans le `PATH`  
  Vérifier : `flutter --version`
- **Java** (JDK 17 recommandé)  
  Vérifier : `java -version`
- **Android SDK + Platform Tools** (pour `adb`, `emulator`)  
  Vérifier : `adb --version` et `emulator -version`
- Au moins **un AVD** (émulateur Android) déjà créé dans l’Android SDK.

---

## Installation du projet

```bash
# 1) Cloner le repo (si besoin)
git clone <URL_DU_REPO>
cd <racine_du_repo>/mobile

# 2) Installer les dépendances Dart
flutter pub get
```

---

## Lancer l’app sur un émulateur (sans Android Studio)

### 1) Lister les émulateurs disponibles
```bash
flutter emulators
```
> Noter le nom de l’AVD (ex. `Medium_Phone_API_36.0`).

### 2) Démarrer l’émulateur
```bash
flutter emulators --launch <NOM_DE_L_EMULATEUR>
# exemple
# flutter emulators --launch Medium_Phone_API_36.0
```

> Laisser quelques secondes pour booter (écran de démarrage Android).

### 3) Vérifier les devices connectés
```bash
flutter devices
```
Tu dois voir ton émulateur (ex. `emulator-5554`).

### 4) Lancer l’application
```bash
flutter run -d <ID_DU_DEVICE>
# exemple
# flutter run -d emulator-5554
```

> Raccourcis utiles pendant `flutter run` :
> - `r` : hot reload (rafraîchit les changements UI instantanément)
> - `R` : hot restart (relance l’app, garde le build)
> - `q` : quit

---

## Construire un APK

### Debug APK
```bash
flutter build apk --debug
# Sortie : build/app/outputs/flutter-apk/app-debug.apk
```

### Release APK
```bash
flutter build apk --release
# Sortie : build/app/outputs/flutter-apk/app-release.apk
```
---

## Commandes utiles

- **Nettoyer le projet** (quand Gradle/Flutter font n’importe quoi) :
  ```bash
  flutter clean
  rm -rf android/.gradle android/build build
  flutter pub get
  ```
- **Forcer l’update des dépendances** :
  ```bash
  flutter pub upgrade
  ```
- **Lister les devices** :
  ```bash
  flutter devices
  ```
- **Log Android** (équivalent de `adb logcat`) :
  ```bash
  flutter logs
  ```
---
