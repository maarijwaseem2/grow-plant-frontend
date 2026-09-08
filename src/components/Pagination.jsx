import React from "react";

const Pagination = ({
  currentPage,
  totalPages,
  onNext,
  onPrevious,
  setCurrentPage,
}) => {
  return (
    <nav aria-label="Page navigation">
      <ul className="pagination justify-content-center mt-4">
        <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
          <button
            className={`page-link bg-green-200 text-green-600 font-bold px-6 py-3 rounded ${
              currentPage === 1 ? "opacity-50 cursor-not-allowed" : ""
            }`}
            onClick={onPrevious}
            disabled={currentPage === 1}
          >
            Previous
          </button>
        </li>

        {Array.from({ length: totalPages }, (_, index) => (
          <li
            key={index + 1}
            className={`page-item ${currentPage === index + 1 ? "active" : ""}`}
          >
            <button
              className={`page-link text-green-600 ${
                currentPage === index + 1 ? "font-bold" : ""
              }`}
              onClick={() => setCurrentPage(index + 1)}
              style={{
                padding: "15px 21px",
                backgroundColor:
                  currentPage === index + 1
                    ? "rgba(72, 187, 120, 0.5)"
                    : "transparent",
                border: "1px solid rgba(72, 187, 120, 0.5)",
                borderRadius: "5px",
                margin: "0 5px",
              }}
            >
              {index + 1}
            </button>
          </li>
        ))}

        <li
          className={`page-item ${
            currentPage === totalPages ? "disabled" : ""
          }`}
        >
          <button
            className={`page-link bg-green-200 text-green-600 font-bold px-6 py-3 rounded ${
              currentPage === totalPages ? "opacity-50 cursor-not-allowed" : ""
            }`}
            onClick={onNext}
            disabled={currentPage === totalPages}
          >
            Next
          </button>
        </li>
      </ul>
    </nav>
  );
};

export default Pagination;
