import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import '../config/api_config.dart';

class HttpService {
  static String? _cachedBaseUrl;

  static Future<String> get baseUrl async {
    if (_cachedBaseUrl != null) {
      return _cachedBaseUrl!;
    }
    _cachedBaseUrl = await ApiConfig.getBaseUrl();
    return _cachedBaseUrl!;
  }

  static void resetCache() {
    _cachedBaseUrl = null;
  }

  Future<Map<String, String>> _getHeaders() async {
    final prefs = await SharedPreferences.getInstance();
    final token = prefs.getString('auth_token');
    
    return {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      if (token != null)
        'Authorization': 'Bearer $token',
    };
  }

  Future<http.Response> get(String endpoint) async {
    final url = await baseUrl;
    final uri = Uri.parse('$url$endpoint');
    final headers = await _getHeaders();
    return http.get(uri, headers: headers);
  }

  Future<http.Response> post(String endpoint, {Map<String, dynamic>? body}) async {
    final url = await baseUrl;
    final uri = Uri.parse('$url$endpoint');
    final headers = await _getHeaders();
    print('[HttpService] POST $uri');
    print('[HttpService] Headers: $headers');
    print('[HttpService] Body: ${jsonEncode(body ?? {})}');
    final response = await http.post(uri, headers: headers, body: jsonEncode(body ?? {}));
    print('[HttpService] Response status: ${response.statusCode}');
    print('[HttpService] Response body: ${response.body}');
    return response;
  }

  Future<http.Response> put(String endpoint, {Map<String, dynamic>? body}) async {
    final url = await baseUrl;
    final uri = Uri.parse('$url$endpoint');
    final headers = await _getHeaders();
    return http.put(uri, headers: headers, body: jsonEncode(body ?? {}));
  }

  Future<http.Response> patch(String endpoint, {Map<String, dynamic>? body}) async {
    final url = await baseUrl;
    final uri = Uri.parse('$url$endpoint');
    final headers = await _getHeaders();
    return http.patch(uri, headers: headers, body: jsonEncode(body ?? {}));
  }

  Future<http.Response> delete(String endpoint) async {
    final url = await baseUrl;
    final uri = Uri.parse('$url$endpoint');
    final headers = await _getHeaders();
    return http.delete(uri, headers: headers);
  }

  static String getErrorMessage(http.Response r) {
    try {
      final body = json.decode(r.body);
      if (body is Map && body['message'] != null) {
        return body['message'].toString();
      }
    } catch (_) {}
    return 'HTTP ${r.statusCode}';
  }
}