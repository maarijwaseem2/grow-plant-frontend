import React, { useState } from "react";
import { Heart, ShoppingCart, Star } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useContext } from "react";
import { CartContext } from "../context/CartContext";

const ProductCard = ({
  products,
  id,
  imageSrc,
  name,
  price,
  quantity,
  onFavoriteChange,
  onCartChange,
  updateStarCount,
}) => {
  const { cartQuantity, setCartQuantity, handleAddToCart } =
    useContext(CartContext);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  // const [cartQuantity, setCartQuantity] = useState(0);
  const [rating, setRating] = useState(0);
  const [hasRated, setHasRated] = useState(false);
  const navigate = useNavigate();

  const handleFavoriteClick = (event) => {
    event.stopPropagation();
    setIsFavorite(!isFavorite);
    onFavoriteChange(!isFavorite ? 1 : -1);
  };

  const handleStarClick = (event, star) => {
    event.stopPropagation();
    if (!hasRated) {
      setRating(star);
      updateStarCount(star);
      setHasRated(true);
    }
  };

  const isSoldOut = (cartQuantity[id] || 0) >= quantity;
  const handleCardClick = () => {
    navigate(`/product/${id}`);
  };

  return (
    <div
      className={`relative max-w-sm rounded-lg overflow-hidden shadow-md transition-transform transform hover:scale-105 ${
        isSoldOut ? "bg-gray-300" : "bg-gray-100"
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleCardClick}
    >
      <img
        className="w-80 h-64 object-cover mx-auto"
        src={imageSrc}
        alt={name}
      />
      <div className="px-4 py-3">
        <div className="font-semibold text-lg mb-1">{name}</div>
        <p className="text-gray-700 text-sm">
          Price: Rs{" "}
          {price !== undefined && price !== null ? price.toFixed(2) : "N/A"}
        </p>
        <p className="text-gray-700 text-sm">
          Available: {quantity - (cartQuantity[id] || 0)}
        </p>
        <div className="flex">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              fill={rating >= star ? "yellow" : "none"}
              stroke="currentColor"
              className="h-5 w-5 cursor-pointer"
              onClick={(event) => handleStarClick(event, star)}
              style={{ cursor: hasRated ? "not-allowed" : "pointer" }}
            />
          ))}
        </div>
      </div>
      <div className="flex justify-end items-center px-4 pb-3">
        {isHovered && (
          <div className="flex flex-col items-center">
            <button
              onClick={handleFavoriteClick}
              className="flex items-center text-sm hover:text-red-500 transition mb-1"
            >
              <Heart
                className={`h-5 w-5 ${
                  isFavorite ? "text-red-500 fill-current" : "text-gray-500"
                }`}
              />
            </button>
            <button
              onClick={(event) => {
                event.stopPropagation(); // Prevent the click from navigating
                handleAddToCart(id, 1, products); // Call the add to cart function
              }}
              className={`flex items-center text-sm ${
                isSoldOut ? "opacity-50 cursor-not-allowed" : "text-blue-500"
              }`}
              disabled={isSoldOut}
            >
              <ShoppingCart className="h-5 w-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductCard;
