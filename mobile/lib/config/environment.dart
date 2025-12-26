import 'package:flutter/foundation.dart' show kIsWeb;

class Environment {
  static const bool usePhysicalDevice = true;

  static const String localIpAddress = '172.20.10.3';

  static String get baseUrl {
    if (kIsWeb) {
      return 'http://localhost:8080';
    }

    if (usePhysicalDevice) {
      return 'http://$localIpAddress:8080';
    } else {
      return 'http://10.0.2.2:8080';
    }
  }
}
