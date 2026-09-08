import React, { useState, useEffect } from "react";
import { API_BASE_URL } from "../../../config";
import "./ShopDetails.css";
import { Link } from "react-router-dom";
import { FaStar } from "react-icons/fa";
import { FaAngleRight, FaAngleLeft } from "react-icons/fa";
import { FaCartPlus } from "react-icons/fa";
import toast from "react-hot-toast";
import Filter from "../Filters/Filter";
import axios from "axios";

const ShopDetails = () => {
  const [plants, setPlants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cartItems, setCartItems] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedPriceRange, setSelectedPriceRange] = useState([0, 100000]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const baseUrl = `${API_BASE_URL}/uploads/`;
  const productsPerPage = 6;

  // Fetch plants from backend
  useEffect(() => {
    const fetchPlants = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/plants`);
        setPlants(response.data.data);
        setLoading(false);
      } catch (err) {
        setError("Failed to fetch plants");
        setLoading(false);
        toast.error("Unable to load products");
      }
    };

    fetchPlants();
  }, []);

  const handleAddToCart = async (plant) => {
    try {
      const productInCart = cartItems.find((item) => item.id === plant.id);

      if (productInCart && productInCart.quantity >= 20) {
        toast.error("Product limit reached", {
          duration: 2000,
          style: {
            backgroundColor: "#ff4b4b",
            color: "white",
          },
        });
      } else {
        setCartItems([...cartItems, { ...plant, quantity: 1 }]);
        toast.success(`Added to cart!`, {
          duration: 2000,
          style: {
            backgroundColor: "#07bc0c",
            color: "white",
          },
        });
      }
    } catch (error) {
      toast.error("Failed to add to cart");
    }
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // Filtering and Pagination Logic
  const filteredProducts = plants.filter(
    (plant) =>
      (selectedCategory ? plant.category === selectedCategory : true) &&
      plant.price >= selectedPriceRange[0] &&
      plant.price <= selectedPriceRange[1]
  );

  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

  const displayedProducts = filteredProducts.slice(
    (currentPage - 1) * productsPerPage,
    currentPage * productsPerPage
  );

  const changePage = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
      scrollToTop();
    }
  };

  const generatePageNumbers = () => {
    const pageNumbers = [];
    const range = selectedCategory ? 1 : 2;

    const startPage = Math.max(1, currentPage - range);
    const endPage = Math.min(totalPages, currentPage + range);

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }

    return pageNumbers;
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="shopDetails mt-20">
      <div className="shopDetailMain">
        <div className="shopDetails__left">
          <Filter
            setPriceRange={setSelectedPriceRange}
            setCategory={setSelectedCategory}
          />
        </div>
        <div className="shopDetails__right">
          <div className="shopDetailsSorting">
            <div className="shopDetailsBreadcrumbLink">
              <Link to="/" onClick={scrollToTop}>
                Home
              </Link>
              &nbsp;/&nbsp;
              <Link to="/Page-Shop">The Shop</Link>
            </div>
          </div>
          <div className="shopDetailsProducts">
            <div className="shopDetailsProductsContainer">
              {displayedProducts.length === 0 ? (
                <div className="noResultsMessage">
                  <h3>No Results Found</h3>
                </div>
              ) : (
                displayedProducts.map((plant) => (
                  <div className="sdProductContainer" key={plant.id}>
                    <div className="sdProductImages">
                      <Link
                        to={`/DetailsProduct/${plant.id}`}
                        onClick={scrollToTop}
                      >
                        <img
                          src={`${baseUrl}${plant.image}`}
                          alt={plant.name}
                          className="sdProduct_single"
                        />
                      </Link>
                    </div>
                    <div
                      className="sdProductImagesCart"
                      onClick={() => handleAddToCart(plant)}
                    >
                      <FaCartPlus />
                    </div>
                    <div className="sdProductInfo">
                      <div className="sdProductNameInfo">
                        <Link
                          to={`/DetailsProduct/${plant.id}`}
                          onClick={scrollToTop}
                        >
                          <h5>{plant.name}</h5>
                        </Link>
                        <p>₨.{plant.price}</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {displayedProducts.length > 0 && (
            <div className="shopDetailsPagination">
              <div className="sdPaginationPrev">
                {currentPage > 1 && (
                  <p onClick={() => changePage(currentPage - 1)}>
                    <FaAngleLeft />
                    Prev
                  </p>
                )}
              </div>
              <div
                className="sdPaginationNumber"
                style={{ marginBottom: "32px" }}
              >
                {generatePageNumbers().map((num) => (
                  <p
                    key={num}
                    onClick={() => changePage(num)}
                    className={currentPage === num ? "active" : ""}
                  >
                    {num}
                  </p>
                ))}
              </div>
              <div className="sdPaginationNext">
                {currentPage < totalPages && (
                  <p onClick={() => changePage(currentPage + 1)}>
                    Next
                    <FaAngleRight />
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ShopDetails;
