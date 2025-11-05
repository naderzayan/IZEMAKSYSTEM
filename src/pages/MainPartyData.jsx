import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "../style/_mainPartyData.scss";
import { FaUserEdit, FaRegEdit } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
import { IoSearchSharp } from "react-icons/io5";
import Footer from "../components/Footer";

export default function MainPartyData() {
    const [parties, setParties] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [searchPerformed, setSearchPerformed] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [lastPage, setLastPage] = useState(1);
    const [loading, setLoading] = useState(false);

    const [showEditModal, setShowEditModal] = useState(false);
    const [editPartyName, setEditPartyName] = useState("");
    const [editPartyId, setEditPartyId] = useState(null);

    const [showModal, setShowModal] = useState(false);
    const [deleteIndex, setDeleteIndex] = useState(null);
    const [deletePartyName, setDeletePartyName] = useState("");

    const baseUrl = "https://www.izemak.com/azimak/public/api/parties";

    const fetchParties = (page = 1) => {
        setLoading(true);
        fetch(`${baseUrl}?page=${page}`, {
            headers: { Accept: "application/json" },
        })
            .then((response) => response.json())
            .then((data) => {
                setParties(data.data);
                setLastPage(data.meta?.last_page || 1);
                setLoading(false);
            })
            .catch((error) => {
                console.error("Fetch error:", error);
                setLoading(false);
            });
    };

    useEffect(() => {
        fetchParties(currentPage);
    }, [currentPage]);

    const confirmDelete = (index) => {
        setDeleteIndex(index);
        setDeletePartyName(parties[index].name);
        setShowModal(true);
    };

    const handleDelete = () => {
        if (deleteIndex === null) return;
        const deleteUrl = "https://www.izemak.com/azimak/public/api/deleteparty/" + parties[deleteIndex].id;
        fetch(deleteUrl, {
            method: "DELETE",
            headers: { Accept: "application/json" },
        })
            .then(() => {
                const updatedParties = parties.filter((_, i) => i !== deleteIndex);
                setParties(updatedParties);
                setShowModal(false);
                setDeleteIndex(null);
                setDeletePartyName("");
            })
            .catch((err) => console.error("Delete error:", err));
    };

    const handleSearch = () => {
        setSearchPerformed(true);
        if (!searchTerm) {
            fetchParties(currentPage);
            return;
        }
        const result = parties.filter((party) => party.name.toLowerCase().includes(searchTerm.toLowerCase()));
        setParties(result);
    };

    const goToNextPage = () => {
        if (currentPage < lastPage) setCurrentPage((prev) => prev + 1);
    };

    const goToPrevPage = () => {
        if (currentPage > 1) setCurrentPage((prev) => prev - 1);
    };

    const openEditModal = (party) => {
        setEditPartyName(party.name);
        setEditPartyId(party.id);
        setShowEditModal(true);
    };

    const handleEditSubmit = async () => {
        if (!editPartyId || !editPartyName.trim()) return;

        try {
            const response = await fetch("https://www.izemak.com/azimak/public/api/update/party", {
                method: "POST",
                headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    id: editPartyId,
                    name: editPartyName,
                }),
            });

            const data = await response.json();

            if (data.success || response.ok) {
                const updated = parties.map((p) =>
                    p.id === editPartyId ? { ...p, name: editPartyName } : p
                );
                setParties(updated);
                setShowEditModal(false);
            } else {
                alert("حدث خطأ أثناء التعديل");
            }
        } catch (error) {
            console.error("Edit error:", error);
        }
    };

    return (
        <main className="mainOfMainPartyData">
            <div className="addParty">
                <button className="addBtn">
                    <Link to="/createnewparty">إضافة حفل جديد</Link>
                </button>
                <div className="search">
                    <button className="searchBtn" onClick={handleSearch}>
                        بحث
                    </button>
                    <IoSearchSharp />
                    <input
                        type="search"
                        placeholder="ادخل اسم الحفلة"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") {
                                e.preventDefault();
                                handleSearch();
                            }
                        }}
                    />
                </div>
                <div>
                    <Link to="/mainpartydata">
                        <img src="/اعزمك-01.png" alt="" />
                    </Link>
                </div>
            </div>

            {loading ? (
                <div className="loadingSpinner">
                    <div className="spinner"></div>
                    <p>جاري تحميل البيانات...</p>
                </div>
            ) : (
                <>
                    <table className="partyTable">
                        <thead>
                            <tr>
                                <th>اسم الحفلة</th>
                                <th>ميعاد الحفلة</th>
                                <th>عنوان الحفلة</th>
                                <th>الحذف والتعديل/إضافة</th>
                            </tr>
                        </thead>
                        <tbody>
                            {parties.length > 0 ? (
                                parties.map((party, index) => (
                                    <tr key={index}>
                                        <td>
                                            {party.name}{" "}
                                            <button
                                                className="EditButton"
                                                onClick={() => openEditModal(party)}
                                            >
                                                <FaRegEdit />
                                            </button>
                                        </td>
                                        <td>{party.time}</td>
                                        <td>{party.address}</td>
                                        <td>
                                            <button
                                                className="deleteBtn"
                                                onClick={() => confirmDelete(index)}
                                            >
                                                <MdDelete />
                                            </button>
                                            <button className="editBtn">
                                                <Link
                                                    to="/AddInvitors"
                                                    state={{
                                                        partyId: party?.id,
                                                        partyName: party?.name,
                                                    }}
                                                >
                                                    <FaUserEdit />
                                                </Link>
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : searchPerformed ? (
                                <tr>
                                    <td colSpan="4" className="empty">
                                        لا توجد نتائج مطابقة
                                    </td>
                                </tr>
                            ) : (
                                <tr>
                                    <td colSpan="4" className="empty">
                                        لا يوجد بيانات بالجدول
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>

                    <div className="pages">
                        <button className="prev" onClick={goToPrevPage} disabled={currentPage === 1}>
                            السابقة
                        </button>
                        <span>
                            {currentPage} / {lastPage}
                        </span>
                        <button className="next" onClick={goToNextPage} disabled={currentPage === lastPage}>
                            التالية
                        </button>
                    </div>
                </>
            )}

            {showModal && (
                <div className="modalOverlay">
                    <div className="modal">
                        <h3>هل متأكد من حذف الحفلة "{deletePartyName}"؟</h3>
                        <div className="modalActions">
                            <button className="confirmBtn" onClick={handleDelete}>
                                نعم
                            </button>
                            <button className="cancelBtn" onClick={() => setShowModal(false)}>
                                لا
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showEditModal && (
                <div className="modalOverlay">
                    <div className="modal">
                        <h3>تعديل اسم الحفلة</h3>
                        <input
                            type="text"
                            value={editPartyName}
                            onChange={(e) => setEditPartyName(e.target.value)}
                        />
                        <div className="modalActions">
                            <button className="confirmBtn" onClick={handleEditSubmit}>
                                حفظ التعديل
                            </button>
                            <button className="cancelBtn" onClick={() => setShowEditModal(false)}>
                                إلغاء
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <Footer />
        </main>
    );
}
