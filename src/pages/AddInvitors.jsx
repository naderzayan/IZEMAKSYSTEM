import React, { useState, useEffect, useMemo } from "react";
import "../style/_addInvitors.scss";
import { Link, useLocation } from "react-router-dom";
import Footer from "../components/Footer";

export default function AddInvitors() {
    const location = useLocation();
    const [guests, setGuests] = useState([]);
    const [name, setName] = useState("");
    const [phone, setPhone] = useState("");
    const [invites, setInvites] = useState("");
    const [saving, setSaving] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [showDuplicateConfirm, setShowDuplicateConfirm] = useState(false);
    const [duplicatePayload, setDuplicatePayload] = useState(null);

    const partyName = location.state?.partyName ?? "";

    const query = useMemo(() => new URLSearchParams(location.search), [location.search]);
    const partyId = location.state?.partyId ?? query.get("partyId");

    useEffect(() => {
        if (!partyId) return;
        let cancelled = false;

        const fetchGuests = async () => {
            setLoading(true);
            setError(null);
            try {
                const res = await fetch(`https://www.izemak.com/azimak/public/api/party/${partyId}`);
                if (!res.ok) throw new Error("No Data Added");
                const data = await res.json();
                const arr = data?.data.members ?? [];
                if (!cancelled) setGuests(arr);
            } catch (err) {
                if (!cancelled) setError(err.message || "error");
            } finally {
                if (!cancelled) setLoading(false);
            }
        };

        fetchGuests();
        return () => {
            cancelled = true;
        };
    }, [partyId]);

    const handleAddGuest = async () => {
        if (!partyId) {
            alert("error ?partyId=ID");
            return;
        }
        if (!name || !phone || !invites) return;

        const isDuplicate = guests.some((guest) => guest.phoneNumber === phone);
        const formData = new FormData();
        formData.append("Party_id", partyId);
        formData.append("name", name);
        formData.append("phoneNumber", phone);
        formData.append("maxScan", invites);

        if (isDuplicate) {
            setDuplicatePayload(formData);
            setShowDuplicateConfirm(true);
            return;
        }

        setSaving(true);
        setError(null);
        try {
            const res = await fetch("https://www.izemak.com/azimak/public/api/addinvitor", {
                method: "POST",
                body: formData,
            });

            if (!res.ok) throw new Error("error not added");
            window.location.reload();
            setName("");
            setPhone("");
            setInvites("");
        } catch (err) {
            setError(err.message || "error");
        } finally {
            setSaving(false);
        }
    };

    const handleResendDuplicate = async () => {
        if (!duplicatePayload) return;
        setSaving(true);
        setError(null);
        try {
            const res = await fetch("https://www.izemak.com/azimak/public/api/addinvitor/confirm", {
                method: "POST",
                body: duplicatePayload,
            });

            if (!res.ok) throw new Error("error on confirm");

            setShowDuplicateConfirm(false);
            window.location.reload();
            setName("");
            setPhone("");
            setInvites("");
        } catch (err) {
            setError(err.message || "error");
            setShowDuplicateConfirm(false);
        } finally {
            setSaving(false);
            setDuplicatePayload(null);
        }
    };

    return (
        <main className="mainOfAddInvitors">
            {showDuplicateConfirm && (
                <div className="overlay">
                    <div className="warningBox">
                        <p>الرقم مكرر هل تريد إضافته؟</p>
                        <div className="warningActions">
                            <button type="button" onClick={handleResendDuplicate} disabled={saving} className="confirmBtn"> إرسال </button>
                            <button type="button" onClick={() => { setShowDuplicateConfirm(false); setDuplicatePayload(null); }} className="cancelBtn" > إلغاء </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="sideBar">
                <Link to="/invitorspage" state={{ partyId }}>
                    <h1>قائمة المدعوين</h1>
                </Link>
                <ul>
                    {loading ? (
                        <p className="loading"> جاري تحميل البيانات...</p>
                    ) : !Array.isArray(guests) || guests.length === 0 ? (
                        <p>No Data Yet</p>
                    ) : (
                        guests.map((guest, idx) => (
                            <li key={idx}>
                                <span>{guest.name}</span>
                                <span>{guest.status ?? ""}</span>
                            </li>
                        ))
                    )}
                </ul>
            </div>

            <div className="addDetailis">
                {error && <p className="error">{error}</p>}
                <h2>{partyName}</h2>
                <div className="name">
                    <label>الاسم</label>
                    <input type="text" placeholder="الاسم" value={name} onChange={(e) => setName(e.target.value)} />
                </div>

                <div className="phoneNum">
                    <label>رقم الهاتف</label>
                    <input type="number" placeholder="رقم الهاتف" value={phone} onChange={(e) => setPhone(e.target.value)} />
                </div>

                <div className="numOfInvitations">
                    <label>عدد الدعوات</label>
                    <input type="number" placeholder="عدد الدعوات" value={invites} onChange={(e) => setInvites(e.target.value)} />
                </div>

                <div className="buttons">
                    <div className="addButton">
                        <button type="button" onClick={handleAddGuest} disabled={saving}>
                            إضافة
                        </button>
                    </div>
                    <div className="addButton">
                        <label htmlFor="fileUpload" className="uploadBtn">
                            رفع ملف
                        </label>
                        <input type="file" id="fileUpload" className="inputUpload" />
                    </div>
                </div>
                <Footer />
            </div>
        </main>
    );
}
