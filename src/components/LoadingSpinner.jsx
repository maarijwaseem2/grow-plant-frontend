import React from "react";

const LoadingSpinner = () => (
  <div className="flex justify-center items-center h-64">
    <div className="spinner-border" role="status">
      <span className="visually-hidden">Loading...</span>
    </div>
  </div>
);

export default LoadingSpinner;
