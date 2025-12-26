import 'package:flutter/material.dart';
import '../theme/colors.dart';

enum StatusType {
  success,
  error,
  warning,
  info,
  inactive,
}

class StatusBadge extends StatelessWidget {
  final StatusType status;
  final String label;
  final bool compact;

  const StatusBadge({
    super.key,
    required this.status,
    required this.label,
    this.compact = false,
  });

  IconData _getIcon() {
    switch (status) {
      case StatusType.success:
        return Icons.check_circle;
      case StatusType.error:
        return Icons.cancel;
      case StatusType.warning:
        return Icons.warning;
      case StatusType.info:
        return Icons.info;
      case StatusType.inactive:
        return Icons.pause_circle;
    }
  }

  Color _getBackgroundColor() {
    switch (status) {
      case StatusType.success:
        return RelayColors.green600;
      case StatusType.error:
        return RelayColors.red600;
      case StatusType.warning:
        return RelayColors.yellow500;
      case StatusType.info:
        return RelayColors.primary600;
      case StatusType.inactive:
        return Colors.grey.shade700;
    }
  }

  Color _getTextColor() {
    return Colors.white;
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: compact
          ? const EdgeInsets.symmetric(horizontal: 8, vertical: 4)
          : const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
      decoration: BoxDecoration(
        color: _getBackgroundColor(),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
          color: Colors.white.withOpacity(0.3),
          width: 1,
        ),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(
            _getIcon(),
            color: _getTextColor(),
            size: compact ? 14 : 16,
          ),
          const SizedBox(width: 4),
          Text(
            label,
            style: TextStyle(
              color: _getTextColor(),
              fontSize: compact ? 12 : 14,
              fontWeight: FontWeight.w600,
            ),
          ),
        ],
      ),
    );
  }
}

class AlertMessage extends StatelessWidget {
  final StatusType type;
  final String message;
  final String? title;
  final VoidCallback? onDismiss;
  final VoidCallback? onAction;
  final String? actionLabel;

  const AlertMessage({
    super.key,
    required this.type,
    required this.message,
    this.title,
    this.onDismiss,
    this.onAction,
    this.actionLabel,
  });

  IconData _getIcon() {
    switch (type) {
      case StatusType.success:
        return Icons.check_circle_outline;
      case StatusType.error:
        return Icons.error_outline;
      case StatusType.warning:
        return Icons.warning_amber;
      case StatusType.info:
        return Icons.info_outline;
      case StatusType.inactive:
        return Icons.info_outline;
    }
  }

  Color _getBackgroundColor() {
    switch (type) {
      case StatusType.success:
        return RelayColors.green600.withOpacity(0.1);
      case StatusType.error:
        return RelayColors.red600.withOpacity(0.1);
      case StatusType.warning:
        return RelayColors.yellow500.withOpacity(0.1);
      case StatusType.info:
        return RelayColors.primary600.withOpacity(0.1);
      case StatusType.inactive:
        return Colors.grey.withOpacity(0.1);
    }
  }

  Color _getBorderColor() {
    switch (type) {
      case StatusType.success:
        return RelayColors.green600;
      case StatusType.error:
        return RelayColors.red600;
      case StatusType.warning:
        return RelayColors.yellow500;
      case StatusType.info:
        return RelayColors.primary600;
      case StatusType.inactive:
        return Colors.grey.shade700;
    }
  }

  Color _getIconColor() {
    return _getBorderColor();
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: _getBackgroundColor(),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
          color: _getBorderColor(),
          width: 2,
        ),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(
            _getIcon(),
            color: _getIconColor(),
            size: 24,
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                if (title != null) ...[
                  Text(
                    title!,
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: 16,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 4),
                ],
                Text(
                  message,
                  style: TextStyle(
                    color: Colors.white.withOpacity(0.9),
                    fontSize: 14,
                  ),
                ),
                if (onAction != null && actionLabel != null) ...[
                  const SizedBox(height: 12),
                  TextButton(
                    onPressed: onAction,
                    style: TextButton.styleFrom(
                      foregroundColor: _getIconColor(),
                      padding: EdgeInsets.zero,
                      minimumSize: const Size(0, 0),
                      tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                    ),
                    child: Text(
                      actionLabel!,
                      style: const TextStyle(
                        fontWeight: FontWeight.w600,
                        decoration: TextDecoration.underline,
                      ),
                    ),
                  ),
                ],
              ],
            ),
          ),
          if (onDismiss != null) ...[
            const SizedBox(width: 8),
            IconButton(
              icon: const Icon(Icons.close),
              color: Colors.white.withOpacity(0.7),
              iconSize: 20,
              padding: EdgeInsets.zero,
              constraints: const BoxConstraints(),
              onPressed: onDismiss,
            ),
          ],
        ],
      ),
    );
  }
}

