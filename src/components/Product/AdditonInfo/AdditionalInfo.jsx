import React, { useState, useEffect } from "react";
import { API_BASE_URL } from "../../../config";
import axios from "axios";
import { ThemeProvider } from "@mui/material/styles";
import { Box, Container, Tabs, Tab, Typography, Grid, Paper } from "@mui/material";
import theme from "../../../theme";

const AdditionalInfo = ({ selectedProductID }) => {
  const [product, setProduct] = useState(null);
  const [tab, setTab] = useState(0);

  useEffect(() => {
    (async () => {
      try {
        if (selectedProductID) {
          const res = await axios.get(`${API_BASE_URL}/plants/${selectedProductID}`);
          setProduct(res.data.data);
        }
      } catch (e) { console.error("Failed to fetch product details:", e); }
    })();
  }, [selectedProductID]);

  if (!product) return null;

  const rows = [
    { label: "Category", value: product.category || "—" },
    { label: "Price", value: `Rs ${Number(product.price).toLocaleString()}` },
    { label: "Availability", value: `${product.quantity} in stock` },
  ];

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ bgcolor: "#fff", py: { xs: 4, md: 6 } }}>
        <Container maxWidth="lg">
          <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
            <Tab label="Description" sx={{ textTransform: "none", fontWeight: 600 }} />
            <Tab label="Additional information" sx={{ textTransform: "none", fontWeight: 600 }} />
          </Tabs>

          {tab === 0 && (
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>{product.name}</Typography>
              <Typography variant="body1" sx={{ color: "text.secondary", lineHeight: 1.8 }}>{product.description}</Typography>
            </Box>
          )}

          {tab === 1 && (
            <Paper variant="outlined" sx={{ borderRadius: 3, overflow: "hidden" }}>
              {rows.map((r, i) => (
                <Grid container key={r.label} sx={{ borderBottom: i < rows.length - 1 ? "1px solid #eef0ee" : "none" }}>
                  <Grid item xs={5} sm={4} sx={{ p: 2, bgcolor: "#f4f7f4", fontWeight: 700 }}>{r.label}</Grid>
                  <Grid item xs={7} sm={8} sx={{ p: 2, color: "text.secondary" }}>{r.value}</Grid>
                </Grid>
              ))}
            </Paper>
          )}
        </Container>
      </Box>
    </ThemeProvider>
  );
};

export default AdditionalInfo;
