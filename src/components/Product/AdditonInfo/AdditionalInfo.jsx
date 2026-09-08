import React, { useState, useEffect } from "react";
import { API_BASE_URL } from "../../../config";
import axios from "axios";
import "./AdditionalInfo.css";

const AdditionalInfo = ({ selectedProductID }) => {
  const [product, setProduct] = useState(null);
  const [activeTab, setActiveTab] = useState("description");

  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        if (selectedProductID) {
          const response = await axios.get(
            `${API_BASE_URL}/plants/${selectedProductID}`
          );
          setProduct(response.data.data);
        }
      } catch (error) {
        console.error("Failed to fetch product details:", error);
      }
    };

    fetchProductDetails();
  }, [selectedProductID]);

  if (!product) {
    return <div>Loading product info...</div>;
  }

  const handleTabClick = (tab) => {
    setActiveTab(tab);
  };

  return (
    <div className="productAdditionalInfo">
      <div className="productAdditonalInfoContainer">
        <div className="productAdditionalInfoTabs">
          <div className="aiTabs">
            <p
              onClick={() => handleTabClick("description")}
              className={activeTab === "description" ? "aiActive" : ""}
            >
              Description
            </p>
            <p
              onClick={() => handleTabClick("additionalInfo")}
              className={activeTab === "additionalInfo" ? "aiActive" : ""}
            >
              Additional Information
            </p>
          </div>
        </div>

        <div className="productAdditionalInfoContent">
          {activeTab === "description" && (
            <div className="aiTabDescription">
              <div className="descriptionPara">
                <h3>{product.name}</h3>
                <p>{product.description}</p>
              </div>
            </div>
          )}

          {activeTab === "additionalInfo" && (
            <div className="aiTabAdditionalInfo">
              <div className="additionalInfoContainer">
                <h6>Category</h6>
                <p>{product.category}</p>
              </div>
              <div className="additionalInfoContainer">
                <h6>Price</h6>
                <p>₨.{product.price}</p>
              </div>
              <div className="additionalInfoContainer">
                <h6>Quantity</h6>
                <p>{product.quantity} in stock</p>
              </div>
              {/* <div className="additionalInfoContainer">
                <h6>Size</h6>
                <p>XS, S, M, L, XL</p>
              </div>
              <div className="additionalInfoContainer">
                <h6>Color</h6>
                <p>Black, Red, Grey</p>
              </div> */}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdditionalInfo;
