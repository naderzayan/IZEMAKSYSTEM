import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import "../style/_invitorsPage.scss";
import { FaUserEdit, FaFileExcel, FaFilePdf, FaEdit } from "react-icons/fa";
import { MdDelete, MdOutlineDeleteSweep } from "react-icons/md";
import { ImCheckmark2 } from "react-icons/im";
import { IoMdPersonAdd } from "react-icons/io";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import Footer from "../components/Footer";

export default function InvitorsPage() {
    const location = useLocation();
    const [invitors, setInvitors] = useState([]);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("All");
    const [loading, setLoading] = useState(false);

    const [showActionBtns, setShowActionBtns] = useState(false);
    const [selectAll, setSelectAll] = useState(false);

    const [showConfirm, setShowConfirm] = useState(false);
    const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState(false);
    const [selectedInvitor, setSelectedInvitor] = useState(null);

    const [showChangeStatusBox, setShowChangeStatusBox] = useState(false);
    const [newStatus, setNewStatus] = useState("Invited");

    const baseUrl = "https://www.izemak.com/azimak/public/api";
    const partyId = location.state?.partyId;

    const fetchInvitors = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${baseUrl}/party/${partyId}`);
            const data = await res.json();
            setInvitors(
                (data?.data?.members || []).map((item) => ({
                    ...item,
                    selected: false,
                })),
            );
        } catch (err) {
            console.log(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInvitors();
    }, [partyId]);

    const handleSearch = async () => {
        if (!search) return fetchInvitors();
        try {
            setLoading(true);
            const res = await fetch(`${baseUrl}/searchinvitor/${partyId}/${search}`);
            const data = await res.json();
            setInvitors(data.data || []);
        } catch (err) {
            console.log(err);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteClick = (invitor) => {
        setSelectedInvitor(invitor);
        setShowConfirm(true);
    };

    const confirmDelete = async () => {
        if (!selectedInvitor) return;
        try {
            await fetch(`${baseUrl}/deleteinvitor/${selectedInvitor.id}`, {
                method: "DELETE",
            });
            setInvitors((prev) => prev.filter((i) => i.id !== selectedInvitor.id));
        } catch (err) {
            console.error("Delete error:", err);
        } finally {
            setShowConfirm(false);
            setSelectedInvitor(null);
        }
    };

    const cancelDelete = () => {
        setShowConfirm(false);
        setSelectedInvitor(null);
    };

    const handleSelectAllClick = () => {
        const newSelectAll = !selectAll;
        setSelectAll(newSelectAll);
        setShowActionBtns(newSelectAll);
        setInvitors((prev) => prev.map((item) => ({ ...item, selected: newSelectAll })));
    };

    const handleCheckboxChange = (id) => {
        setInvitors((prev) => prev.map((item) => (item.id === id ? { ...item, selected: !item.selected } : item)));
    };

    const handleBulkDelete = async () => {
        try {
            for (const invitor of invitors) {
                await fetch(`${baseUrl}/deleteinvitor/${invitor.id}`, {
                    method: "DELETE",
                });
            }
            setInvitors([]);
        } catch (err) {
            console.error("Bulk delete error:", err);
        } finally {
            setShowBulkDeleteConfirm(false);
            setShowActionBtns(false);
            setSelectAll(false);
        }
    };

    const handleChangeStatus = async () => {
        try {
            for (const invitor of invitors) {
                await fetch(`${baseUrl}/updateinvitor/${invitor.id}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ status: newStatus.toLowerCase() }),
                });
            }
            setInvitors((prev) => prev.map((item) => ({ ...item, status: newStatus.toLowerCase() })));
        } catch (err) {
            console.error("Change status error:", err);
        } finally {
            setShowChangeStatusBox(false);
        }
    };

    const handleExportExcel = () => {
        const dataForExcel = invitors.map((item) => ({
            "اسم المدعو": item.name,
            "رقم الهاتف": item.phoneNumber,
            الحالة: item.status,
        }));
        const worksheet = XLSX.utils.json_to_sheet(dataForExcel);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Invitors");
        XLSX.writeFile(workbook, "invitors.xlsx");
    };

    const handleExportPDF = () => {
        const doc = new jsPDF();
        doc.setFontSize(16);
        doc.text("قائمة المدعوين", 14, 15);

        const tableColumn = ["اسم المدعو", "رقم الهاتف", "الحالة"];
        const tableRows = invitors.map((item) => [item.name, item.phoneNumber, item.status]);

        autoTable(doc, {
            head: [tableColumn],
            body: tableRows,
            startY: 25,
        });

        doc.save("invitors.pdf");
    };

    const filteredInvitors = invitors.filter((invitor) => (statusFilter === "All" ? true : invitor.status === statusFilter.toLowerCase()));

    return (
        <main className="invitorsPage">
            <header className="pageHeader">
                <div className="actions">
                    <div>
                        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                            <option>All</option>
                            <option>Invited</option>
                            <option>Arrived</option>
                            <option>Accepted</option>
                            <option>Rejected</option>
                            <option>Faild</option>
                        </select>
                    </div>
                    <div>
                        <Link to="/mainpartydata">
                            <img src="/اعزمك-01.png" alt="" className="logo" />
                        </Link>
                    </div>
                    <div className="search">
                        <input type="text" placeholder="ادخل اسم المدعو" value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleSearch()} />
                        <button onClick={handleSearch}>بحث</button>
                    </div>
                </div>
            </header>

            {loading ? (
                <p className="loading">جاري تحميل البيانات...</p>
            ) : (
                <table className="invitorsTable">
                    <thead>
                        <tr>
                            <th>اسم المدعو</th>
                            <th>رقم الهاتف</th>
                            <th>الحالة</th>
                            <th>التعديل</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredInvitors.length > 0 ? (
                            filteredInvitors.map((invitor) => (
                                <tr key={invitor.id}>
                                    <td>{invitor.name}</td>
                                    <td>{invitor.phoneNumber}</td>
                                    <td>{invitor.status}</td>
                                    <td>
                                        <div className="icons">
                                            <button className="editBtn">
                                                <Link to="/updateinvitor" state={invitor}>
                                                    <FaUserEdit />
                                                </Link>
                                            </button>
                                            <button className="deleteBtn" onClick={() => handleDeleteClick(invitor)}>
                                                <MdDelete />
                                            </button>
                                            <input type="checkbox" checked={invitor.selected} onChange={() => handleCheckboxChange(invitor.id)} />
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="4" className="emptyRow">
                                    لا توجد بيانات
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            )}

            {showConfirm && (
                <div className="confirmOverlay">
                    <div className="confirmBox">
                        <p>هل متأكد من الحذف؟</p>
                        <div className="confirmBtns">
                            <button onClick={confirmDelete}>نعم</button>
                            <button onClick={cancelDelete}>لا</button>
                        </div>
                    </div>
                </div>
            )}

            {showBulkDeleteConfirm && (
                <div className="confirmOverlay">
                    <div className="confirmBox">
                        <p>هل متأكد من الحذف ؟</p>
                        <div className="confirmBtns">
                            <button onClick={handleBulkDelete}>نعم</button>
                            <button onClick={() => setShowBulkDeleteConfirm(false)}>لا</button>
                        </div>
                    </div>
                </div>
            )}

            {showChangeStatusBox && (
                <div className="confirmOverlay">
                    <div className="confirmBox">
                        <p>تغيير الحالة</p>
                        <div className="changeStatus">
                            <select value={newStatus} onChange={(e) => setNewStatus(e.target.value)}>
                                <option>Invited</option>
                                <option>Arrived</option>
                                <option>Accepted</option>
                                <option>Rejected</option>
                                <option>Faild</option>
                            </select>
                        </div>
                        <div className="confirmBtns">
                            <button onClick={handleChangeStatus}>تعديل</button>
                            <button onClick={() => setShowChangeStatusBox(false)}>إلغاء</button>
                        </div>
                    </div>
                </div>
            )}

            <div className="bottomActions">
                {showActionBtns && (
                    <>
                        <button className="exportExcelBtn" onClick={() => setShowChangeStatusBox(true)}>
                            <FaEdit />
                        </button>
                        <button className="exportExcelBtn" onClick={() => setShowBulkDeleteConfirm(true)}>
                            <MdOutlineDeleteSweep />
                        </button>
                    </>
                )}
                <button className="exportExcelBtn" onClick={handleExportExcel}>
                    <FaFileExcel />
                </button>
                <button className="exportPdfBtn" onClick={handleExportPDF}>
                    <FaFilePdf />
                </button>
                <button className="selectAllBtn" onClick={handleSelectAllClick}>
                    <ImCheckmark2 />
                </button>
                <button className="addInvitorBtn">
                    <Link to="/addinvitors" state={{ partyId }}>
                        <IoMdPersonAdd />
                    </Link>
                </button>
            </div>
            <Footer />
        </main>
    );
}
