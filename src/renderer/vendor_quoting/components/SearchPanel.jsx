import React, { useState } from 'react';

export default function SearchPanel({ 
    onSearch, 
    searchResults = [], 
    selectedResult, 
    onResultSelect,
    quantity,
    onQuantityChange,
    isSearching = false 
}) {
    const [searchType, setSearchType] = useState('');
    const [searchQuery, setSearchQuery] = useState('');

    const handleSearch = () => {
        if (!searchQuery.trim() || !searchType) return;
        onSearch?.(searchQuery.trim(), searchType);
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleSearch();
        }
    };

    const materialCardStyle = {
        borderRadius: '12px',
        border: 'none',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1), 0 1px 3px rgba(0,0,0,0.08)',
        overflow: 'hidden'
    };

    const materialHeaderStyle = {
        background: 'linear-gradient(135deg, #263238 0%, #37474f 100%)',
        padding: '1rem 1.5rem',
        borderBottom: 'none',
        borderLeft: '4px solid #1976d2'
    };

    return (
        <div className="card" style={materialCardStyle}>
            <div className="card-header text-white" style={materialHeaderStyle}>
                <h6 className="mb-0 fw-bold">Search RFQ/Item</h6>
            </div>
            <div className="card-body">
                {/* Top row: Type selector and search input */}
                <div className="row g-3 mb-3">
                    <div className={searchType === 'Item' ? 'col-md-2' : 'col-md-3'}>
                        <label htmlFor="type-select-box" className="form-label text-dark fw-semibold">Type</label>
                        <select 
                            className="form-select" 
                            id="type-select-box"
                            value={searchType}
                            onChange={(e) => setSearchType(e.target.value)}
                        >
                            <option value="">-- Select --</option>
                            <option value="Item">Item</option>
                            <option value="RFQ">RFQ</option>
                        </select>
                    </div>
                    <div className={searchType === 'Item' ? 'col-md-7' : 'col-md-9'}>
                        <label htmlFor="rfq-or-item-search" className="form-label text-dark fw-semibold">Search Query</label>
                        <div className="input-group">
                            <input 
                                type="text" 
                                className="form-control" 
                                id="rfq-or-item-search"
                                placeholder={searchType ? `Enter ${searchType} identifier` : "Select type first"}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onKeyPress={handleKeyPress}
                            />
                            <button 
                                className={`btn btn-success ${isSearching ? 'disabled' : ''}`}
                                type="button" 
                                id="search-button"
                                onClick={handleSearch}
                                disabled={isSearching || !searchQuery.trim() || !searchType}
                            >
                                {isSearching ? (
                                    <>
                                        <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                                        Searching...
                                    </>
                                ) : (
                                    'Search'
                                )}
                            </button>
                        </div>
                    </div>
                    {/* Quantity field - only show for Item type */}
                    {searchType === 'Item' && (
                        <div className="col-md-3">
                            <label htmlFor="item-qty" className="form-label text-dark fw-semibold">Quantity</label>
                            <input 
                                type="number" 
                                className="form-control" 
                                id="item-qty" 
                                min="1" 
                                placeholder="Qty"
                                value={quantity}
                                onChange={(e) => onQuantityChange?.(parseInt(e.target.value) || 1)}
                            />
                        </div>
                    )}
                </div>

                {/* Dynamic Results section */}
                {(isSearching || searchResults.length > 0) && (
                    <div className="row">
                        <div className="col-12">
                            <label className="form-label text-dark fw-semibold">Search Results</label>
                            <div 
                                className="border rounded p-2 bg-light" 
                                style={{ height: '120px', overflowY: 'auto' }}
                            >
                                {isSearching ? (
                                    <div className="d-flex align-items-center justify-content-center h-100">
                                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                        <span className="text-muted">Loading results...</span>
                                    </div>
                                ) : searchResults.length === 0 ? (
                                    <div className="d-flex align-items-center justify-content-center h-100">
                                        <span className="text-muted">No results found</span>
                                    </div>
                                ) : (
                                    <div className="list-group list-group-flush">
                                        {searchResults.map((result, index) => (
                                            <button
                                                key={index}
                                                type="button"
                                                className={`list-group-item list-group-item-action ${
                                                    selectedResult === result.value ? 'active' : ''
                                                }`}
                                                onClick={() => onResultSelect?.(result.value)}
                                            >
                                                {result.label}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
