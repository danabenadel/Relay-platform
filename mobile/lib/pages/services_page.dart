import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:url_launcher/url_launcher.dart';

import '../services/http_service.dart';
import '../services/oauth_service.dart';
import '../theme/theme.dart';
import '../utils/service_icons.dart';
import '../widgets/nav_drawer.dart';
import '../widgets/page_with_accessibility.dart';

class ServicesScreen extends StatefulWidget {
  const ServicesScreen({super.key});

  @override
  State<ServicesScreen> createState() => _ServicesScreenState();
}

class _ServicesScreenState extends State<ServicesScreen> with WidgetsBindingObserver {
  final HttpService _http = HttpService();
  final OAuthService _oauthService = OAuthService();

  bool _isLoading = false;
  List<dynamic> _services = [];
  String? _errorMessage;
  String? _connectingService;
  Map<String, dynamic> _connectedOAuthServices = {};
  String? _userId;

  final TextEditingController _telegramTokenController = TextEditingController();
  Map<String, dynamic> _telegramStatus = {'configured': false};
  bool _telegramLoading = false;
  bool _telegramSaving = false;
  bool _telegramDisconnecting = false;
  bool _telegramForceOverwrite = false;
  String? _telegramErrorMessage;
  String? _telegramSuccessMessage;

  final Set<String> _oauthServices = {
    'spotify',
    'google',
    'github',
    'gitlab',
    'facebook',
    'reddit',
    'discord',
    'onedrive',
    'notion',
    'youtube',
  };

  String _normalizeServiceKey(String raw) {
    final normalized = raw.trim().toLowerCase();
    if (normalized.isEmpty) {
      return normalized;
    }

    if (normalized.startsWith('google')) return 'google';
    if (normalized.startsWith('youtube')) return 'youtube';
    if (normalized.startsWith('gitlab')) return 'gitlab';
    if (normalized.startsWith('github')) return 'github';
    if (normalized.startsWith('facebook')) return 'facebook';
    if (normalized.startsWith('spotify')) return 'spotify';
    if (normalized.startsWith('reddit')) return 'reddit';
    if (normalized.startsWith('discord')) return 'discord';
    if (normalized.startsWith('onedrive')) return 'onedrive';
    if (normalized.startsWith('notion')) return 'notion';
    if (normalized.startsWith('telegram')) return 'telegram';
    if (normalized.startsWith('timer')) return 'timer';
    if (normalized.startsWith('console')) return 'console';

    final fallback = normalized.split(RegExp(r'[^a-z0-9_-]')).first;
    return fallback.isNotEmpty ? fallback : normalized;
  }

