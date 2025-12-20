import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import "../style/_mainPartyData.scss";
import { MdRestore } from "react-icons/md";
import Footer from "../components/Footer";

const BASE_URL = "https://www.izemak.com/azimak/public/api";

export default function DeletedParties() {
  const [deleted, setDeleted] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedParty, setSelectedParty] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchDeleted();
  }, []);

  const getId = (party) =>
    party.id ?? party.party_id ?? party.partyId ?? party.id_party ?? null;

  const axiosInstance = axios.create({
    baseURL: BASE_URL,
  });

  const fetchDeleted = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get("/parties/deleted");
      const list = res.data?.data ?? res.data;
      setDeleted(Array.isArray(list) ? list.reverse() : []);
    } catch (err) {
      console.error("Failed to load deleted parties:", err);
      setDeleted([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRestoreClick = (party) => {
    setSelectedParty(party);
    setShowModal(true);
  };

  const handleConfirmRestore = async () => {
    if (!selectedParty) return;
    const id = getId(selectedParty);
    if (!id) return;

    try {
      await axiosInstance.get(`/party/restore/${id}`);
      await fetchDeleted();
    } catch (err) {
      console.error("Restore error:", err);
    } finally {
      setShowModal(false);
      setSelectedParty(null);
    }
  };

  const handleCancel = () => {
    setShowModal(false);
    setSelectedParty(null);
  };

  return (
    <main className="mainOfMainPartyData">
      <div className="addParty">
        <button className="Btn">
          <Link to="/mainpartydata">Return to the home page</Link>
        </button>
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
            <th>Restoration</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan="4" className="empty">Loading...</td>
            </tr>
          ) : deleted.length > 0 ? (
            deleted.map((party, idx) => (
              <tr key={idx}>
                <td>{party.name ?? party.title ?? "-"}</td>
                <td>{party.time ?? "-"}</td>
                <td>{party.address ?? party.location ?? "-"}</td>
                <td>
                  <button
                    className="editBtn"
                    onClick={() => handleRestoreClick(party)}
                  >
                    <MdRestore />
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

      {showModal && (
        <div className="modalOverlay">
          <div className="modalBox">
            <p>Do you want to retrieve this party</p>
            <div className="modalActions">
              <button className="cancelBtn" onClick={handleConfirmRestore}>
                Restore
              </button>
              <button className="cancelBtn" onClick={handleCancel}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </main>
  );
}
