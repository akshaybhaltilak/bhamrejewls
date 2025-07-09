import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";

const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || "dvx3a4adj";
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UNSIGNED_PRESET || "gold_preset";
const CLOUD_FOLDER = "gold-catalog";

// Helper function to safely handle localStorage
const getLocalStorageItem = (key, defaultValue = []) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error("Error reading from localStorage:", error);
    return defaultValue;
  }
};

export default function ImageUploadPage() {
  const [file, setFile] = useState(null);
  const [name, setName] = useState("");
  const [images, setImages] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);
  const filePreviewRef = useRef(null);

  // Load previous uploads from localStorage
  useEffect(() => {
    const savedImages = getLocalStorageItem("uploadedImages");
    if (savedImages && savedImages.length > 0) {
      setImages(savedImages);
    }
  }, []);

  // Save to localStorage when images change
  useEffect(() => {
    try {
      localStorage.setItem("uploadedImages", JSON.stringify(images));
    } catch (error) {
      console.error("Error saving to localStorage:", error);
    }
  }, [images]);

  // Preview selected image
  useEffect(() => {
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        filePreviewRef.current.src = e.target.result;
      };
      reader.onerror = () => {
        setError("Failed to preview the selected image");
      };
      reader.readAsDataURL(file);
    }
  }, [file]);

  const handleUpload = async () => {
    if (!file) {
      setError("Please select an image file");
      return;
    }
    
    if (!name.trim()) {
      setError("Please enter an image name");
      return;
    }

    // Check for duplicate names
    if (images.some(img => img.name.toLowerCase() === name.trim().toLowerCase())) {
      setError("An image with this name already exists");
      return;
    }

    try {
      setUploading(true);
      setError(null);

      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", UPLOAD_PRESET);
      formData.append("public_id", name.trim());
      formData.append("folder", CLOUD_FOLDER);

      const url = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;

      const res = await fetch(url, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to upload image");
      }

      const data = await res.json();

      if (data.secure_url) {
        const newImage = { 
          url: data.secure_url, 
          name: name.trim(),
          public_id: data.public_id,
          uploadedAt: new Date().toISOString()
        };
        
        setImages(prev => [newImage, ...prev]);
        setFile(null);
        setName("");
        if (fileInputRef.current) fileInputRef.current.value = "";
      } else {
        throw new Error("No URL returned from Cloudinary");
      }
    } catch (err) {
      console.error("Upload error:", err);
      setError(err.message || "Error uploading image. See console for details.");
    } finally {
      setUploading(false);
    }
  };

  const copyToClipboard = (text, index) => {
    navigator.clipboard.writeText(text)
      .then(() => {
        setCopiedIndex(index);
        setTimeout(() => setCopiedIndex(null), 2000);
      })
      .catch(err => {
        console.error("Failed to copy:", err);
        setError("Failed to copy URL to clipboard");
      });
  };

  const removeImage = (index) => {
    const imageToRemove = images[index];
    if (window.confirm(`Are you sure you want to delete "${imageToRemove.name}"?`)) {
      setImages(prev => prev.filter((_, i) => i !== index));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <header className="mb-6 md:mb-8 text-center">
          <h1 className="text-2xl md:text-4xl font-bold text-gray-800 mb-2">
            Cloudinary Image Manager
          </h1>
          <p className="text-sm md:text-base text-gray-600 max-w-lg mx-auto">
            Upload and manage your images with Cloudinary storage
          </p>
        </header>

        {/* Upload Card */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-6 md:mb-8">
          <div className="p-4 md:p-6">
            <h2 className="text-lg md:text-xl font-semibold text-gray-800 mb-4 md:mb-6">
              Upload New Image
            </h2>
            
            {error && (
              <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                {error}
              </div>
            )}
            
            <div className="grid md:grid-cols-2 gap-4 md:gap-6">
              {/* Upload Form */}
              <div>
                <div className="mb-3 md:mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Image Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. product-image-1"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      setError(null);
                    }}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                  />
                </div>

                <div className="mb-4 md:mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Select Image
                  </label>
                  <div className="flex items-center justify-center w-full">
                    <label className="flex flex-col w-full h-28 border-2 border-dashed border-gray-300 hover:border-gray-400 rounded-lg cursor-pointer transition hover:bg-gray-50">
                      <div className="flex flex-col items-center justify-center pt-4 pb-5">
                        <svg
                          className="w-8 h-8 text-gray-400 mb-1"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                          ></path>
                        </svg>
                        <p className="text-xs md:text-sm text-gray-500">
                          {file ? file.name : "Click to select an image"}
                        </p>
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          setFile(e.target.files[0]);
                          setError(null);
                        }}
                        ref={fileInputRef}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>

                <button
                  onClick={handleUpload}
                  disabled={uploading || !file || !name.trim()}
                  className={`w-full py-2 px-4 text-sm md:text-base rounded-lg font-medium text-white transition ${
                    uploading || !file || !name.trim()
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-blue-600 hover:bg-blue-700"
                  }`}
                >
                  {uploading ? (
                    <span className="flex items-center justify-center">
                      <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Uploading...
                    </span>
                  ) : (
                    "Upload Image"
                  )}
                </button>
              </div>

              {/* Preview */}
              <div className="flex flex-col items-center justify-center">
                <h3 className="text-xs md:text-sm font-medium text-gray-700 mb-2">
                  Image Preview
                </h3>
                <div className="w-full h-36 md:h-48 bg-gray-100 rounded-lg overflow-hidden border border-gray-200 flex items-center justify-center">
                  {file ? (
                    <img
                      ref={filePreviewRef}
                      alt="Preview"
                      className="object-contain max-h-full max-w-full"
                    />
                  ) : (
                    <div className="text-gray-400 text-xs md:text-sm">
                      No image selected
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Gallery */}
        {images.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="p-4 md:p-6">
              <div className="flex justify-between items-center mb-4 md:mb-6">
                <h2 className="text-lg md:text-xl font-semibold text-gray-800">
                  Your Uploaded Images ({images.length})
                </h2>
                <button 
                  onClick={() => {
                    if (window.confirm("Clear all images? This cannot be undone.")) {
                      setImages([]);
                    }
                  }}
                  className="text-sm text-red-500 hover:text-red-700"
                >
                  Clear All
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
                {images.map((img, idx) => (
                  <div
                    key={img.public_id || idx}
                    className="group relative rounded-lg overflow-hidden border border-gray-200 hover:shadow-md transition-shadow"
                  >
                    <div className="aspect-square bg-gray-100">
                      <img
                        src={img.url}
                        alt={img.name || `Uploaded ${idx}`}
                        className="object-cover w-full h-full"
                        loading="lazy"
                      />
                    </div>
                    
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-2">
                      <div className="text-white text-xs font-medium truncate">
                        {img.name || "Untitled"}
                      </div>
                      <div className="text-white text-[10px] opacity-80">
                        {new Date(img.uploadedAt).toLocaleDateString()}
                      </div>
                    </div>
                    
                    <div className="absolute top-1 right-1 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => copyToClipboard(img.url, idx)}
                        className="p-1 bg-white/90 rounded-full hover:bg-white transition"
                        title="Copy URL"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-3 w-3 text-gray-700"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"
                          />
                        </svg>
                      </button>
                      <button
                        onClick={() => removeImage(idx)}
                        className="p-1 bg-white/90 rounded-full hover:bg-white transition"
                        title="Delete"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-3 w-3 text-gray-700"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>
                    </div>
                    
                    {copiedIndex === idx && (
                      <div className="absolute bottom-1 left-1 bg-green-500 text-white text-[10px] px-1 py-0.5 rounded">
                        Copied!
                      </div>
                    )}
                    
                    <div className="p-1 bg-gray-50">
                      <input
                        type="text"
                        value={img.url}
                        readOnly
                        className="w-full text-[10px] text-gray-500 bg-transparent border-none outline-none truncate"
                        onClick={(e) => e.target.select()}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}