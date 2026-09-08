import React from "react";
import ProductList from "./ProductList";
import Pagination from "./Pagination";
import LoadingSpinner from "./LoadingSpinner";

const ProductContainer = ({
  products,
  loading,
  currentProducts,
  updateStarCount,
  setFavoriteCount,
  setCartCount,
  currentPage,
  totalPages,
  handleNextPage,
  handlePreviousPage,
  cartQuantity,
  setCartQuantity,
  handleAddToCart,
}) => {
  return (
    <div className="container mx-auto py-4 flex-grow">
      <div className="flex justify-center mb-6">
        <h1 className="bg-green-100 text-green-600 rounded-full px-6 py-2 text-2xl font-bold text-center shadow-md">
          Our Plants
        </h1>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : (
        <>
          <ProductList
            products={currentProducts.map((product) => ({
              ...product,
              updateStarCount,
            }))}
            setFavoriteCount={setFavoriteCount}
            setCartCount={setCartCount}
            cartQuantity={cartQuantity}
            setCartQuantity={setCartQuantity}
            handleAddToCart={handleAddToCart}
          />
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onNext={handleNextPage}
            onPrevious={handlePreviousPage}
          />
        </>
      )}
    </div>
  );
};

export default ProductContainer;
