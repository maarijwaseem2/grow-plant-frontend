import React, { useState, useRef, useEffect } from "react";
import { API_BASE_URL } from "../config";
import axios from "axios";
import {
  Box, Paper, IconButton, TextField, Typography, Avatar, CircularProgress, Fab, Stack,
} from "@mui/material";
import { MessageCircle, X, Send, Leaf } from "lucide-react";

const WELCOME = {
  role: "assistant",
  content:
    "Hi! I'm the Go Green Assistant 🌱 Ask me anything about planting trees, plant care, native Pakistani species, or our services.",
};

const ChatWidget = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([WELCOME]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const endRef = useRef(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, open, loading]);

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;
    const next = [...messages, { role: "user", content: text }];
    setMessages(next);
    setInput("");
    setLoading(true);
    try {
      const res = await axios.post(`${API_BASE_URL}/ai/chat`, {
        messages: next.filter((m) => m.role === "user" || m.role === "assistant"),
      });
      setMessages((prev) => [...prev, { role: "assistant", content: res.data?.reply || "Sorry, no response." }]);
    } catch {
      setMessages((prev) => [...prev, { role: "assistant", content: "Sorry, I'm having trouble right now. Please try again." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {!open && (
        <Fab color="primary" onClick={() => setOpen(true)}
          sx={{ position: "fixed", bottom: 24, right: 24, zIndex: 1300, bgcolor: "#2e7d32", "&:hover": { bgcolor: "#1b5e20" } }}
          aria-label="Open assistant">
          <MessageCircle size={24} />
        </Fab>
      )}

      {open && (
        <Paper elevation={8}
          sx={{
            position: "fixed", bottom: 24, right: 24, zIndex: 1300,
            width: { xs: "calc(100vw - 32px)", sm: 370 }, height: 520, maxHeight: "80vh",
            display: "flex", flexDirection: "column", borderRadius: 3, overflow: "hidden",
          }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ bgcolor: "#10281a", color: "#fff", px: 2, py: 1.5 }}>
            <Stack direction="row" spacing={1} alignItems="center">
              <Avatar sx={{ bgcolor: "#66bb6a", width: 32, height: 32 }}><Leaf size={18} /></Avatar>
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, lineHeight: 1.1 }}>Go Green Assistant</Typography>
                <Typography variant="caption" sx={{ color: "#9ccc9c" }}>Ask about plants &amp; trees</Typography>
              </Box>
            </Stack>
            <IconButton size="small" onClick={() => setOpen(false)} sx={{ color: "#fff" }} aria-label="Close"><X size={18} /></IconButton>
          </Stack>

          <Box sx={{ flex: 1, overflowY: "auto", p: 2, bgcolor: "#f4f7f4" }}>
            {messages.map((m, i) => (
              <Box key={i} sx={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start", mb: 1.2 }}>
                <Box sx={{
                  maxWidth: "82%", px: 1.5, py: 1, borderRadius: 2, boxShadow: 1, whiteSpace: "pre-wrap",
                  bgcolor: m.role === "user" ? "#2e7d32" : "#fff", color: m.role === "user" ? "#fff" : "text.primary",
                }}>
                  <Typography variant="body2">{m.content}</Typography>
                </Box>
              </Box>
            ))}
            {loading && (
              <Box sx={{ display: "flex", justifyContent: "flex-start", mb: 1 }}>
                <Box sx={{ px: 2, py: 1.2, borderRadius: 2, bgcolor: "#fff", boxShadow: 1 }}><CircularProgress size={16} /></Box>
              </Box>
            )}
            <div ref={endRef} />
          </Box>

          <Stack direction="row" spacing={1} sx={{ p: 1.5, borderTop: "1px solid #e0e0e0", bgcolor: "#fff" }}>
            <TextField size="small" fullWidth placeholder="Ask about plants…" value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }} />
            <IconButton color="primary" onClick={send} disabled={loading || !input.trim()} aria-label="Send"><Send size={20} /></IconButton>
          </Stack>
        </Paper>
      )}
    </>
  );
};

export default ChatWidget;
