import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../services/http_service.dart';
import '../theme/theme.dart';
import '../widgets/page_with_accessibility.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});
  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  final _httpService = HttpService();

  bool _isLoading = false;
  bool _isFormValid = false;

  @override
  Widget build(BuildContext context) {
    return PageWithAccessibility(
      child: Scaffold(
      body: Container(
        decoration: const BoxDecoration(
          gradient: RelayGradients.background,
        ),
        child: Padding(
          padding: const EdgeInsets.all(24.0),
          child: ListView(
            children: [
              const SizedBox(height: 80),
              Text(
                '{Relay}',
                textAlign: TextAlign.center,
                style: GoogleFonts.quicksand(
                  fontSize: 75,
                  fontWeight: FontWeight.bold,
                  foreground: Paint()
                    ..shader = const LinearGradient(
                      colors: [
                        RelayColors.primary400,
                        RelayColors.purple400,
                      ],
                    ).createShader(const Rect.fromLTWH(0, 0, 200, 70)),
                ),
              ),
              const SizedBox(height: 60),
              Text(
                'Welcome Back!',
                textAlign: TextAlign.center,
                style: GoogleFonts.quicksand(
                  fontSize: 44,
                  fontWeight: FontWeight.bold,
                  color: Colors.white,
                ),
              ),
              const SizedBox(height: 32),

              TextFormField(
                controller: _emailController,
                keyboardType: TextInputType.emailAddress,
                style: const TextStyle(color: Colors.white),
                decoration: InputDecoration(
                  labelText: 'Email address',
                  labelStyle: TextStyle(color: Colors.white.withOpacity(0.7)),
                  prefixIcon: const Icon(Icons.email, color: RelayColors.primary400),
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
                    borderSide: const BorderSide(color: RelayColors.primary600, width: 2),
                  ),
                ),
                onChanged: (_) => _checkForm(),
              ),

              const SizedBox(height: 16),

              TextFormField(
                controller: _passwordController,
                obscureText: true,
                style: const TextStyle(color: Colors.white),
                decoration: InputDecoration(
                  labelText: 'Password',
                  labelStyle: TextStyle(color: Colors.white.withOpacity(0.7)),
                  prefixIcon: const Icon(Icons.lock, color: RelayColors.primary400),
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
                    borderSide: const BorderSide(color: RelayColors.primary600, width: 2),
                  ),
                ),
                onChanged: (_) => _checkForm(),
              ),

              const SizedBox(height: 28),

              RelayGradientButton(
                onPressed: _isFormValid && !_isLoading ? _login : null,
                child: _isLoading
                    ? const SizedBox(
                        height: 20,
                        width: 20,
                        child: CircularProgressIndicator(
                          color: Colors.white,
                          strokeWidth: 2,
                        ),
                      )
                    : const Text(
                        'Login',
                        style: TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.w600,
                          color: Colors.white,
                        ),
                      ),
              ),

              const SizedBox(height: 20),

              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Text(
                    'No account? ',
                    style: TextStyle(color: Colors.white.withOpacity(0.7)),
                  ),
                  TextButton(
                    onPressed: () => Navigator.pushNamed(context, '/register'),
                    child: const Text(
                      "Register",
                      style: TextStyle(
                        color: RelayColors.primary400,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
      ),
    );
  }

  bool _isEmailValid() {
    final email = _emailController.text.trim();
    return email.isNotEmpty && email.contains('@') && email.contains('.');
  }

  bool _isPasswordValid() => _passwordController.text.isNotEmpty;

  void _checkForm() {
    setState(() {
      _isFormValid = _isEmailValid() && _isPasswordValid();
    });
  }

  Future<void> _login() async {
    setState(() => _isLoading = true);
    try {
      final response = await _httpService.post('/auth/login', body: {
        'email': _emailController.text.trim(),
        'password': _passwordController.text,
      });

      if (!mounted) return;

      if (response.statusCode == 200) {
        final body = jsonDecode(response.body);
        String? token;
        if (body['token'] != null)
          token = body['token'];
        else if (body['access_token'] != null)
          token = body['access_token'];
        else if (body['data'] != null && body['data']['token'] != null)
          token = body['data']['token'];
        else if (body['user'] != null && body.containsKey('token'))
          token = body['token'];
        if (token == null || token.isEmpty) {
          throw Exception('Token not received from server');
        }

        final prefs = await SharedPreferences.getInstance();
        await prefs.setString('auth_token', token);
        
        if (body['user'] != null && body['user']['name'] != null) {
          await prefs.setString('user_name', body['user']['name']);
        }

        if (!mounted) return;
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: const Text('Connection successful!'),
            backgroundColor: RelayColors.green600,
          ),
        );
        Navigator.pushReplacementNamed(context, '/services');
      } else {
        final msg = _getErrorMessage(response);
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(msg),
            backgroundColor: RelayColors.red500,
          ),
        );
      }
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Error: $e'),
          backgroundColor: RelayColors.red500,
        ),
      );
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  String _getErrorMessage(response) {
    try {
      final body = jsonDecode(response.body);
      return body['message'] ?? body['error'] ?? HttpService.getErrorMessage(response);
    } catch (_) {
      return HttpService.getErrorMessage(response);
    }
  }

  @override
  void dispose() {
    _emailController.dispose();
    _passwordController.dispose();
    super.dispose();
  }
}