import 'package:flutter/foundation.dart' show kIsWeb;
import 'package:shared_preferences/shared_preferences.dart';

class ApiConfig {
  static const String _customUrlKey = 'custom_api_url';

  static const String webUrl = 'http://localhost:8080';
  static const String emulatorUrl = 'http://10.0.2.2:8080';
  static const String physicalDeviceUrl = 'http://172.20.10.3:8080';

  static Future<String> getBaseUrl() async {
    if (kIsWeb) {
      return webUrl;
    }

    const envUrl = String.fromEnvironment('API_BASE_URL', defaultValue: '');
    if (envUrl.isNotEmpty) {
      return envUrl;
    }

    final prefs = await SharedPreferences.getInstance();
    final customUrl = prefs.getString(_customUrlKey);
    if (customUrl != null && customUrl.isNotEmpty) {
      return customUrl;
    }

    return physicalDeviceUrl;
  }

  static Future<void> setCustomUrl(String url) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_customUrlKey, url);
  }

  static Future<void> clearCustomUrl() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(_customUrlKey);
  }

  static Future<String?> getCustomUrl() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString(_customUrlKey);
  }
}
