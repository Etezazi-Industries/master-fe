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

    const cardStyle = {
        border: '1px solid #e9ecef',
        borderRadius: '16px',
        boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
        background: '#ffffff'
    };

    return (
        <div className="card" style={cardStyle}>
            <div className="card-body" style={{ padding: '2rem' }}>
                {/* Clean title */}
                <h5 className="mb-4 fw-semibold text-dark" style={{ 
                    fontSize: '1.25rem',
                    fontWeight: '600',
                    letterSpacing: '-0.02em',
                    color: '#1a1a1a'
                }}>
                    Search RFQ/Item
                </h5>
                {/* Top row: Type selector and search input */}
                <div className="row g-3 mb-3">
                    <div className={searchType === 'Item' ? 'col-md-2' : 'col-md-3'}>
                        <label htmlFor="type-select-box" className="form-label fw-medium" style={{ 
                            fontSize: '0.875rem',
                            fontWeight: '500',
                            color: '#374151',
                            marginBottom: '0.5rem'
                        }}>Type</label>
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
                        <label htmlFor="rfq-or-item-search" className="form-label fw-medium" style={{ 
                            fontSize: '0.875rem',
                            fontWeight: '500',
                            color: '#374151',
                            marginBottom: '0.5rem'
                        }}>Search Query</label>
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
                            <label htmlFor="item-qty" className="form-label fw-medium" style={{ 
                                fontSize: '0.875rem',
                                fontWeight: '500',
                                color: '#374151',
                                marginBottom: '0.5rem'
                            }}>Quantity</label>
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
                            <label className="form-label fw-medium" style={{ 
                                fontSize: '0.875rem',
                                fontWeight: '500',
                                color: '#374151',
                                marginBottom: '0.5rem'
                            }}>Search Results</label>
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
