import 'package:flutter/material.dart';
import 'package:flutter/foundation.dart' show kIsWeb;
import 'package:google_fonts/google_fonts.dart';
import 'package:url_launcher/url_launcher.dart';
import '../theme/theme.dart';
import '../services/oauth_service.dart';
import '../services/http_service.dart';
import '../widgets/page_with_accessibility.dart';

class WelcomeScreen extends StatefulWidget {
  const WelcomeScreen({super.key});

  @override
  State<WelcomeScreen> createState() => _WelcomeScreenState();
}

class _WelcomeScreenState extends State<WelcomeScreen> {
  final OAuthService _oauthService = OAuthService();

  @override
  void initState() {
    super.initState();
    _initOAuthListener();
  }

  void _initOAuthListener() {
    _oauthService.initDeepLinkListener((token, userName) {
      if (!mounted) return;

      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Connected as ${userName ?? 'user'}!'),
          backgroundColor: RelayColors.green600,
        ),
      );

      Navigator.pushReplacementNamed(context, '/services');
    });
  }

  @override
  void dispose() {
    _oauthService.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return PageWithAccessibility(
      child: Scaffold(
        body: Container(
          decoration: const BoxDecoration(
            gradient: RelayGradients.background,
          ),
          child: SafeArea(
            child: Padding(
              padding: const EdgeInsets.all(24.0),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  Text(
                    'Relay',
                    textAlign: TextAlign.center,
                    style: GoogleFonts.quicksand(
                      fontSize: 64,
                      fontWeight: FontWeight.bold,
                      color: RelayColors.primary400,
                    ),
                  ),
                  const SizedBox(height: 12),
                  Text(
                    'Automation Platform',
                    textAlign: TextAlign.center,
                    style: GoogleFonts.quicksand(
                      fontSize: 18,
                      color: Colors.white.withOpacity(0.7),
                    ),
                  ),
                  const SizedBox(height: 48),
                  Row(
                    children: [
                      Expanded(
                        child: RelayGradientButton(
                          onPressed: () => Navigator.pushNamed(context, '/login'),
                          child: const Text(
                            'Login',
                            style: TextStyle(
                              fontSize: 16,
                              fontWeight: FontWeight.bold,
                              color: Colors.white,
                            ),
                          ),
                        ),
                      ),
                      const SizedBox(width: 16),
                      Expanded(
                        child: Container(
                          decoration: BoxDecoration(
                            color: RelayColors.glassWhite10,
                            borderRadius: BorderRadius.circular(12),
                            border: Border.all(
                              color: RelayColors.primary600,
                              width: 2,
                            ),
                          ),
                          child: ElevatedButton(
                            onPressed: () => Navigator.pushNamed(context, '/register'),
                            style: ElevatedButton.styleFrom(
                              backgroundColor: Colors.transparent,
                              shadowColor: Colors.transparent,
                              padding: const EdgeInsets.symmetric(vertical: 16),
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(12),
                              ),
                            ),
                            child: const Text(
                              'Register',
                              style: TextStyle(
                                fontSize: 16,
                                fontWeight: FontWeight.bold,
                                color: RelayColors.primary400,
                              ),
                            ),
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 24),
                  Row(
                    children: [
                      Expanded(
                        child: Divider(
                          color: Colors.white.withOpacity(0.2),
                        ),
                      ),
                      Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 16),
                        child: Text(
                          'or',
                          style: TextStyle(
                            color: Colors.white.withOpacity(0.6),
                          ),
                        ),
                      ),
                      Expanded(
                        child: Divider(
                          color: Colors.white.withOpacity(0.2),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 24),
                  _buildAuthButton(
                    context,
                    icon: Icons.g_mobiledata,
                    label: 'Google',
                    gradient: const LinearGradient(
                      colors: [Color(0xFF4285F4), Color(0xFF34A853)],
                    ),
                    onPressed: () => _launchOAuth(context, 'google'),
                  ),
                  const SizedBox(height: 12),
                  _buildAuthButton(
                    context,
                    icon: Icons.code,
                    label: 'GitHub',
                    gradient: const LinearGradient(
                      colors: [Color(0xFF24292E), Color(0xFF40464F)],
                    ),
                    onPressed: () => _launchOAuth(context, 'github'),
                  ),
                  const SizedBox(height: 12),
                  _buildAuthButton(
                    context,
                    icon: Icons.facebook,
                    label: 'Facebook',
                    gradient: const LinearGradient(
                      colors: [Color(0xFF1877F2), Color(0xFF0E5DC2)],
                    ),
                    onPressed: () => _launchOAuth(context, 'facebook'),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildAuthButton(
    BuildContext context, {
    required IconData icon,
    required String label,
    required Gradient gradient,
    required VoidCallback onPressed,
  }) {
    return Container(
      height: 56,
      decoration: BoxDecoration(
        gradient: gradient,
        borderRadius: BorderRadius.circular(12),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.2),
            blurRadius: 8,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: ElevatedButton.icon(
        onPressed: onPressed,
        icon: Icon(icon, color: Colors.white, size: 24),
        label: Text(
          label,
          style: GoogleFonts.quicksand(
            fontSize: 16,
            fontWeight: FontWeight.w600,
            color: Colors.white,
          ),
        ),
        style: ElevatedButton.styleFrom(
          backgroundColor: Colors.transparent,
          shadowColor: Colors.transparent,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
          ),
        ),
      ),
    );
  }
}

Future<void> _launchOAuth(BuildContext context, String provider) async {
  OAuthService().enable();

  final backendUrl = await HttpService.baseUrl;


  final sourceParam = kIsWeb ? '' : '?source=mobile';
  final uri = Uri.parse('$backendUrl/auth/oauth/$provider$sourceParam');

  try {
    final ok = await canLaunchUrl(uri);
    final launched = ok
        ? await launchUrl(uri, mode: LaunchMode.externalApplication)
        : await launchUrl(uri, mode: LaunchMode.externalApplication);

    if (!launched && context.mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: const Text("Opening navigator for OAuth impossible."),
          backgroundColor: RelayColors.red500,
        ),
      );
    }
  } catch (e) {
    if (context.mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Error: $e'),
          backgroundColor: RelayColors.red500,
        ),
      );
    }
  }
}
