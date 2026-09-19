import React, { useState, useContext } from "react";
import { API_BASE_URL, imgUrl } from "../config";
import axios from "axios";
import toast from "react-hot-toast";
import {
  Box, Paper, Typography, Stack, TextField, MenuItem, Button, Card, CardMedia,
  CardContent, Chip, CircularProgress,
} from "@mui/material";
import { Sparkles, ShoppingCart } from "lucide-react";
import { CartContext } from "../context/CartContext";

const PlantRecommender = () => {
  const { addToCart } = useContext(CartContext);
  const uploads = `${API_BASE_URL}/uploads/`;
  const [sunlight, setSunlight] = useState("full sun");
  const [space, setSpace] = useState("small");
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);

  const recommend = async () => {
    setLoading(true);
    try {
      const res = await axios.post(`${API_BASE_URL}/ai/recommend`, { sunlight, space });
      setResults(res.data?.data || []);
    } catch {
      toast.error("Couldn't get recommendations right now.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 3, mb: 3, bgcolor: "#f6faf6", borderColor: "#c8e6c9" }}>
      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.5 }}>
        <Sparkles size={20} color="#2e7d32" />
        <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>Not sure what to plant? Let us suggest</Typography>
      </Stack>
      <Stack direction={{ xs: "column", sm: "row" }} spacing={2} alignItems={{ sm: "center" }}>
        <TextField select size="small" label="Sunlight" value={sunlight} onChange={(e) => setSunlight(e.target.value)} sx={{ minWidth: 150 }}>
          <MenuItem value="full sun">Full sun</MenuItem>
          <MenuItem value="partial">Partial sun</MenuItem>
          <MenuItem value="shade">Shade / indoor</MenuItem>
        </TextField>
        <TextField select size="small" label="Space" value={space} onChange={(e) => setSpace(e.target.value)} sx={{ minWidth: 150 }}>
          <MenuItem value="small">Small / balcony</MenuItem>
          <MenuItem value="medium">Medium</MenuItem>
          <MenuItem value="large">Large / open ground</MenuItem>
        </TextField>
        <Button variant="contained" onClick={recommend} disabled={loading} startIcon={!loading && <Sparkles size={16} />} sx={{ px: 3 }}>
          {loading ? <CircularProgress size={20} color="inherit" /> : "Recommend"}
        </Button>
      </Stack>

      {results && (
        results.length === 0 ? (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>No products available yet — check back soon.</Typography>
        ) : (
          <Box sx={{ display: "flex", gap: 2, mt: 2.5, overflowX: "auto", pb: 1 }}>
            {results.map((p) => (
              <Card key={p.id} variant="outlined" sx={{ minWidth: 180, maxWidth: 180, borderRadius: 2, flexShrink: 0 }}>
                <Box sx={{ bgcolor: "#fff", p: 1.5 }}>
                  <CardMedia component="img" image={imgUrl(p.image)} alt={p.name} sx={{ height: 100, objectFit: "contain" }} />
                </Box>
                <CardContent sx={{ p: 1.5 }}>
                  <Typography variant="body2" sx={{ fontWeight: 700, lineHeight: 1.2 }} noWrap>{p.name}</Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 0.5 }}>{p.reason}</Typography>
                  <Typography variant="subtitle2" sx={{ color: "primary.main", fontWeight: 800 }}>Rs {Number(p.price).toLocaleString()}</Typography>
                  <Button fullWidth size="small" variant="contained" startIcon={<ShoppingCart size={14} />}
                    onClick={() => { addToCart(p, 1); toast.success("Added to cart!"); }} sx={{ mt: 1 }}>
                    Add
                  </Button>
                </CardContent>
              </Card>
            ))}
          </Box>
        )
      )}
    </Paper>
  );
};

export default PlantRecommender;
