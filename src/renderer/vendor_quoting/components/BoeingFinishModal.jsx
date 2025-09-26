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
                                    {/* Results List */}
                                    {data.results && data.results.length > 0 ? (
                                        data.results.map((result, resultIndex) => (
                                            <div key={resultIndex} className="card mb-4">
                                                <div className="card-header">
                                                    <h6 className="card-title mb-0">
                                                        {result.process_code}
                                                        <small className="text-muted ms-2">({result.suppliers.length} supplier{result.suppliers.length !== 1 ? 's' : ''})</small>
                                                    </h6>
                                                </div>
                                                <div className="card-body">
                                                    <p className="card-text mb-3">{result.nomenclature}</p>
                                                    <div className="row mb-3">
                                                        <div className="col-md-6">
                                                            <small className="text-muted">Specification Number:</small>
                                                            <div className="fw-medium">{result.specification_number}</div>
                                                        </div>
                                                        <div className="col-md-6">
                                                            <small className="text-muted">Specification Title:</small>
                                                            <div className="fw-medium">{result.specification_title}</div>
                                                        </div>
                                                    </div>

                                                    {result.url && (
                                                        <div className="mb-3">
                                                            <a
                                                                href={result.url}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="btn btn-sm btn-outline-primary"
                                                            >
                                                                <i className="bi bi-box-arrow-up-right me-1"></i>
                                                                View on Boeing
                                                            </a>
                                                        </div>
                                                    )}

                                                    {/* Suppliers Table for this result */}
                                                    <div>
                                                        <h6 className="mb-2">Approved Suppliers</h6>
                                                        {result.suppliers && result.suppliers.length > 0 ? (
                                                            <div className="table-responsive">
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
                                                                        {result.suppliers.map((supplier, supplierIndex) => (
                                                                            <tr key={supplierIndex}>
                                                                                <td>{supplier.country}</td>
                                                                                <td>{supplier.state || "—"}</td>
                                                                                <td>{supplier.processor_code}</td>
                                                                                <td>{supplier.processor_name}</td>
                                                                            </tr>
                                                                        ))}
                                                                    </tbody>
                                                                </table>
                                                            </div>
                                                        ) : (
                                                            <p className="text-muted">No approved suppliers found for this process code.</p>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="alert alert-warning">
                                            No results found for "{data.search_term}". Try a different search term.
                                        </div>
                                    )}
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
