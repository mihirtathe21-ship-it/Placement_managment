import { useState, useEffect, useCallback } from 'react'
import {
  Bell, BellOff, Check, CheckCheck, Trash2,
  Briefcase, Award, AlertCircle, Info, X
} from 'lucide-react'
import { Link } from 'react-router-dom'
import api from '../../api'
import toast from 'react-hot-toast'

const TYPE_CONFIG = {
  job_posted:         { icon: Briefcase,   color: 'text-blue-600',    bg: 'bg-blue-50' },
  application_update: { icon: AlertCircle, color: 'text-amber-600',   bg: 'bg-amber-50' },
  shortlisted:        { icon: AlertCircle, color: 'text-amber-600',   bg: 'bg-amber-50' },
  selected:           { icon: Award,       color: 'text-emerald-600', bg: 'bg-emerald-50' },
  rejected:           { icon: X,           color: 'text-red-500',     bg: 'bg-red-50' },
  drive_reminder:     { icon: Bell,        color: 'text-violet-600',  bg: 'bg-violet-50' },
  general:            { icon: Info,        color: 'text-slate-500',   bg: 'bg-slate-100' },
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [unreadOnly, setUnreadOnly] = useState(false)
  const [deleting, setDeleting] = useState(null)

  const fetchNotifications = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await api.get('/notifications', {
        params: { unreadOnly: unreadOnly ? 'true' : undefined, limit: 50 }
      })
      setNotifications(data.notifications)
      setUnreadCount(data.unreadCount)
    } catch {
      toast.error('Failed to load notifications')
    } finally {
      setLoading(false)
    }
  }, [unreadOnly])

  useEffect(() => { fetchNotifications() }, [fetchNotifications])

  const markRead = async (id) => {
    try {
      await api.patch(`/notifications/${id}/read`)
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n))
      setUnreadCount(prev => Math.max(0, prev - 1))
    } catch {}
  }

  const markAllRead = async () => {
    try {
      await api.patch('/notifications/read-all')
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
      setUnreadCount(0)
      toast.success('All marked as read')
    } catch {
      toast.error('Failed to mark all as read')
    }
  }

  const deleteNotification = async (id) => {
    setDeleting(id)
    try {
      await api.delete(`/notifications/${id}`)
      setNotifications(prev => prev.filter(n => n._id !== id))
      toast.success('Notification deleted')
    } catch {
      toast.error('Failed to delete')
    } finally {
      setDeleting(null)
    }
  }

  const timeAgo = (date) => {
    const diff = Date.now() - new Date(date).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 1) return 'Just now'
    if (mins < 60) return `${mins}m ago`
    const hrs = Math.floor(mins / 60)
    if (hrs < 24) return `${hrs}h ago`
    const days = Math.floor(hrs / 24)
    if (days < 7) return `${days}d ago`
    const weeks = Math.floor(days / 7)
    return `${weeks}w ago`
  }

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Header */}
      <div className="border-b bg-white sticky top-0 z-20">
        <div className="max-w-3xl mx-auto px-6 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-semibold text-gray-900">Notifications</h1>
              {unreadCount > 0 && (
                <span className="bg-gray-900 text-white text-xs font-medium px-2 py-0.5 rounded-full">
                  {unreadCount}
                </span>
              )}
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setUnreadOnly(!unreadOnly)}
                className={`text-sm px-3 py-1.5 rounded-lg border transition-colors ${
                  unreadOnly
                    ? 'bg-gray-900 border-gray-900 text-white'
                    : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                Unread only
              </button>
              {unreadCount > 0 && (
                <button
                  onClick={markAllRead}
                  className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors"
                >
                  <CheckCheck className="w-4 h-4" />
                  Mark all read
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-6">
        
        {loading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="bg-white border border-gray-200 rounded-lg p-4 animate-pulse">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 bg-gray-200 rounded-lg"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
                    <div className="h-3 bg-gray-100 rounded w-2/3"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-lg border border-gray-200">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <BellOff className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-500 font-medium">No notifications</p>
            <p className="text-gray-400 text-sm mt-1">
              {unreadOnly ? "You're all caught up!" : 'Notifications will appear here'}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {notifications.map(notif => {
              const cfg = TYPE_CONFIG[notif.type] || TYPE_CONFIG.general
              const Icon = cfg.icon
              return (
                <div
                  key={notif._id}
                  className={`group relative flex items-start gap-4 p-4 rounded-lg border transition-all ${
                    !notif.isRead
                      ? 'bg-white border-gray-200 shadow-sm'
                      : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  {/* Unread indicator */}
                  {!notif.isRead && (
                    <div className="absolute -left-px top-0 bottom-0 w-1 bg-gray-900 rounded-l-lg" />
                  )}

                  {/* Icon */}
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${cfg.bg}`}>
                    <Icon className={`w-4 h-4 ${cfg.color}`} />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className={`text-sm font-medium ${!notif.isRead ? 'text-gray-900' : 'text-gray-500'}`}>
                        {notif.title}
                      </p>
                      <span className="text-xs text-gray-400 shrink-0">{timeAgo(notif.createdAt)}</span>
                    </div>
                    <p className={`text-sm mt-1 ${!notif.isRead ? 'text-gray-600' : 'text-gray-400'}`}>
                      {notif.message}
                    </p>
                    {notif.link && (
                      <Link
                        to={notif.link}
                        onClick={e => e.stopPropagation()}
                        className="text-sm text-gray-600 hover:text-gray-900 mt-2 inline-block font-medium"
                      >
                        View details →
                      </Link>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1">
                    {!notif.isRead && (
                      <button
                        onClick={e => { e.stopPropagation(); markRead(notif._id) }}
                        className="p-1.5 rounded text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                        title="Mark as read"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <button
                      onClick={e => { e.stopPropagation(); deleteNotification(notif._id) }}
                      disabled={deleting === notif._id}
                      className="p-1.5 rounded text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors disabled:opacity-40"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}