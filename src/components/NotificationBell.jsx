import React, { useEffect, useState } from "react";
import { API_BASE_URL } from "../config";
import axios from "axios";
import { io } from "socket.io-client";
import { decodeJwt } from "jose";
import { useNavigate } from "react-router-dom";
import { IconButton, Badge, Menu, Box, Typography, Button, Divider } from "@mui/material";
import { Bell, CheckCheck } from "lucide-react";

const NotificationBell = ({ dark = true }) => {
  const [items, setItems] = useState([]);
  const [anchor, setAnchor] = useState(null);
  const navigate = useNavigate();
  const token = () => localStorage.getItem("authToken");

  const load = async () => {
    if (!token()) return;
    try {
      const res = await axios.get(`${API_BASE_URL}/notifications/my`, {
        headers: { Authorization: `Bearer ${token()}` },
      });
      setItems(Array.isArray(res.data) ? res.data : res.data?.data || []);
    } catch { /* ignore */ }
  };

  useEffect(() => {
    load();
    const t = setInterval(load, 30000); // fallback poll
    let socket;
    const tk = token();
    if (tk) {
      try {
        const uid = decodeJwt(tk).sub;
        socket = io(API_BASE_URL, { transports: ["websocket", "polling"] });
        socket.on("connect", () => socket.emit("join", uid));
        socket.on("notification", () => load());
        socket.on("task-updated", () => load());
      } catch { /* ignore */ }
    }
    return () => { clearInterval(t); if (socket) socket.disconnect(); };
  }, []);

  const unread = items.filter((n) => !n.read).length;

  const markRead = async (id) => {
    try {
      await axios.patch(`${API_BASE_URL}/notifications/${id}/read`, {}, { headers: { Authorization: `Bearer ${token()}` } });
      setItems((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    } catch { /* ignore */ }
  };
  const markAll = async () => {
    try {
      await axios.patch(`${API_BASE_URL}/notifications/read-all`, {}, { headers: { Authorization: `Bearer ${token()}` } });
      setItems((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch { /* ignore */ }
  };

  // only show the bell to logged-in users
  if (!token()) return null;

  return (
    <>
      <IconButton onClick={(e) => setAnchor(e.currentTarget)} sx={{ color: dark ? "#cfe0d3" : "#2e7d32" }}>
        <Badge badgeContent={unread} color="error"><Bell size={20} /></Badge>
      </IconButton>
      <Menu anchorEl={anchor} open={!!anchor} onClose={() => setAnchor(null)}
        PaperProps={{ sx: { width: 350, borderRadius: 2 } }}>
        <Box sx={{ px: 2, py: 1.5, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Notifications</Typography>
          {unread > 0 && <Button size="small" startIcon={<CheckCheck size={14} />} onClick={markAll}>Mark all</Button>}
        </Box>
        <Divider />

        {/* scrollable list */}
        <Box sx={{ maxHeight: 320, overflowY: "auto" }}>
          {items.length === 0 ? (
            <Box sx={{ px: 2, py: 4, textAlign: "center", color: "text.secondary" }}>
              <Typography variant="body2">No notifications yet.</Typography>
            </Box>
          ) : (
            items.slice(0, 15).map((n) => (
              <Box key={n.id} onClick={() => !n.read && markRead(n.id)}
                sx={{ px: 2, py: 1.2, cursor: "pointer", bgcolor: n.read ? "transparent" : "#eaf3ea",
                  "&:hover": { bgcolor: "#f2f2f2" }, borderBottom: "1px solid #f2f2f2" }}>
                <Typography variant="body2" sx={{ fontWeight: n.read ? 400 : 600 }}>{n.message}</Typography>
                {n.createdAt && (
                  <Typography variant="caption" color="text.secondary">
                    {new Date(n.createdAt).toLocaleString()}
                  </Typography>
                )}
              </Box>
            ))
          )}
        </Box>

        <Divider />
        <Box sx={{ p: 1 }}>
          <Button fullWidth size="small" sx={{ fontWeight: 700 }}
            onClick={() => { setAnchor(null); navigate("/notifications"); }}>
            See all notifications
          </Button>
        </Box>
      </Menu>
    </>
  );
};

export default NotificationBell;