  String _extractConnectionLabel(Map<String, dynamic>? connection, String serviceName) {
    if (connection == null) {
      return '';
    }

    final candidateKeys = [
      'email',
      'emailAddress',
      'mail',
      'displayName',
      'display_name',
      'name',
      'username',
      'login',
    ];

    for (final key in candidateKeys) {
      final value = connection[key];
      if (value == null) continue;
      final label = value.toString().trim();
      if (label.isNotEmpty && label.toLowerCase() != 'null') {
        return label;
      }
    }

    final identifier = connection['id']?.toString().trim();
    if (identifier != null && identifier.isNotEmpty) {
      return identifier;
    }

    final trimmedService = serviceName.trim();
    if (trimmedService.isNotEmpty) {
      return '${trimmedService[0].toUpperCase()}${trimmedService.substring(1)}';
    }

    return '';
  }

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addObserver(this);
    _telegramTokenController.addListener(() {
      if (!mounted) return;
      setState(() {
        _telegramErrorMessage = null;
      });
    });
    _loadInitialData();
    _initOAuthListener();
  }

  void _loadInitialData() {
    _loadUserProfile();
    _loadServices();
    _loadTelegramStatus();
  }

  @override
  void dispose() {
    WidgetsBinding.instance.removeObserver(this);
    _oauthService.dispose();
    _telegramTokenController.dispose();
    super.dispose();
  }

  void _initOAuthListener() {
    _oauthService.initDeepLinkListener(
      (token, userName) {
        debugPrint('[Services] OAuth login callback received. token length=${token.length}, user=$userName');
      },
      onServiceConnected: () async {
        debugPrint('[Services] OAuth service connected callback');
        if (!mounted) return;
        await _refreshAll();
        if (!mounted) return;
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Service connecté avec succès.'),
            backgroundColor: RelayColors.green600,
          ),
        );
      },
    );
  }

  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    if (state == AppLifecycleState.resumed) {
      debugPrint('[Services] App resumed, refreshing services');
      _refreshAll();
    }
  }

  Future<void> _loadUserProfile() async {
    try {
      final response = await _http.get('/auth/profile');
      if (response.statusCode == 200) {
        final data = jsonDecode(response.body) as Map<String, dynamic>;
        final user = data['data'] as Map<String, dynamic>? ?? {};
        final tokens = (user['oauthTokens'] as List<dynamic>? ?? [])
            .cast<Map<String, dynamic>>();
        if (!mounted) return;
        setState(() {
          _userId = user['id']?.toString();
          _connectedOAuthServices = {
            for (final token in tokens)
              _normalizeServiceKey(token['serviceName'].toString()): token
          };
        });
      }
    } catch (error) {
      debugPrint('[Services] Failed to load profile: $error');
    }
  }

  Future<void> _loadServices({bool showSpinner = true}) async {
    if (showSpinner) {
      setState(() {
        _isLoading = true;
        _errorMessage = null;
      });
    } else {
      setState(() {
        _errorMessage = null;
      });
    }

    try {
      final response = await _http.get('/about.json');
      if (response.statusCode == 200) {
        final data = jsonDecode(response.body) as Map<String, dynamic>;
        final services = (data['server']?['services'] as List<dynamic>? ?? []);
        if (!mounted) return;
        setState(() {
          _services = services;
          _isLoading = false;
        });
      } else {
        if (!mounted) return;
        setState(() {
          _errorMessage = HttpService.getErrorMessage(response);
          _isLoading = false;
        });
      }
    } catch (error) {
      if (!mounted) return;
      setState(() {
        _errorMessage = 'Network error: $error';
        _isLoading = false;
      });
    }
  }

  Future<void> _connectOAuthService(String serviceName) async {
    final normalized = _normalizeServiceKey(serviceName);
    setState(() {
      _connectingService = normalized;
    });

    try {
      final baseUrl = await HttpService.baseUrl;
      var source = 'mobile';
      if (_userId != null && _userId!.isNotEmpty) {
        source = 'mobile:${_userId!}';
      }

      final oauthUrl = '$baseUrl/auth/oauth/$normalized?source=$source';
      final uri = Uri.parse(oauthUrl);

      debugPrint('[Services] Opening OAuth URL $oauthUrl');

      if (!await canLaunchUrl(uri)) {
        throw Exception('Unable to open OAuth URL');
      }

      await launchUrl(uri, mode: LaunchMode.externalApplication);

      if (!mounted) return;
      Future.delayed(const Duration(seconds: 2), () {
        if (mounted) {
          _loadUserProfile();
        }
      });
    } catch (error) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Erreur lors de la connexion à $serviceName: $error'),
          backgroundColor: RelayColors.red500,
        ),
      );
    } finally {
      if (!mounted) return;
      setState(() {
        _connectingService = null;
      });
    }
  }

  Future<void> _disconnectOAuthService(String serviceName) async {
    final normalized = _normalizeServiceKey(serviceName);
    setState(() {
      _connectingService = normalized;
    });

    try {
      final response = await _http.delete('/auth/oauth/$normalized');

      if (!mounted) return;

      if (response.statusCode == 200) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('$serviceName déconnecté.'),
            backgroundColor: RelayColors.green600,
          ),
        );
        await _loadUserProfile();
      } else {
        final message = HttpService.getErrorMessage(response);
        throw Exception(message);
      }
    } catch (error) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Impossible de déconnecter $serviceName: $error'),
          backgroundColor: RelayColors.red500,
        ),
      );
    } finally {
      if (!mounted) return;
      setState(() {
        _connectingService = null;
      });
    }
  }

  Future<void> _loadTelegramStatus() async {
    setState(() {
      _telegramLoading = true;
      _telegramErrorMessage = null;
    });

    try {
      final response = await _http.get('/api/telegram/status');
      if (!mounted) return;

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body) as Map<String, dynamic>;
        final status = (data['data'] as Map<String, dynamic>?) ?? {};
        setState(() {
          _telegramStatus = {
            'configured': status['configured'] ?? false,
            'displayName': status['displayName'],
            'botId': status['botId'],
            'updatedAt': status['updatedAt'],
          };
          _telegramLoading = false;
        });
      } else if (response.statusCode == 401) {
        setState(() {
          _telegramStatus = {'configured': false};
          _telegramLoading = false;
        });
      } else {
        final message = HttpService.getErrorMessage(response);
        throw Exception(message);
      }
    } catch (error) {
      if (!mounted) return;
      setState(() {
        _telegramStatus = {'configured': false};
        _telegramLoading = false;
        _telegramErrorMessage = 'Erreur de chargement du statut Telegram: $error';
      });
    }
  }

  Future<void> _configureTelegram() async {
    final token = _telegramTokenController.text.trim();
    if (token.isEmpty) {
      setState(() {
        _telegramErrorMessage = 'Veuillez renseigner le token BotFather.';
        _telegramSuccessMessage = null;
      });
      return;
    }

    setState(() {
      _telegramSaving = true;
      _telegramErrorMessage = null;
      _telegramSuccessMessage = null;
    });

    try {
      final response = await _http.post(
        '/api/telegram/configure',
        body: {
          'botToken': token,
          'force': _telegramForceOverwrite,
        },
      );

      if (!mounted) return;

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body) as Map<String, dynamic>;
        final status = (data['data'] as Map<String, dynamic>?) ?? {};
        setState(() {
          _telegramStatus = {
            'configured': status['configured'] ?? true,
            'displayName': status['displayName'],
            'botId': status['botId'],
            'updatedAt': status['updatedAt'],
          };
          _telegramSuccessMessage = data['message']?.toString() ?? 'Bot Telegram configuré.';
          _telegramForceOverwrite = false;
          _telegramTokenController.clear();
        });
        await _loadUserProfile();
        await _loadTelegramStatus();
      } else {
        final message = HttpService.getErrorMessage(response);
        throw Exception(message);
      }
    } catch (error) {
      if (!mounted) return;
      setState(() {
        _telegramErrorMessage = 'Erreur lors de la configuration du bot: $error';
      });
    } finally {
      if (!mounted) return;
      setState(() {
        _telegramSaving = false;
      });
    }
  }

  Future<void> _disconnectTelegram() async {
    if (!_isTelegramConfigured) {
      setState(() {
        _telegramErrorMessage = 'Aucun bot Telegram configuré.';
      });
      return;
    }

    setState(() {
      _telegramDisconnecting = true;
      _telegramErrorMessage = null;
      _telegramSuccessMessage = null;
    });

    try {
      final response = await _http.delete('/api/telegram/configure');

      if (!mounted) return;

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body) as Map<String, dynamic>;
        setState(() {
          _telegramStatus = {'configured': false};
          _telegramSuccessMessage = data['message']?.toString() ?? 'Bot Telegram déconnecté.';
          _telegramForceOverwrite = false;
          _telegramTokenController.clear();
        });
        await _loadUserProfile();
        await _loadTelegramStatus();
      } else {
        final message = HttpService.getErrorMessage(response);
        throw Exception(message);
      }
    } catch (error) {
      if (!mounted) return;
      setState(() {
        _telegramErrorMessage = 'Erreur lors de la déconnexion du bot: $error';
      });
    } finally {
      if (!mounted) return;
      setState(() {
        _telegramDisconnecting = false;
      });
    }
  }

  Future<void> _refreshAll() async {
    await _loadServices(showSpinner: false);
    await _loadUserProfile();
    await _loadTelegramStatus();
  }

  bool _isOAuthService(String serviceName) =>
      _oauthServices.contains(_normalizeServiceKey(serviceName));

  bool _googleTokenHasYouTubeScope() {
    final googleToken = _connectedOAuthServices['google'] as Map<String, dynamic>?;
    if (googleToken == null) return false;

    final scopes = (googleToken['scope'] as List<dynamic>? ?? []);
    return scopes.any(
      (scope) => scope.toString().toLowerCase().contains('youtube'),
    );
  }

  bool _isServiceConnected(String serviceName) {
    final key = _normalizeServiceKey(serviceName);
    if (_connectedOAuthServices.containsKey(key)) {
      return true;
    }

    if (key == 'youtube') {
      return _googleTokenHasYouTubeScope();
    }

    return false;
  }

  bool get _isTelegramConfigured => (_telegramStatus['configured'] ?? false) == true;

  String? get _telegramDisplayName => _telegramStatus['displayName']?.toString();

  String? get _telegramBotId => _telegramStatus['botId']?.toString();

  String? get _telegramUpdatedAtLabel {
    final updatedAt = _telegramStatus['updatedAt'];
    if (updatedAt == null) return null;
    try {
      final parsed = DateTime.parse(updatedAt.toString()).toLocal();
      final day = parsed.day.toString().padLeft(2, '0');
      final month = parsed.month.toString().padLeft(2, '0');
      final year = parsed.year.toString();
      final hour = parsed.hour.toString().padLeft(2, '0');
      final minute = parsed.minute.toString().padLeft(2, '0');
      return '$day/$month/$year $hour:$minute';
    } catch (_) {
      return updatedAt.toString();
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
            'Services',
            style: GoogleFonts.quicksand(
              fontWeight: FontWeight.bold,
              color: Colors.white,
            ),
          ),
          automaticallyImplyLeading: false,
          centerTitle: true,
          actions: [
            TextButton(
              onPressed: () => Navigator.pushNamed(context, '/my-areas'),
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
          child: _buildBody(),
        ),
      ),
    );
  }

  Widget _buildBody() {
    if (_isLoading) {
      return const Center(
        child: CircularProgressIndicator(color: RelayColors.primary600),
      );
    }

    if (_errorMessage != null) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(Icons.error_outline, size: 60, color: RelayColors.red500),
            const SizedBox(height: 16),
            const Text(
              'Error',
              style: TextStyle(
                fontSize: 20,
                fontWeight: FontWeight.bold,
                color: Colors.white,
              ),
            ),
            const SizedBox(height: 8),
            Padding(
              padding: const EdgeInsets.all(16),
              child: Text(
                _errorMessage!,
                textAlign: TextAlign.center,
                style: TextStyle(color: Colors.white.withOpacity(0.7)),
              ),
            ),
            const SizedBox(height: 16),
            RelayGradientButton(
              onPressed: _loadServices,
              child: const Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Icon(Icons.refresh, color: Colors.white),
                  SizedBox(width: 8),
                  Text('Retry', style: TextStyle(color: Colors.white)),
                ],
              ),
            ),
          ],
        ),
      );
    }

    if (_services.isEmpty) {
      return Center(
        child: Text(
          'No available services',
          style: TextStyle(color: Colors.white.withOpacity(0.7)),
        ),
      );
    }

    return RefreshIndicator(
      onRefresh: _refreshAll,
      color: RelayColors.primary600,
      child: ListView.builder(
        padding: const EdgeInsets.all(16),
        itemCount: _services.length,
        itemBuilder: (context, index) {
          final service = _services[index] as Map<String, dynamic>;
          return _buildServiceCard(service);
        },
      ),
    );
  }

  Widget _buildServiceCard(Map<String, dynamic> service) {
    final serviceName = service['name']?.toString() ?? 'Unknown service';
    final serviceKey = _normalizeServiceKey(serviceName);
    final actions = (service['actions'] as List<dynamic>? ?? []).cast<Map<String, dynamic>>();
    final reactions = (service['reactions'] as List<dynamic>? ?? []).cast<Map<String, dynamic>>();
    final description = service['description']?.toString();
    final serviceType = service['type']?.toString().toLowerCase();
    final isBotService = serviceType == 'bot';

    return Padding(
      padding: const EdgeInsets.only(bottom: 16),
      child: RelayGlassCard(
        padding: EdgeInsets.zero,
        child: Theme(
          data: Theme.of(context).copyWith(
            dividerColor: Colors.transparent,
            expansionTileTheme: const ExpansionTileThemeData(
              iconColor: RelayColors.primary400,
              collapsedIconColor: Colors.white70,
            ),
          ),
          child: ExpansionTile(
            tilePadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            leading: Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                color: ServiceIcons.getBackgroundColor(serviceName),
                borderRadius: BorderRadius.circular(8),
              ),
              child: Icon(
                ServiceIcons.getIcon(serviceName),
                color: ServiceIcons.getColor(serviceName),
                size: 24,
              ),
            ),
            title: Text(
              serviceName.toUpperCase(),
              style: GoogleFonts.quicksand(
                fontWeight: FontWeight.bold,
                fontSize: 18,
                color: Colors.white,
              ),
            ),
            subtitle: Text(
              '${actions.length} actions • ${reactions.length} reactions',
              style: TextStyle(color: Colors.white.withOpacity(0.6)),
            ),
            children: [
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: Colors.black.withOpacity(0.2),
                  borderRadius: const BorderRadius.only(
                    bottomLeft: Radius.circular(16),
                    bottomRight: Radius.circular(16),
                  ),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    if (description != null && description.isNotEmpty) ...[
                      Text(
                        description,
                        style: TextStyle(
                          color: Colors.white.withOpacity(0.8),
                          fontSize: 14,
                        ),
                      ),
                      const SizedBox(height: 16),
                    ],
                    if (actions.isNotEmpty)
                      _buildCapabilitySection(
                        label: 'Actions',
                        icon: Icons.play_arrow,
                        highlightColor: RelayColors.primary400,
                        capabilities: actions,
                      ),
                    if (reactions.isNotEmpty) ...[
                      if (actions.isNotEmpty) const SizedBox(height: 16),
                      _buildCapabilitySection(
                        label: 'Reactions',
                        icon: Icons.flash_on,
                        highlightColor: RelayColors.purple400,
                        capabilities: reactions,
                      ),
                    ],
                    if (isBotService && serviceKey == 'telegram') ...[
                      const SizedBox(height: 16),
                      const Divider(color: RelayColors.borderWhite20),
                      const SizedBox(height: 16),
                      _buildTelegramBotSection(),
                    ] else if (_isOAuthService(serviceName)) ...[
                      const SizedBox(height: 16),
                      const Divider(color: RelayColors.borderWhite20),
                      const SizedBox(height: 16),
                      _buildOAuthSection(serviceName),
                    ],
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildCapabilitySection({
    required String label,
    required IconData icon,
    required Color highlightColor,
    required List<Map<String, dynamic>> capabilities,
  }) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            Icon(icon, color: highlightColor),
            const SizedBox(width: 8),
            Text(
              label,
              style: GoogleFonts.quicksand(
                fontWeight: FontWeight.bold,
                color: highlightColor,
                fontSize: 16,
              ),
            ),
          ],
        ),
        const SizedBox(height: 12),
        ...capabilities.map(
          (item) => Padding(
            padding: const EdgeInsets.only(bottom: 8),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Container(
                  width: 4,
                  height: 4,
                  margin: const EdgeInsets.only(top: 6),
                  decoration: BoxDecoration(
                    color: highlightColor,
                    borderRadius: BorderRadius.circular(2),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Text(
                    item['description']?.toString() ?? item['name']?.toString() ?? '',
                    style: TextStyle(color: Colors.white.withOpacity(0.8)),
                    maxLines: 3,
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildOAuthSection(String serviceName) {
    final normalized = _normalizeServiceKey(serviceName);
    final isBusy = _connectingService == normalized;
    final isConnected = _isServiceConnected(serviceName);
    Map<String, dynamic>? connection = _connectedOAuthServices[normalized] as Map<String, dynamic>?;
    if (connection == null && normalized == 'youtube') {
      connection = _connectedOAuthServices['google'] as Map<String, dynamic>?;
    }

    if (isConnected) {
      final displayText = _extractConnectionLabel(connection, serviceName);

      return Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: RelayColors.green600.withOpacity(0.2),
              borderRadius: BorderRadius.circular(8),
              border: Border.all(
                color: RelayColors.green600.withOpacity(0.5),
                width: 1,
              ),
            ),
            child: Row(
              children: [
                const Icon(Icons.check_circle, color: RelayColors.green600, size: 20),
                const SizedBox(width: 8),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        'Connected',
                        style: TextStyle(
                          color: RelayColors.green600,
                          fontWeight: FontWeight.bold,
                          fontSize: 14,
                        ),
                      ),
                      if (displayText.isNotEmpty)
                        Text(
                          'as $displayText',
                          style: TextStyle(
                            color: Colors.white.withOpacity(0.7),
                            fontSize: 12,
                          ),
                        ),
                    ],
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 12),
          SizedBox(
            width: double.infinity,
            child: ElevatedButton(
              onPressed: isBusy ? null : () => _disconnectOAuthService(serviceName),
              style: ElevatedButton.styleFrom(
                backgroundColor: RelayColors.red500,
                foregroundColor: Colors.white,
                padding: const EdgeInsets.symmetric(vertical: 12),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(8),
                ),
              ),
              child: isBusy
                  ? const SizedBox(
                      height: 20,
                      width: 20,
                      child: CircularProgressIndicator(
                        color: Colors.white,
                        strokeWidth: 2,
                      ),
                    )
                  : Row(
                      mainAxisSize: MainAxisSize.min,
                      children: const [
                        Icon(Icons.link_off),
                        SizedBox(width: 8),
                        Text('Disconnect'),
                      ],
                    ),
            ),
          ),
        ],
      );
    }

    return SizedBox(
      width: double.infinity,
      child: RelayGradientButton(
        onPressed: isBusy ? null : () => _connectOAuthService(serviceName),
        padding: const EdgeInsets.symmetric(vertical: 12),
        child: isBusy
            ? const SizedBox(
                height: 20,
                width: 20,
                child: CircularProgressIndicator(
                  color: Colors.white,
                  strokeWidth: 2,
                ),
              )
            : Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  const Icon(Icons.link, color: Colors.white),
                  const SizedBox(width: 8),
                  Text(
                    'Connect to $serviceName',
                    style: GoogleFonts.quicksand(
                      fontWeight: FontWeight.w600,
                      color: Colors.white,
                    ),
                  ),
                ],
              ),
      ),
    );
  }

  Widget _buildTelegramBotSection() {
    if (_telegramLoading) {
      return const Center(
        child: CircularProgressIndicator(color: RelayColors.primary600),
      );
    }

    final isTokenEmpty = _telegramTokenController.text.trim().isEmpty;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        if (_telegramSuccessMessage != null)
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: RelayColors.green600.withOpacity(0.2),
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: RelayColors.green600.withOpacity(0.5)),
            ),
            child: Row(
              children: [
                const Icon(Icons.check_circle, color: RelayColors.green500, size: 20),
                const SizedBox(width: 12),
                Expanded(
                  child: Text(
                    _telegramSuccessMessage!,
                    style: TextStyle(color: Colors.white.withOpacity(0.85)),
                  ),
                ),
              ],
            ),
          ),
        if (_telegramSuccessMessage != null) const SizedBox(height: 16),
        if (_telegramErrorMessage != null)
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: RelayColors.red500.withOpacity(0.15),
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: RelayColors.red500.withOpacity(0.5)),
            ),
            child: Row(
              children: [
                const Icon(Icons.warning_amber, color: RelayColors.red500, size: 20),
                const SizedBox(width: 12),
                Expanded(
                  child: Text(
                    _telegramErrorMessage!,
                    style: TextStyle(color: Colors.white.withOpacity(0.85)),
                  ),
                ),
              ],
            ),
          ),
        if (_telegramErrorMessage != null) const SizedBox(height: 16),
        Container(
          width: double.infinity,
          padding: const EdgeInsets.all(12),
          decoration: BoxDecoration(
            color: Colors.white.withOpacity(0.03),
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: Colors.white.withOpacity(0.08)),
          ),
          child: Row(
            children: [
              Container(
                decoration: BoxDecoration(
                  color: ServiceIcons.getBackgroundColor('telegram'),
                  borderRadius: BorderRadius.circular(8),
                ),
                padding: const EdgeInsets.all(8),
                child: Icon(
                  ServiceIcons.getIcon('telegram'),
                  color: ServiceIcons.getColor('telegram'),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      _isTelegramConfigured ? 'Connected' : 'Not connected',
                      style: GoogleFonts.quicksand(
                        fontWeight: FontWeight.w600,
                        color: Colors.white,
                      ),
                    ),
                    const SizedBox(height: 4),
                    if (_isTelegramConfigured && _telegramDisplayName != null)
                      Text(
                        _telegramBotId != null
                            ? 'as ${_telegramDisplayName!} (ID $_telegramBotId)'
                            : 'as ${_telegramDisplayName!}',
                        style: TextStyle(color: Colors.white.withOpacity(0.8)),
                      )
                    else
                      Text(
                        'Ajoutez votre token BotFather pour activer les réactions Telegram.',
                        style: TextStyle(color: Colors.white.withOpacity(0.7)),
                      ),
                    if (_telegramUpdatedAtLabel != null) ...[
                      const SizedBox(height: 4),
                      Text(
                        'Dernière mise à jour : ${_telegramUpdatedAtLabel!}',
                        style: TextStyle(color: Colors.white.withOpacity(0.6), fontSize: 12),
                      ),
                    ],
                  ],
                ),
              ),
            ],
          ),
        ),
        const SizedBox(height: 16),
        TextField(
          controller: _telegramTokenController,
          style: const TextStyle(color: Colors.white),
          decoration: InputDecoration(
            labelText: 'Token BotFather',
            hintText: '123456789:AA-XXXXXXXXXXXXXXX',
            helperText: 'Obtenez ce token auprès de @BotFather dans Telegram.',
            helperStyle: TextStyle(color: Colors.white.withOpacity(0.6)),
          ),
        ),
        const SizedBox(height: 12),
        if (_isTelegramConfigured)
          Row(
            children: [
              Checkbox(
                value: _telegramForceOverwrite,
                onChanged: (value) {
                  setState(() {
                    _telegramForceOverwrite = value ?? false;
                    _telegramSuccessMessage = null;
                  });
                },
                activeColor: RelayColors.purple400,
                checkColor: Colors.white,
              ),
              const SizedBox(width: 8),
              Expanded(
                child: Text(
                  'Forcer la mise à jour du bot existant',
                  style: TextStyle(color: Colors.white.withOpacity(0.7)),
                ),
              ),
            ],
          ),
        if (_isTelegramConfigured) const SizedBox(height: 12),
        Row(
          children: [
            Expanded(
              child: RelayGradientButton(
                onPressed: (_telegramSaving || isTokenEmpty) ? null : _configureTelegram,
                padding: const EdgeInsets.symmetric(vertical: 14),
                child: _telegramSaving
                    ? const SizedBox(
                        height: 18,
                        width: 18,
                        child: CircularProgressIndicator(
                          strokeWidth: 2,
                          color: Colors.white,
                        ),
                      )
                    : Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(
                            _isTelegramConfigured ? Icons.save : Icons.check,
                            color: Colors.white,
                            size: 18,
                          ),
                          const SizedBox(width: 8),
                          Text(
                            _isTelegramConfigured ? 'Mettre à jour le bot' : 'Enregistrer le bot',
                            style: GoogleFonts.quicksand(
                              fontWeight: FontWeight.w600,
                              color: Colors.white,
                            ),
                          ),
                        ],
                      ),
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: OutlinedButton(
                onPressed: (_telegramDisconnecting || !_isTelegramConfigured) ? null : _disconnectTelegram,
                style: OutlinedButton.styleFrom(
                  foregroundColor: RelayColors.red500,
                  side: const BorderSide(color: RelayColors.red500),
                  padding: const EdgeInsets.symmetric(vertical: 14),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  backgroundColor: Colors.white.withOpacity(0.05),
                ),
                child: _telegramDisconnecting
                    ? const SizedBox(
                        height: 18,
                        width: 18,
                        child: CircularProgressIndicator(
                          strokeWidth: 2,
                          color: RelayColors.red500,
                        ),
                      )
                    : Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          const Icon(Icons.link_off, size: 18),
                          const SizedBox(width: 8),
                          Text(
                            'Déconnecter',
                            style: GoogleFonts.quicksand(
                              fontWeight: FontWeight.w600,
                              color: RelayColors.red500,
                            ),
                          ),
                        ],
                      ),
              ),
            ),
          ],
        ),
      ],
    );
  }
}
