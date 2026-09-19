import React, { useState, useEffect } from "react";
import { API_BASE_URL, imgUrl } from "../../../config";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { ThemeProvider } from "@mui/material/styles";
import { Box, Container, Grid, Card, CardMedia, CardContent, Typography, Chip, CircularProgress, Stack } from "@mui/material";
import theme from "../../../theme";

const RelatedProducts = ({ selectedProductID }) => {
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const { id } = useParams();
  const navigate = useNavigate();
  const uploads = `${API_BASE_URL}/uploads/`;

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const all = (await axios.get(`${API_BASE_URL}/plants`)).data.data || [];
        const productId = id || selectedProductID;
        if (!productId) { setRelated(all.slice(0, 8)); return; }
        const current = (await axios.get(`${API_BASE_URL}/plants/${productId}`)).data.data;
        let list = all.filter((p) => p.id !== current.id && p.category === current.category);
        if (list.length === 0) list = all.filter((p) => p.id !== current.id);
        setRelated(list.slice(0, 8));
      } catch (e) {
        console.error("Failed to fetch related products:", e);
      } finally { setLoading(false); }
    })();
  }, [id, selectedProductID]);

  const open = (pid) => { navigate(`/DetailsProduct/${pid}`); window.scrollTo({ top: 0, behavior: "smooth" }); };

  if (loading) return (
    <ThemeProvider theme={theme}><Box sx={{ display: "flex", justifyContent: "center", py: 6 }}><CircularProgress /></Box></ThemeProvider>
  );
  if (related.length === 0) return null;

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ bgcolor: "#f4f7f4", py: { xs: 5, md: 7 } }}>
        <Container maxWidth="lg">
          <Typography variant="h4" sx={{ fontWeight: 800, mb: 3, fontSize: { xs: "1.5rem", md: "2rem" } }}>
            Related products
          </Typography>
          <Grid container spacing={3}>
            {related.map((p) => (
              <Grid item xs={6} sm={4} md={3} key={p.id}>
                <Card variant="outlined" onClick={() => open(p.id)}
                  sx={{ borderRadius: 3, cursor: "pointer", height: "100%", transition: "0.25s",
                    "&:hover": { boxShadow: 6, transform: "translateY(-4px)", borderColor: "primary.light" } }}>
                  <Box sx={{ bgcolor: "#fff", p: 2 }}>
                    <CardMedia component="img" image={imgUrl(p.image)} alt={p.name} sx={{ height: 140, objectFit: "contain" }} />
                  </Box>
                  <CardContent>
                    {p.category && <Chip label={p.category} size="small" variant="outlined" sx={{ mb: 1 }} />}
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{p.name}</Typography>
                    <Typography variant="body2" sx={{ color: "primary.main", fontWeight: 700 }}>Rs {Number(p.price).toLocaleString()}</Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>
    </ThemeProvider>
  );
};

export default RelatedProducts;
