import axios from "axios";
import React, { useState, useRef } from "react";
import { FaCloudUploadAlt } from "react-icons/fa";

import "../styles/PlantForm.css";

const PlantForm = ({ onSubmit, initialData }) => {
  const [plant, setPlant] = useState(
    initialData || {
      name: "",
      price: "",
      quantity: "",
      description: "",
      image: null,
    }
  );
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Create FormData to handle the file upload
      const formData = new FormData();
      formData.append("name", plant.name);
      formData.append("price", plant.price);
      formData.append("quantity", plant.quantity);
      formData.append("description", plant.description);
      if (plant.image) {
        formData.append("image", plant.image); // Add the file
      }

      // Send formData using Axios
      const response = await axios.post(
        "http://localhost:3000/plants",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      console.log("Plant added successfully:", response.data);
    } catch (error) {
      console.error("Error adding plant:", error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPlant((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
        setPlant((prev) => ({ ...prev, image: file }));
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  return (
    <form className="plant-form" onSubmit={handleSubmit}>
      <div className="image-upload-container">
        {imagePreview && (
          <img
            src={imagePreview}
            alt="Plant Preview"
            className="image-preview"
          />
        )}
        <input
          type="file"
          ref={fileInputRef}
          className="file-input"
          accept="image/*"
          onChange={handleImageUpload}
        />
        <button
          type="button"
          className="file-input-label"
          onClick={triggerFileInput}
        >
          <FaCloudUploadAlt /> Upload Image
        </button>
      </div>

      <div className="form-group">
        <label>Plant Name</label>
        <input
          type="text"
          name="name"
          value={plant.name}
          onChange={handleChange}
          required
          placeholder="Enter plant name"
        />
      </div>
      <div className="form-group">
        <label>Price</label>
        <input
          type="number"
          name="price"
          value={plant.price}
          onChange={handleChange}
          required
          min="0"
          step="0.01"
          placeholder="Enter price"
        />
      </div>
      <div className="form-group">
        <label>Quantity</label>
        <input
          type="number"
          name="quantity"
          value={plant.quantity}
          onChange={handleChange}
          required
          min="0"
          placeholder="Enter quantity"
        />
      </div>
      <div className="form-group">
        <label>Description</label>
        <textarea
          name="description"
          value={plant.description}
          onChange={handleChange}
          required
          placeholder="Describe the plant..."
        />
      </div>
      <button type="submit" className="submit-btn">
        {initialData ? "Update Plant" : "Add Plant"}
      </button>
    </form>
  );
};

export default PlantForm;
