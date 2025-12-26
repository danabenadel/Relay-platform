import 'package:flutter/material.dart';

class RelayColors {
  static const primary50  = Color(0xFFEFF6FF);
  static const primary100 = Color(0xFFDBEAFE);
  static const primary200 = Color(0xFFBFDBFE);
  static const primary300 = Color(0xFF93C5FD);
  static const primary400 = Color(0xFF60A5FA);
  static const primary500 = Color(0xFF3B82F6);
  static const primary600 = Color(0xFF2563EB);
  static const primary700 = Color(0xFF1D4ED8);
  static const primary800 = Color(0xFF1E40AF);
  static const primary900 = Color(0xFF1E3A8A);

  static const indigo500 = Color(0xFF6366F1);
  static const indigo600 = Color(0xFF4F46E5);
  static const indigo700 = Color(0xFF4338CA);
  static const indigo800 = Color(0xFF3730A3);
  static const indigo900 = Color(0xFF312E81);

  static const purple400 = Color(0xFFA78BFA);
  static const purple600 = Color(0xFF9333EA);
  static const cyan600   = Color(0xFF0891B2);

  static const green400  = Color(0xFF4ADE80);
  static const green500  = Color(0xFF22C55E);
  static const green600  = Color(0xFF16A34A);

  static const red500    = Color(0xFFEF4444);
  static const red600    = Color(0xFFDC2626);

  static const yellow400 = Color(0xFFFACC15);
  static const yellow500 = Color(0xFFEAB308);

  static const slate800  = Color(0xFF1E293B);
  static const slate900  = Color(0xFF0F172A);
  static const white     = Colors.white;

  static const glass       = Color(0x1AFFFFFF);
  static const glassHover  = Color(0x26FFFFFF);
  static const glassBorder = Color(0x33FFFFFF);

  static const gradientPrimary = LinearGradient(
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
    colors: [RelayColors.primary600, RelayColors.indigo600],
  );

  static const gradientPrimaryHover = LinearGradient(
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
    colors: [RelayColors.primary700, RelayColors.indigo700],
  );

  static const gradientSuccess = LinearGradient(
    begin: Alignment.centerLeft,
    end: Alignment.centerRight,
    colors: [RelayColors.green600, RelayColors.primary600],
  );

  static const gradientError = LinearGradient(
    begin: Alignment.centerLeft,
    end: Alignment.centerRight,
    colors: [RelayColors.red600, RelayColors.red500],
  );

  static const gradientWarning = LinearGradient(
    begin: Alignment.centerLeft,
    end: Alignment.centerRight,
    colors: [RelayColors.yellow500, RelayColors.yellow400],
  );

  static const gradientBackground = LinearGradient(
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
    colors: [RelayColors.slate900, RelayColors.primary900, RelayColors.indigo900],
  );
}
