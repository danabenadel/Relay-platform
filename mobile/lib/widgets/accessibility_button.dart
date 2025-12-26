import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/accessibility_provider.dart';
import '../theme/colors.dart';

class AccessibilityFloatingButton extends StatefulWidget {
  const AccessibilityFloatingButton({super.key});

  @override
  State<AccessibilityFloatingButton> createState() =>
      _AccessibilityFloatingButtonState();
}

class _AccessibilityFloatingButtonState
    extends State<AccessibilityFloatingButton> {
  bool _isMenuOpen = false;

  void _toggleMenu() {
    setState(() {
      _isMenuOpen = !_isMenuOpen;
    });
  }

  void _closeMenu() {
    if (_isMenuOpen) {
      setState(() {
        _isMenuOpen = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Consumer<AccessibilityProvider>(
      builder: (context, accessibilityProvider, child) {
        return Stack(
          children: [
            if (_isMenuOpen)
              Positioned.fill(
                child: GestureDetector(
                  onTap: _closeMenu,
                  child: Container(
                    color: Colors.black.withOpacity(0.5),
                  ),
                ),
              ),

            if (_isMenuOpen)
              Positioned(
                bottom: 80,
                right: 16,
                child: _buildAccessibilityMenu(accessibilityProvider),
              ),

            Positioned(
              bottom: 16,
              right: 16,
              child: _buildFloatingButton(accessibilityProvider),
            ),
          ],
        );
      },
    );
  }

  Widget _buildFloatingButton(AccessibilityProvider provider) {
    final isNormalMode = provider.currentMode == AccessibilityMode.normal;

    return Material(
      elevation: 6,
      borderRadius: BorderRadius.circular(16),
      color: Colors.transparent,
      child: Container(
        decoration: BoxDecoration(
          gradient: isNormalMode
              ? const LinearGradient(
                  colors: [RelayColors.primary600, RelayColors.indigo600],
                )
              : const LinearGradient(
                  colors: [RelayColors.yellow500, RelayColors.yellow400],
                ),
          borderRadius: BorderRadius.circular(16),
          border: Border.all(
            color: Colors.white.withOpacity(0.3),
            width: 2,
          ),
          boxShadow: [
            BoxShadow(
              color: (isNormalMode
                      ? RelayColors.primary600
                      : RelayColors.yellow500)
                  .withOpacity(0.4),
              blurRadius: 12,
              offset: const Offset(0, 4),
            ),
          ],
        ),
        child: InkWell(
          onTap: _toggleMenu,
          borderRadius: BorderRadius.circular(16),
          child: Padding(
            padding: const EdgeInsets.all(14),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Icon(
                  provider.currentMode.icon,
                  color: isNormalMode ? Colors.white : Colors.black87,
                  size: 24,
                ),
                if (_isMenuOpen) ...[
                  const SizedBox(width: 8),
                  Icon(
                    Icons.close,
                    color: isNormalMode ? Colors.white : Colors.black87,
                    size: 20,
                  ),
                ],
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildAccessibilityMenu(AccessibilityProvider provider) {
    return Material(
      elevation: 8,
      borderRadius: BorderRadius.circular(16),
      color: Colors.transparent,
      child: Container(
        width: 300,
        constraints: const BoxConstraints(maxHeight: 500),
        decoration: BoxDecoration(
          color: RelayColors.slate800,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(
            color: RelayColors.glassBorder,
            width: 2,
          ),
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              padding: const EdgeInsets.all(16),
              decoration: const BoxDecoration(
                gradient: LinearGradient(
                  colors: [RelayColors.primary600, RelayColors.indigo600],
                ),
                borderRadius: BorderRadius.only(
                  topLeft: Radius.circular(14),
                  topRight: Radius.circular(14),
                ),
              ),
              child: const Row(
                children: [
                  Icon(Icons.accessibility_new, color: Colors.white),
                  SizedBox(width: 12),
                  Expanded(
                    child: Text(
                      'Accessibilité',
                      style: TextStyle(
                        color: Colors.white,
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                ],
              ),
            ),

            Flexible(
              child: SingleChildScrollView(
                padding: const EdgeInsets.symmetric(vertical: 8),
                child: Column(
                  children: AccessibilityMode.values.map((mode) {
                    final isSelected = provider.currentMode == mode;
                    return _buildModeOption(
                      mode: mode,
                      isSelected: isSelected,
                      onTap: () async {
                        await provider.setMode(mode);
                        _closeMenu();
                        if (!mounted) return;
                        ScaffoldMessenger.of(context).showSnackBar(
                          SnackBar(
                            content: Row(
                              children: [
                                Icon(mode.icon, color: Colors.white),
                                const SizedBox(width: 12),
                                Expanded(
                                  child: Text('Mode ${mode.label} activé'),
                                ),
                              ],
                            ),
                            backgroundColor: isSelected
                                ? RelayColors.primary600
                                : RelayColors.yellow500,
                            behavior: SnackBarBehavior.floating,
                            duration: const Duration(seconds: 2),
                          ),
                        );
                      },
                    );
                  }).toList(),
                ),
              ),
            ),

            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: RelayColors.glass,
                borderRadius: const BorderRadius.only(
                  bottomLeft: Radius.circular(14),
                  bottomRight: Radius.circular(14),
                ),
              ),
              child: Row(
                children: [
                  const Icon(
                    Icons.info_outline,
                    size: 16,
                    color: RelayColors.primary400,
                  ),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      'Testez différents modes pour simuler le daltonisme',
                      style: TextStyle(
                        fontSize: 11,
                        color: Colors.white.withOpacity(0.7),
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildModeOption({
    required AccessibilityMode mode,
    required bool isSelected,
    required VoidCallback onTap,
  }) {
    return InkWell(
      onTap: onTap,
      child: Container(
        margin: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: isSelected
              ? RelayColors.primary600.withOpacity(0.2)
              : Colors.transparent,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(
            color: isSelected
                ? RelayColors.primary600
                : Colors.transparent,
            width: 2,
          ),
        ),
        child: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                color: isSelected
                    ? RelayColors.primary600
                    : RelayColors.glass,
                borderRadius: BorderRadius.circular(8),
              ),
              child: Icon(
                mode.icon,
                color: Colors.white,
                size: 20,
              ),
            ),
            const SizedBox(width: 12),

            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    mode.label,
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: 14,
                      fontWeight:
                          isSelected ? FontWeight.bold : FontWeight.w600,
                    ),
                  ),
                  if (mode.description != null) ...[
                    const SizedBox(height: 2),
                    Text(
                      mode.description!,
                      style: TextStyle(
                        color: Colors.white.withOpacity(0.6),
                        fontSize: 11,
                      ),
                    ),
                  ],
                ],
              ),
            ),

            if (isSelected)
              const Icon(
                Icons.check_circle,
                color: RelayColors.green400,
                size: 24,
              ),
          ],
        ),
      ),
    );
  }
}
