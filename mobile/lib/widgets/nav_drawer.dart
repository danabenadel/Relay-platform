import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../theme/theme.dart';
import '../services/oauth_service.dart';
import '../services/http_service.dart';

class AppNavDrawer extends StatefulWidget {
  const AppNavDrawer({super.key});

  @override
  State<AppNavDrawer> createState() => _AppNavDrawerState();
}

class _AppNavDrawerState extends State<AppNavDrawer> {
  Map<String, dynamic>? _userProfile;
  final HttpService _http = HttpService();

  @override
  void initState() {
    super.initState();
    _loadUserProfile();
  }

  Future<void> _loadUserProfile() async {
    try {
      final response = await _http.get('/auth/profile');
      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        setState(() {
          _userProfile = data['data'];
        });
      }
    } catch (e) {
      debugPrint('[NavDrawer] Error loading profile: $e');
    }
  }

  @override
  Widget build(BuildContext context) {
    return Drawer(
      backgroundColor: RelayColors.slate900,
      child: Container(
        decoration: const BoxDecoration(
          gradient: RelayGradients.background,
        ),
        child: Column(
          children: [
            Container(
              width: double.infinity,
              padding: const EdgeInsets.fromLTRB(24, 60, 24, 24),
              decoration: BoxDecoration(
                gradient: RelayGradients.gradientPrimary,
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      const CircleAvatar(
                        radius: 32,
                        backgroundColor: Colors.white,
                        child: Icon(
                          Icons.person,
                          size: 32,
                          color: RelayColors.primary600,
                        ),
                      ),
                      const Spacer(),
                      IconButton(
                        onPressed: () {
                          Navigator.pop(context);
                          _showEditProfileDialog(context);
                        },
                        icon: const Icon(
                          Icons.edit,
                          color: Colors.white,
                          size: 20,
                        ),
                        tooltip: 'Edit Profile',
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),
                  Text(
                    _userProfile?['name'] ?? _userProfile?['email']?.split('@')[0] ?? 'User',
                    style: GoogleFonts.quicksand(
                      fontSize: 20,
                      fontWeight: FontWeight.bold,
                      color: Colors.white,
                    ),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                  const SizedBox(height: 4),
                  Text(
                    _userProfile?['email'] ?? 'Loading...',
                    style: GoogleFonts.quicksand(
                      fontSize: 14,
                      color: Colors.white70,
                    ),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                ],
              ),
            ),
            Expanded(
              child: ListView(
                padding: const EdgeInsets.symmetric(vertical: 8),
                children: [
                  _buildDrawerItem(
                    context,
                    icon: Icons.apps,
                    title: 'Services',
                    route: '/services',
                  ),
                  _buildDrawerItem(
                    context,
                    icon: Icons.link,
                    title: 'My Areas',
                    route: '/my-areas',
                  ),
                  _buildDrawerItem(
                    context,
                    icon: Icons.add_circle_outline,
                    title: 'Create Area',
                    route: '/create-area',
                  ),
                  const Divider(
                    color: RelayColors.glassBorder,
                    height: 32,
                    indent: 16,
                    endIndent: 16,
                  ),
                  _buildDrawerItem(
                    context,
                    icon: Icons.logout,
                    title: 'Logout',
                    onTap: () => _logout(context),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildDrawerItem(
    BuildContext context, {
    required IconData icon,
    required String title,
    String? route,
    VoidCallback? onTap,
  }) {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: RelayColors.glassWhite10,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
          color: RelayColors.borderWhite20,
          width: 1,
        ),
      ),
      child: ListTile(
        leading: Icon(icon, color: RelayColors.primary400),
        title: Text(
          title,
          style: GoogleFonts.quicksand(
            fontWeight: FontWeight.w600,
            color: Colors.white,
          ),
        ),
        onTap: onTap ??
            () {
              Navigator.pop(context);
              if (route != null) {
                Navigator.pushReplacementNamed(context, route);
              }
            },
      ),
    );
  }

  void _showEditProfileDialog(BuildContext context) {
    final nameController = TextEditingController(text: _userProfile?['name'] ?? '');

    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        backgroundColor: RelayColors.slate900,
        title: Text(
          'Edit Profile',
          style: GoogleFonts.quicksand(
            color: Colors.white,
            fontWeight: FontWeight.bold,
          ),
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            TextField(
              controller: nameController,
              style: const TextStyle(color: Colors.white),
              decoration: InputDecoration(
                labelText: 'Name',
                labelStyle: const TextStyle(color: Colors.white70),
                enabledBorder: OutlineInputBorder(
                  borderSide: const BorderSide(color: RelayColors.borderWhite20),
                  borderRadius: BorderRadius.circular(8),
                ),
                focusedBorder: OutlineInputBorder(
                  borderSide: const BorderSide(color: RelayColors.primary400),
                  borderRadius: BorderRadius.circular(8),
                ),
              ),
            ),
            const SizedBox(height: 16),
            Text(
              'Email: ${_userProfile?['email'] ?? ''}',
              style: const TextStyle(color: Colors.white70, fontSize: 12),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: Text(
              'Cancel',
              style: GoogleFonts.quicksand(color: Colors.white70),
            ),
          ),
          ElevatedButton(
            onPressed: () async {
              Navigator.pop(context);
              await _updateProfile(nameController.text);
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: RelayColors.primary600,
            ),
            child: Text(
              'Save',
              style: GoogleFonts.quicksand(color: Colors.white),
            ),
          ),
        ],
      ),
    );
  }

  Future<void> _updateProfile(String newName) async {
    try {
      final response = await _http.put(
        '/auth/profile',
        body: {'name': newName},
      );

      if (response.statusCode == 200) {
        await _loadUserProfile();
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('Profile updated successfully'),
              backgroundColor: RelayColors.green600,
            ),
          );
        }
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Error updating profile: $e'),
            backgroundColor: RelayColors.red500,
          ),
        );
      }
    }
  }

  Future<void> _logout(BuildContext context) async {
    print('[Logout] Début du logout');

    final prefs = await SharedPreferences.getInstance();

    final tokenBefore = prefs.getString('auth_token');
    print('[Logout] Token avant: ${tokenBefore != null ? "existe" : "null"}');

    await prefs.remove('auth_token');
    await prefs.remove('user_name');

    final tokenAfter = prefs.getString('auth_token');
    print('[Logout] Token après: ${tokenAfter != null ? "existe encore (!)" : "null (OK)"}');

    OAuthService().cancelAll();
    print('[Logout] Listeners OAuth annulés');

    if (!context.mounted) return;

    print('[Logout] Navigation vers /welcome');
    Navigator.pushNamedAndRemoveUntil(
      context,
      '/welcome',
      (route) => false,
    );
  }
}