import React, { useState, useRef, useEffect } from "react";
import "../style/_qrcodescanner.scss";
import { BsQrCodeScan } from "react-icons/bs";
import { MdOutlineImageSearch } from "react-icons/md";
import axios from "axios";
import jsQR from "jsqr";

/**
 * QRCodeScanner
 * - Improved startCamera with detailed error handling & device checks
 * - Safer cleanup on unmount
 * - Buttons used for toggles (no accidental route navigations)
 *
 * Usage: import and render <QRCodeScanner />
 */

export default function QRCodeScanner() {
  const [showImageScan, setShowImageScan] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [scanSuccess, setScanSuccess] = useState(false);
  const [scanData, setScanData] = useState(null);
  const [error, setError] = useState("");
  const [scannedText, setScannedText] = useState("");
  const [cameraActive, setCameraActive] = useState(false);

  const fileInputRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const rafRef = useRef(null);

  useEffect(() => {
    return () => {
      stopCamera();
      if (selectedImage) {
        try {
          URL.revokeObjectURL(selectedImage);
        } catch (e) {}
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function tryDecodeFromCanvas() {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    try {
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(imageData.data, imageData.width, imageData.height);
      if (code) return code.data;
    } catch (e) {
      console.warn("decode error", e);
    }
    return null;
  }

  async function callScanApi(scanned) {
    setError("");
    try {
      // NOTE: keep your real URL here
      const res = await axios.get(
        `https://www.izemak.com/azimak/public/api/scan/${encodeURIComponent(
          scanned
        )}`
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
        setError("API returned unexpected response");
      }
    } catch (err) {
      console.error("Scan failed", err);
      setError("Scan failed (API). Please try again");
    }
  }

  const handleFileSelect = (event) => {
    setError("");
    const file = event.target.files && event.target.files[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Please select an image file");
      return;
    }

    stopCamera();
    const imageURL = URL.createObjectURL(file);
    if (selectedImage) {
      try {
        URL.revokeObjectURL(selectedImage);
      } catch (e) {}
    }
    setSelectedImage(imageURL);

    const img = new Image();
    img.onload = () => {
      const canvas = canvasRef.current;
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext("2d");
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      const decoded = tryDecodeFromCanvas();
      if (decoded) {
        setScannedText(decoded);
        callScanApi(decoded);
      } else {
        setError("No QR code found in image");
      }
    };
    img.onerror = () => {
      setError("Failed to read image file");
      try {
        URL.revokeObjectURL(imageURL);
      } catch (e) {}
      setSelectedImage(null);
    };
    img.src = imageURL;
  };

  const handleChooseImageClick = () => {
    if (fileInputRef.current) fileInputRef.current.click();
  };

  const handleRescan = () => {
    setScanSuccess(false);
    if (selectedImage) {
      try {
        URL.revokeObjectURL(selectedImage);
      } catch (e) {}
    }
    setSelectedImage(null);
    setShowImageScan(false);
    setScannedText("");
    setScanData(null);
    setError("");
  };

  async function startCamera() {
    setError("");
    setScanSuccess(false);
    if (selectedImage) {
      try {
        URL.revokeObjectURL(selectedImage);
      } catch (e) {}
    }
    setSelectedImage(null);

    try {
      // Capability check
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setError("Your browser does not support camera access (navigator.mediaDevices missing).");
        console.error("navigator.mediaDevices missing");
        return;
      }

      // If page is inside an iframe warn (parent must allow camera)
      if (window.self !== window.top) {
        console.warn("Page appears inside an iframe. Parent must allow camera with allow=\"camera\" on the iframe.");
      }

      // Try to enumerate devices to detect if any video input exists
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const hasVideoInput = devices.some((d) => d.kind === "videoinput");
        if (!hasVideoInput) {
          setError("No camera devices found on this machine.");
          console.error("No videoinput devices:", devices);
          return;
        }
      } catch (enumErr) {
        // Not fatal — continue to request permission (enumerateDevices might be restricted)
        console.warn("enumerateDevices failed:", enumErr);
      }

      const constraints = {
        video: {
          facingMode: { ideal: "environment" },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef.current) {
        // Attach stream and attempt to play
        videoRef.current.srcObject = stream;
        videoRef.current.playsInline = true;
        videoRef.current.muted = true; // helps autoplay in some browsers

        try {
          await videoRef.current.play();
          setCameraActive(true);
          rafRef.current = requestAnimationFrame(scanVideoFrame);
        } catch (playErr) {
          console.error("Video play error", playErr);
          setError("Unable to start video playback. Check browser autoplay/permission settings.");
        }
      }
    } catch (err) {
      console.error("Camera error (getUserMedia failed):", err);

      if (err && err.name) {
        switch (err.name) {
          case "NotAllowedError":
          case "SecurityError":
          case "PermissionDeniedError":
            setError("Camera access denied. Please allow camera access in your browser settings for this site.");
            break;
          case "NotFoundError":
          case "OverconstrainedError":
          case "DevicesNotFoundError":
            setError("No compatible camera found on this device.");
            break;
          case "NotReadableError":
          case "TrackStartError":
            setError("Camera is already in use by another application.");
            break;
          default:
            setError("Camera access failed: " + (err.message || err.name));
        }
      } else {
        if (window.location.protocol !== "https:" && window.location.hostname !== "localhost") {
          setError("Camera requires HTTPS or localhost to work.");
        } else {
          setError("Camera access denied or not available.");
        }
      }
    }
  }

  function stopCamera() {
    setCameraActive(false);
    if (rafRef.current) {
      try {
        cancelAnimationFrame(rafRef.current);
      } catch (e) {}
      rafRef.current = null;
    }
    if (videoRef.current) {
      try {
        videoRef.current.pause();
        videoRef.current.srcObject = null;
      } catch (e) {}
    }
    if (streamRef.current) {
      try {
        streamRef.current.getTracks().forEach((t) => t.stop());
      } catch (e) {}
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
      // video metadata not ready
      setTimeout(() => {
        rafRef.current = requestAnimationFrame(scanVideoFrame);
      }, 100);
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
                <button onClick={() => setShowImageScan(true)}>Scan an Image File</button>
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
                    <button onClick={handleChooseImageClick}>Choose Image</button>
                    <p>Or drop an image to scan</p>
                  </div>
                ) : (
                  <div className="preview">
                    <p>Image ready to scan!</p>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button
                        onClick={() => {
                          const decoded = tryDecodeFromCanvas();
                          if (decoded) callScanApi(decoded);
                          else setError("No QR code found in image");
                        }}
                      >
                        Scan Image Now
                      </button>
                      <button
                        onClick={() => {
                          try {
                            URL.revokeObjectURL(selectedImage);
                          } catch (e) {}
                          setSelectedImage(null);
                        }}
                      >
                        Clear
                      </button>
                    </div>
                  </div>
                )}
              </div>
              <button onClick={() => setShowImageScan(false)}>Back to Camera</button>
            </div>
          )}

          <div style={{ marginTop: 12 }}>
            {cameraActive && (
              <div className="cameraPreview">
                <video
                  ref={videoRef}
                  style={{
                    width: "100%",
                    maxHeight: 360,
                    borderRadius: 12,
                    background: "#000",
                  }}
                  playsInline
                  muted
                  autoPlay
                />
                <p style={{ fontSize: 12 }}>Camera active — point at a QR code.</p>
              </div>
            )}
          </div>

          <canvas ref={canvasRef} style={{ display: "none" }} />

          {error && (
            <div className="error" style={{ marginTop: 8 }}>
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
