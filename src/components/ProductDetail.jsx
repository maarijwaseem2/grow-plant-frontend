import React, { useState, useEffect } from "react";
import { API_BASE_URL } from "../config";
import { useParams, useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useContext } from "react";
import { CartContext } from "../context/CartContext";
import Seo from "./Seo";

const ProductDetail = () => {
  const { handleAddToCart, cartQuantity } = useContext(CartContext);
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [similarProducts, setSimilarProducts] = useState([]);
  const [isAddedToCart, setIsAddedToCart] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const baseUrl = `${API_BASE_URL}/uploads/`;
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const productData = await fetchPlantById(id);

        if (!productData) {
          throw new Error("Product not found");
        }

        setProduct(productData);

        const allProducts = await fetchPlants();

        const productsArray = Array.isArray(allProducts)
          ? allProducts
          : Object.values(allProducts)[1]; // Accessing index 1 explicitly if it's the array

        if (!Array.isArray(productsArray)) {
          console.error("Expected an array but got:", productsArray);
          throw new Error("Invalid products data format");
        }

        const filteredProducts = productsArray.filter(
          (p) => p.id !== productData.id
        );
        setSimilarProducts(filteredProducts);
      } catch (err) {
        console.error("Detailed Error:", err);
        setError(err.message || "An error occurred while fetching data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    window.scrollTo(0, 0);
  }, [id]);

  if (loading) return <div>Loading...</div>;
  if (error || !product) return <div>{error || "Product not found"}</div>;
  const visibleProducts = similarProducts.slice(currentIndex, currentIndex + 3);

  const handleNextProducts = () => {
    if (currentIndex + 3 >= similarProducts.length) {
      setCurrentIndex(0);
    } else {
      setCurrentIndex(currentIndex + 3);
    }
  };

  const handlePrevProducts = () => {
    if (currentIndex === 0) {
      setCurrentIndex(Math.max(0, similarProducts.length - 3));
    } else {
      setCurrentIndex(currentIndex - 3);
    }
  };

  const availableQuantity = product.data.quantity - (cartQuantity[id] || 0);

  const handleQuantityChange = (e) => {
    const value = parseInt(e.target.value);

    // Ensure the input is a valid number
    if (isNaN(value)) {
      setQuantity("");
      return;
    }

    // Restrict quantity to available quantity
    if (value > availableQuantity) {
      toast.error("Invalid quantity: exceeds available stock");
      setQuantity(availableQuantity); // Reset to max available quantity
    } else if (value > 0) {
      setQuantity(value);
      setIsAddedToCart(false);
    } else {
      toast.error("Invalid quantity: must be greater than 0");
      setQuantity(""); // Clear invalid input
    }
  };

  const imageSrc = product.data.image
    ? `${baseUrl}${product.data.image}`
    : null;
  return (
    <div className="container mt-5 px-4 md:px-8 lg:px-16">
      <Seo title={product?.data?.name} description={product?.data?.description} image={imageSrc} path={`/product/${id}`} />
      <div className="grid md:grid-cols-2 gap-8 items-start">
        <div className="flex justify-center items-center bg-gray-50 rounded-2xl p-6 shadow-lg transition-all duration-300 hover:shadow-xl">
          <img
            src={imageSrc}
            alt={product.data.name}
            className="w-full max-w-md object-cover rounded-xl transform hover:scale-105 transition-transform duration-300"
          />
        </div>
        <div className="space-y-4">
          <h2 className="text-3xl md:text-4xl font-bold text-green-800 mb-4 border-b-4 border-green-300 pb-2">
            {product.data.name}
          </h2>
          <div className="space-y-3">
            <p className="text-2xl font-semibold text-gray-700">
              Price:{" "}
              <span className="text-green-600">Rs {product.data.price}</span>
            </p>
            <p className="text-xl font-medium">
              Available:{" "}
              <span
                className={`font-bold ${
                  availableQuantity > 0 ? "text-green-600" : "text-red-500"
                }`}
              >
                {availableQuantity > 0 ? availableQuantity : "Out of stock"}
              </span>
            </p>

            <div className="form-group">
              <label
                htmlFor="quantity"
                className="block text-lg font-semibold text-gray-700 mb-2"
              >
                Quantity:
              </label>
              <input
                type="number"
                className="form-control w-24 px-3 py-2 border-2 border-green-200 rounded-lg focus:ring-2 focus:ring-green-400 focus:outline-none transition-all"
                id="quantity"
                min="1"
                max={availableQuantity}
                value={quantity}
                onChange={handleQuantityChange}
              />
            </div>

            <p className="text-gray-600 leading-relaxed italic">
              {product.data.description}
            </p>
          </div>

          <div className="space-y-4 mt-6">
            <button
              className={`w-full py-3 rounded-lg text-lg font-bold transition-all duration-300 ${
                availableQuantity > 0
                  ? "bg-green-500 hover:bg-green-600 text-white"
                  : "bg-gray-400 text-gray-200 cursor-not-allowed"
              }`}
              onClick={(event) => {
                handleAddToCart(product.data.id, quantity, product);
                setQuantity(1);
                setIsAddedToCart(true);
                toast.success("Product added to cart!", {
                  position: "top-center",
                  autoClose: 3000,
                });
              }}
              disabled={availableQuantity <= 0 || isAddedToCart}
            >
              {isAddedToCart ? "Added to Cart" : "Add to Cart"}
            </button>
            <button
              className="w-full py-3 rounded-lg text-lg font-bold bg-gray-100 text-gray-700 border-2 border-gray-300 hover:bg-gray-200 transition-all duration-300"
              onClick={() => navigate("/plants")}
            >
              Back to Products
            </button>
          </div>
        </div>
      </div>

      <div className="flex justify-center items-center my-16">
        <button
          className="bg-green-50 hover:bg-green-100 p-2 rounded-full shadow-md transition-all duration-300 mr-4"
          onClick={handlePrevProducts}
        >
          <ChevronLeft size={48} className="text-green-600" />
        </button>

        <div className="flex flex-col items-center">
          <h1 className="bg-green-100 text-green-700 rounded-full px-8 py-4 text-3xl font-bold text-center shadow-lg mb-6">
            Similar Products
          </h1>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {visibleProducts.map((similarProduct) => (
              <div
                key={similarProduct.id}
                className="bg-white rounded-xl shadow-lg overflow-hidden transform hover:scale-105 transition-all duration-300 hover:shadow-xl"
              >
                <img
                  src={`${baseUrl}${similarProduct.image}`}
                  alt={similarProduct.name}
                  className="w-full h-56 object-cover"
                />
                <div className="p-4 space-y-2">
                  <h5 className="text-xl font-bold text-gray-800">
                    {similarProduct.name}
                  </h5>
                  <p className="text-green-600 font-semibold">
                    Rs {similarProduct.price.toFixed(2)}
                  </p>
                  <button
                    className="w-full py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-all duration-300"
                    onClick={() => {
                      window.scrollTo(0, 0);
                      navigate(`/product/${similarProduct.id}`);
                    }}
                  >
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <button
          className="bg-green-50 hover:bg-green-100 p-2 rounded-full shadow-md transition-all duration-300 ml-4"
          onClick={handleNextProducts}
        >
          <ChevronRight size={48} className="text-green-600" />
        </button>
      </div>
    </div>
  );
};

export default ProductDetail;
