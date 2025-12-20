import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "../style/_mainPartyData.scss";
import { FaUserEdit, FaRegEdit } from "react-icons/fa";
import { GiPartyPopper } from "react-icons/gi";
import { MdDelete } from "react-icons/md";
import { IoSearchSharp } from "react-icons/io5";
import { MdRestore } from "react-icons/md";
import { RiUserSettingsLine } from "react-icons/ri";
import { FaHotel } from "react-icons/fa";
import Footer from "../components/Footer";

export default function MainPartyData() {
  const [parties, setParties] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchPerformed, setSearchPerformed] = useState(false);

  const [allParties, setAllParties] = useState([]);

  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [loading, setLoading] = useState(false);

  const [showEditModal, setShowEditModal] = useState(false);
  const [editPartyName, setEditPartyName] = useState("");
  const [editPartyId, setEditPartyId] = useState(null);

  const [showModal, setShowModal] = useState(false);
  const [deleteIndex, setDeleteIndex] = useState(null);
  const [deletePartyName, setDeletePartyName] = useState("");

  const [employees, setEmployees] = useState([]);
  const [openDropdownIndex, setOpenDropdownIndex] = useState(null);
  const [addingIndex, setAddingIndex] = useState(null);

  const baseUrl = "https://www.izemak.com/azimak/public/api/parties";

  const fetchParties = async (page = 1) => {
    setLoading(true);
    try {
      const response = await fetch(`${baseUrl}?page=${page}`, {
        headers: { Accept: "application/json" },
      });
      const data = await response.json();
      const normalized = (data.data || []).map((p) => ({
        ...p,
        employees: Array.isArray(p.employees) ? p.employees : [],
      }));
      setParties(normalized);
      setLastPage(data.meta?.last_page || 1);
    } catch (error) {
      console.error("Fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllParties = async () => {
  setLoading(true);
  try {
    let page = 1;
    let last = 1;
    let all = [];

    do {
      const res = await fetch(`${baseUrl}?page=${page}`, {
        headers: { Accept: "application/json" },
      });
      const data = await res.json();
      all = [...all, ...(data.data || [])];
      last = data.meta?.last_page || 1;
      page++;
    } while (page <= last);

    setAllParties(all);
    return all;
  } catch (err) {
    console.error(err);
    return [];
  } finally {
    setLoading(false);
  }
};


  const fetchEmployees = async () => {
    try {
      const res = await fetch(
        "https://www.izemak.com/azimak/public/api/employees",
        { headers: { Accept: "application/json" } }
      );
      if (!res.ok) throw new Error("no employees API");
      const data = await res.json();
      setEmployees(data?.data || data || []);
    } catch (err) {
      console.warn("Employees fetch failed — using fallback sample list.", err);
      setEmployees([
        { id: 1, name: "Ahmad Ali" },
        { id: 2, name: "Mona Hassan" },
        { id: 3, name: "Omar Mahmoud" },
      ]);
    }
  };

  useEffect(() => {
    fetchParties(currentPage);
    fetchEmployees();
  }, [currentPage]);

  const confirmDelete = (index) => {
    setDeleteIndex(index);
    setDeletePartyName(parties[index].name);
    setShowModal(true);
  };

  const handleDelete = async () => {
    if (deleteIndex === null) return;
    try {
      const deleteUrl =
        "https://www.izemak.com/azimak/public/api/deleteparty/" +
        parties[deleteIndex].id;
      await fetch(deleteUrl, {
        method: "DELETE",
        headers: { Accept: "application/json" },
      });
      setParties(parties.filter((_, i) => i !== deleteIndex));
      setShowModal(false);
      setDeleteIndex(null);
      setDeletePartyName("");
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

const handleSearch = async () => {
  setSearchPerformed(true);

  if (!searchTerm.trim()) {
    fetchParties(currentPage);
    return;
  }

  const data =
    allParties.length > 0 ? allParties : await fetchAllParties();

  const result = data.filter((party) =>
    (party.name || "")
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

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
      const response = await fetch(
        "https://www.izemak.com/azimak/public/api/update/party",
        {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ id: editPartyId, name: editPartyName }),
        }
      );
      const data = await response.json();
      if (data.success || response.ok) {
        const updated = parties.map((p) =>
          p.id === editPartyId ? { ...p, name: editPartyName } : p
        );
        setParties(updated);
        setShowEditModal(false);
      } else alert("error");
    } catch (error) {
      console.error("Edit error:", error);
    }
  };

  const renderPageNumbers = () => {
    const pages = [];
    const maxPagesToShow = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
    let endPage = Math.min(lastPage, startPage + maxPagesToShow - 1);
    if (endPage - startPage < maxPagesToShow - 1) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }
    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => setCurrentPage(i)}
          className={`pageNumber ${i === currentPage ? "active" : ""}`}
        >
          {i}
        </button>
      );
    }
    return pages;
  };

  const toggleDropdown = (index) => {
    setOpenDropdownIndex((prev) => (prev === index ? null : index));
  };

  const addEmployeeToParty = async (partyId, employee) => {
    const party = parties.find((p) => p.id === partyId);
    if (party?.employees?.some((e) => e.id === employee.id)) {
      setOpenDropdownIndex(null);
      alert(`${employee.name} Already in the party`);
      return;
    }

    setAddingIndex(partyId);

    try {
      const url = "https://www.izemak.com/azimak/public/api/party/employee";
      const res = await fetch(url, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ party_id: partyId, employee_id: employee.id }),
      });
      const data = await res.json();

      if (res.ok || data.success) {
        setParties((prev) =>
          prev.map((p) =>
            p.id === partyId
              ? { ...p, employees: [...p.employees, employee] }
              : p
          )
        );
        setOpenDropdownIndex(null);
      } else {
        console.error("Add employee failed:", data);
        alert("Failed to add employee");
      }
    } catch (err) {
      console.error("Add employee error:", err);
      alert("Error");
    } finally {
      setAddingIndex(null);
    }
  };

  return (
    <main className="mainOfMainPartyData">
      <div className="addParty">
        <button className="Btn">
          <Link to="/createnewparty">
            <GiPartyPopper />
            <p>Add a new party</p>
          </Link>
        </button>
        <div className="search">
          <button className="Btn" onClick={handleSearch}>
            search
          </button>
          <IoSearchSharp />
          <input
            type="search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) =>
              e.key === "Enter" && (e.preventDefault(), handleSearch())
            }
          />
        </div>
        <div>
          <button className="Btn">
            <Link to="/deletedparties">
              <MdRestore />
              <p>Recover deleted parties</p>
            </Link>
          </button>
        </div>

        <div>
          <button className="accessbtn">
            <Link to="/add_a_hotel">
              <FaHotel />
              <p>Add a Hotel</p>
            </Link>
          </button>
        </div>

        <div>
          <button className="accessbtn">
            <Link to="/access_staff">
              <RiUserSettingsLine />
              <p>Staff</p>
            </Link>
          </button>
        </div>
        <div>
          <Link to="/">
            <img src="/اعزمك-01.png" alt="logo" />
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="loadingSpinner">
          <div className="spinner"></div>
          <p>Loading...</p>
        </div>
      ) : (
        <>
          <table className="partyTable">
            <thead>
              <tr>
                <th>Party name</th>
                <th>Party time</th>
                <th>Party address</th>
                <th>Add Employee</th>
                <th>procedures</th>
              </tr>
            </thead>
            <tbody>
              {parties.length > 0 ? (
                parties.map((party, index) => (
                  <tr key={party.id ?? index}>
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

                    <td className="employeeCell">
                      {party.employee?.length > 0 ? (
                        <div className="assignedList">
                          <span className="assignedItem">{party.employee}</span>
                        </div>
                      ) : (
                        <button
                          className="AddEmployee"
                          onClick={() => toggleDropdown(index)}
                        >
                          Add Employee
                        </button>
                      )}

                      {openDropdownIndex === index && (
                        <ul role="listbox" className="employeeDropdown">
                          {employees.length > 0 ? (
                            employees.map((emp) => (
                              <li key={emp.id} className="employeeItem">
                                <button
                                  type="button"
                                  onClick={() =>
                                    addEmployeeToParty(party.id, emp)
                                  }
                                  className="employeeBtn"
                                  disabled={addingIndex === party.id}
                                >
                                  {emp.name}
                                </button>
                              </li>
                            ))
                          ) : (
                            <li className="employeeItem">No employees</li>
                          )}
                        </ul>
                      )}
                    </td>

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
                          state={{ partyId: party?.id, partyName: party?.name }}
                        >
                          <FaUserEdit />
                        </Link>
                      </button>
                    </td>
                  </tr>
                ))
              ) : searchPerformed ? (
                <tr>
                  <td colSpan="5" className="empty">
                    No matching results found
                  </td>
                </tr>
              ) : (
                <tr>
                  <td colSpan="5" className="empty">
                    There is no data in the table
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          <div className="pages">
            {currentPage > 5 && (
              <button className="prev" onClick={goToPrevPage}>
                Previous
              </button>
            )}
            {renderPageNumbers()}
            <button
              className="next"
              onClick={goToNextPage}
              disabled={currentPage === lastPage}
            >
              Next
            </button>
          </div>
        </>
      )}

      {showModal && (
        <div className="modalOverlay">
          <div className="modal">
            <h3> Are you sure you want to delete {deletePartyName} ؟</h3>
            <div className="modalActions">
              <button className="confirmBtn" onClick={handleDelete}>
                yes
              </button>
              <button className="cancelBtn" onClick={() => setShowModal(false)}>
                no
              </button>
            </div>
          </div>
        </div>
      )}

      {showEditModal && (
        <div className="modalOverlay">
          <div className="modal">
            <h3>Edit party name</h3>
            <input
              type="text"
              value={editPartyName}
              onChange={(e) => setEditPartyName(e.target.value)}
            />
            <div className="modalActions">
              <button className="confirmBtn" onClick={handleEditSubmit}>
                Save
              </button>
              <button
                className="cancelBtn"
                onClick={() => setShowEditModal(false)}
              >
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
