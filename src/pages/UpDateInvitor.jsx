import React, { useState } from "react";
import "../style/_updateinvitor.scss";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Footer from "../components/Footer";

export default function UpDateInvitor() {
    const location = useLocation();
    const navigate = useNavigate();
    const invitor = location.state;

    const [name, setName] = useState(invitor?.name || "");
    const [phoneNumber, setPhoneNumber] = useState(invitor?.phoneNumber || "");
    const [readCount, setReadCount] = useState(invitor?.readCount || 0);
    const [status, setStatus] = useState(invitor?.status || "Invited");

    const baseUrl = "https://www.izemak.com/azimak/public/api";

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await fetch(`${baseUrl}/profile`, {
                method: "Put",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    id: invitor.id,
                    name,
                    phoneNumber,
                    maxScan: readCount,
                    status,
                }),
            });

            if (response.ok) {                
                navigate("/invitorspage", { state: { partyId: invitor.Party_id } });
            } else {
                console.error("فشل في تعديل البيانات");
            }
        } catch (error) {
            console.error("Error:", error);
        }
    };

    return (
        <main className="mainOfUpDateInvitor">
            <div>
                <Link to="/mainpartydata">
                    <img src="/اعزمك-01.png" alt="" />
                </Link>
            </div>
            <h1>تعديل البيانات</h1>
            <form onSubmit={handleSubmit}>
                <div className="details">
                    <label>الاسم</label>
                    <input type="text" value={name} onChange={(e) => setName(e.target.value)} />
                </div>
                <div className="details">
                    <label>رقم الهاتف</label>
                    <input type="text" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} />
                </div>
                <div className="details">
                    <label>عدد مرات القراءة</label>
                    <input type="number" value={readCount} onChange={(e) => setReadCount(e.target.value)} />
                </div>
                <label>الحالة</label>
                <div className="condition">
                    <select value={status} onChange={(e) => setStatus(e.target.value)}>
                        <option value="Invited">Invited</option>
                        <option value="Arrived">Arrived</option>
                        <option value="Accepted">Accepted</option>
                        <option value="Rejected">Rejected</option>
                    </select>
                </div>
                <div className="submit">
                    <button type="submit">تعديل</button>
                </div>
            </form>
            <Footer />
        </main>
    );
}
