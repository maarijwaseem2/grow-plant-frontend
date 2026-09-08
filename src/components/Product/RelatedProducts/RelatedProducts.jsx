import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link, useParams } from "react-router-dom";
import "./RelatedProducts.css";

import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";

import { Navigation } from "swiper/modules";

import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";

const RelatedProducts = ({ setSelectedProductID, selectedProductID }) => {
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { id } = useParams();
  const baseUrl = "http://localhost:3000/uploads/";

  useEffect(() => {
    const fetchRelatedProducts = async () => {
      try {
        setLoading(true);
        setError(null);

        // Log the current product ID being used
        console.log("Current Product ID:", id || selectedProductID);

        // Fetch all products first
        const allProductsResponse = await axios.get(
          "http://localhost:3000/plants"
        );

        console.log("All Products Full Response:", allProductsResponse.data);
        const allProducts = allProductsResponse.data.data;
        console.log("All Products Array:", allProducts);

        // If no specific product ID is available, show all products
        if (!id && !selectedProductID) {
          setRelatedProducts(allProducts);
          setLoading(false);
          return;
        }

        // Determine the product ID
        const productId = id || selectedProductID;

        // Fetch the specific product details
        const productResponse = await axios.get(
          `http://localhost:3000/plants/${productId}`
        );

        console.log("Current Product Response:", productResponse.data);
        const currentProduct = productResponse.data.data;

        // Filter related products based on the same category
        const related = allProducts.filter((relatedProduct) => {
          const sameCategory =
            relatedProduct.category === currentProduct.category;
          const differentProduct = relatedProduct._id !== currentProduct._id;

          console.log(`Product: ${relatedProduct.name}
            Same Category: ${sameCategory}
            Different Product: ${differentProduct}`);

          return sameCategory || differentProduct;
        });

        setRelatedProducts(related);
      } catch (err) {
        console.error("Failed to fetch related products:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchRelatedProducts();
  }, [id, selectedProductID]);

  const handleProductClick = (productID) => {
    localStorage.setItem("selectedProductID", productID);
    setSelectedProductID(productID);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (loading) {
    return <div>Loading related products...</div>;
  }

  if (error) {
    return <div>Error loading related products: {error}</div>;
  }

  return (
    <div className="relatedProductSection">
      <div className="relatedProducts">
        <h2>
          RELATED <span>PRODUCTS</span>
        </h2>
      </div>
      {relatedProducts.length === 0 ? (
        <div>No related products found</div>
      ) : (
        <div className="relatedProductSlider">
          <div className="swiper-button image-swiper-button-next">
            <IoIosArrowForward />
          </div>
          <div className="swiper-button image-swiper-button-prev">
            <IoIosArrowBack />
          </div>
          <Swiper
            slidesPerView={4}
            slidesPerGroup={4}
            spaceBetween={30}
            loop={true}
            navigation={{
              nextEl: ".image-swiper-button-next",
              prevEl: ".image-swiper-button-prev",
            }}
            modules={[Navigation]}
            breakpoints={{
              320: {
                slidesPerView: 2,
                slidesPerGroup: 2,
                spaceBetween: 14,
              },
              768: {
                slidesPerView: 3,
                slidesPerGroup: 3,
                spaceBetween: 24,
              },
              1024: {
                slidesPerView: 4,
                slidesPerGroup: 4,
                spaceBetween: 30,
              },
            }}
          >
            {relatedProducts.map((product) => (
              <SwiperSlide key={product._id}>
                <div className="rpContainer">
                  <Link
                    to={`/DetailsProduct/${product.id}`}
                    onClick={() => handleProductClick(product.id)}
                  >
                    {/* existing link content */}

                    <div className="rpImages">
                      <img
                        src={`${baseUrl}${product.image}`}
                        alt={product.name}
                        className="rpFrontImg"
                      />
                    </div>
                    <div className="relatedProductInfo">
                      <div className="rpCategoryWishlist">
                        <p>{product.category}</p>
                      </div>
                      <div className="productNameInfo">
                        <h5>{product.name}</h5>
                        <p>Rs.{product.price}</p>
                      </div>
                    </div>
                  </Link>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      )}
    </div>
  );
};

export default RelatedProducts;
