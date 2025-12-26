import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../services/http_service.dart';
import '../theme/theme.dart';
import '../widgets/nav_drawer.dart';
import '../widgets/page_with_accessibility.dart';

class CreateAreaScreen extends StatefulWidget {
  const CreateAreaScreen({super.key});

  @override
  State<CreateAreaScreen> createState() => _CreateAreaScreenState();
}

class _CreateAreaScreenState extends State<CreateAreaScreen> {
  final HttpService _http = HttpService();
  final _formKey = GlobalKey<FormState>();

  List<dynamic> _services = [];
  bool _isLoading = false;
  Map<String, dynamic> _connectedOAuthServices = {};
  String? _userEmail;

  String? _selectedActionService;
  Map<String, dynamic>? _selectedAction;
  Map<String, TextEditingController> _actionParams = {};

  String? _selectedReactionService;
  Map<String, dynamic>? _selectedReaction;
  Map<String, TextEditingController> _reactionParams = {};

  int _currentStep = 0;

  final Set<String> _oauthServices = {'spotify', 'reddit', 'google', 'github', 'facebook', 'discord', 'onedrive'};

  @override
  void initState() {
    super.initState();
    _loadUserProfile();
    _loadServices();
  }

  Future<void> _loadUserProfile() async {
    try {
      final response = await _http.get('/auth/profile');

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        final user = data['data'];

        setState(() {
          _userEmail = user['email'];

          if (user['oauthTokens'] != null) {
            _connectedOAuthServices = {};
            for (var token in user['oauthTokens']) {
              _connectedOAuthServices[token['serviceName'].toString().toLowerCase()] = token;
            }
          }
        });
      }
    } catch (e) {
      debugPrint('[CreateArea] Error loading user profile: $e');
    }
  }

  Future<void> _loadServices() async {
    setState(() => _isLoading = true);

    try {
      final servicesResponse = await _http.get('/api/areas/services');

      if (servicesResponse.statusCode == 200) {
        final data = jsonDecode(servicesResponse.body);
        setState(() {
          _services = (data['data'] as List?) ?? [];
          _isLoading = false;
        });
      } else {
        setState(() => _isLoading = false);
        if (!mounted) return;
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Error loading services: ${HttpService.getErrorMessage(servicesResponse)}'),
            backgroundColor: RelayColors.red500,
          ),
        );
      }
    } catch (e) {
      setState(() => _isLoading = false);
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Network error: $e'),
          backgroundColor: RelayColors.red500,
        ),
      );
    }
  }

  List<dynamic> _getActionsForService(String serviceName) {
    final service = _services.firstWhere(
      (s) => s['name'] == serviceName,
      orElse: () => {},
    );
    return (service['actions'] as List?) ?? [];
  }

  List<dynamic> _getReactionsForService(String serviceName) {
    final service = _services.firstWhere(
      (s) => s['name'] == serviceName,
      orElse: () => {},
    );
    return (service['reactions'] as List?) ?? [];
  }

  void _initializeActionParams() {
    _actionParams.forEach((_, c) => c.dispose());
    _actionParams.clear();
    final params = (_selectedAction?['params'] as List?) ?? [];
    for (var param in params) {
      final paramName = param['name'] ?? '';
      _actionParams[paramName] = TextEditingController();
    }
  }

  void _initializeReactionParams() {
    _reactionParams.forEach((_, c) => c.dispose());
    _reactionParams.clear();
    final params = (_selectedReaction?['params'] as List?) ?? [];
    for (var param in params) {
      final paramName = param['name'] ?? '';
      _reactionParams[paramName] = TextEditingController();
    }
  }

  bool _isOAuthService(String serviceName) {
    return _oauthServices.contains(serviceName.toLowerCase());
  }

  bool _isServiceConnected(String serviceName) {
    return _connectedOAuthServices.containsKey(serviceName.toLowerCase());
  }

  bool _validateStep() {
    if (_currentStep == 0) {
      if (_selectedActionService == null || _selectedAction == null) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: const Text('Please select a service and an action'),
            backgroundColor: RelayColors.yellow500,
          ),
        );
        return false;
      }

      if (_isOAuthService(_selectedActionService!) && !_isServiceConnected(_selectedActionService!)) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Please connect to ${_selectedActionService!.toUpperCase()} first'),
            backgroundColor: RelayColors.yellow500,
          ),
        );
        return false;
      }

      final params = (_selectedAction?['params'] as List?) ?? [];
      for (var param in params) {
        final paramName = param['name'] ?? '';
        final required = param['required'] ?? false;
        if (required && _actionParams[paramName]?.text.trim().isEmpty == true) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text('The parameter "$paramName" is required'),
              backgroundColor: RelayColors.yellow500,
            ),
          );
          return false;
        }
      }
      return true;
    } else if (_currentStep == 1) {
      if (_selectedReactionService == null || _selectedReaction == null) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: const Text('Please select a service and a reaction'),
            backgroundColor: RelayColors.yellow500,
          ),
        );
        return false;
      }

      if (_isOAuthService(_selectedReactionService!) && !_isServiceConnected(_selectedReactionService!)) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Please connect to ${_selectedReactionService!.toUpperCase()} first'),
            backgroundColor: RelayColors.yellow500,
          ),
        );
        return false;
      }

      final params = (_selectedReaction?['params'] as List?) ?? [];
      for (var param in params) {
        final paramName = param['name'] ?? '';
        final required = param['required'] ?? false;
        final value = _reactionParams[paramName]?.text.trim() ?? '';
        if (required && value.isEmpty) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text('The parameter "$paramName" is required'),
              backgroundColor: RelayColors.yellow500,
            ),
          );
          return false;
        }
      }
      return true;
    }
    return false;
  }

  Future<void> _createArea() async {
    if (!_validateStep()) return;

    final actionParams = <String, dynamic>{};
    _actionParams.forEach((key, controller) {
      if (controller.text.isNotEmpty) {
        actionParams[key] = controller.text;
      }
    });

    final reactionParams = <String, dynamic>{};
    _reactionParams.forEach((key, controller) {
      if (controller.text.isNotEmpty) {
        reactionParams[key] = controller.text;
      }
    });

    final config = <String, dynamic>{};

    if (_selectedAction!['name'] == 'timer_time' && actionParams['time'] != null) {
      config['targetTime'] = actionParams['time'];
      config['timerType'] = 'time';
    } else if (_selectedAction!['name'] == 'timer_date' && actionParams['date'] != null) {
      config['targetDate'] = actionParams['date'];
      config['timerType'] = 'date';
    } else {
      actionParams.forEach((key, value) {
        config[key] = value;
      });
    }

    if (_selectedReaction!['name'] == 'discord_webhook') {
      config['discordWebhookUrl'] = reactionParams['webhook_url'];
      config['discordMessage'] = reactionParams['message'];
    } else if (_selectedReaction!['name'] == 'console_log') {
      config['consoleMessage'] = reactionParams['message'];
    } else {
      reactionParams.forEach((key, value) {
        config[key] = value;
      });
    }

    final areaData = {
      'actionId': _selectedAction!['id'],
      'reactionId': _selectedReaction!['id'],
      'config': config,
    };

    setState(() => _isLoading = true);
    try {
      final response = await _http.post('/api/areas', body: areaData);
      if (!mounted) return;

      if (response.statusCode == 200 || response.statusCode == 201) {
        String areaId = 'unknown';
        try {
          final responseData = jsonDecode(response.body);
          areaId = (responseData['id'] ?? responseData['area_id'] ?? responseData['_id'] ?? 'unknown').toString();
        } catch (_) {}

        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('AREA successfully created! (ID: $areaId)'),
            backgroundColor: RelayColors.green600,
            duration: const Duration(seconds: 3),
          ),
        );

        Navigator.pushNamedAndRemoveUntil(
          context,
          '/my-areas',
          (route) => route.settings.name == '/services',
        );
      } else {
        String errorMessage = 'Unknown error';
        try {
          final errorBody = jsonDecode(response.body);
          errorMessage = errorBody['message'] ?? errorBody['error'] ?? HttpService.getErrorMessage(response);
        } catch (_) {
          errorMessage = HttpService.getErrorMessage(response);
        }

        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Error: $errorMessage'),
            backgroundColor: RelayColors.red500,
            duration: const Duration(seconds: 4),
          ),
        );
      }
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Network error: $e'),
          backgroundColor: RelayColors.red500,
          duration: const Duration(seconds: 4),
        ),
      );
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return PageWithAccessibility(
      child: Scaffold(
        backgroundColor: RelayColors.slate900,
        appBar: AppBar(
          backgroundColor: RelayColors.glassWhite10,
          elevation: 0,
          title: Text(
            'Create AREA',
            style: GoogleFonts.quicksand(
              fontWeight: FontWeight.bold,
              color: Colors.white,
            ),
          ),
          centerTitle: true,
          leading: IconButton(
            icon: const Icon(Icons.arrow_back, color: Colors.white),
            onPressed: () => Navigator.pop(context),
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pushReplacementNamed(context, '/services'),
              child: Text(
                'Services',
                style: GoogleFonts.quicksand(
                  fontWeight: FontWeight.w600,
                  color: RelayColors.primary400,
                ),
              ),
            ),
            TextButton(
              onPressed: () => Navigator.pushReplacementNamed(context, '/my-areas'),
              child: Text(
                'My Areas',
                style: GoogleFonts.quicksand(
                  fontWeight: FontWeight.w600,
                  color: RelayColors.primary400,
                ),
              ),
            ),
            Builder(
              builder: (context) => IconButton(
                icon: const Icon(Icons.menu, color: Colors.white),
                onPressed: () => Scaffold.of(context).openEndDrawer(),
              ),
            ),
          ],
        ),
        endDrawer: const AppNavDrawer(),
        body: Container(
          decoration: const BoxDecoration(
            gradient: RelayGradients.background,
          ),
          child: _isLoading
              ? const Center(
                  child: CircularProgressIndicator(color: RelayColors.primary600),
                )
              : Theme(
                  data: Theme.of(context).copyWith(
                    colorScheme: ColorScheme.dark(
                      primary: RelayColors.primary600,
                      surface: RelayColors.slate800,
                    ),
                  ),
                  child: Stepper(
                    currentStep: _currentStep,
                    type: StepperType.vertical,
                    elevation: 0,
                    onStepContinue: () {
                      if (_currentStep == 0) {
                        if (_validateStep()) {
                          setState(() => _currentStep = 1);
                        }
                      } else {
                        _createArea();
                      }
                    },
                    onStepCancel: () {
                      if (_currentStep > 0) {
                        setState(() => _currentStep -= 1);
                      } else {
                        Navigator.pop(context);
                      }
                    },
                    controlsBuilder: (context, details) {
                      return Padding(
                        padding: const EdgeInsets.only(top: 16),
                        child: Row(
                          children: [
                            RelayGradientButton(
                              onPressed: details.onStepContinue,
                              padding: const EdgeInsets.symmetric(
                                horizontal: 24,
                                vertical: 12,
                              ),
                              child: Text(
                                _currentStep == 1 ? 'Create' : 'Next',
                                style: const TextStyle(
                                  color: Colors.white,
                                  fontWeight: FontWeight.w600,
                                ),
                              ),
                            ),
                            const SizedBox(width: 12),
                            Container(
                              decoration: BoxDecoration(
                                color: RelayColors.glassWhite10,
                                borderRadius: BorderRadius.circular(12),
                                border: Border.all(
                                  color: RelayColors.borderWhite20,
                                  width: 1,
                                ),
                              ),
                              child: TextButton(
                                onPressed: details.onStepCancel,
                                style: TextButton.styleFrom(
                                  padding: const EdgeInsets.symmetric(
                                    horizontal: 24,
                                    vertical: 12,
                                  ),
                                ),
                                child: Text(
                                  _currentStep == 0 ? 'Cancel' : 'Back',
                                  style: const TextStyle(
                                    color: RelayColors.primary400,
                                    fontWeight: FontWeight.w600,
                                  ),
                                ),
                              ),
                            ),
                          ],
                        ),
                      );
                    },
                    steps: [
                      Step(
                        title: Text(
                          'Select an Action',
                          style: GoogleFonts.quicksand(
                            fontWeight: FontWeight.bold,
                            color: Colors.white,
                          ),
                        ),
                        subtitle: Text(
                          'Choose the trigger for your automation',
                          style: TextStyle(
                            color: Colors.white.withOpacity(0.6),
                            fontSize: 12,
                          ),
                        ),
                        content: _buildActionStep(),
                        isActive: _currentStep >= 0,
                        state: _currentStep > 0 ? StepState.complete : StepState.indexed,
                      ),
                      Step(
                        title: Text(
                          'Select a Reaction',
                          style: GoogleFonts.quicksand(
                            fontWeight: FontWeight.bold,
                            color: Colors.white,
                          ),
                        ),
                        subtitle: Text(
                          'Choose what happens when triggered',
                          style: TextStyle(
                            color: Colors.white.withOpacity(0.6),
                            fontSize: 12,
                          ),
                        ),
                        content: _buildReactionStep(),
                        isActive: _currentStep >= 1,
                        state: _currentStep > 1 ? StepState.complete : StepState.indexed,
                      ),
                    ],
                  ),
                ),
        ),
      ),
    );
  }

  Widget _buildActionStep() {
    final needsOAuth = _selectedActionService != null &&
                       _isOAuthService(_selectedActionService!) &&
                       !_isServiceConnected(_selectedActionService!);

    return Expanded(
      child: SingleChildScrollView(
        padding: const EdgeInsets.only(bottom: 20),
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              DropdownButtonFormField<String>(
            value: _selectedActionService,
            dropdownColor: RelayColors.slate800,
            style: const TextStyle(color: Colors.white),
            decoration: InputDecoration(
              labelText: 'Service',
              labelStyle: TextStyle(color: Colors.white.withOpacity(0.7)),
              prefixIcon: const Icon(Icons.apps, color: RelayColors.primary400),
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
            items: _services.map<DropdownMenuItem<String>>((service) {
              final name = service['name'] ?? '';
              return DropdownMenuItem<String>(
                value: name,
                child: Text(
                  name.toUpperCase(),
                  overflow: TextOverflow.ellipsis,
                  maxLines: 1,
                ),
              );
            }).toList(),
            onChanged: (value) {
              setState(() {
                _selectedActionService = value;
                _selectedAction = null;
                _actionParams.forEach((_, c) => c.dispose());
                _actionParams.clear();
              });
            },
            ),
            const SizedBox(height: 16),
            if (_selectedActionService != null)
              DropdownButtonFormField<Map<String, dynamic>>(
              value: _selectedAction,
              dropdownColor: RelayColors.slate800,
              style: const TextStyle(color: Colors.white),
              decoration: InputDecoration(
                labelText: 'Action',
                labelStyle: TextStyle(color: Colors.white.withOpacity(0.7)),
                prefixIcon: const Icon(Icons.play_arrow, color: RelayColors.primary600),
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
              items: _getActionsForService(_selectedActionService!)
                  .map<DropdownMenuItem<Map<String, dynamic>>>((action) {
                return DropdownMenuItem<Map<String, dynamic>>(
                  value: action,
                  child: Text(
                    action['description'] ?? action['name'],
                    overflow: TextOverflow.ellipsis,
                    maxLines: 2,
                  ),
                );
              }).toList(),
              onChanged: (value) {
                setState(() {
                  _selectedAction = value;
                  _initializeActionParams();
                });
              },
              ),
              const SizedBox(height: 16),
              if (needsOAuth) ...[
                Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: RelayColors.yellow500.withOpacity(0.1),
                    border: Border.all(
                      color: RelayColors.yellow500.withOpacity(0.5),
                      width: 1,
                    ),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Icon(
                            Icons.warning_amber_rounded,
                            color: RelayColors.yellow500,
                            size: 24,
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            child: Text(
                              'Not Connected',
                              style: GoogleFonts.quicksand(
                                fontSize: 16,
                                fontWeight: FontWeight.bold,
                                color: RelayColors.yellow500,
                              ),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 8),
                      Text(
                        'You need to connect to ${_selectedActionService!.toUpperCase()} before creating an AREA with this service.',
                        style: TextStyle(
                          color: Colors.white.withOpacity(0.8),
                          fontSize: 14,
                        ),
                      ),
                      const SizedBox(height: 12),
                      SizedBox(
                        width: double.infinity,
                        child: ElevatedButton.icon(
                          onPressed: () {
                            Navigator.pushReplacementNamed(context, '/services');
                          },
                          style: ElevatedButton.styleFrom(
                            backgroundColor: RelayColors.yellow500,
                            foregroundColor: RelayColors.slate900,
                            padding: const EdgeInsets.symmetric(vertical: 12),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(8),
                            ),
                          ),
                          icon: const Icon(Icons.login, size: 20),
                          label: Text(
                            'Go to Services to Login',
                            style: GoogleFonts.quicksand(
                              fontSize: 14,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 16),
              ],
              if (_selectedAction != null && !needsOAuth) ..._buildParamFields(_actionParams, _selectedAction?['params'] as List?),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildReactionStep() {
    final needsOAuth = _selectedReactionService != null &&
                       _isOAuthService(_selectedReactionService!) &&
                       !_isServiceConnected(_selectedReactionService!);

    return Expanded(
      child: SingleChildScrollView(
        padding: const EdgeInsets.only(bottom: 20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            DropdownButtonFormField<String>(
          value: _selectedReactionService,
          dropdownColor: RelayColors.slate800,
          style: const TextStyle(color: Colors.white),
          decoration: InputDecoration(
            labelText: 'Service',
            labelStyle: TextStyle(color: Colors.white.withOpacity(0.7)),
            prefixIcon: const Icon(Icons.apps, color: RelayColors.purple400),
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
              borderSide: const BorderSide(color: RelayColors.indigo600, width: 2),
            ),
          ),
          items: _services.map<DropdownMenuItem<String>>((service) {
            final name = service['name'] ?? '';
            return DropdownMenuItem<String>(
              value: name,
              child: Text(
                name.toUpperCase(),
                overflow: TextOverflow.ellipsis,
                maxLines: 1,
              ),
            );
          }).toList(),
          onChanged: (value) {
            setState(() {
              _selectedReactionService = value;
              _selectedReaction = null;
              _reactionParams.forEach((_, c) => c.dispose());
              _reactionParams.clear();
            });
          },
          ),
          const SizedBox(height: 16),
          if (_selectedReactionService != null)
            DropdownButtonFormField<Map<String, dynamic>>(
            value: _selectedReaction,
            dropdownColor: RelayColors.slate800,
            style: const TextStyle(color: Colors.white),
            decoration: InputDecoration(
              labelText: 'Reaction',
              labelStyle: TextStyle(color: Colors.white.withOpacity(0.7)),
              prefixIcon: const Icon(Icons.bolt, color: RelayColors.indigo600),
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
                borderSide: const BorderSide(color: RelayColors.indigo600, width: 2),
              ),
            ),
            items: _getReactionsForService(_selectedReactionService!)
                .map<DropdownMenuItem<Map<String, dynamic>>>((reaction) {
              return DropdownMenuItem<Map<String, dynamic>>(
                value: reaction,
                child: Text(
                  reaction['description'] ?? reaction['name'],
                  overflow: TextOverflow.ellipsis,
                  maxLines: 2,
                ),
              );
            }).toList(),
            onChanged: (value) {
              setState(() {
                _selectedReaction = value;
                _initializeReactionParams();
              });
            },
            ),
            const SizedBox(height: 16),
            if (needsOAuth) ...[
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: RelayColors.yellow500.withOpacity(0.1),
                  border: Border.all(
                    color: RelayColors.yellow500.withOpacity(0.5),
                    width: 1,
                  ),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        const Icon(
                          Icons.warning_amber_rounded,
                          color: RelayColors.yellow500,
                          size: 24,
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Text(
                            'Not Connected',
                            style: GoogleFonts.quicksand(
                              fontSize: 16,
                              fontWeight: FontWeight.bold,
                              color: RelayColors.yellow500,
                            ),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 8),
                    Text(
                      'You need to connect to ${_selectedReactionService!.toUpperCase()} before creating an AREA with this service.',
                      style: TextStyle(
                        color: Colors.white.withOpacity(0.8),
                        fontSize: 14,
                      ),
                    ),
                    const SizedBox(height: 12),
                    SizedBox(
                      width: double.infinity,
                      child: ElevatedButton.icon(
                        onPressed: () {
                          Navigator.pushReplacementNamed(context, '/services');
                        },
                        style: ElevatedButton.styleFrom(
                          backgroundColor: RelayColors.yellow500,
                          foregroundColor: RelayColors.slate900,
                          padding: const EdgeInsets.symmetric(vertical: 12),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(8),
                          ),
                        ),
                        icon: const Icon(Icons.login, size: 20),
                        label: Text(
                          'Go to Services to Login',
                          style: GoogleFonts.quicksand(
                            fontSize: 14,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 16),
            ],
            if (_selectedReaction != null && !needsOAuth) ..._buildParamFields(_reactionParams, _selectedReaction?['params'] as List?),
          ],
        ),
      ),
    );
  }

  List<Widget> _buildParamFields(
    Map<String, TextEditingController> controllers,
    List<dynamic>? params,
  ) {
    if (params == null || params.isEmpty) return [];

    return params.map<Widget>((param) {
      final paramName = param['name'] ?? '';
      final paramDescription = param['description'] ?? paramName;
      final required = param['required'] ?? false;
      final type = param['type'] ?? 'string';

      return Padding(
        padding: const EdgeInsets.only(bottom: 16),
        child: TextFormField(
          controller: controllers[paramName],
          style: const TextStyle(color: Colors.white),
          decoration: InputDecoration(
            labelText: '$paramDescription${required ? ' *' : ''}',
            labelStyle: TextStyle(color: Colors.white.withOpacity(0.7)),
            hintText: 'Enter $paramDescription',
            hintStyle: TextStyle(color: Colors.white.withOpacity(0.5)),
            prefixIcon: Icon(_getIconForType(type), color: RelayColors.primary400),
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
            errorBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
              borderSide: const BorderSide(color: RelayColors.red500),
            ),
          ),
          keyboardType: _getKeyboardType(type),
          validator: required
              ? (value) {
                  if (value == null || value.trim().isEmpty) {
                    return 'Field required';
                  }
                  return null;
                }
              : null,
        ),
      );
    }).toList();
  }

  IconData _getIconForType(String type) {
    switch (type.toLowerCase()) {
      case 'email':
        return Icons.email;
      case 'number':
        return Icons.numbers;
      case 'url':
        return Icons.link;
      case 'date':
        return Icons.calendar_today;
      case 'time':
        return Icons.access_time;
      default:
        return Icons.text_fields;
    }
  }

  TextInputType _getKeyboardType(String type) {
    switch (type.toLowerCase()) {
      case 'email':
        return TextInputType.emailAddress;
      case 'number':
        return TextInputType.number;
      case 'url':
        return TextInputType.url;
      default:
        return TextInputType.text;
    }
  }

  @override
  void dispose() {
    _actionParams.values.forEach((controller) => controller.dispose());
    _reactionParams.values.forEach((controller) => controller.dispose());
    super.dispose();
  }
}
