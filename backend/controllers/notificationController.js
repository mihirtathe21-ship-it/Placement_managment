import { Notification } from '../models/Notification.js'

// @desc    Get my notifications
// @route   GET /api/notifications
// @access  Private
export const getNotifications = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, unreadOnly } = req.query
    const filter = { recipient: req.user._id }
    if (unreadOnly === 'true') filter.isRead = false

    const notifications = await Notification.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit))

    const unreadCount = await Notification.countDocuments({ recipient: req.user._id, isRead: false })
    const total = await Notification.countDocuments(filter)

    res.json({ notifications, unreadCount, total, page: Number(page), pages: Math.ceil(total / limit) })
  } catch (err) {
    next(err)
  }
}

// @desc    Mark notification as read
// @route   PATCH /api/notifications/:id/read
// @access  Private
export const markRead = async (req, res, next) => {
  try {
    await Notification.findOneAndUpdate(
      { _id: req.params.id, recipient: req.user._id },
      { isRead: true }
    )
    res.json({ message: 'Marked as read' })
  } catch (err) {
    next(err)
  }
}

// @desc    Mark all as read
// @route   PATCH /api/notifications/read-all
// @access  Private
export const markAllRead = async (req, res, next) => {
  try {
    await Notification.updateMany({ recipient: req.user._id, isRead: false }, { isRead: true })
    res.json({ message: 'All notifications marked as read' })
  } catch (err) {
    next(err)
  }
}

// @desc    Delete a notification
// @route   DELETE /api/notifications/:id
// @access  Private
export const deleteNotification = async (req, res, next) => {
  try {
    await Notification.findOneAndDelete({ _id: req.params.id, recipient: req.user._id })
    res.json({ message: 'Notification deleted' })
  } catch (err) {
    next(err)
  }
}