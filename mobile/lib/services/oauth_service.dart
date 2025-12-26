import 'dart:async';
import 'package:app_links/app_links.dart';
import 'package:shared_preferences/shared_preferences.dart';

class OAuthService {
  static final OAuthService _instance = OAuthService._internal();
  factory OAuthService() => _instance;
  OAuthService._internal();

  final AppLinks _appLinks = AppLinks();
  StreamSubscription? _sub;
  bool _isDisabled = false;

  Future<void> initDeepLinkListener(Function(String token, String? userName) onSuccess, {Function()? onServiceConnected}) async {
    try {
      final initialUri = await _appLinks.getInitialLink();
      if (initialUri != null) {
        _handleDeepLink(initialUri, onSuccess, onServiceConnected: onServiceConnected);
      }

      _sub = _appLinks.uriLinkStream.listen((Uri uri) {
        _handleDeepLink(uri, onSuccess, onServiceConnected: onServiceConnected);
      });
    } catch (e) {
      print('Error initializing deep link listener: $e');
    }
  }

  void _handleDeepLink(Uri uri, Function(String token, String? userName) onSuccess, {Function()? onServiceConnected}) async {
    print('[OAuth] Deep link reçu: ${uri.toString()}');

    if (_isDisabled) {
      print('[OAuth] Service désactivé, deep link ignoré');
      return;
    }

    if (uri.scheme == 'relay' && uri.host == 'oauth-callback') {
      final token = uri.queryParameters['token'];
      final userName = uri.queryParameters['name'];
      final service = uri.queryParameters['service'];
      final status = uri.queryParameters['status'];

      if (service != null && status != null) {
        print('[OAuth] Service connection callback: $service - $status');
        if (onServiceConnected != null) {
          onServiceConnected();
        }
        return;
      }

      print('[OAuth] Token extrait: ${token != null ? "OUI" : "NON"}');

      if (token != null && token.isNotEmpty) {
        print('[OAuth] Sauvegarde du token dans SharedPreferences');

        final prefs = await SharedPreferences.getInstance();
        await prefs.setString('auth_token', token);

        if (userName != null && userName.isNotEmpty) {
          await prefs.setString('user_name', userName);
        }

        print('[OAuth] Token sauvegardé, appel du callback onSuccess');
        onSuccess(token, userName);
      }
    }
  }

  void dispose() {
    _sub?.cancel();
    _sub = null;
  }

  void cancelAll() {
    print('[OAuth] cancelAll() appelé - désactivation du service');
    _isDisabled = true;
    _sub?.cancel();
    _sub = null;
  }

  void enable() {
    print('[OAuth] Service réactivé');
    _isDisabled = false;
  }
}
