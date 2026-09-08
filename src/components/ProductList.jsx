import React from "react";
import ProductCard from "./ProductCard";

const ProductList = ({
  products,
  setFavoriteCount,
  setCartCount,
  updateStarCount,
  cartQuantity,
  setCartQuantity,
  handleAddToCart,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          id={product.id}
          imageSrc={product.imageSrc}
          name={product.name}
          price={product.price}
          quantity={product.quantity}
          cartQuantity={cartQuantity}
          setCartQuantity={setCartQuantity}
          handleAddToCart={handleAddToCart}
          onFavoriteChange={(change) =>
            setFavoriteCount((prev) => prev + change)
          }
          onCartChange={(change) => setCartCount((prev) => prev + change)}
          updateStarCount={product.updateStarCount}
          products={products}
        />
      ))}
    </div>
  );
};

export default ProductList;
