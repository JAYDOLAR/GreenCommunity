import Notification from '../models/Notification.model.js';

/**
 * Get admin notifications
 */
export const getNotifications = async (req, res) => {
  try {
    const { type, isRead, limit = 20 } = req.query;

    const query = {};
    if (type) query.type = type;
    if (isRead !== undefined) query.isRead = isRead === 'true';

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .populate('userId', 'name email')
      .populate('projectId', 'name')
      .lean();

    // Format for frontend
    const formattedNotifications = notifications.map(notification => ({
      id: notification._id.toString(),
      type: notification.type,
      title: notification.title,
      message: notification.message,
      priority: notification.priority,
      isRead: notification.isRead,
      time: formatTimeAgo(notification.createdAt),
      timestamp: notification.createdAt
    }));

    res.json({
      success: true,
      data: formattedNotifications
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch notifications',
      error: error.message
    });
  }
};

/**
 * Create a notification
 */
export const createNotification = async (req, res) => {
  try {
    const { type, title, message, priority, userId, projectId, orderId, metadata } = req.body;

    const notification = new Notification({
      type,
      title,
      message,
      priority: priority || 'medium',
      userId,
      projectId,
      orderId,
      metadata
    });

    await notification.save();

    res.json({
      success: true,
      data: notification
    });
  } catch (error) {
    console.error('Error creating notification:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create notification',
      error: error.message
    });
  }
};

/**
 * Mark notification as read
 */
export const markAsRead = async (req, res) => {
  try {
    const { id } = req.query;

    const notification = await Notification.findByIdAndUpdate(
      id,
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    res.json({
      success: true,
      data: notification
    });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark notification as read',
      error: error.message
    });
  }
};

/**
 * Mark all notifications as read
 */
export const markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { isRead: false },
      { isRead: true }
    );

    res.json({
      success: true,
      message: 'All notifications marked as read'
    });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark all notifications as read',
      error: error.message
    });
  }
};

/**
 * Delete notification
 */
export const deleteNotification = async (req, res) => {
  try {
    const { id } = req.query;

    const notification = await Notification.findByIdAndDelete(id);

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    res.json({
      success: true,
      message: 'Notification deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete notification',
      error: error.message
    });
  }
};

// Helper function to format time ago
function formatTimeAgo(date) {
  const now = new Date();
  const diff = now - new Date(date);
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
  return 'Just now';
}

/**
 * Get user-specific notifications (for authenticated users)
 */
export const getUserNotifications = async (req, res) => {
  try {
    const userId = req.user._id;
    const { limit = 20 } = req.query;

    // Get notifications for this user OR system-wide notifications
    const notifications = await Notification.find({
      $or: [
        { userId: userId },
        { type: 'system' }
      ]
    })
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .lean();

    // Format for frontend
    const formattedNotifications = notifications.map(notification => ({
      id: notification._id.toString(),
      type: notification.type,
      title: notification.title,
      message: notification.message,
      priority: notification.priority,
      unread: !notification.isRead,
      time: formatTimeAgo(notification.createdAt),
      timestamp: notification.createdAt
    }));

    res.json({
      success: true,
      data: formattedNotifications
    });
  } catch (error) {
    console.error('Error fetching user notifications:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch notifications',
      error: error.message
    });
  }
};

/**
 * Mark user notification as read
 */
export const markUserNotificationAsRead = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;

    const notification = await Notification.findOneAndUpdate(
      { _id: id, $or: [{ userId: userId }, { type: 'system' }] },
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    res.json({
      success: true,
      data: notification
    });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark notification as read',
      error: error.message
    });
  }
};

/**
 * Mark all user notifications as read
 */
export const markAllUserNotificationsAsRead = async (req, res) => {
  try {
    const userId = req.user._id;

    await Notification.updateMany(
      { $or: [{ userId: userId }, { type: 'system' }], isRead: false },
      { isRead: true }
    );

    res.json({
      success: true,
      message: 'All notifications marked as read'
    });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark all notifications as read',
      error: error.message
    });
  }
};

/**
 * Create notification for a user (internal use or triggered by actions)
 */
export const createUserNotification = async (userId, type, title, message, metadata = {}) => {
  try {
    const notification = new Notification({
      type,
      title,
      message,
      userId,
      metadata,
      priority: metadata.priority || 'medium'
    });
    await notification.save();
    return notification;
  } catch (error) {
    console.error('Error creating user notification:', error);
    return null;
  }
};
