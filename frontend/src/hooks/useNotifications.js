import { useEffect, useRef, useState } from 'react'
import { io } from 'socket.io-client'
import toast from 'react-hot-toast'

const SOCKET_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'

export function useNotifications(userId) {
  const socketRef = useRef(null)
  const [unreadCount, setUnreadCount] = useState(0)
  const [latestNotification, setLatestNotification] = useState(null)

  useEffect(() => {
    if (!userId) return

    socketRef.current = io(SOCKET_URL, { transports: ['websocket'] })

    socketRef.current.on('connect', () => {
      socketRef.current.emit('register', userId)
    })

    socketRef.current.on('notification', (notif) => {
      setLatestNotification(notif)
      setUnreadCount(prev => prev + 1)

      // Show a toast for important notification types
      if (notif.type === 'selected') {
        toast.success(notif.title, { duration: 5000, icon: '🎉' })
      } else if (notif.type === 'shortlisted') {
        toast(notif.title, { duration: 4000, icon: '⭐' })
      } else if (notif.type === 'job_posted') {
        toast(notif.title, { duration: 3000, icon: '💼' })
      }
    })

    return () => {
      socketRef.current?.disconnect()
    }
  }, [userId])

  return { unreadCount, setUnreadCount, latestNotification }
}