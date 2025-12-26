import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../services/http_service.dart';
import '../theme/theme.dart';
import '../widgets/nav_drawer.dart';
import '../widgets/accessible_components.dart';
import '../widgets/page_with_accessibility.dart';

class MyAreasScreen extends StatefulWidget {
  const MyAreasScreen({super.key});

  @override
  State<MyAreasScreen> createState() => _MyAreasScreenState();
}

class _MyAreasScreenState extends State<MyAreasScreen> {
  final HttpService _http = HttpService();
  
  List<dynamic> _areas = [];
  bool _isLoading = false;
  String? _errorMessage;
  final Set<dynamic> _togglingAreas = {};

  @override
  void initState() {
    super.initState();
    _loadAreas();
  }

  Future<void> _loadAreas() async {
    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    try {
      final response = await _http.get('/api/areas');

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        List<dynamic> areasList = [];

        if (data is List) {
          areasList = data;
        } else if (data is Map) {
          if (data['data'] != null) {
            areasList = List<dynamic>.from(data['data']);
          } else if (data['areas'] != null) {
            areasList = List<dynamic>.from(data['areas']);
          }
        }

        setState(() {
          _areas = areasList;
          _isLoading = false;
        });
      } else {
        setState(() {
          _errorMessage = HttpService.getErrorMessage(response);
          _isLoading = false;
        });
      }
    } catch (e) {
      setState(() {
        _errorMessage = 'Network error: $e';
        _isLoading = false;
      });
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
            'My Areas',
            style: GoogleFonts.quicksand(
              fontWeight: FontWeight.bold,
              color: Colors.white,
            ),
          ),
          automaticallyImplyLeading: false,
          centerTitle: true,
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
        floatingActionButton: Padding(
          padding: const EdgeInsets.only(right: 72),
          child: Container(
            decoration: BoxDecoration(
              gradient: RelayGradients.primary,
              borderRadius: BorderRadius.circular(16),
              boxShadow: [
                BoxShadow(
                  color: RelayColors.primary600.withOpacity(0.3),
                  blurRadius: 12,
                  offset: const Offset(0, 4),
                ),
              ],
            ),
            child: FloatingActionButton.extended(
              onPressed: () => Navigator.pushNamed(context, '/create-area'),
              backgroundColor: Colors.transparent,
              elevation: 0,
              icon: const Icon(Icons.add, color: Colors.white),
              label: const Text(
                'Create AREA',
                style: TextStyle(
                  color: Colors.white,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ),
          ),
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
              onPressed: _loadAreas,
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

    if (_areas.isEmpty) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              Icons.link_off,
              size: 80,
              color: Colors.white.withOpacity(0.3),
            ),
            const SizedBox(height: 20),
            Text(
              'No AREA created',
              style: GoogleFonts.quicksand(
                fontSize: 24,
                fontWeight: FontWeight.bold,
                color: Colors.white,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              'Create your first automation',
              style: TextStyle(
                fontSize: 16,
                color: Colors.white.withOpacity(0.6),
              ),
            ),
          ],
        ),
      );
    }

    return Stack(
      children: [
        ListView.builder(
          padding: const EdgeInsets.fromLTRB(16, 16, 16, 80),
          itemCount: _areas.length,
          itemBuilder: (context, index) {
            final area = _areas[index] as Map<String, dynamic>;
            final areaId = area['id'] ?? area['_id'] ?? 'unknown';
            final action = (area['action'] as Map<String, dynamic>?) ?? {};
            final reaction = (area['reaction'] as Map<String, dynamic>?) ?? {};
            final isActive = area['isActive'] ?? area['active'] ?? area['enabled'] ?? true;

            final actionParams = _ensureMap(action['params']);
            final reactionParams = _ensureMap(reaction['params']);

            return Padding(
              padding: const EdgeInsets.only(bottom: 16),
              child: RelayGlassCard(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Expanded(
                          child: Text(
                            'AREA #$areaId',
                            style: GoogleFonts.quicksand(
                              fontSize: 18,
                              fontWeight: FontWeight.bold,
                              color: Colors.white,
                            ),
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                        StatusBadge(
                          status: isActive ? StatusType.success : StatusType.inactive,
                          label: isActive ? 'Active' : 'Inactive',
                          compact: true,
                        ),
                      ],
                    ),
                    const SizedBox(height: 16),
                    
                    _buildActionReactionTile(
                      icon: Icons.play_arrow,
                      iconColor: RelayColors.primary600,
                      title: 'Action',
                      service: _getServiceName(action['service']),
                      name: action['name'] ?? 'N/A',
                      params: actionParams,
                    ),

                    const SizedBox(height: 12),

                    Center(
                      child: Icon(
                        Icons.arrow_downward,
                        color: RelayColors.primary400.withOpacity(0.5),
                        size: 24,
                      ),
                    ),

                    const SizedBox(height: 12),

                    _buildActionReactionTile(
                      icon: Icons.bolt,
                      iconColor: RelayColors.indigo600,
                      title: 'Reaction',
                      service: _getServiceName(reaction['service']),
                      name: reaction['name'] ?? 'N/A',
                      params: reactionParams,
                    ),
                    
                    const SizedBox(height: 16),
                    
                    Row(
                      mainAxisAlignment: MainAxisAlignment.end,
                      children: [
                        Builder(builder: (context) {
                          final isToggling = _togglingAreas.contains(areaId);
                          final buttonLabel = isToggling
                              ? (isActive ? 'Pausing...' : 'Activating...')
                              : (isActive ? 'Pause' : 'Activate');
                          return TextButton.icon(
                            onPressed: isToggling ? null : () => _toggleAreaStatus(areaId, isActive),
                            icon: isToggling
                                ? const SizedBox(
                                    width: 18,
                                    height: 18,
                                    child: CircularProgressIndicator(
                                      strokeWidth: 2,
                                      color: RelayColors.yellow400,
                                    ),
                                  )
                                : Icon(
                                    isActive ? Icons.pause : Icons.play_arrow,
                                    size: 18,
                                    color: RelayColors.yellow400,
                                  ),
                            label: Text(
                              buttonLabel,
                              style: const TextStyle(color: RelayColors.yellow400),
                            ),
                            style: TextButton.styleFrom(
                              backgroundColor: RelayColors.yellow400.withOpacity(0.1),
                              padding: const EdgeInsets.symmetric(
                                horizontal: 12,
                                vertical: 8,
                              ),
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(8),
                              ),
                            ),
                          );
                        }),
                        const SizedBox(width: 8),
                        TextButton.icon(
                          onPressed: () => _deleteArea(areaId),
                          icon: const Icon(Icons.delete, size: 18, color: RelayColors.red500),
                          label: const Text(
                            'Delete',
                            style: TextStyle(color: RelayColors.red500),
                          ),
                          style: TextButton.styleFrom(
                            backgroundColor: RelayColors.red500.withOpacity(0.1),
                            padding: const EdgeInsets.symmetric(
                              horizontal: 12,
                              vertical: 8,
                            ),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(8),
                            ),
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            );
          },
        ),
        Positioned(
          bottom: 16,
          left: 0,
          right: 0,
          child: Center(
            child: Container(
              decoration: BoxDecoration(
                color: RelayColors.glassWhite10,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(
                  color: RelayColors.borderWhite20,
                  width: 1,
                ),
              ),
              child: TextButton.icon(
                onPressed: _isLoading ? null : _loadAreas,
                icon: _isLoading
                    ? const SizedBox(
                        width: 16,
                        height: 16,
                        child: CircularProgressIndicator(
                          strokeWidth: 2,
                          color: RelayColors.primary400,
                        ),
                      )
                    : const Icon(
                        Icons.refresh,
                        size: 20,
                        color: RelayColors.primary400,
                      ),
                label: const Text(
                  'Refresh',
                  style: TextStyle(color: RelayColors.primary400),
                ),
                style: TextButton.styleFrom(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 20,
                    vertical: 12,
                  ),
                ),
              ),
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildActionReactionTile({
    required IconData icon,
    required Color iconColor,
    required String title,
    required String service,
    required String name,
    required Map<String, dynamic> params,
  }) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: Colors.black.withOpacity(0.3),
        borderRadius: BorderRadius.circular(8),
        border: Border.all(
          color: iconColor.withOpacity(0.3),
          width: 1,
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                padding: const EdgeInsets.all(6),
                decoration: BoxDecoration(
                  color: iconColor.withOpacity(0.2),
                  borderRadius: BorderRadius.circular(6),
                ),
                child: Icon(icon, color: iconColor, size: 16),
              ),
              const SizedBox(width: 8),
              Text(
                title,
                style: TextStyle(
                  fontWeight: FontWeight.bold,
                  color: iconColor,
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),
          Text(
            '$service → $name',
            style: GoogleFonts.quicksand(
              fontSize: 14,
              fontWeight: FontWeight.w600,
              color: Colors.white,
            ),
          ),
          if (params.isNotEmpty) ...[
            const SizedBox(height: 8),
            ...params.entries.map((entry) => Padding(
                  padding: const EdgeInsets.only(top: 4),
                  child: Row(
                    children: [
                      Container(
                        width: 4,
                        height: 4,
                        decoration: BoxDecoration(
                          color: iconColor.withOpacity(0.6),
                          borderRadius: BorderRadius.circular(2),
                        ),
                      ),
                      const SizedBox(width: 8),
                      Expanded(
                        child: Text(
                          '${entry.key}: ${entry.value}',
                          style: TextStyle(
                            fontSize: 12,
                            color: Colors.white.withOpacity(0.7),
                          ),
                          overflow: TextOverflow.ellipsis,
                          maxLines: 2,
                        ),
                      ),
                    ],
                  ),
                )),
          ],
        ],
      ),
    );
  }

  String _getServiceName(dynamic service) {
    if (service == null) return 'N/A';
    if (service is String) return service.toUpperCase();
    if (service is Map && service['name'] != null) {
      return service['name'].toString().toUpperCase();
    }
    return 'N/A';
  }

  Map<String, dynamic> _ensureMap(dynamic value) {
    if (value == null) return {};
    if (value is Map<String, dynamic>) return value;
    if (value is Map) return Map<String, dynamic>.from(value);
    return {};
  }

  bool _areaIdsEqual(dynamic area, dynamic areaId) {
    if (area is Map) {
      final id = area['id'] ?? area['areaId'];
      return id == areaId;
    }
    return false;
  }

  dynamic _mapAreaWithStatus(dynamic area, dynamic areaId, bool status) {
    if (_areaIdsEqual(area, areaId) && area is Map) {
      final updated = Map<String, dynamic>.from(area);
      updated['isActive'] = status;
      updated['active'] = status;
      updated['enabled'] = status;
      return updated;
    }
    return area;
  }

  Future<void> _toggleAreaStatus(dynamic areaId, bool currentStatus) async {
    final bool newStatus = !currentStatus;

    setState(() {
      _togglingAreas.add(areaId);
      _areas = _areas
          .map((area) => _mapAreaWithStatus(area, areaId, newStatus))
          .toList();
    });

    try {
      final response = await _http.patch(
        '/api/areas/$areaId',
        body: {'isActive': newStatus},
      );

      if (!mounted) return;

      if (response.statusCode == 200) {
        final decoded = jsonDecode(response.body);
        final updatedArea = decoded is Map ? decoded['data'] : null;

        if (updatedArea is Map) {
          setState(() {
            _areas = _areas
                .map((area) => _areaIdsEqual(area, areaId)
                    ? Map<String, dynamic>.from(updatedArea)
                    : area)
                .toList();
          });
        }

        ScaffoldMessenger.of(context).showSnackBar(
          AccessibleSnackBar.success(
            currentStatus ? 'AREA paused successfully' : 'AREA activated successfully',
          ),
        );
      } else {
        setState(() {
          _areas = _areas
              .map((area) => _mapAreaWithStatus(area, areaId, currentStatus))
              .toList();
        });
        ScaffoldMessenger.of(context).showSnackBar(
          AccessibleSnackBar.error(
            'Error: ${HttpService.getErrorMessage(response)}',
          ),
        );
      }
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _areas = _areas
            .map((area) => _mapAreaWithStatus(area, areaId, currentStatus))
            .toList();
      });
      ScaffoldMessenger.of(context).showSnackBar(
        AccessibleSnackBar.error('Network error: $e'),
      );
    } finally {
      if (!mounted) return;
      setState(() {
        _togglingAreas.remove(areaId);
      });
    }
  }

  Future<void> _deleteArea(dynamic areaId) async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        backgroundColor: RelayColors.slate800,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(16),
          side: const BorderSide(
            color: RelayColors.borderWhite20,
            width: 1,
          ),
        ),
        title: const Text(
          'Delete AREA',
          style: TextStyle(color: Colors.white),
        ),
        content: Text(
          'Are you sure you want to delete this AREA?',
          style: TextStyle(color: Colors.white.withOpacity(0.8)),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: Text(
              'Cancel',
              style: TextStyle(color: Colors.white.withOpacity(0.7)),
            ),
          ),
          Container(
            decoration: BoxDecoration(
              gradient: const LinearGradient(
                colors: [RelayColors.red600, RelayColors.red500],
              ),
              borderRadius: BorderRadius.circular(8),
            ),
            child: ElevatedButton(
              onPressed: () => Navigator.pop(context, true),
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.transparent,
                shadowColor: Colors.transparent,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(8),
                ),
              ),
              child: const Text(
                'Delete',
                style: TextStyle(color: Colors.white),
              ),
            ),
          ),
        ],
      ),
    );

    if (confirmed != true) return;

    try {
      final response = await _http.delete('/api/areas/$areaId');

      if (!mounted) return;

      if (response.statusCode == 200 || response.statusCode == 204) {
        ScaffoldMessenger.of(context).showSnackBar(
          AccessibleSnackBar.success('AREA deleted successfully'),
        );
        _loadAreas();
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          AccessibleSnackBar.error(
            'Error: ${HttpService.getErrorMessage(response)}',
          ),
        );
      }
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        AccessibleSnackBar.error('Network error: $e'),
      );
    }
  }
}
