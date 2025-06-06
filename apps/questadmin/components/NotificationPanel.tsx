'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { useNotifications, type Notification } from '@/contexts/NotificationsContext'
import { cn } from '@/lib/utils'
import { formatDistanceToNow } from 'date-fns'
import {
    AlertTriangle,
    Check,
    CheckCircle,
    Info,
    MoreHorizontal,
    Trash2,
    XCircle
} from 'lucide-react'
import React from 'react'

interface NotificationPanelProps {
  children: React.ReactNode
}

const notificationIcons = {
  info: Info,
  success: CheckCircle,
  warning: AlertTriangle,
  error: XCircle,
}

const notificationColors = {
  info: 'text-blue-500',
  success: 'text-green-500',
  warning: 'text-yellow-500',
  error: 'text-red-500',
}

function NotificationItem({ notification }: { notification: Notification }) {
  const { markAsRead, removeNotification } = useNotifications()
  const Icon = notificationIcons[notification.type]

  return (
    <div className={cn(
      "p-3 border-b border-border last:border-b-0 hover:bg-accent/50 transition-colors",
      !notification.read && "bg-accent/20"
    )}>
      <div className="flex items-start gap-3">
        <Icon className={cn("w-4 h-4 mt-1 flex-shrink-0", notificationColors[notification.type])} />
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">{notification.title}</p>
              <p className="text-xs text-muted-foreground mt-1">{notification.message}</p>
              <p className="text-xs text-muted-foreground mt-2">
                {formatDistanceToNow(notification.timestamp, { addSuffix: true })}
              </p>
            </div>
            <div className="flex items-center gap-1">
              {!notification.read && (
                <div className="w-2 h-2 bg-primary rounded-full" />
              )}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                    <MoreHorizontal className="w-3 h-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {!notification.read && (
                    <DropdownMenuItem onClick={() => markAsRead(notification.id)}>
                      <Check className="mr-2 h-3 w-3" />
                      Mark as read
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem 
                    onClick={() => removeNotification(notification.id)}
                    className="text-destructive"
                  >
                    <Trash2 className="mr-2 h-3 w-3" />
                    Remove
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export function NotificationPanel({ children }: NotificationPanelProps) {
  const { notifications, markAllAsRead, clearAllNotifications, unreadCount } = useNotifications()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {children}
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80 p-0" align="end" forceMount>
        <div className="flex items-center justify-between p-4 border-b border-border">
          <DropdownMenuLabel className="p-0">
            <div className="flex items-center gap-2">
              <span>Notifications</span>
              {unreadCount > 0 && (
                <Badge variant="secondary" className="h-5 text-xs">
                  {unreadCount}
                </Badge>
              )}
            </div>
          </DropdownMenuLabel>
          {notifications.length > 0 && (
            <div className="flex gap-1">
              {unreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={markAllAsRead}
                  className="h-6 text-xs px-2"
                >
                  Mark all read
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAllNotifications}
                className="h-6 text-xs px-2 text-destructive hover:text-destructive"
              >
                Clear all
              </Button>
            </div>
          )}
        </div>
        
        <div className="max-h-96 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="p-8 text-center">
              <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mx-auto mb-3">
                <Info className="w-6 h-6 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground">No notifications yet</p>
            </div>
          ) : (
            notifications.map((notification) => (
              <NotificationItem key={notification.id} notification={notification} />
            ))
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
