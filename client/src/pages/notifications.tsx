import { useState, useEffect } from "react";
import { api, type Notification } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Heart, MessageSquare, Trash2, Bell, Check } from "lucide-react";
import { LayerNav } from "@/components/layer/LayerNav";

export default function NotificationsPage() {
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadNotifications = async () => {
      try {
        const data = await api.getNotifications().catch(() => []);
        setNotifications(data || []);
      } catch (error: any) {
        toast({ title: "Error", description: error.message, variant: "destructive" });
      } finally {
        setLoading(false);
      }
    };
    loadNotifications();
  }, [toast]);

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await api.markNotificationAsRead(notificationId);
      setNotifications(notifications.map((n) => (n.id === notificationId ? { ...n, read: true } : n)));
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const handleDelete = async (notificationId: string) => {
    try {
      await api.deleteNotification(notificationId);
      setNotifications(notifications.filter((n) => n.id !== notificationId));
      toast({ title: "Notification deleted" });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  return (
    <div style={{ background: "var(--bone)", minHeight: "100vh", color: "var(--ink)" }}>
      <LayerNav />
      <section className="layer-section layer-divider" style={{ paddingTop: "3rem", paddingBottom: "5rem" }}>
        <div className="layer-container">
          <span className="eyebrow"><span className="num">N</span> Notifications</span>
          <h2 style={{ fontSize: "var(--t-5)", marginBottom: "1rem" }}>
            Activity on <span className="it">your modules.</span>
          </h2>

          <div style={{ marginTop: "2.5rem" }}>
            {loading ? (
              <p style={{ color: "var(--ink-4)" }}>Loading…</p>
            ) : notifications.length > 0 ? (
              <div
                style={{
                  background: "var(--bone-light)",
                  border: "1px solid var(--bone-edge)",
                  borderRadius: "var(--r-3)",
                  overflow: "hidden",
                }}
              >
                {notifications.map((notif, i) => (
                  <div
                    key={notif.id}
                    style={{
                      padding: "1.1rem 1.5rem",
                      borderBottom: i < notifications.length - 1 ? "1px solid var(--bone-edge)" : "none",
                      background: notif.read ? "transparent" : "var(--acid-soft)",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "0.75rem" }}>
                      <div style={{ display: "flex", gap: "0.75rem", flex: 1, minWidth: 0 }}>
                        <div style={{ marginTop: 2, color: "var(--ink-3)" }}>
                          {notif.type === "favorite" && <Heart className="w-4 h-4" />}
                          {notif.type === "run" && <MessageSquare className="w-4 h-4" />}
                        </div>
                        <div style={{ minWidth: 0, flex: 1 }}>
                          <p style={{ fontSize: "0.92rem", color: "var(--ink)", fontWeight: notif.read ? 400 : 600 }}>{notif.message}</p>
                          <p
                            style={{
                              fontSize: "0.7rem",
                              fontFamily: "var(--font-mono)",
                              textTransform: "uppercase",
                              letterSpacing: "0.12em",
                              color: "var(--ink-4)",
                              marginTop: 4,
                            }}
                          >
                            {new Date(notif.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
                        {!notif.read && (
                          <button
                            onClick={() => handleMarkAsRead(notif.id)}
                            style={{ background: "transparent", border: 0, padding: 8, cursor: "pointer", color: "var(--ink)", borderRadius: 6 }}
                          >
                            <Check className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(notif.id)}
                          style={{ background: "transparent", border: 0, padding: 8, cursor: "pointer", color: "var(--ink-4)", borderRadius: 6 }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div
                style={{
                  textAlign: "center",
                  padding: "5rem 2rem",
                  background: "var(--bone-light)",
                  border: "1px solid var(--bone-edge)",
                  borderRadius: "var(--r-3)",
                }}
              >
                <Bell className="w-10 h-10" style={{ margin: "0 auto 1rem", color: "var(--ink-4)" }} />
                <p style={{ fontWeight: 600, fontSize: "1rem" }}>No notifications yet</p>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
