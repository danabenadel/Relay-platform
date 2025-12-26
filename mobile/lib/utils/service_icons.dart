import 'package:flutter/material.dart';
import '../theme/theme.dart';

class ServiceIcons {
  static IconData getIcon(String serviceName) {
    final normalized = serviceName.toLowerCase();

    if (normalized.startsWith('spotify')) return Icons.speaker;
    if (normalized.startsWith('discord')) return Icons.discord;
    if (normalized.startsWith('timer')) return Icons.timer;
    if (normalized.startsWith('console')) return Icons.terminal;
    if (normalized.startsWith('google')) return Icons.g_mobiledata;
    if (normalized.startsWith('github')) return Icons.code;
    if (normalized.startsWith('gitlab')) return Icons.merge_type;
    if (normalized.startsWith('facebook')) return Icons.facebook;
    if (normalized.startsWith('reddit')) return Icons.reddit;
    if (normalized.startsWith('onedrive')) return Icons.cloud;
    if (normalized.startsWith('telegram')) return Icons.telegram;
    if (normalized.startsWith('notion')) return Icons.note_alt;
    if (normalized.startsWith('openai')) return Icons.psychology;
    if (normalized.startsWith('youtube')) return Icons.play_circle_filled;

    return Icons.apps;
  }

  static Color getColor(String serviceName) {
    final normalized = serviceName.toLowerCase();

    if (normalized.startsWith('spotify')) return const Color(0xFF1DB954);
    if (normalized.startsWith('discord')) return const Color(0xFF5865F2);
    if (normalized.startsWith('timer')) return RelayColors.primary600;
    if (normalized.startsWith('console')) return RelayColors.slate900;
    if (normalized.startsWith('google')) return const Color(0xFF4285F4);
    if (normalized.startsWith('github')) return const Color(0xFF171515);
    if (normalized.startsWith('gitlab')) return const Color(0xFFFC6D26);
    if (normalized.startsWith('facebook')) return const Color(0xFF1877F2);
    if (normalized.startsWith('reddit')) return const Color(0xFFFF4500);
    if (normalized.startsWith('onedrive')) return const Color(0xFF0078D4);
    if (normalized.startsWith('telegram')) return const Color(0xFF229ED9);
    if (normalized.startsWith('notion')) return const Color(0xFF2F3437);
    if (normalized.startsWith('openai')) return const Color(0xFF10A37F);
    if (normalized.startsWith('youtube')) return const Color(0xFFFF0000);

    return RelayColors.primary600;
  }

  static Color getBackgroundColor(String serviceName) {
    return getColor(serviceName).withOpacity(0.2);
  }
}
