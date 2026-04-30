import { useState, useEffect } from 'react';
import { Bell, Check, X, Info, AlertTriangle, ExternalLink } from 'lucide-react';
import { usersAPI } from '@/services/api';
import { Button } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from './ui/dropdown-menu';
import { Badge } from './ui/badge';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';

export function NotificationCenter() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    fetchNotifications();
    // Poll for new notifications every 60 seconds
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await usersAPI.getNotifications();
      const data = Array.isArray(response.data) ? response.data : [];
      setNotifications(data);
      setUnreadCount(data.filter((n: any) => !n.is_read).length);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    }
  };

  const markAsRead = async (id?: number) => {
    try {
      await usersAPI.markNotificationsRead(id);
      if (id) {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
        setUnreadCount(prev => Math.max(0, prev - 1));
      } else {
        setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
        setUnreadCount(0);
      }
    } catch (error) {
      console.error('Failed to mark notifications as read:', error);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'approval': return <Check className="w-4 h-4 text-green-500" />;
      case 'rejection': return <X className="w-4 h-4 text-red-500" />;
      case 'fulfillment': return <Badge className="bg-yellow-500/10 text-yellow-500 p-1"><ExternalLink className="w-3 h-3" /></Badge>;
      case 'follow': return <Bell className="w-4 h-4 text-blue-500" />;
      default: return <Info className="w-4 h-4 text-primary" />;
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 p-0 overflow-hidden bg-card/95 backdrop-blur-md border-border shadow-2xl rounded-xl">
        <div className="p-4 flex items-center justify-between bg-muted/50">
          <DropdownMenuLabel className="p-0 text-base font-bold">Notifications</DropdownMenuLabel>
          {unreadCount > 0 && (
            <button 
              onClick={() => markAsRead()}
              className="text-xs text-primary hover:underline font-medium"
            >
              Mark all read
            </button>
          )}
        </div>
        <DropdownMenuSeparator className="m-0" />
        <div className="max-h-[400px] overflow-y-auto no-scrollbar">
          {notifications.length > 0 ? (
            notifications.map((notif) => (
              <DropdownMenuItem 
                key={notif.id} 
                className={`p-4 cursor-pointer focus:bg-muted/80 border-b border-border/50 last:border-0 ${!notif.is_read ? 'bg-primary/5' : ''}`}
                onClick={() => !notif.is_read && markAsRead(notif.id)}
              >
                <div className="flex gap-3 w-full">
                  <div className="mt-1 flex-shrink-0">
                    {getIcon(notif.type)}
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className={`text-sm leading-none ${!notif.is_read ? 'font-bold' : 'font-medium'}`}>
                      {notif.title}
                    </p>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {notif.message}
                    </p>
                    <p className="text-[10px] text-muted-foreground/60 flex items-center gap-1">
                      {formatDistanceToNow(new Date(notif.created_at), { addSuffix: true })}
                    </p>
                  </div>
                  {notif.link && (
                    <Link to={notif.link} className="mt-1">
                      <ExternalLink className="w-3 h-3 text-muted-foreground/40 hover:text-primary transition-colors" />
                    </Link>
                  )}
                </div>
              </DropdownMenuItem>
            ))
          ) : (
            <div className="p-8 text-center flex flex-col items-center gap-2">
              <Bell className="w-8 h-8 text-muted-foreground/20" />
              <p className="text-sm text-muted-foreground">All caught up!</p>
            </div>
          )}
        </div>
        {notifications.length > 0 && (
          <div className="p-2 bg-muted/30 text-center border-t border-border/50">
            <button className="text-xs text-muted-foreground hover:text-foreground font-medium transition-colors">
              View all activity
            </button>
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
