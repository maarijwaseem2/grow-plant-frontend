import React, { useState, useEffect, useRef } from "react";
import { API_BASE_URL } from "../config";
import axios from "axios";
import { io } from "socket.io-client";
import { decodeJwt } from "jose";
import toast from "react-hot-toast";
import {
  Box, Typography, IconButton, TextField, Avatar, Stack, CircularProgress, Tooltip,
} from "@mui/material";
import { Send, Mic, StopCircle, MapPin, X, ShieldCheck } from "lucide-react";

const ChatBox = ({ otherId, otherName, onClose }) => {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [recording, setRecording] = useState(false);
  const endRef = useRef(null);
  const recRef = useRef(null);
  const token = () => localStorage.getItem("authToken");
  const auth = { headers: { Authorization: `Bearer ${token()}` } };
  const myId = (() => { try { return decodeJwt(token()).sub; } catch { return null; } })();

  const load = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/chat/with/${otherId}`, auth);
      setMessages(Array.isArray(res.data) ? res.data : []);
    } catch { /* ignore */ } finally { setLoading(false); }
  };

  useEffect(() => {
    load();
    let socket;
    try {
      socket = io(API_BASE_URL, { transports: ["websocket", "polling"] });
      socket.on("connect", () => socket.emit("join", myId));
      socket.on("chat-message", (m) => {
        if (m && (m.senderId === otherId)) setMessages((prev) => [...prev, m]);
      });
    } catch { /* ignore */ }
    return () => { if (socket) socket.disconnect(); };
  }, [otherId]);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const push = (m) => setMessages((prev) => [...prev, m]);

  const send = async (type, content) => {
    if (type === "text" && !content.trim()) return;
    try {
      const res = await axios.post(`${API_BASE_URL}/chat/send`, { toUserId: otherId, type, content }, auth);
      push(res.data);
      if (type === "text") setText("");
    } catch (e) {
      toast.error(e.response?.data?.message || "Could not send message.");
    }
  };

  const startRec = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const rec = new MediaRecorder(stream);
      const chunks = [];
      rec.ondataavailable = (e) => chunks.push(e.data);
      rec.onstop = async () => {
        const blob = new Blob(chunks, { type: "audio/webm" });
        const reader = new FileReader();
        reader.onloadend = () => send("voice", reader.result); // data URL
        reader.readAsDataURL(blob);
        stream.getTracks().forEach((t) => t.stop());
      };
      rec.start();
      recRef.current = rec;
      setRecording(true);
    } catch {
      toast.error("Microphone permission needed for voice notes.");
    }
  };
  const stopRec = () => { recRef.current?.stop(); setRecording(false); };

  const sendLocation = () => {
    if (!navigator.geolocation) { toast.error("Location not supported."); return; }
    navigator.geolocation.getCurrentPosition(
      (pos) => send("location", `${pos.coords.latitude.toFixed(5)},${pos.coords.longitude.toFixed(5)}`),
      () => toast.error("Couldn't get your location."),
    );
  };

  const bubble = (m) => {
    const mine = m.senderId === myId;
    return (
      <Box key={m.id} sx={{ display: "flex", justifyContent: mine ? "flex-end" : "flex-start", mb: 1 }}>
        <Box sx={{ maxWidth: "78%", px: 1.5, py: 1, borderRadius: 2, boxShadow: 1,
          bgcolor: mine ? "#2e7d32" : "#fff", color: mine ? "#fff" : "text.primary" }}>
          {m.type === "text" && <Typography variant="body2">{m.content}</Typography>}
          {m.type === "voice" && <audio controls src={m.content} style={{ height: 34, maxWidth: 200 }} />}
          {m.type === "location" && (
            <a href={`https://maps.google.com/?q=${m.content}`} target="_blank" rel="noreferrer"
              style={{ color: mine ? "#fff" : "#2e7d32", textDecoration: "underline", fontSize: 13 }}>
              📍 Shared location — open in Maps
            </a>
          )}
          <Typography variant="caption" sx={{ display: "block", opacity: 0.7, mt: 0.3, fontSize: 10 }}>
            {new Date(m.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </Typography>
        </Box>
      </Box>
    );
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: 460, width: "100%" }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ bgcolor: "#10281a", color: "#fff", px: 2, py: 1.2 }}>
        <Stack direction="row" spacing={1.2} alignItems="center">
          <Avatar sx={{ bgcolor: "#66bb6a", width: 32, height: 32 }}>{(otherName || "U")[0]}</Avatar>
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, lineHeight: 1.1 }}>{otherName || "Chat"}</Typography>
            <Typography variant="caption" sx={{ color: "#9ccc9c" }}>via Go Green</Typography>
          </Box>
        </Stack>
        {onClose && <IconButton size="small" onClick={onClose} sx={{ color: "#fff" }}><X size={18} /></IconButton>}
      </Stack>

      <Box sx={{ flex: 1, overflowY: "auto", p: 2, bgcolor: "#f4f7f4" }}>
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}><CircularProgress size={22} /></Box>
        ) : messages.length === 0 ? (
          <Box sx={{ textAlign: "center", color: "text.secondary", py: 3 }}>
            <ShieldCheck size={26} color="#2e7d32" />
            <Typography variant="body2" sx={{ mt: 1 }}>Say hello! Coordinate your planting here.</Typography>
            <Typography variant="caption">Phone numbers are blocked for everyone's safety.</Typography>
          </Box>
        ) : messages.map(bubble)}
        <div ref={endRef} />
      </Box>

      <Stack direction="row" spacing={0.5} alignItems="center" sx={{ p: 1, borderTop: "1px solid #e0e0e0", bgcolor: "#fff" }}>
        <Tooltip title="Share my location"><IconButton color="primary" onClick={sendLocation}><MapPin size={20} /></IconButton></Tooltip>
        {recording ? (
          <Tooltip title="Stop & send"><IconButton color="error" onClick={stopRec}><StopCircle size={20} /></IconButton></Tooltip>
        ) : (
          <Tooltip title="Record voice note"><IconButton color="primary" onClick={startRec}><Mic size={20} /></IconButton></Tooltip>
        )}
        <TextField size="small" fullWidth placeholder={recording ? "Recording… tap stop to send" : "Type a message…"}
          value={text} onChange={(e) => setText(e.target.value)} disabled={recording}
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); send("text", text); } }} />
        <IconButton color="primary" onClick={() => send("text", text)} disabled={recording || !text.trim()}><Send size={20} /></IconButton>
      </Stack>
    </Box>
  );
};

export default ChatBox;
