import React, { useState } from "react";
import "./Filter.css";

import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import { IoIosArrowDown } from "react-icons/io";
import Slider from "@mui/material/Slider";

const Filter = ({ setPriceRange, setCategory }) => {
  const [value, setValue] = useState([0, 10000]); // Price range from 0 to 100,000
  const [selectedColors, setSelectedColors] = useState([]);
  const [selectedSizes, setSelectedSizes] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(""); // Track selected category

  const handleColorChange = (color) => {
    setSelectedColors((prevColors) =>
      prevColors.includes(color)
        ? prevColors.filter((c) => c !== color)
        : [...prevColors, color]
    );
  };

  const handleSizeChange = (size) => {
    setSelectedSizes((prevSizes) =>
      prevSizes.includes(size)
        ? prevSizes.filter((s) => s !== size)
        : [...prevSizes, size]
    );
  };

  const handleChange = (event, newValue) => {
    setValue(newValue);
    setPriceRange(newValue); // Pass the selected price range to parent
  };

  const handleCategoryChange = (category) => {
    // If the clicked category is already selected, unselect it by setting it to an empty string
    if (selectedCategory === category) {
      setCategory(""); // Unselect category in parent component
      setSelectedCategory(""); // Clear selected category
    } else {
      setCategory(category); // Pass selected category to parent component
      setSelectedCategory(category); // Set the selected category
    }
  };

  const filterCategories = [
    "Indoor Plants",
    "Outdoor Plants",
    "Fruits",
    "Flowers",
    "Vegetables",
    "Herbs",
  ];

  const filterColors = [
    "#0B2472",
    "#D6BB4F",
    "#282828",
    "#B0D6E8",
    "#9C7539",
    "#D29B47",
    "#E5AE95",
    "#D76B67",
    "#BABABA",
    "#BFDCC4",
  ];

  // const filterSizes = ["XS", "S", "M", "L", "XL", "XXL"];

  return (
    <div className="filterSection">
      <div className="filterCategories">
        <Accordion defaultExpanded disableGutters elevation={0}>
          <AccordionSummary
            expandIcon={<IoIosArrowDown size={20} />}
            aria-controls="panel1-content"
            id="panel1-header"
            sx={{ padding: 0, marginBottom: 2 }}
          >
            <h5 className="filterHeading">Product Categories</h5>
          </AccordionSummary>
          <AccordionDetails sx={{ padding: 0 }}>
            {filterCategories.map((category, index) => (
              <p
                key={index}
                onClick={() => handleCategoryChange(category)} // Trigger category change
                className={selectedCategory === category ? "selected" : ""}
              >
                {category}
              </p>
            ))}
          </AccordionDetails>
        </Accordion>
      </div>

      {/* <div className="filterColors">
        <Accordion defaultExpanded disableGutters elevation={0}>
          <AccordionSummary
            expandIcon={<IoIosArrowDown size={20} />}
            aria-controls="panel1-content"
            id="panel1-header"
            sx={{ padding: 0, marginBottom: 2 }}
          >
            <h5 className="filterHeading">Color</h5>
          </AccordionSummary>
          <AccordionDetails sx={{ padding: 0 }}>
            <div className="filterColorBtn">
              {filterColors.map((color, index) => (
                <button
                  key={index}
                  className={`colorButton ${
                    selectedColors.includes(color) ? "selected" : ""
                  }`}
                  style={{
                    backgroundColor: color,
                  }}
                  onClick={() => handleColorChange(color)}
                />
              ))}
            </div>
          </AccordionDetails>
        </Accordion>
      </div> */}

      {/* <div className="filterSizes">
        <Accordion defaultExpanded disableGutters elevation={0}>
          <AccordionSummary
            expandIcon={<IoIosArrowDown size={20} />}
            aria-controls="panel1-content"
            id="panel1-header"
            sx={{ padding: 0, marginBottom: 2 }}
          >
            <h5 className="filterHeading">Sizes</h5>
          </AccordionSummary>
          <AccordionDetails sx={{ padding: 0 }}>
            <div className="sizeButtons">
              {filterSizes.map((size, index) => (
                <button
                  key={index}
                  className={`sizeButton ${
                    selectedSizes.includes(size) ? "selected" : ""
                  }`}
                  onClick={() => handleSizeChange(size)}
                >
                  {size}
                </button>
              ))}
            </div>
          </AccordionDetails>
        </Accordion>
      </div> */}

      <div className="filterPrice">
        <Accordion defaultExpanded disableGutters elevation={0}>
          <AccordionSummary
            expandIcon={<IoIosArrowDown size={20} />}
            aria-controls="panel1-content"
            id="panel1-header"
            sx={{ padding: 0, marginBottom: 2 }}
          >
            <h5 className="filterHeading">Price</h5>
          </AccordionSummary>
          <AccordionDetails sx={{ padding: 0 }}>
            <Slider
              getAriaLabel={() => "Price range"}
              value={value}
              onChange={handleChange}
              valueLabelDisplay="auto"
              valueLabelFormat={(value) => `Rs{value}`} // Show value in PKR
              min={0}
              max={10000} // Set the max value to 100,000 PKR
              sx={{
                color: "black",
                "& .MuiSlider-thumb": {
                  backgroundColor: "white",
                  border: "2px solid black",
                  width: 18,
                  height: 18,
                },
              }}
            />
            <div className="filterSliderPrice">
              <div className="priceRange">
                <p>
                  Min Price: <span>₨{value[0]}</span>
                </p>
                <p>
                  Max Price: <span>₨{value[1]}</span>
                </p>
              </div>
            </div>
          </AccordionDetails>
        </Accordion>
      </div>
    </div>
  );
};

export default Filter;
