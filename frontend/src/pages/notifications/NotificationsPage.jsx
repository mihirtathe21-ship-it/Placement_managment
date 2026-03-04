import { useState, useEffect, useCallback } from 'react'
import {
  Bell, BellOff, Check, CheckCheck, Trash2,
  Briefcase, Award, AlertCircle, Info, X
} from 'lucide-react'
import { Link } from 'react-router-dom'
import api from '../../api'
import toast from 'react-hot-toast'

const TYPE_CONFIG = {
  job_posted:         { icon: Briefcase,    color: 'text-navy-400',    bg: 'bg-navy-500/10' },
  application_update: { icon: AlertCircle,  color: 'text-yellow-400',  bg: 'bg-yellow-500/10' },
  shortlisted:        { icon: AlertCircle,  color: 'text-yellow-400',  bg: 'bg-yellow-500/10' },
  selected:           { icon: Award,        color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  rejected:           { icon: X,            color: 'text-red-400',     bg: 'bg-red-500/10' },
  drive_reminder:     { icon: Bell,         color: 'text-purple-400',  bg: 'bg-purple-500/10' },
  general:            { icon: Info,         color: 'text-white/60',    bg: 'bg-white/5' },
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
    return `${days}d ago`
  }

  return (
    <div className="min-h-screen bg-[#0a0f1e] text-white">
      {/* Header */}
      <div className="border-b border-white/5 bg-[#0d1425]/80 backdrop-blur sticky top-0 z-20">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="font-display text-xl font-bold text-white">Notifications</h1>
            {unreadCount > 0 && (
              <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                {unreadCount}
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setUnreadOnly(!unreadOnly)}
              className={`text-xs px-3 py-1.5 rounded-xl border transition-all ${
                unreadOnly ? 'bg-navy-500/20 border-navy-500/30 text-navy-300' : 'bg-white/5 border-white/10 text-white/40'
              }`}
            >
              Unread only
            </button>
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                className="flex items-center gap-1.5 text-xs text-white/40 hover:text-white/60 transition-colors"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                Mark all read
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-6">
        {loading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="bg-white/3 border border-white/5 rounded-2xl p-4 animate-pulse h-20" />
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-24">
            <BellOff className="w-12 h-12 text-white/10 mx-auto mb-4" />
            <p className="text-white/40 font-medium">No notifications</p>
            <p className="text-white/20 text-sm mt-1">
              {unreadOnly ? 'You\'re all caught up!' : 'Notifications will appear here'}
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
                  className={`group relative flex items-start gap-4 p-4 rounded-2xl border transition-all cursor-pointer ${
                    !notif.isRead
                      ? 'bg-white/5 border-white/10 hover:border-white/15'
                      : 'bg-white/2 border-white/5 hover:border-white/8'
                  }`}
                  onClick={() => !notif.isRead && markRead(notif._id)}
                >
                  {/* Unread dot */}
                  {!notif.isRead && (
                    <div className="absolute top-4 right-12 w-2 h-2 rounded-full bg-navy-400" />
                  )}

                  {/* Icon */}
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${cfg.bg}`}>
                    <Icon className={`w-4 h-4 ${cfg.color}`} />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className={`text-sm font-semibold leading-tight ${notif.isRead ? 'text-white/60' : 'text-white'}`}>
                        {notif.title}
                      </p>
                      <span className="text-xs text-white/30 shrink-0">{timeAgo(notif.createdAt)}</span>
                    </div>
                    <p className="text-xs text-white/40 mt-1 leading-relaxed">{notif.message}</p>
                    {notif.link && (
                      <Link
                        to={notif.link}
                        onClick={e => e.stopPropagation()}
                        className="text-xs text-navy-400 hover:text-navy-300 mt-1.5 inline-block transition-colors"
                      >
                        View details →
                      </Link>
                    )}
                  </div>

                  {/* Delete button */}
                  <button
                    onClick={e => { e.stopPropagation(); deleteNotification(notif._id) }}
                    disabled={deleting === notif._id}
                    className="opacity-0 group-hover:opacity-100 text-white/20 hover:text-red-400 transition-all shrink-0"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}