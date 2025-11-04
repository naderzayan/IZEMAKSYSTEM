import React, { useState, useRef } from "react";
import "../style/_qrcodescanner.scss";
import { BsQrCodeScan } from "react-icons/bs";
import { MdOutlineImageSearch } from "react-icons/md";
import { Link } from "react-router-dom";

export default function QRCodeScanner() {
  const [showImageScan, setShowImageScan] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  // بنحط ref عشان نتحكم في الـ input يدويًا
  const fileInputRef = useRef(null);

  const openScanApp = (mode) => {
    const url =
      mode === "camera"
        ? "https://scanapp.org/scan"
        : "https://scanapp.org/scan?mode=image";
    window.open(url, "_blank", "width=800,height=600");
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith("image/")) {
      setSelectedImage(URL.createObjectURL(file));
    }
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setIsDragging(false);
    const file = event.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) {
      setSelectedImage(URL.createObjectURL(file));
    }
  };

  const handleDragOver = (event) => {
    event.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  // لما المستخدم يدوس على الزرار
  const handleChooseImageClick = () => {
    fileInputRef.current.click(); // يفتح نافذة اختيار الملفات
  };

  return (
    <main className="mainOfQRCodeScanner">
      <div className="scannerContainer">
        <h1>QR Code Reader</h1>

        {!showImageScan && (
          <div className="scanCard centerCard">
            <BsQrCodeScan size={60} />
            <button onClick={() => openScanApp("camera")}>
              Request Camera Permissions
            </button>
            <Link onClick={() => setShowImageScan(true)}>
              Scan an Image File
            </Link>
          </div>
        )}

        {showImageScan && (
          <div className="scanCard centerCard">
            <MdOutlineImageSearch size={60} />
            <div
              className={`drop-zone ${isDragging ? "dragging" : ""}`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              {!selectedImage ? (
                <div>
                  {/* input file مخفي */}
                  <input
                    type="file"
                    accept="image/*"
                    ref={fileInputRef}
                    onChange={handleFileSelect}
                    style={{ display: "none" }}
                  />

                  {/* الزرار اللي بيفتح الملفات */}
                  <button onClick={handleChooseImageClick}>
                    Choose Image - No image chosen
                  </button>

                  <p>Or drop an image to scan</p>
                </div>
              ) : (
                <div className="preview">
                  <img
                    src={selectedImage}
                    alt="Selected"
                    style={{
                      maxWidth: "100%",
                      maxHeight: "200px",
                      borderRadius: "10px",
                    }}
                  />
                  <p>Image ready to scan!</p>
                </div>
              )}
            </div>

            <Link onClick={() => setShowImageScan(false)}>
              Scan using camera directly
            </Link>
          </div>
        )}
      </div>
      <div>
        <h1>scan successfully</h1>
      </div>
    </main>
  );
}
