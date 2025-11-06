import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "../style/_mainPartyData.scss";
import { FaUserEdit, FaRegEdit } from "react-icons/fa";
import { MdDelete, MdRestore } from "react-icons/md";
import Footer from "../components/Footer";

export default function DeletedParties() {
  const [deleted, setDeleted] = useState([]);

  useEffect(() => {
    loadDeleted();
  }, []);

  const loadDeleted = () => {
    try {
      const list = JSON.parse(localStorage.getItem("deletedParties") || "[]");
      setDeleted(list.reverse());
    } catch (err) {
      console.error("Error reading deletedParties:", err);
      setDeleted([]);
    }
  };

  const handleRestore = (index) => {
    try {
      const list = JSON.parse(localStorage.getItem("deletedParties") || "[]");
      const [item] = list.splice(index, 1);
      localStorage.setItem("deletedParties", JSON.stringify(list));
      setDeleted(list);

      const restored = JSON.parse(localStorage.getItem("restoredParties") || "[]");
      restored.push(item);
      localStorage.setItem("restoredParties", JSON.stringify(restored));

    } catch (err) {
      console.error("Restore error:", err);
    }
  };

  const handlePermanentDelete = (index) => {
    if (!confirm("Do you want to Absolutely delete this item from the Trash?")) return;
    try {
      const list = JSON.parse(localStorage.getItem("deletedParties") || "[]");
      list.splice(index, 1);
      localStorage.setItem("deletedParties", JSON.stringify(list));
      setDeleted(list);
    } catch (err) {
      console.error("Permanent delete error:", err);
    }
  };

  const clearAll = () => {
    if (!confirm("Clear all items from the trash?")) return;
    localStorage.removeItem("deletedParties");
    setDeleted([]);
  };

  return (
    <main className="mainOfMainPartyData">
      <div className="addParty">
        <button className="Btn">
          <Link to="/mainpartydata">Return to the home page</Link>
        </button>
        <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
          <button className="Btn" onClick={clearAll} >
            Clear all
          </button>
        </div>
        <div>
          <Link to="/mainpartydata">
            <img src="/اعزمك-01.png" alt="" />
          </Link>
        </div>
      </div>

      <table className="partyTable">
        <thead>
          <tr>
            <th>Party name</th>
            <th>Party time</th>
            <th>Party address</th>
            <th>restoration</th>
          </tr>
        </thead>
        <tbody>
          {deleted.length > 0 ? (
            deleted.map((party, idx) => (
              <tr key={idx}>
                <td>
                  {party.name}
                </td>
                <td>{party.time || "-"}</td>
                <td>{party.address || "-"}</td>
                <td>
                  <button className="editBtn" title="استعادة" onClick={() => handleRestore(idx)}>
                    <MdRestore />
                  </button>
                  <button className="deleteBtn" title="حذف نهائي" onClick={() => handlePermanentDelete(idx)}>
                    <MdDelete />
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="4" className="empty">No data yet</td>
            </tr>
          )}
        </tbody>
      </table>

      <Footer />
    </main>
  );
}
