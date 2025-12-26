import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/accessibility_provider.dart';
import 'accessibility_button.dart';

class PageWithAccessibility extends StatelessWidget {
  final Widget child;
  final bool showAccessibilityButton;

  const PageWithAccessibility({
    super.key,
    required this.child,
    this.showAccessibilityButton = true,
  });

  @override
  Widget build(BuildContext context) {
    return Consumer<AccessibilityProvider>(
      builder: (context, accessibilityProvider, _) {
        Widget content = child;

        if (accessibilityProvider.isColorBlindMode ||
            accessibilityProvider.isHighContrastMode) {
          content = ColorFiltered(
            colorFilter: _getColorFilterForMode(accessibilityProvider.currentMode),
            child: content,
          );
        }

        if (showAccessibilityButton) {
          content = Stack(
            children: [
              content,
              const AccessibilityFloatingButton(),
            ],
          );
        }

        return content;
      },
    );
  }

  ColorFilter _getColorFilterForMode(AccessibilityMode mode) {
    switch (mode) {
      case AccessibilityMode.protanopia:
        return const ColorFilter.matrix([
          0.567, 0.433, 0.0, 0.0, 0.0,
          0.558, 0.442, 0.0, 0.0, 0.0,
          0.0, 0.242, 0.758, 0.0, 0.0,
          0.0, 0.0, 0.0, 1.0, 0.0,
        ]);

      case AccessibilityMode.deuteranopia:
        return const ColorFilter.matrix([
          0.625, 0.375, 0.0, 0.0, 0.0,
          0.7, 0.3, 0.0, 0.0, 0.0,
          0.0, 0.3, 0.7, 0.0, 0.0,
          0.0, 0.0, 0.0, 1.0, 0.0,
        ]);

      case AccessibilityMode.tritanopia:
        return const ColorFilter.matrix([
          0.95, 0.05, 0.0, 0.0, 0.0,
          0.0, 0.433, 0.567, 0.0, 0.0,
          0.0, 0.475, 0.525, 0.0, 0.0,
          0.0, 0.0, 0.0, 1.0, 0.0,
        ]);

      case AccessibilityMode.achromatopsia:
        return const ColorFilter.matrix([
          0.299, 0.587, 0.114, 0.0, 0.0,
          0.299, 0.587, 0.114, 0.0, 0.0,
          0.299, 0.587, 0.114, 0.0, 0.0,
          0.0, 0.0, 0.0, 1.0, 0.0,
        ]);

      case AccessibilityMode.highContrast:
        return const ColorFilter.matrix([
          1.5, 0.0, 0.0, 0.0, -0.25,
          0.0, 1.5, 0.0, 0.0, -0.25,
          0.0, 0.0, 1.5, 0.0, -0.25,
          0.0, 0.0, 0.0, 1.0, 0.0,
        ]);

      case AccessibilityMode.normal:
        return const ColorFilter.mode(
          Colors.transparent,
          BlendMode.dst,
        );
    }
  }
}
