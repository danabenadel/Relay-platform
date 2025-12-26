import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';

enum AccessibilityMode {
  normal('Mode Normal', Icons.visibility, null),
  protanopia('Protanopie', Icons.remove_red_eye, 'Rouge-vert (déficience rouge)'),
  deuteranopia('Deutéranopie', Icons.remove_red_eye, 'Rouge-vert (le plus commun)'),
  tritanopia('Tritanopie', Icons.remove_red_eye, 'Bleu-jaune'),
  achromatopsia('Achromatopsie', Icons.visibility_off, 'Vision en niveaux de gris'),
  highContrast('Contraste Élevé', Icons.contrast, 'Mode haute lisibilité');

  final String label;
  final IconData icon;
  final String? description;

  const AccessibilityMode(this.label, this.icon, this.description);
}

class AccessibilityProvider extends ChangeNotifier {
  AccessibilityMode _currentMode = AccessibilityMode.normal;
  static const String _storageKey = 'accessibility_mode';

  AccessibilityMode get currentMode => _currentMode;

  AccessibilityProvider() {
    _loadMode();
  }

  Future<void> _loadMode() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final savedMode = prefs.getString(_storageKey);
      if (savedMode != null) {
        _currentMode = AccessibilityMode.values.firstWhere(
          (mode) => mode.name == savedMode,
          orElse: () => AccessibilityMode.normal,
        );
        notifyListeners();
      }
    } catch (e) {
      debugPrint('Error loading accessibility mode: $e');
    }
  }

  Future<void> setMode(AccessibilityMode mode) async {
    if (_currentMode == mode) return;

    _currentMode = mode;
    notifyListeners();

    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString(_storageKey, mode.name);
    } catch (e) {
      debugPrint('Error saving accessibility mode: $e');
    }
  }

  Future<void> resetToNormal() async {
    await setMode(AccessibilityMode.normal);
  }

  bool get isColorBlindMode =>
      _currentMode != AccessibilityMode.normal &&
      _currentMode != AccessibilityMode.highContrast;

  bool get isHighContrastMode => _currentMode == AccessibilityMode.highContrast;
}
