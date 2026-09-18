import React, { useEffect, useState } from "react";
import { API_BASE_URL } from "../config";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import { ThemeProvider } from "@mui/material/styles";
import {
  Box, Container, Typography, Card, Avatar, Stack, CircularProgress, Dialog, Button, Divider,
} from "@mui/material";
import { MessageCircle, ArrowLeft } from "lucide-react";
import theme from "../theme";
import ChatBox from "./ChatBox";

const MessagesPage = () => {
  const navigate = useNavigate();
  const params = new URLSearchParams(useLocation().search);
  const [convos, setConvos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState(null); // { otherId, otherName }
  const token = () => localStorage.getItem("authToken");

  const load = async () => {
    if (!token()) { setLoading(false); return; }
    try {
      const res = await axios.get(`${API_BASE_URL}/chat/conversations`, { headers: { Authorization: `Bearer ${token()}` } });
      setConvos(Array.isArray(res.data) ? res.data : []);
    } catch { /* ignore */ } finally { setLoading(false); }
  };
  useEffect(() => {
    load();
    // deep link from a task: /messages?with=<id>&name=<name>
    const withId = params.get("with");
    if (withId) setActive({ otherId: withId, otherName: params.get("name") || "Chat" });
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ minHeight: "100vh", bgcolor: "#f4f7f4", pt: "80px", pb: 6 }}>
        <Container maxWidth="md">
          <Button onClick={() => navigate(-1)} startIcon={<ArrowLeft size={18} />} sx={{ mb: 2, color: "text.secondary" }}>Back</Button>
          <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 3 }}>
            <Avatar sx={{ bgcolor: "#eaf3ea", color: "primary.main" }}><MessageCircle size={22} /></Avatar>
            <Typography variant="h5" sx={{ fontWeight: 800 }}>Messages</Typography>
          </Stack>

          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 10 }}><CircularProgress /></Box>
          ) : !token() ? (
            <Card variant="outlined" sx={{ borderRadius: 3, textAlign: "center", py: 6 }}>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>Please log in</Typography>
              <Button variant="contained" sx={{ mt: 2 }} onClick={() => navigate("/login")}>Log in</Button>
            </Card>
          ) : convos.length === 0 ? (
            <Card variant="outlined" sx={{ borderRadius: 3, textAlign: "center", py: 8 }}>
              <Avatar sx={{ bgcolor: "#eaf3ea", color: "primary.main", width: 64, height: 64, mx: "auto", mb: 2 }}><MessageCircle size={30} /></Avatar>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>No conversations yet</Typography>
              <Typography variant="body2" color="text.secondary">When you're matched with a gardener (or customer), your chat appears here.</Typography>
            </Card>
          ) : (
            <Card variant="outlined" sx={{ borderRadius: 3, overflow: "hidden" }}>
              {convos.map((c, i) => (
                <Box key={c.otherId}>
                  <Box onClick={() => setActive({ otherId: c.otherId, otherName: c.otherName })}
                    sx={{ px: 3, py: 2, display: "flex", gap: 2, alignItems: "center", cursor: "pointer", "&:hover": { bgcolor: "#fafafa" } }}>
                    <Avatar sx={{ bgcolor: "#2e7d32" }}>{(c.otherName || "U")[0]}</Avatar>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>{c.otherName}</Typography>
                      <Typography variant="body2" color="text.secondary" noWrap>{c.lastMessage}</Typography>
                    </Box>
                    <Typography variant="caption" color="text.secondary">
                      {c.lastAt ? new Date(c.lastAt).toLocaleDateString() : ""}
                    </Typography>
                  </Box>
                  {i < convos.length - 1 && <Divider />}
                </Box>
              ))}
            </Card>
          )}
        </Container>
      </Box>

      <Dialog open={!!active} onClose={() => setActive(null)} maxWidth="sm" fullWidth
        PaperProps={{ sx: { borderRadius: 3, overflow: "hidden" } }}>
        {active && <ChatBox otherId={active.otherId} otherName={active.otherName} onClose={() => setActive(null)} />}
      </Dialog>
    </ThemeProvider>
  );
};

export default MessagesPage;
