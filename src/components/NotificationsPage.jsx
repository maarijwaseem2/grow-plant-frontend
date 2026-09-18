import React, { useEffect, useState } from "react";
import { API_BASE_URL } from "../config";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { ThemeProvider } from "@mui/material/styles";
import {
  Box, Container, Typography, Button, Stack, Card, Avatar, Chip, CircularProgress, Divider,
} from "@mui/material";
import { Bell, CheckCheck, ArrowLeft } from "lucide-react";
import theme from "../theme";

const NotificationsPage = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = () => localStorage.getItem("authToken");
  const auth = { headers: { Authorization: `Bearer ${token()}` } };

  const load = async () => {
    if (!token()) { setLoading(false); return; }
    try {
      const res = await axios.get(`${API_BASE_URL}/notifications/my`, auth);
      setItems(Array.isArray(res.data) ? res.data : res.data?.data || []);
    } catch { /* ignore */ } finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const unread = items.filter((n) => !n.read).length;
  const markRead = async (id) => {
    try { await axios.patch(`${API_BASE_URL}/notifications/${id}/read`, {}, auth);
      setItems((p) => p.map((n) => (n.id === id ? { ...n, read: true } : n))); } catch { /* ignore */ }
  };
  const markAll = async () => {
    try { await axios.patch(`${API_BASE_URL}/notifications/read-all`, {}, auth);
      setItems((p) => p.map((n) => ({ ...n, read: true }))); } catch { /* ignore */ }
  };

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ minHeight: "100vh", bgcolor: "#f4f7f4", pt: "80px", pb: 6 }}>
        <Container maxWidth="md">
          <Button onClick={() => navigate(-1)} startIcon={<ArrowLeft size={18} />} sx={{ mb: 2, color: "text.secondary" }}>Back</Button>

          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Avatar sx={{ bgcolor: "#eaf3ea", color: "primary.main" }}><Bell size={22} /></Avatar>
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 800 }}>Notifications</Typography>
                <Typography variant="body2" color="text.secondary">{unread} unread · {items.length} total</Typography>
              </Box>
            </Stack>
            {unread > 0 && <Button variant="outlined" startIcon={<CheckCheck size={16} />} onClick={markAll}>Mark all read</Button>}
          </Stack>

          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 10 }}><CircularProgress /></Box>
          ) : !token() ? (
            <Card variant="outlined" sx={{ borderRadius: 3, textAlign: "center", py: 6 }}>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>Please log in</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>Log in to see your notifications.</Typography>
              <Button variant="contained" onClick={() => navigate("/login")}>Log in</Button>
            </Card>
          ) : items.length === 0 ? (
            <Card variant="outlined" sx={{ borderRadius: 3, textAlign: "center", py: 8 }}>
              <Avatar sx={{ bgcolor: "#eaf3ea", color: "primary.main", width: 64, height: 64, mx: "auto", mb: 2 }}><Bell size={30} /></Avatar>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>No notifications yet</Typography>
              <Typography variant="body2" color="text.secondary">Updates about your orders, payments and tasks will show up here.</Typography>
            </Card>
          ) : (
            <Card variant="outlined" sx={{ borderRadius: 3, overflow: "hidden" }}>
              {items.map((n, i) => (
                <Box key={n.id}>
                  <Box onClick={() => !n.read && markRead(n.id)}
                    sx={{ px: 3, py: 2, cursor: n.read ? "default" : "pointer", display: "flex", gap: 2, alignItems: "flex-start",
                      bgcolor: n.read ? "transparent" : "#eaf3ea", "&:hover": { bgcolor: n.read ? "#fafafa" : "#e2efe2" } }}>
                    <Avatar sx={{ bgcolor: n.read ? "#eeeeee" : "#2e7d32", color: n.read ? "#999" : "#fff", width: 36, height: 36 }}><Bell size={18} /></Avatar>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="body1" sx={{ fontWeight: n.read ? 400 : 700 }}>{n.message}</Typography>
                      {n.createdAt && <Typography variant="caption" color="text.secondary">{new Date(n.createdAt).toLocaleString()}</Typography>}
                    </Box>
                    {!n.read && <Chip size="small" label="New" color="success" />}
                  </Box>
                  {i < items.length - 1 && <Divider />}
                </Box>
              ))}
            </Card>
          )}
        </Container>
      </Box>
    </ThemeProvider>
  );
};

export default NotificationsPage;
