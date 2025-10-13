import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../style/_login.scss";
import Footer from "../components/Footer";

export default function Login() {
    const navigate = useNavigate();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [email, setEmail] = useState("");
    const [error, setError] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        const formData = new FormData();
        formData.append("name", username);
        formData.append("password", password);
        formData.append("email", email);
        const res = await fetch("https://www.izemak.com/azimak/public/api/login", {
            method: "POST",
            body: formData,
        });
        
        if (res.ok) {            
            navigate("/mainpartydata");
        } else {
            setError("بيانات تسجيل الدخول غير صحيحة!");
        }
    };

    return (
        <main className="mainOfLogin">
            <div className="form">
                <form className="loginBox" onSubmit={handleSubmit}>
                    <img src="/اعزمك-01.png" alt="" className="logo" />

                    <div className="input">
                        <input type="text" placeholder="اسم المستخدم" value={username} onChange={(e) => setUsername(e.target.value)} required />
                    </div>
                    <div className="input">
                        <input type="password" placeholder="كلمة المرور" value={password} onChange={(e) => setPassword(e.target.value)} required />
                    </div>
                    <div className="input">
                        <input type="email" placeholder="ادخل الايميل" value={email} onChange={(e) => setEmail(e.target.value)} required />
                    </div>

                    {error && <p className="error">{error}</p>}

                    <button type="submit" className="loginBtn">
                        تسجيل الدخول
                    </button>
                </form>
            </div>
            <div>
                <Footer />
            </div>
        </main>
    );
}
