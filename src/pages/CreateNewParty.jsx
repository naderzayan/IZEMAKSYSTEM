import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../style/_createNewParty.scss";
import { FaCloudUploadAlt } from "react-icons/fa";
import Footer from "../components/Footer";

export default function CreateNewParty() {
  const navigate = useNavigate();

  const [partyName, setPartyName] = useState("");
  const [partyDate, setPartyDate] = useState("");
  const [partyPlace, setPartyPlace] = useState("");
  const [invitation, setInvitation] = useState("both");
  const [invitationText, setInvitationText] = useState("");
  const [file, setFile] = useState(null);
  const [hotelId, setHotelId] = useState("");
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("https://www.izemak.com/azimak/public/api/hotels")
      .then((res) => res.json())
      .then((data) => setHotels(data.data || []));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData();
    formData.append("name", partyName);
    formData.append("address", partyPlace);
    formData.append("location", "");
    formData.append("time", partyDate);
    formData.append("partyInvitationText", invitationText);
    formData.append("party_condition", invitation);
    formData.append("hotel_id", hotelId);

    if (file) formData.append("invititon", file);

    try {
      const res = await fetch(
        "https://www.izemak.com/azimak/public/api/addparty",
        {
          method: "POST",
          body: formData,
        }
      );

      if (res.ok) {
        navigate("/mainpartydata");
      } else {
        alert("Failed to add party");
      }
    } catch {
      alert("Server connection problem");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="mainOfCreateNewParty">
      <Link to="/mainpartydata">
        <img src="/اعزمك-01.png" alt="" />
      </Link>

      <h1>Add a new party</h1>

      <form className="formContainer" onSubmit={handleSubmit}>
        <select
          value={invitation}
          onChange={(e) => setInvitation(e.target.value)}
          required
        >
          <option value="invitation">ارسال الدعوة فقط</option>
          <option value="invitationWithQuestion">ارسال الدعوة مع السؤال</option>
          <option value="both">ارسال الدعوة ورمز الدخول مع السؤال</option>
          <option value="bothwithoutQuestion">ارسال الدعوة مع رمز الدخول بدون سؤال</option>
          <option value="location">ارسال الموقع</option>
          <option value="qr">ارسال رمز الدخول فقط</option>
          <option value="withoutMax">ارسال دعوات بدون عدد دعوات محدد</option>
        </select>

        <input
          type="text"
          placeholder="Party Name"
          value={partyName}
          onChange={(e) => setPartyName(e.target.value)}
          required
        />

        <input
          type="text"
          placeholder="Party Time"
          value={partyDate}
          onChange={(e) => setPartyDate(e.target.value)}
          required
        />

        <input
          type="text"
          placeholder="Party Address"
          value={partyPlace}
          onChange={(e) => setPartyPlace(e.target.value)}
          required
        />

        <select
          value={hotelId}
          onChange={(e) => setHotelId(e.target.value)}
          required
        >
          <option value="">Choose hotel</option>
          {hotels.map((h) => (
            <option key={h.id} value={h.id}>
              {h.name}
            </option>
          ))}
        </select>

        <input
          type="text"
          placeholder="Invitation Text"
          value={invitationText}
          onChange={(e) => setInvitationText(e.target.value)}
          className="invitationText"
        />

        <label className="uploadBtn">
          Upload <FaCloudUploadAlt />
          <input
            type="file"
            hidden
            onChange={(e) => setFile(e.target.files[0])}
          />
        </label>

        <button type="submit" disabled={loading}>
          {loading ? "Loading..." : "Add Party"}
        </button>
      </form>

      <Footer />
    </main>
  );
}