class AccessibleSnackBar {
  static SnackBar success(String message, {Duration? duration}) {
    return SnackBar(
      content: Row(
        children: [
          const Icon(
            Icons.check_circle,
            color: Colors.white,
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Text(message),
          ),
        ],
      ),
      backgroundColor: RelayColors.green600,
      behavior: SnackBarBehavior.floating,
      duration: duration ?? const Duration(seconds: 3),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(8),
      ),
    );
  }

  static SnackBar error(String message, {Duration? duration}) {
    return SnackBar(
      content: Row(
        children: [
          const Icon(
            Icons.error,
            color: Colors.white,
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Text(message),
          ),
        ],
      ),
      backgroundColor: RelayColors.red500,
      behavior: SnackBarBehavior.floating,
      duration: duration ?? const Duration(seconds: 4),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(8),
      ),
    );
  }

  static SnackBar warning(String message, {Duration? duration}) {
    return SnackBar(
      content: Row(
        children: [
          const Icon(
            Icons.warning,
            color: Colors.black87,
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Text(
              message,
              style: const TextStyle(color: Colors.black87),
            ),
          ),
        ],
      ),
      backgroundColor: RelayColors.yellow400,
      behavior: SnackBarBehavior.floating,
      duration: duration ?? const Duration(seconds: 3),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(8),
      ),
    );
  }

  static SnackBar info(String message, {Duration? duration}) {
    return SnackBar(
      content: Row(
        children: [
          const Icon(
            Icons.info,
            color: Colors.white,
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Text(message),
          ),
        ],
      ),
      backgroundColor: RelayColors.primary600,
      behavior: SnackBarBehavior.floating,
      duration: duration ?? const Duration(seconds: 3),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(8),
      ),
    );
  }
}

class AccessibleTextField extends StatelessWidget {
  final TextEditingController controller;
  final String label;
  final String? errorText;
  final bool isValid;
  final bool showValidation;
  final TextInputType? keyboardType;
  final bool obscureText;
  final String? hintText;

  const AccessibleTextField({
    super.key,
    required this.controller,
    required this.label,
    this.errorText,
    this.isValid = false,
    this.showValidation = false,
    this.keyboardType,
    this.obscureText = false,
    this.hintText,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        TextField(
          controller: controller,
          keyboardType: keyboardType,
          obscureText: obscureText,
          decoration: InputDecoration(
            labelText: label,
            hintText: hintText,
            errorText: showValidation && !isValid ? errorText : null,
            suffixIcon: showValidation
                ? Icon(
                    isValid ? Icons.check_circle : Icons.error,
                    color: isValid
                        ? RelayColors.green500
                        : RelayColors.red500,
                  )
                : null,
            enabledBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
              borderSide: BorderSide(
                color: showValidation
                    ? (isValid
                        ? RelayColors.green500
                        : RelayColors.red500)
                    : RelayColors.glassBorder,
                width: showValidation ? 2 : 1,
              ),
            ),
            focusedBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
              borderSide: BorderSide(
                color: showValidation
                    ? (isValid
                        ? RelayColors.green500
                        : RelayColors.red500)
                    : RelayColors.primary600,
                width: 2,
              ),
            ),
            errorBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
              borderSide: const BorderSide(
                color: RelayColors.red500,
                width: 2,
              ),
            ),
            focusedErrorBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
              borderSide: const BorderSide(
                color: RelayColors.red500,
                width: 2,
              ),
            ),
            filled: true,
            fillColor: RelayColors.glass,
          ),
          style: const TextStyle(color: Colors.white),
        ),
      ],
    );
  }
}
