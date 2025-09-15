import React, { useState } from "react";
import { createRoot } from "react-dom/client";
import { searchBoeingFinishCode } from "../../api_calls.js";

function BoeingFinishModal({ onClose }) {
    const [query, setQuery] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [data, setData] = useState(null);

    const handleSearch = async () => {
        const trimmedQuery = query.trim();
        if (!trimmedQuery) return;

        setLoading(true);
        setError(null);
        setData(null);

        try {
            const result = await searchBoeingFinishCode(trimmedQuery);
            if (result && result.error) {
                setError(result.error);
            } else {
                setData(result);
            }
        } catch (err) {
            setError(err.message || "An error occurred while searching");
        } finally {
            setLoading(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            handleSearch();
        }
    };

    const isSearchDisabled = loading || !query.trim();

    return (
        <div className="modal fade show" style={{ display: "block" }} tabIndex="-1">
            <div className="modal-dialog modal-lg">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">Boeing finish codes</h5>
                        <button
                            type="button"
                            className="btn-close"
                            onClick={onClose}
                            aria-label="Close"
                        ></button>
                    </div>
                    <div className="modal-body">
                        {/* Search Input */}
                        <div className="mb-3">
                            <div className="input-group">
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Search finish code…"
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    onKeyPress={handleKeyPress}
                                />
                                <button
                                    className="btn btn-primary"
                                    type="button"
                                    onClick={handleSearch}
                                    disabled={isSearchDisabled}
                                >
                                    {loading ? "Searching..." : "Search"}
                                </button>
                            </div>
                            <div className="form-text text-muted">Press Enter to search.</div>
                        </div>

                        {/* Results Area */}
                        <div className="results-area">
                            {loading && (
                                <div className="text-center py-4">
                                    <div className="spinner-border spinner-border-sm me-2" role="status">
                                        <span className="visually-hidden">Loading...</span>
                                    </div>
                                    Loading...
                                </div>
                            )}

                            {error && (
                                <div className="alert alert-danger alert-dismissible" role="alert">
                                    {error}
                                    <button
                                        type="button"
                                        className="btn-close"
                                        onClick={() => setError(null)}
                                        aria-label="Close"
                                    ></button>
                                </div>
                            )}

                            {data && !loading && !error && (
                                <div>
                                    {/* Summary Card */}
                                    <div className="card mb-3">
                                        <div className="card-body">
                                            <h6 className="card-title">{data.process_code}</h6>
                                            <p className="card-text">{data.nomenclature}</p>
                                            <div className="row">
                                                <div className="col-md-6">
                                                    <small className="text-muted">Specification Number:</small>
                                                    <div>{data.specification_number}</div>
                                                </div>
                                                <div className="col-md-6">
                                                    <small className="text-muted">Specification Title:</small>
                                                    <div>{data.specification_title}</div>
                                                </div>
                                            </div>
                                            {data.url && (
                                                <div className="mt-2">
                                                    <a
                                                        href={data.url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="btn btn-sm btn-outline-primary"
                                                    >
                                                        View on Boeing
                                                    </a>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Suppliers Table */}
                                    <div>
                                        <h6>Approved Suppliers</h6>
                                        {data.suppliers && data.suppliers.length > 0 ? (
                                            <table className="table table-sm table-striped">
                                                <thead>
                                                    <tr>
                                                        <th>Country</th>
                                                        <th>State</th>
                                                        <th>Processor Code</th>
                                                        <th>Processor Name</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {data.suppliers.map((supplier, index) => (
                                                        <tr key={index}>
                                                            <td>{supplier.country}</td>
                                                            <td>{supplier.state || "—"}</td>
                                                            <td>{supplier.processor_code}</td>
                                                            <td>{supplier.processor_name}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        ) : (
                                            <p className="text-muted">No approved suppliers found.</p>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn btn-secondary" onClick={onClose}>
                            Close
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

let modalRoot = null;
let modalContainer = null;

export function openBoeingFinishModal() {
    // Ensure container exists
    if (!modalContainer) {
        modalContainer = document.getElementById("boeing-finish-modal-root");
        if (!modalContainer) {
            modalContainer = document.createElement("div");
            modalContainer.id = "boeing-finish-modal-root";
            document.body.appendChild(modalContainer);
        }
    }

    // Create root if needed
    if (!modalRoot) {
        modalRoot = createRoot(modalContainer);
    }

    const handleClose = () => {
        if (modalRoot && modalContainer) {
            modalRoot.unmount();
            modalRoot = null;
            if (modalContainer.parentNode) {
                modalContainer.parentNode.removeChild(modalContainer);
            }
            modalContainer = null;
        }
    };

    // Render the modal
    modalRoot.render(
        React.createElement(BoeingFinishModal, { onClose: handleClose })
    );
}
