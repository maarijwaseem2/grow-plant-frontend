import React from "react";
import {
  User,
  Phone,
  IdCard,
  MapPin,
  FileText,
  Image as ImageIcon,
  Leaf,
  Send,
} from "lucide-react";
import axios from "axios";
const ComplaintForm = () => {
  const [name, setName] = React.useState("");
  const [phoneNo, setPhoneNo] = React.useState("");
  const [cnic, setCnic] = React.useState("");
  const [address, setAddress] = React.useState("");
  const [complaintText, setComplaintText] = React.useState("");
  const [image, setImage] = React.useState(null);
  const [imagePreview, setImagePreview] = React.useState(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");
  const autocompleteRef = React.useRef(null);
  const inputRef = React.useRef(null);

  React.useEffect(() => {
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyCVw4fDdxUEPr0Z6ZbSAJD_MJzqZ_eAbQo&libraries=places`;
    script.async = true;
    script.onload = initializeAutocomplete;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const initializeAutocomplete = () => {
    if (inputRef.current) {
      autocompleteRef.current = new window.google.maps.places.Autocomplete(
        inputRef.current,
        { types: ["address"] }
      );

      autocompleteRef.current.addListener("place_changed", () => {
        const place = autocompleteRef.current.getPlace();
        if (place.formatted_address) {
          setAddress(place.formatted_address);
        }
      });
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      const validTypes = [
        "image/jpeg",
        "image/png",
        "image/gif",
        "image/svg+xml",
      ];
      if (!validTypes.includes(file.type)) {
        setError("Please upload a valid image file (JPG, PNG, GIF, or SVG)");
        return;
      }

      // Validate file size (e.g., 5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        setError("File size should be less than 5MB");
        return;
      }

      setImage(file);
      setImagePreview(URL.createObjectURL(file));
      setError(""); // Clear any existing errors
    }
  };

  // const handleSubmit = async (e) => {
  //   e.preventDefault();
  //   setLoading(true);
  //   setError("");

  //   try {
  //     const formData = new FormData();
  //     formData.append("userId", "user123"); // Add actual user ID here
  //     formData.append("fullname", name);
  //     formData.append("phoneNumber", phoneNo);
  //     formData.append("cnic", cnic);
  //     formData.append("address", address);
  //     formData.append("complaintText", complaintText);
  //     if (image) {
  //       formData.append("file", image); // 'file' should match the backend's expected field name
  //     }

  //     const response = await axios.post(
  //       "http://localhost:3000/complain", // Replace with your actual backend URL
  //       formData,
  //       {
  //         headers: {
  //           "Content-Type": "multipart/form-data",
  //         },
  //       }
  //     );

  //     if (response.data) {
  //       // Reset form after successful submission
  //       setName("");
  //       setPhoneNo("");
  //       setCnic("");
  //       setAddress("");
  //       setComplaintText("");
  //       setImage(null);
  //       setImagePreview(null);

  //       alert("Report submitted successfully!");
  //     }
  //   } catch (error) {
  //     setError(
  //       error.response?.data?.message ||
  //         "An error occurred while submitting the report"
  //     );
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Validate required fields
    if (!name || !phoneNo || !cnic || !address || !complaintText || !image) {
      setError("Please fill in all required fields and upload an image");
      setLoading(false);
      return;
    }

    try {
      const formData = new FormData();
      formData.append("userId", "user123");
      formData.append("fullname", name);
      formData.append("phoneNumber", phoneNo);
      formData.append("cnic", cnic);
      formData.append("address", address);
      formData.append("complaintDetails", complaintText);

      // Important: The file field name must match the backend expectation
      if (image) {
        formData.append("image", image); // Changed from 'file' to 'image' to match backend
      }

      const response = await axios.post(
        "http://localhost:3000/complain",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.data) {
        // Reset form
        setName("");
        setPhoneNo("");
        setCnic("");
        setAddress("");
        setComplaintText("");
        setImage(null);
        setImagePreview(null);

        alert(response.data.message || "Report submitted successfully!");
      }
    } catch (error) {
      console.error("Error details:", error.response?.data);

      setError(
        error.response?.data?.message ||
          "An error occurred while submitting the form. Please ensure all fields are filled correctly."
      );
    } finally {
      setLoading(false);
    }
  };

  const inputStyles =
    "w-full px-6 py-4 rounded-xl bg-gray-800/50 text-white border border-gray-700 focus:border-green-400 focus:ring-2 focus:ring-green-400/20 focus:outline-none transition-all duration-200 text-lg font-serif";

  return (
    <div className="min-h-screen bg-black py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="bg-gray-900 rounded-2xl shadow-2xl p-12 border border-green-500/10 mt-12">
          <div className="text-center mb-12">
            <div className="flex justify-center mb-4">
              <Leaf className="w-12 h-12 text-green-400" strokeWidth={1.5} />
            </div>
            <h2 className="text-4xl font-sans text-green-400 mb-2">
              Plant Damage Report
            </h2>
            <p className="text-gray-400 font-sans text-lg">
              Please provide detailed information about the incident
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="mb-8">
              <label className="block text-green-400 mb-3 flex items-center gap-2 text-lg font-serif">
                <User className="w-5 h-5" strokeWidth={1.5} />
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={inputStyles}
                placeholder="Enter your full name"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="mb-8">
                <label className="block text-green-400 mb-3 flex items-center gap-2 text-lg font-serif">
                  <Phone className="w-5 h-5" strokeWidth={1.5} />
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={phoneNo}
                  onChange={(e) => setPhoneNo(e.target.value)}
                  className={inputStyles}
                  placeholder="Enter your phone number"
                />
              </div>

              <div className="mb-8">
                <label className="block text-green-400 mb-3 flex items-center gap-2 text-lg font-serif">
                  <IdCard className="w-5 h-5" strokeWidth={1.5} />
                  CNIC Number
                </label>
                <input
                  type="text"
                  value={cnic}
                  onChange={(e) => setCnic(e.target.value)}
                  className={inputStyles}
                  placeholder="Enter your CNIC number"
                />
              </div>
            </div>

            <div className="mb-8">
              <label className="block text-green-400 mb-3 flex items-center gap-2 text-lg font-serif">
                <MapPin className="w-5 h-5" strokeWidth={1.5} />
                Address
              </label>
              <input
                ref={inputRef}
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className={inputStyles}
                placeholder="Start typing your address..."
              />
            </div>

            <div className="mb-8">
              <label className="block text-green-400 mb-3 flex items-center gap-2 text-lg font-serif">
                <FileText className="w-5 h-5" strokeWidth={1.5} />
                Complaint Details
              </label>
              <textarea
                value={complaintText}
                onChange={(e) => setComplaintText(e.target.value)}
                rows="4"
                className={inputStyles}
                placeholder="Describe the plant damage incident"
              />
            </div>

            <div className="mb-8">
              <label className="block text-green-400 mb-3 flex items-center gap-2 text-lg font-serif">
                <ImageIcon className="w-5 h-5" strokeWidth={1.5} />
                Upload Image
              </label>
              <div className="mt-2">
                <div className="flex items-center justify-center w-full">
                  <label className="flex flex-col items-center justify-center w-full h-72 border-2 border-gray-700 border-dashed rounded-xl cursor-pointer bg-gray-800/50 hover:bg-gray-700/50 transition-all duration-200">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <ImageIcon
                        className="w-12 h-12 mb-4 text-gray-400"
                        strokeWidth={1.5}
                      />
                      <p className="mb-2 text-lg text-gray-400 font-serif">
                        <span className="font-semibold">Click to upload</span>{" "}
                        or drag and drop
                      </p>
                      <p className="text-sm text-gray-500 font-serif">
                        SVG, PNG, JPG or GIF (MAX. 800x400px)
                      </p>
                    </div>
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={handleImageChange}
                    />
                  </label>
                </div>
                {imagePreview && (
                  <div className="mt-6">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="max-w-md rounded-xl border border-gray-700 mx-auto"
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="pt-8">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-green-500 hover:bg-green-600 text-white font-serif text-lg py-4 px-6 rounded-xl transition duration-300 ease-in-out transform hover:scale-102 focus:outline-none focus:ring-2 focus:ring-green-400 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  "Submitting..."
                ) : (
                  <>
                    <Send className="w-6 h-6" strokeWidth={1.5} />
                    Submit Report
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ComplaintForm;
