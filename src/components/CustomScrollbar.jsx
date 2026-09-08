import { useEffect } from 'react';

const CustomScrollbar = () => {
  useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = `
      /* Custom scrollbar styles with green color theme and squared borders */
      ::-webkit-scrollbar {
        width: 14px; /* Slightly wider scrollbar for more style */
      }

      ::-webkit-scrollbar-track {
        background: linear-gradient(135deg, #e0f7fa 0%, #b2ebf2 100%); /* Soft greenish gradient background for track */
        box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.1); /* Subtle shadow */
      }

      ::-webkit-scrollbar-thumb {
        background: linear-gradient(45deg, #2e7d32, #388e3c); /* Green gradient for the thumb */
        box-shadow: 0 0 6px rgba(0, 0, 0, 0.4); /* Shadow effect for the thumb */
        transition: background-color 0.3s ease, box-shadow 0.3s ease; /* Smooth transition */
      }

      ::-webkit-scrollbar-thumb:hover {
        background: linear-gradient(45deg, #66bb6a, #43a047); /* Lighter green gradient on hover */
        box-shadow: 0 0 10px rgba(0, 0, 0, 0.6); /* Stronger shadow on hover */
      }

      ::-webkit-scrollbar-thumb:active {
        background: linear-gradient(45deg, #43a047, #2e7d32); /* Darker green gradient on active */
        box-shadow: 0 0 15px rgba(0, 0, 0, 0.8); /* Intensified shadow on active */
      }

      /* Apply the custom scrollbar to specific containers */
      .custom-scroll {
        overflow-y: auto;
        height: 100vh; /* Ensure it's scrollable */
        padding-right: 14px; /* Compensate for the scrollbar width */
        background-color: #f9f9f9; /* Light background for the scrollable container */
      }
    `;
    document.head.appendChild(style);

    return () => {
      // Cleanup when the component is unmounted
      document.head.removeChild(style);
    };
  }, []);

  return null;
};

export default CustomScrollbar;
