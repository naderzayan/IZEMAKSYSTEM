import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "../style/_accessStaff.scss";
import { MdDelete } from "react-icons/md";
import Footer from "../components/Footer";

export default function AccessStaff() {
    const [parties, setParties] = useState([]);
    const [searchPerformed] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [lastPage, setLastPage] = useState(1);
    const [loading, setLoading] = useState(false);

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

    const goToNextPage = () => {
        if (currentPage < lastPage) setCurrentPage((prev) => prev + 1);
    };

    const goToPrevPage = () => {
        if (currentPage > 1) setCurrentPage((prev) => prev - 1);
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

    return (
        <main className="mainOfAccessStaff">
            <div className="addEmployee">
                <button className="Btn">
                    <Link to="/create_employee">Add employee</Link>
                </button>
                <div>
                    <Link to='/mainpartydata'><img src="/اعزمك-01.png" alt="" /></Link>
                </div>
            </div>

            {loading ? (
                <div className="loadingSpinner">
                    <div className="spinner"></div>
                    <p>Loading...</p>
                </div>
            ) : (
                <>
                    <table className="accessTable">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Phone Number</th>
                                <th>Email</th>
                                <th>Delete</th>
                            </tr>
                        </thead>
                        <tbody>
                                    <tr>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td>
                                            <MdDelete />
                                        </td>
                                    </tr>
                        </tbody>
                    </table>

                    <div className="pages">
                        {currentPage > 5 && (
                            <button
                                className="prev"
                                onClick={goToPrevPage}
                            >
                                السابقة
                            </button>
                        )}

                        {renderPageNumbers()}

                        <button
                            className="next"
                            onClick={goToNextPage}
                            disabled={currentPage === lastPage}
                        >
                            التالية
                        </button>
                    </div>
                </>
            )}
            <Footer />
        </main>
    );
}
