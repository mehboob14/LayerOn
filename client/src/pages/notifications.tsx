import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { api, type Notification } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Heart, MessageSquare, Trash2, Bell, Check } from "lucide-react";

export default function NotificationsPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadNotifications = async () => {
      try { const data = await api.getNotifications().catch(() => []); setNotifications(data || []); }
      catch (error: any) { toast({ title: "Error", description: error.message, variant: "destructive" }); }
      finally { setLoading(false); }
    };
    loadNotifications();
  }, [toast]);

  const handleMarkAsRead = async (notificationId: string) => {
    try { await api.markNotificationAsRead(notificationId); setNotifications(notifications.map(n => n.id === notificationId ? { ...n, read: true } : n)); }
    catch (error: any) { toast({ title: "Error", description: error.message, variant: "destructive" }); }
  };

  const handleDelete = async (notificationId: string) => {
    try { await api.deleteNotification(notificationId); setNotifications(notifications.filter(n => n.id !== notificationId)); toast({ title: "Notification deleted" }); }
    catch (error: any) { toast({ title: "Error", description: error.message, variant: "destructive" }); }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ position: "relative", zIndex: 1 }}>
      <p style={{ color: "#52525b" }}>Loading...</p>
    </div>
  );

  return (
    <div className="min-h-screen" style={{ position: "relative", zIndex: 1 }}>
      <header className="sticky top-0 z-40 glass-navbar">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center gap-3">
          <button onClick={() => setLocation("/dashboard")} className="flex items-center justify-center w-8 h-8 rounded-lg gentle-animation hover:bg-white/5" style={{ color: "#71717a" }}>
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <span className="text-lg font-black" style={{ color: "#fafafa" }}>Notifications</span>
            <p className="text-xs" style={{ color: "#71717a" }}>Activity on your modules</p>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-10">
        {notifications.length > 0 ? (
          <div className="rounded-2xl overflow-hidden glass-card">
            {notifications.map((notif, i) => (
              <div key={notif.id} className="px-6 py-4" style={{
                borderBottom: i < notifications.length - 1 ? "1px solid #27272a" : "none",
                backgroundColor: notif.read ? "transparent" : "rgba(37,99,235,0.02)",
              }}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex gap-3 flex-1 min-w-0">
                    <div className="mt-0.5" style={{ color: "#52525b" }}>
                      {notif.type === "favorite" && <Heart className="w-4 h-4" />}
                      {notif.type === "run" && <MessageSquare className="w-4 h-4" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm" style={{ color: notif.read ? "#71717a" : "#fafafa", fontWeight: notif.read ? 400 : 600 }}>{notif.message}</p>
                      <p className="text-xs mt-1" style={{ color: "#52525b" }}>{new Date(notif.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    {!notif.read && (
                      <button onClick={() => handleMarkAsRead(notif.id)} className="p-2 rounded-lg gentle-animation hover:bg-white/5" style={{ color: "var(--accent-blue)" }}>
                        <Check className="w-4 h-4" />
                      </button>
                    )}
                    <button onClick={() => handleDelete(notif.id)} className="p-2 rounded-lg gentle-animation hover:bg-red-500/10" style={{ color: "#52525b" }}>
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 rounded-2xl glass-card">
            <Bell className="w-12 h-12 mx-auto mb-4" style={{ color: "#27272a" }} />
            <p className="text-sm font-bold" style={{ color: "#fafafa" }}>No notifications yet</p>
          </div>
        )}
      </div>
    </div>
  );
}
