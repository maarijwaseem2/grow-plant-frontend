import React, { useContext } from "react";
import Navbar from "./Navbar";
import Header from "./Header";
import Sidebar from "./Sidebar";
import ProductContainer from "./ProductContainer";
import Footer from "./Footer";
import { CartContext } from "../context/CartContext";

const MainLayout = ({
  products,
  favoriteCount,
  searchQuery,
  setSearchQuery,
  priceRange,
  setPriceRange,
  priceSort,
  setPriceSort,
  starCounts,
  loading,
  currentProducts,
  updateStarCount,
  setFavoriteCount,

  currentPage,
  totalPages,
  handleNextPage,
  handlePreviousPage,

  containerRef,
}) => {
  const {
    cartQuantity,
    setCartQuantity,
    setCartCount,
    cartCount,
    handleAddToCart,
  } = useContext(CartContext);
  return (
    <div>
      <Navbar favoriteCount={favoriteCount} cartCount={cartCount} />
      <Header />
      <div className="flex" ref={containerRef}>
        <Sidebar
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          priceRange={priceRange}
          setPriceRange={setPriceRange}
          priceSort={priceSort}
          setPriceSort={setPriceSort}
          starCounts={starCounts || []}
        />
        <ProductContainer
          loading={loading}
          currentProducts={currentProducts}
          updateStarCount={updateStarCount}
          setFavoriteCount={setFavoriteCount}
          setCartCount={setCartCount}
          currentPage={currentPage}
          totalPages={totalPages}
          handleNextPage={handleNextPage}
          handlePreviousPage={handlePreviousPage}
          cartQuantity={cartQuantity}
          setCartQuantity={setCartQuantity}
          handleAddToCart={handleAddToCart}
          products={products}
        />
      </div>
      <Footer />
    </div>
  );
};

export default MainLayout;
