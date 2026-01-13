import SecurityThreat from '../models/SecurityThreat.model.js';
import SecurityLog from '../models/SecurityLog.model.js';

/**
 * Get security threats
 */
export const getSecurityThreats = async (req, res) => {
  try {
    const { status, severity, limit = 50 } = req.query;

    const query = {};
    if (status) query.status = status;
    if (severity) query.severity = severity;

    const threats = await SecurityThreat.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .lean();

    // Format for frontend
    const formattedThreats = threats.map(threat => ({
      id: threat._id.toString(),
      type: threat.type,
      severity: threat.severity,
      description: threat.description,
      ipAddress: threat.ipAddress,
      user: threat.user,
      timestamp: threat.createdAt.toISOString().replace('T', ' ').substring(0, 19),
      status: threat.status,
      location: threat.location
    }));

    res.json({
      success: true,
      data: formattedThreats
    });
  } catch (error) {
    console.error('Error fetching security threats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch security threats',
      error: error.message
    });
  }
};

/**
 * Get security access logs
 */
export const getSecurityLogs = async (req, res) => {
  try {
    const { action, status, userId, limit = 100 } = req.query;

    const query = {};
    if (action) query.action = action;
    if (status) query.status = status;
    if (userId) query.userId = userId;

    const logs = await SecurityLog.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .lean();

    // Format for frontend
    const formattedLogs = logs.map(log => ({
      id: log._id.toString(),
      user: log.user,
      action: log.action,
      ipAddress: log.ipAddress,
      userAgent: log.userAgent,
      timestamp: log.createdAt.toISOString().replace('T', ' ').substring(0, 19),
      status: log.status,
      location: log.location
    }));

    res.json({
      success: true,
      data: formattedLogs
    });
  } catch (error) {
    console.error('Error fetching security logs:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch security logs',
      error: error.message
    });
  }
};

/**
 * Create security threat
 */
export const createSecurityThreat = async (req, res) => {
  try {
    const { type, severity, description, ipAddress, user, location, userAgent, metadata } = req.body;

    const threat = new SecurityThreat({
      type,
      severity,
      description,
      ipAddress,
      user: user || 'unknown',
      location: location || 'Unknown',
      userAgent,
      metadata
    });

    await threat.save();

    res.json({
      success: true,
      data: threat
    });
  } catch (error) {
    console.error('Error creating security threat:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create security threat',
      error: error.message
    });
  }
};

/**
 * Create security log entry
 */
export const createSecurityLog = async (req, res) => {
  try {
    const { user, userId, action, ipAddress, userAgent, status, location, metadata } = req.body;

    const log = new SecurityLog({
      user,
      userId,
      action,
      ipAddress,
      userAgent,
      status: status || 'success',
      location: location || 'Unknown',
      metadata
    });

    await log.save();

    res.json({
      success: true,
      data: log
    });
  } catch (error) {
    console.error('Error creating security log:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create security log',
      error: error.message
    });
  }
};

/**
 * Update security threat status
 */
export const updateSecurityThreat = async (req, res) => {
  try {
    const { id } = req.query;
    const { status } = req.body;

    const threat = await SecurityThreat.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!threat) {
      return res.status(404).json({
        success: false,
        message: 'Security threat not found'
      });
    }

    res.json({
      success: true,
      data: threat
    });
  } catch (error) {
    console.error('Error updating security threat:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update security threat',
      error: error.message
    });
  }
};
