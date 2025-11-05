import React, { useState, useRef, useEffect } from "react";
import "../style/_qrcodescanner.scss";
import { BsQrCodeScan } from "react-icons/bs";
import { MdOutlineImageSearch } from "react-icons/md";
import { Link } from "react-router-dom";
import axios from "axios";
import jsQR from "jsqr";

export default function QRCodeScanner() {
  const [showImageScan, setShowImageScan] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [scanSuccess, setScanSuccess] = useState(false);
  const [scanData, setScanData] = useState(null);
  const [error, setError] = useState("");
  const [scannedText, setScannedText] = useState("");
  const fileInputRef = useRef(null);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const rafRef = useRef(null);
  const [cameraActive, setCameraActive] = useState(false);

  useEffect(() => {
    return () => {
      stopCamera();
      if (selectedImage) URL.revokeObjectURL(selectedImage);
    };
  }, []);

  function tryDecodeFromCanvas() {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    try {
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(imageData.data, imageData.width, imageData.height);
      if (code) {
        return code.data;
      }
    } catch (e) {
      console.warn("decode error", e);
    }
    return null;
  }

  async function callScanApi(scanned) {
    setError("");
    try {
      const res = await axios.get(
        `https://www.izemak.com/azimak/public/api/scan/${scanned}`
      );

      if (res.status === 200 && res.data) {
        setScanData({
          name: res.data.data?.name ?? "Not found",
          phone: res.data.data?.phoneNumber ?? "Not found",
          scan: res.data.data?.scan ?? "Not found",
          maxScan: res.data.data?.maxScan ?? "Not found",
        });
        setScanSuccess(true);
      } else {
        setError("API returned unexpected response.");
        console.warn("API response", res);
      }
    } catch (err) {
      console.error("Scan failed", err);
      setError("Scan failed (API). Please try again.");
    }
  }

  const handleFileSelect = async (event) => {
    setError("");
    const file = event.target.files && event.target.files[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Please select an image file.");
      return;
    }

    stopCamera();

    const imageURL = URL.createObjectURL(file);
    if (selectedImage) URL.revokeObjectURL(selectedImage);
    setSelectedImage(imageURL);

    const img = new Image();
    img.onload = async () => {
      const canvas = canvasRef.current;
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext("2d");
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      const decoded = tryDecodeFromCanvas();

      if (decoded) {
        setScannedText(decoded);
        await callScanApi(decoded);
      } else {
        setError("No QR code found in image.");
      }

    };
    img.onerror = () => {
      setError("Failed to read image file.");
      URL.revokeObjectURL(imageURL);
      setSelectedImage(null);
    };
    img.src = imageURL;
  };

  const handleChooseImageClick = () => {
    if (fileInputRef.current) fileInputRef.current.click();
  };

  const handleRescan = () => {
    setScanSuccess(false);
    setSelectedImage(null);
    setShowImageScan(false);
    setScannedText("");
    setScanData(null);
    setError("");
  };

  async function startCamera() {
    setError("");
    setScanSuccess(false);
    setSelectedImage(null);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setCameraActive(true);
      requestAnimationFrame(scanVideoFrame);
    } catch (e) {
      console.error("camera error", e);
      setError(
        "Camera access denied or not available. Ensure HTTPS and permissions."
      );
    }
  }

  function stopCamera() {
    setCameraActive(false);
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    if (videoRef.current) {
      try {
        videoRef.current.pause();
        videoRef.current.srcObject = null;
      } catch {}
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
  }

  function scanVideoFrame() {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) {
      rafRef.current = requestAnimationFrame(scanVideoFrame);
      return;
    }

    const vw = video.videoWidth;
    const vh = video.videoHeight;
    if (vw === 0 || vh === 0) {
      rafRef.current = requestAnimationFrame(scanVideoFrame);
      return;
    }

    canvas.width = vw;
    canvas.height = vh;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0, vw, vh);

    const decoded = tryDecodeFromCanvas();
    if (decoded) {
      setScannedText(decoded);
      stopCamera();
      callScanApi(decoded);
      return;
    }

    rafRef.current = requestAnimationFrame(scanVideoFrame);
  }

  return (
    <main className="mainOfQRCodeScanner">
      {!scanSuccess ? (
        <div className="scannerContainer">
          <h1>QR Code Reader</h1>

          {!showImageScan && (
            <div className="scanCard centerCard">
              <BsQrCodeScan size={60} />
              <div
                style={{
                  display: "flex",
                  gap: 8,
                  flexDirection: "column",
                  alignItems: "center",
                }}
              >
                {!cameraActive ? (
                  <button onClick={startCamera}>Start Camera Scan</button>
                ) : (
                  <button onClick={stopCamera}>Stop Camera</button>
                )}
                <Link onClick={() => setShowImageScan(true)}>
                  Scan an Image File
                </Link>
              </div>
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
                      Choose Image
                    </button>

                    <p>Or drop an image to scan</p>
                  </div>
                ) : (
                  <div className="preview">
                    <p>Image ready to scan!</p>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button
                        onClick={() => {
                          const decoded = tryDecodeFromCanvas();
                          if (decoded) {
                            setScannedText(decoded);
                            callScanApi(decoded);
                          } else {
                            setError("No QR code found in image.");
                          }
                        }}
                      >
                        Scan Image Now
                      </button>
                      <button
                        onClick={() => {
                          URL.revokeObjectURL(selectedImage);
                          setSelectedImage(null);
                        }}
                      >
                        Clear
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <Link
                onClick={() => {
                  setShowImageScan(false);
                }}
              >
                Back to Camera / Options
              </Link>
            </div>
          )}

          <div style={{ marginTop: 12 }}>
            {cameraActive && (
              <div className="cameraPreview">
                <video
                  ref={videoRef}
                  style={{ width: "100%", maxHeight: 360 }}
                  playsInline
                  muted
                />
                <p style={{ fontSize: 12 }}>
                  Camera active — point at a QR code.
                </p>
              </div>
            )}
          </div>

          <canvas ref={canvasRef} style={{ display: "none" }} />

          {error && (
            <div className="error" style={{ color: "red", marginTop: 8 }}>
              {error}
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
