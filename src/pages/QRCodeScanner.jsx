import React, { useState, useRef } from "react";
import "../style/_qrcodescanner.scss";
import { BsQrCodeScan } from "react-icons/bs";
import { MdOutlineImageSearch } from "react-icons/md";
import { Link } from "react-router-dom";
import axios from "axios";

export default function QRCodeScanner() {
  const [showImageScan, setShowImageScan] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [scanSuccess, setScanSuccess] = useState(false);
  const [scanData, setScanData] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileSelect = async (event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith("image/")) {
      const imageURL = URL.createObjectURL(file);
      setSelectedImage(imageURL);

      try {
        const invitorId = "44";
        const res = await axios.get(
          `https://www.izemak.com/azimak/public/api/scan/${invitorId}`
        );

        if (res.status === 200 && res.data) {
          setScanData({
            name: res.data.name || "nader",
            phone: res.data.phoneNumber || "201014600843",
            scan: res.data.scan || "4",
            maxScan: res.data.maxScan || "5",
          });
          setScanSuccess(true);
        }
      } catch (error) {
        console.error("Scan failed", error);
        alert(" Scan failed, please try again ");
      }
    }
  };

  const handleChooseImageClick = () => {
    fileInputRef.current.click();
  };

  const handleRescan = () => {
    setScanSuccess(false);
    setSelectedImage(null);
    setShowImageScan(false);
  };

  return (
    <main className="mainOfQRCodeScanner">
      {!scanSuccess ? (
        <div className="scannerContainer">
          <h1>QR Code Reader</h1>

          {!showImageScan && (
            <div className="scanCard centerCard">
              <BsQrCodeScan size={60} />
              <button onClick={() => alert("Camera scan coming soon!")}>
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
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDragging(false);
                  handleFileSelect({ target: { files: e.dataTransfer.files } });
                }}
              >
                {!selectedImage ? (
                  <div>
                    <input
                      type="file"
                      accept="image/*"
                      ref={fileInputRef}
                      onChange={handleFileSelect}
                      style={{ display: "none" }}
                    />

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
      ) : (
        <div className="successfully">
          <h1>Scan successfully</h1>

          <table className="info-table">
            <tbody>
              <tr>
                <td>{scanData?.name}</td>
                <th>Name</th>
              </tr>
              <tr>
                <td>{scanData?.phone}</td>
                <th>Phone Number</th>
              </tr>
              <tr>
                <td>{scanData?.scan}</td>
                <th>Scan</th>
              </tr>
              <tr>
                <td>{scanData?.maxScan}</td>
                <th>Max Scan</th>
              </tr>
            </tbody>
          </table>

          <button onClick={handleRescan}>Rescan</button>
        </div>
      )}
    </main>
  );
}
