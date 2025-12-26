import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../services/http_service.dart';
import '../theme/theme.dart';
import '../widgets/page_with_accessibility.dart';

class RegisterScreen extends StatefulWidget {
  const RegisterScreen({super.key});
  @override
  State<RegisterScreen> createState() => _RegisterScreenState();
}

class _RegisterScreenState extends State<RegisterScreen> {
  final _nameController = TextEditingController();
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
                  'Join Now !',
                  textAlign: TextAlign.center,
                  style: GoogleFonts.quicksand(
                    fontSize: 44,
                    fontWeight: FontWeight.bold,
                    color: Colors.white,
                  ),
                ),
                const SizedBox(height: 32),

                TextFormField(
                  controller: _nameController,
                  style: const TextStyle(color: Colors.white),
                  decoration: InputDecoration(
                    labelText: 'Name',
                    labelStyle: TextStyle(color: Colors.white.withOpacity(0.7)),
                    prefixIcon: const Icon(Icons.person, color: RelayColors.primary400),
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
                  onPressed: _isFormValid && !_isLoading ? _register : null,
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
                          'Create an account',
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
                      'Already have an account? ',
                      style: TextStyle(color: Colors.white.withOpacity(0.7)),
                    ),
                    TextButton(
                      onPressed: () => Navigator.pushNamed(context, '/login'),
                      child: const Text(
                        'Login',
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

  bool _isNameValid() => _nameController.text.trim().isNotEmpty;

  bool _isEmailValid() {
    final email = _emailController.text.trim();
    return email.isNotEmpty && email.contains('@') && email.contains('.');
  }

  bool _isPasswordValid() => _passwordController.text.isNotEmpty;

  void _checkForm() {
    setState(() {
      _isFormValid = _isNameValid() && _isEmailValid() && _isPasswordValid();
    });
  }

  Future<void> _register() async {
    setState(() => _isLoading = true);
    try {
      final response = await _httpService.post('/auth/register', body: {
        'name': _nameController.text.trim(),
        'email': _emailController.text.trim(),
        'password': _passwordController.text,
      });

      if (!mounted) return;

      if (response.statusCode == 200 || response.statusCode == 201) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: const Text('Account successfully created!'),
            backgroundColor: RelayColors.green600,
          ),
        );
        Navigator.pushReplacementNamed(context, '/login');
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
          content: Text('Network error: $e'),
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
      return body['message'] ?? HttpService.getErrorMessage(response);
    } catch (_) {
      return HttpService.getErrorMessage(response);
    }
  }

  @override
  void dispose() {
    _nameController.dispose();
    _emailController.dispose();
    _passwordController.dispose();
    super.dispose();
  }
}
