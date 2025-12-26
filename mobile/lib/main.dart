import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:provider/provider.dart';
import 'pages/welcome_page.dart';
import 'pages/login_page.dart';
import 'pages/register_page.dart';
import 'pages/services_page.dart';
import 'pages/my_areas_page.dart';
import 'pages/create_area_page.dart';
import 'providers/accessibility_provider.dart';
import 'widgets/accessibility_button.dart';
import 'theme/theme.dart';

void main() {
  runApp(
    ChangeNotifierProvider(
      create: (_) => AccessibilityProvider(),
      child: const MyApp(),
    ),
  );
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'AREA',
      debugShowCheckedModeBanner: false,
      theme: ThemeData.dark(),
      initialRoute: '/',
      routes: {
        '/': (context) => const AuthCheckScreen(),
        '/welcome': (context) => const WelcomeScreen(),
        '/login': (context) => const LoginScreen(),
        '/register': (context) => const RegisterScreen(),
        '/services': (context) => const ServicesScreen(),
        '/my-areas': (context) => const MyAreasScreen(),
        '/create-area': (context) => const CreateAreaScreen(),
      },
    );
  }
}

class AuthCheckScreen extends StatefulWidget {
  const AuthCheckScreen({super.key});

  @override
  State<AuthCheckScreen> createState() => _AuthCheckScreenState();
}

class _AuthCheckScreenState extends State<AuthCheckScreen> {
  @override
  void initState() {
    super.initState();
    _checkAuth();
  }

  Future<void> _checkAuth() async {
    final prefs = await SharedPreferences.getInstance();
    final token = prefs.getString('auth_token');

    print('[AuthCheck] Token trouvé: ${token != null ? "OUI (${token.substring(0, 20)}...)" : "NON"}');

    await Future.delayed(const Duration(milliseconds: 500));

    if (!mounted) return;

    if (token != null && token.isNotEmpty) {
      print('[AuthCheck] Redirection vers /services');
      Navigator.pushReplacementNamed(context, '/services');
    } else {
      print('[AuthCheck] Redirection vers /welcome');
      Navigator.pushReplacementNamed(context, '/welcome');
    }
  }

  @override
  Widget build(BuildContext context) {
    return const Scaffold(
      body: Center(
        child: CircularProgressIndicator(),
      ),
    );
  }
}