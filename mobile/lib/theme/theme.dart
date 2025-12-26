import 'package:flutter/material.dart';

class RelayColors {
  // Primary Blues
  static const Color primary400 = Color(0xFF60A5FA);
  static const Color primary500 = Color(0xFF3B82F6);
  static const Color primary600 = Color(0xFF2563EB);
  static const Color primary700 = Color(0xFF1D4ED8);

  // Indigo
  static const Color indigo500 = Color(0xFF6366F1);
  static const Color indigo600 = Color(0xFF4F46E5);
  static const Color indigo700 = Color(0xFF4338CA);
  static const Color indigo800 = Color(0xFF3730A3);
  static const Color indigo900 = Color(0xFF312E81);

  // Purple
  static const Color purple400 = Color(0xFFA78BFA);
  static const Color purple600 = Color(0xFF9333EA);
  static const Color purple700 = Color(0xFF7E22CE);

  // Success (Green)
  static const Color green400 = Color(0xFF4ADE80);
  static const Color green500 = Color(0xFF22C55E);
  static const Color green600 = Color(0xFF16A34A);

  // Error (Red)
  static const Color red500 = Color(0xFFEF4444);
  static const Color red600 = Color(0xFFDC2626);

  // Warning (Yellow)
  static const Color yellow400 = Color(0xFFFACC15);
  static const Color yellow500 = Color(0xFFEAB308);

  // Slate backgrounds
  static const Color slate800 = Color(0xFF1E293B);
  static const Color slate900 = Color(0xFF0F172A);

  // Glass effect colors
  static const Color glassWhite10 = Color(0x1AFFFFFF);
  static const Color glassWhite20 = Color(0x33FFFFFF);
  static const Color borderWhite10 = Color(0x1AFFFFFF);
  static const Color borderWhite20 = Color(0x33FFFFFF);
  static const Color glassBorder = Color(0x33FFFFFF); // Ajouté
}

class RelayGradients {
  static const LinearGradient primary = LinearGradient(
    colors: [Color(0xFF2563EB), Color(0xFF9333EA)],
    begin: Alignment.centerLeft,
    end: Alignment.centerRight,
  );

  static const LinearGradient primaryHover = LinearGradient(
    colors: [Color(0xFF1D4ED8), Color(0xFF7E22CE)],
    begin: Alignment.centerLeft,
    end: Alignment.centerRight,
  );

  static const LinearGradient auth = LinearGradient(
    colors: [Color(0xFF2563EB), Color(0xFF4F46E5)],
    begin: Alignment.centerLeft,
    end: Alignment.centerRight,
  );

  static const LinearGradient success = LinearGradient(
    colors: [Color(0xFF16A34A), Color(0xFF2563EB)],
    begin: Alignment.centerLeft,
    end: Alignment.centerRight,
  );

  static const LinearGradient background = LinearGradient(
    colors: [
      Color(0xFF0F172A),
      Color(0xFF1E3A8A),
      Color(0xFF312E81),
    ],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  // Ajouté pour nav_drawer
  static const LinearGradient gradientPrimary = primary;
}

class RelayTheme {
  static ThemeData darkTheme = ThemeData(
    brightness: Brightness.dark,
    primaryColor: RelayColors.primary600,
    scaffoldBackgroundColor: RelayColors.slate900,
    
    colorScheme: const ColorScheme.dark(
      primary: RelayColors.primary600,
      secondary: RelayColors.indigo600,
      surface: RelayColors.slate800,
      error: RelayColors.red500,
    ),

    appBarTheme: const AppBarTheme(
      backgroundColor: RelayColors.glassWhite10,
      elevation: 0,
      centerTitle: true,
    ),

    cardTheme: CardThemeData( // Changé de CardTheme à CardThemeData
      color: RelayColors.glassWhite10,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
        side: const BorderSide(
          color: RelayColors.borderWhite20,
          width: 1,
        ),
      ),
    ),

    inputDecorationTheme: InputDecorationTheme(
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

    elevatedButtonTheme: ElevatedButtonThemeData(
      style: ElevatedButton.styleFrom(
        elevation: 0,
        padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(12),
        ),
      ),
    ),

    floatingActionButtonTheme: const FloatingActionButtonThemeData(
      backgroundColor: RelayColors.primary600,
      foregroundColor: Colors.white,
    ),
  );
}

// Widget gradient button
class RelayGradientButton extends StatelessWidget {
  final VoidCallback? onPressed;
  final Widget child;
  final EdgeInsetsGeometry? padding;

  const RelayGradientButton({
    super.key,
    required this.onPressed,
    required this.child,
    this.padding,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        gradient: onPressed != null ? RelayGradients.primary : null,
        color: onPressed == null ? Colors.grey.shade700 : null,
        borderRadius: BorderRadius.circular(12),
      ),
      child: ElevatedButton(
        onPressed: onPressed,
        style: ElevatedButton.styleFrom(
          backgroundColor: Colors.transparent,
          shadowColor: Colors.transparent,
          padding: padding ?? const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
          ),
        ),
        child: child,
      ),
    );
  }
}

// Glass Card Widget
class RelayGlassCard extends StatelessWidget {
  final Widget child;
  final EdgeInsetsGeometry? padding;
  final VoidCallback? onTap;

  const RelayGlassCard({
    super.key,
    required this.child,
    this.padding,
    this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: RelayColors.glassWhite10,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: RelayColors.borderWhite20,
          width: 1,
        ),
      ),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          onTap: onTap,
          borderRadius: BorderRadius.circular(16),
          child: Padding(
            padding: padding ?? const EdgeInsets.all(16),
            child: child,
          ),
        ),
      ),
    );
  }
}