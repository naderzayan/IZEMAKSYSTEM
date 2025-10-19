import React, { useState } from "react";
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
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const formData = new FormData();
        formData.append("name", partyName);
        formData.append("address", partyPlace);
        formData.append("location", "");
        formData.append("time", partyDate);
        if (file) formData.append("invititon", file);
        formData.append("partyInvitationText", invitationText);
        formData.append("party_condition", invitation);

        try {
            const response = await fetch("https://www.izemak.com/azimak/public/api/addparty", {
                method: "POST",
                body: formData,
            });

            const data = await response.json();
            console.log("Party Added Response:", data);

            if (response.ok && data) {
                navigate("/mainpartydata");
            } else {
                alert(data?.message || "لم يتم إضافة الحفلة");
            }
        } catch (error) {
            console.error("Error saving party:", error);
            alert("حصل خطأ في الاتصال بالسيرفر");
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="mainOfCreateNewParty">
            <Link to="/mainpartydata">
                <img src="/اعزمك-01.png" alt="" />
            </Link>
            <h1 className="title">إضافة حفل جديد</h1>

            {loading ? (
                <div className="loadingOverlay">
                    <div className="spinner"></div>
                </div>
            ) : (
                <form className="formContainer" onSubmit={handleSubmit}>
                    <div className="dataOfNewParty">
                        <select value={invitation} onChange={(e) => setInvitation(e.target.value)} required>
                            <option value="invitation">ارسال الدعوة فقط</option>
                            <option value="invitationWithQuestion">ارسال الدعوة مع السؤال</option>
                            <option value="both">ارسال الدعوة ورمز الدخول مع السؤال</option>
                            <option value="bothwithoutQuestion">ارسال الدعوة مع رمز الدخول بدون سؤال</option>
                            <option value="location">ارسال الموقع</option>
                            <option value="qr">ارسال رمز الدخول فقط</option>
                        </select>
                    </div>

                    <div className="dataOfNewParty">
                        <label>اسم الحفل</label>
                        <input
                            type="text"
                            placeholder="اسم الحفل"
                            value={partyName}
                            onChange={(e) => setPartyName(e.target.value)}
                            required
                        />
                    </div>

                    <div className="dataOfNewParty">
                        <label>ميعاد الحفل</label>
                        <input
                            type="text"
                            placeholder="ميعاد الحفل"
                            value={partyDate}
                            onChange={(e) => setPartyDate(e.target.value)}
                            required
                        />
                    </div>

                    <div className="dataOfNewParty">
                        <label>مكان الحفل</label>
                        <input
                            type="text"
                            placeholder="مكان الحفل"
                            value={partyPlace}
                            onChange={(e) => setPartyPlace(e.target.value)}
                            required
                        />
                    </div>

                    <div className="dataOfNewParty">
                        <label>ادخل نص الدعوة</label>
                        <input
                            type="text"
                            placeholder="ادخل نص الدعوة"
                            value={invitationText}
                            onChange={(e) => setInvitationText(e.target.value)}
                        />
                    </div>

                    <div className="dataOfNewParty">
                        <label htmlFor="fileUpload" className="uploadBtn">
                            رفع ملف <FaCloudUploadAlt />
                        </label>
                        <input
                            type="file"
                            id="fileUpload"
                            className="inputUpload"
                            onChange={(e) => setFile(e.target.files[0])}
                        />
                    </div>

                    <div className="dataOfNewParty">
                        <button type="submit" className="submitBtn">
                            إضافة الحفلة
                        </button>
                    </div>
                </form>
            )}
            <Footer />
        </main>
    );
}
