# Mobile App Documentation

## Benchmarking, choosing the best stack for the project

For the mobile client of AREA, we need to build a lightweight application responsible for:
- Displaying screens (UI only, no business logic inside the mobile app),
- Forwarding requests from the user to the backend server (authentication, `/about.json`, creation of AREAs),
- Generating an Android APK that can be served through Docker.

To make an informed decision, we explored three possible stacks for mobile development:

1. **Flutter (Dart)** – Google’s cross-platform UI toolkit, compiles to native ARM code, with its own rendering engine.
2. **React Native (JavaScript/TypeScript with Expo)** – Meta’s framework, with Expo replacing Metro and simplifying the development toolchain.
3. **Kotlin (Android Native with Jetpack Compose)** – Official language for Android, integrates deeply with the Android SDK.

---

## Flutter

### How it works  
Flutter uses the Dart language and comes with its own rendering engine.
It does not rely on native Android components – instead, it draws the UI directly on a canvas, which ensures consistency across devices.

In our PoC, we created a simple login page with a form and some additional texts.

### How to run (development mode)  
```bash
flutter pub get
flutter run
```

### Building an APK  
```bash
flutter build apk --release
```

Output: `build/app/outputs/flutter-apk/app-release.apk`

### Advantages 
- Fast development thanks to **hot reload**
- Consistent UI across Android and iOS
- Easy styling with Material/Cupertino widgets
- Large ecosystem of packages
- Simple **Docker-friendly builds**

### Disadvantages  
- Larger APK size compared to Kotlin
- Requires learning Dart if unfamiliar
- Some platform-specific integrations need native plugins

---

## React Native (Expo)

### How it works  
React Native allows building apps with JavaScript/TypeScript and React concepts.
With **Expo**, the complexity of Metro and Gradle is avoided: Expo handles bundling, developer tools, and builds.
The app relies on native components, which makes the look and feel close to a true native app.

In our PoC, we built the same login page with a form and basic texts.

### How to run (development mode)  
```bash
npm install
npx expo start
```

From the terminal you can:
- Press `a` → open in Android Emulator
- Press `w` → open in the browser
- Scan the QR code → open in Expo Go on a real device

### Building an APK (with Expo EAS)  
```bash
npx expo build:android -t apk
```

Output: `dist/your-app.apk` (managed by Expo).

### Advantages  
- Uses **JavaScript/TypeScript**, easy for web developers
- **Expo Go** → instant testing without building
- Cross-platform (Android, iOS, Web)
- Large community and ecosystem
- Smooth developer experience with hot reload
- Much simpler setup compared to Metro/Gradle

### Disadvantages (observed in PoC)  
- For advanced features, Expo EAS or ejecting may be required
- APK heavier than Kotlin native builds
- Less flexibility for very complex configurations
- Some reliance on Expo services (e.g. for builds)

---

## Kotlin (Jetpack Compose)

### How it works  
Kotlin is Android’s official language. With **Jetpack Compose**, UI is described directly in Kotlin code.
Unlike Flutter or React Native, Compose integrates natively with the Android SDK.

In our PoC, we implemented the same login page fully in Kotlin.

### How to run (development mode)  
```bash
./gradlew assembleDebug
./gradlew installDebug
```
Or directly via Android Studio.

### Building an APK  
```bash
./gradlew assembleRelease
```

Output: `app/build/outputs/apk/release/app-release.apk`

### Advantages  
- **Native Android** performance 
- Officially supported by Google
- APK lighter than Flutter/React Native
- Full access to Android SDK APIs

### Disadvantages (observed in PoC)  
- Android only (no iOS)
- Longer build times
- Less flexibility compared to Flutter hot reload
- Steeper learning curve with Gradle/Compose

---

## Final Choice: Flutter

After benchmarking, we chose **Flutter** for the AREA mobile client.

**Why Flutter?**
- Cross-platform (Android + iOS)
- Reliable and simple build system
- **Hot reload** for faster iteration
- Consistent rendering engine (same UI everywhere)
- Large, mature ecosystem of plugins/packages

**Kotlin** delivered the best APK size and full Android-native integration, but is limited to Android.
**React Native (Expo)** offered simplicity and cross-platform support, but heavier builds and reliance on Expo tools.

**Flutter provides the best balance** for AREA: speed, portability, ecosystem, and developer experience.