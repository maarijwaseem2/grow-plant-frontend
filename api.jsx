import axios from "axios";

// Fetch all plants
export const fetchPlants = async () => {
  try {
    const response = await axios.get("http://localhost:3000/plants");

    return response.data;
  } catch (error) {
    console.error("Error fetching plants:", error.message);
    throw error;
  }
};

// Fetch a single plant by ID
// export const fetchPlantById = async (id) => {
//   try {
//     console.log(`Attempting to fetch plant with ID: ${id}`);
//     const response = await axios.get(`http://localhost:3000/plants/${id}`);

//     console.log("Plant Details Response:", response.data);

//     // Additional validation
//     if (!response.data) {
//       throw new Error(`No plant found with ID ${id}`);
//     }

//     return response.data;
//   } catch (error) {
//     console.error(`Error fetching plant with ID ${id}:`, error);
//     throw error;
//   }
// };
export const fetchPlantById = async (id) => {
  try {
    const response = await axios.get(`http://localhost:3000/plants/${id}`, {
      // Add detailed error logging
      validateStatus: function (status) {
        return status >= 200 && status < 300; // Default
      },
    });

    return response.data;
  } catch (error) {
    console.error("Detailed Axios Error:", {
      message: error.message,
      code: error.code,
      response: error.response?.data,
      status: error.response?.status,
      headers: error.response?.headers,
    });
    throw error;
  }
};
