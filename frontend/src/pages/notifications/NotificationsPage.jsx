import { useState, useEffect, useCallback } from 'react'
import {
  Bell, BellOff, Check, CheckCheck, Trash2,
  Briefcase, Award, AlertCircle, Info, X
} from 'lucide-react'
import { Link } from 'react-router-dom'
import api from '../../api'
import toast from 'react-hot-toast'

const TYPE_CONFIG = {
  job_posted:         { icon: Briefcase,   color: 'text-blue-600',    bg: 'bg-blue-50',    border: 'border-blue-100' },
  application_update: { icon: AlertCircle, color: 'text-amber-600',   bg: 'bg-amber-50',   border: 'border-amber-100' },
  shortlisted:        { icon: AlertCircle, color: 'text-amber-600',   bg: 'bg-amber-50',   border: 'border-amber-100' },
  selected:           { icon: Award,       color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100' },
  rejected:           { icon: X,           color: 'text-red-500',     bg: 'bg-red-50',     border: 'border-red-100' },
  drive_reminder:     { icon: Bell,        color: 'text-violet-600',  bg: 'bg-violet-50',  border: 'border-violet-100' },
  general:            { icon: Info,        color: 'text-slate-500',   bg: 'bg-slate-100',  border: 'border-slate-200' },
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
    <div className="min-h-screen bg-slate-50 text-[#1a2744]">

      {/* Header */}
      <div className="border-b border-slate-200 bg-white sticky top-0 z-20 shadow-sm">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-[#1a2744]">Notifications</h1>
            {unreadCount > 0 && (
              <span className="bg-[#1a2744] text-white text-xs font-bold px-2 py-0.5 rounded-full min-w-[20px] text-center">
                {unreadCount}
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setUnreadOnly(!unreadOnly)}
              className={`text-xs px-3 py-1.5 rounded-xl border font-medium transition-all ${
                unreadOnly
                  ? 'bg-[#1a2744] border-[#1a2744] text-white shadow-sm'
                  : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300 hover:text-slate-700'
              }`}
            >
              Unread only
            </button>
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-[#1a2744] font-medium transition-colors"
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
              <div key={i} className="bg-white border border-slate-200 rounded-2xl p-4 animate-pulse h-20 shadow-sm" />
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-24">
            <div className="w-16 h-16 bg-slate-100 border border-slate-200 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <BellOff className="w-8 h-8 text-slate-300" />
            </div>
            <p className="text-slate-500 font-semibold text-base">No notifications</p>
            <p className="text-slate-400 text-sm mt-1">
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
                  className={`group relative flex items-start gap-4 p-4 rounded-2xl border transition-all cursor-pointer ${
                    !notif.isRead
                      ? 'bg-white border-slate-200 hover:border-slate-300 shadow-sm hover:shadow-md'
                      : 'bg-slate-50 border-slate-200 hover:bg-white hover:border-slate-300 hover:shadow-sm'
                  }`}
                  onClick={() => !notif.isRead && markRead(notif._id)}
                >
                  {/* Unread dot */}
                  {!notif.isRead && (
                    <div className="absolute top-4 right-12 w-2 h-2 rounded-full bg-[#1a2744]" />
                  )}

                  {/* Icon */}
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${cfg.bg} ${cfg.border}`}>
                    <Icon className={`w-4 h-4 ${cfg.color}`} />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className={`text-sm font-semibold leading-tight ${notif.isRead ? 'text-slate-400' : 'text-[#1a2744]'}`}>
                        {notif.title}
                      </p>
                      <span className="text-xs text-slate-400 shrink-0 font-medium">{timeAgo(notif.createdAt)}</span>
                    </div>
                    <p className={`text-xs mt-1 leading-relaxed ${notif.isRead ? 'text-slate-400' : 'text-slate-500'}`}>
                      {notif.message}
                    </p>
                    {notif.link && (
                      <Link
                        to={notif.link}
                        onClick={e => e.stopPropagation()}
                        className="text-xs text-[#1a2744] hover:text-blue-600 mt-1.5 inline-block font-semibold transition-colors"
                      >
                        View details →
                      </Link>
                    )}
                  </div>

                  {/* Delete button */}
                  <button
                    onClick={e => { e.stopPropagation(); deleteNotification(notif._id) }}
                    disabled={deleting === notif._id}
                    className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-50 transition-all shrink-0 disabled:opacity-40"
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
