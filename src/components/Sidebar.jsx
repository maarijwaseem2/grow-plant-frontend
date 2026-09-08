import React, { useState } from "react";
import { Star, Search, ChevronDown } from "lucide-react";

const Sidebar = ({
  searchQuery,
  setSearchQuery,
  priceRange,
  setPriceRange,
  priceSort,
  setPriceSort,
  starCounts,
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleSortChange = (sortOption) => {
    setPriceSort(sortOption);
    setDropdownOpen(false);
  };

  return (
    <div className="w-64 bg-gray-100 text-black p-4">
      <div className="mb-6">
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full p-2 pr-8 bg-white rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Search plants..."
          />
          <button
            onClick={() => setSearchQuery(searchQuery)}
            className="absolute right-2 top-2"
          >
            <Search className="text-gray-400" size={20} />
          </button>
        </div>
      </div>

      <div className="mb-6">
        <h2 className="font-bold mb-4">SORT BY PRICE</h2>
        <div
          className="flex justify-between items-center cursor-pointer border p-2 rounded bg-white"
          onClick={() => setDropdownOpen(!dropdownOpen)}
        >
          <span>
            {priceSort === "low-to-high" ? "Low to High" : "High to Low"}
          </span>
          <ChevronDown className="text-gray-400" />
        </div>
        {dropdownOpen && (
          <div className="mt-2 bg-gray-100 rounded shadow-md">
            <button
              onClick={() => handleSortChange("low-to-high")}
              className="block w-full text-left p-2 font-semibold hover:bg-gray-100"
            >
              Low to High
            </button>
            <button
              onClick={() => handleSortChange("high-to-low")}
              className="block w-full text-left p-2 font-semibold hover:bg-gray-100"
            >
              High to Low
            </button>
          </div>
        )}
      </div>

      {/* Star Ratings Count */}
      <div>
        <h2 className="font-bold mb-4">RATING</h2>
        {[5, 4, 3, 2, 1].map((star) => (
          <div key={star} className="flex items-center mb-1">
            <div className="flex">
              {[...Array(star)].map((_, index) => (
                <Star key={index} className="text-yellow-500 h-5 w-5" />
              ))}
            </div>
            <span className="ml-2 font-semibold">
              {star} Star: {starCounts[star]}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Sidebar;
