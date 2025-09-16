import React, { useState, useEffect, useCallback } from 'react';
import { getPartyData, getBuyers } from '../../api_calls.js';

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
    
    // RFQ search states
    const [rfqSearchBy, setRfqSearchBy] = useState('');
    const [customerRfqNumber, setCustomerRfqNumber] = useState('');
    const [selectedParty, setSelectedParty] = useState('');
    const [selectedBuyer, setSelectedBuyer] = useState('');
    
    // Data states
    const [parties, setParties] = useState([]);
    const [buyers, setBuyers] = useState([]);
    const [loadingBuyers, setLoadingBuyers] = useState(false);
    const [buyersCache, setBuyersCache] = useState({});

    // Load parties on component mount
    useEffect(() => {
        const loadParties = async () => {
            try {
                const partyData = await getPartyData();
                const partyOptions = Object.entries(partyData).map(([pk, name]) => ({
                    value: Number(pk),
                    label: name
                }));
                setParties(partyOptions);
            } catch (error) {
                console.error('Failed to load parties:', error);
                setParties([]);
            }
        };
        
        loadParties();
    }, []);

    // Load buyers when party changes
    const loadBuyersForParty = useCallback(async (partyId) => {
        if (!partyId) {
            setBuyers([]);
            return;
        }

        // Check cache first
        if (buyersCache[partyId]) {
            setBuyers(buyersCache[partyId]);
            return;
        }

        setLoadingBuyers(true);
        try {
            const buyerData = await getBuyers(partyId);
            const buyerOptions = Object.entries(buyerData).map(([pk, name]) => ({
                value: Number(pk),
                label: name
            }));
            setBuyers(buyerOptions);
            
            // Cache the results
            setBuyersCache(prev => ({
                ...prev,
                [partyId]: buyerOptions
            }));
        } catch (error) {
            console.error('Failed to load buyers:', error);
            setBuyers([]);
        } finally {
            setLoadingBuyers(false);
        }
    }, [buyersCache]);

    // Handle party selection
    const handlePartyChange = (partyId) => {
        setSelectedParty(partyId);
        setSelectedBuyer(''); // Reset buyer selection
        if (partyId) {
            loadBuyersForParty(partyId);
        } else {
            setBuyers([]);
        }
    };

    // Handle search type change
    const handleSearchTypeChange = (type) => {
        setSearchType(type);
        // Reset RFQ specific states when switching away from RFQ
        if (type !== 'RFQ') {
            setRfqSearchBy('');
            setCustomerRfqNumber('');
            setSelectedParty('');
            setSelectedBuyer('');
            setBuyers([]);
        }
        // Reset general search when switching to RFQ
        if (type === 'RFQ') {
            setSearchQuery('');
        }
    };

    // Handle RFQ search
    const handleRfqSearch = () => {
        const params = new URLSearchParams();

        switch (rfqSearchBy) {
            case 'customer_rfq_number':
                if (!customerRfqNumber.trim()) return;
                params.set('customer_rfq_number', customerRfqNumber.trim());
                break;
            
            case 'customer':
                if (!selectedParty) return;
                params.set('customer_pk', selectedParty);
                break;
            
            case 'buyer_by_party':
                if (!selectedBuyer) return;
                params.set('buyer_pk', selectedBuyer);
                break;
            
            case 'customer_and_buyer':
                if (!selectedParty || !selectedBuyer) return;
                params.set('customer_pk', selectedParty);
                params.set('buyer_pk', selectedBuyer);
                break;
            
            default:
                return;
        }

        // For RFQ searches, we need to pass the params object differently
        // The existing searchRfqOrItem expects a simple string for /rfqs/{value}
        // But we need /rfqs with query parameters, so we'll pass a special format
        onSearch?.(params.toString(), 'RFQ_PARAMS');
    };

    const handleSearch = () => {
        if (searchType === 'RFQ') {
            handleRfqSearch();
        } else {
            if (!searchQuery.trim() || !searchType) return;
            onSearch?.(searchQuery.trim(), searchType);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleSearch();
        }
    };

    // Check if RFQ search is ready
    const isRfqSearchReady = () => {
        switch (rfqSearchBy) {
            case 'customer_rfq_number':
                return customerRfqNumber.trim();
            case 'customer':
                return selectedParty;
            case 'buyer_by_party':
                return selectedBuyer;
            case 'customer_and_buyer':
                return selectedParty && selectedBuyer;
            default:
                return false;
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
                            onChange={(e) => handleSearchTypeChange(e.target.value)}
                        >
                            <option value="">-- Select --</option>
                            <option value="Item">Item</option>
                            <option value="RFQ">RFQ</option>
                        </select>
                    </div>
                    {searchType === 'RFQ' ? (
                        <div className="col-md-9">
                            <label htmlFor="rfq-search-by" className="form-label fw-medium" style={{ 
                                fontSize: '0.875rem',
                                fontWeight: '500',
                                color: '#374151',
                                marginBottom: '0.5rem'
                            }}>Search by</label>
                            <select 
                                className="form-select" 
                                id="rfq-search-by"
                                value={rfqSearchBy}
                                onChange={(e) => setRfqSearchBy(e.target.value)}
                            >
                                <option value="">-- Select Search Method --</option>
                                <option value="customer_rfq_number">Customer RFQ #</option>
                                <option value="customer">Customer</option>
                                <option value="buyer_by_party">Buyer (by Party)</option>
                                <option value="customer_and_buyer">Customer + Buyer</option>
                            </select>
                        </div>
                    ) : (
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
                                    onKeyDown={handleKeyPress}
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
                    )}
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

                {/* RFQ-specific input fields */}
                {searchType === 'RFQ' && rfqSearchBy && (
                    <div className="row g-3 mb-3">
                        {rfqSearchBy === 'customer_rfq_number' && (
                            <div className="col-md-8">
                                <label htmlFor="customer-rfq-number" className="form-label fw-medium" style={{ 
                                    fontSize: '0.875rem',
                                    fontWeight: '500',
                                    color: '#374151',
                                    marginBottom: '0.5rem'
                                }}>Customer RFQ Number</label>
                                <input 
                                    type="text" 
                                    className="form-control" 
                                    id="customer-rfq-number"
                                    placeholder="Enter Customer RFQ Number"
                                    value={customerRfqNumber}
                                    onChange={(e) => setCustomerRfqNumber(e.target.value)}
                                    onKeyDown={handleKeyPress}
                                />
                            </div>
                        )}

                        {(rfqSearchBy === 'customer' || rfqSearchBy === 'buyer_by_party' || rfqSearchBy === 'customer_and_buyer') && (
                            <div className="col-md-6">
                                <label htmlFor="party-select" className="form-label fw-medium" style={{ 
                                    fontSize: '0.875rem',
                                    fontWeight: '500',
                                    color: '#374151',
                                    marginBottom: '0.5rem'
                                }}>
                                    {rfqSearchBy === 'customer' ? 'Customer' : 'Party'}
                                </label>
                                <select 
                                    className="form-select" 
                                    id="party-select"
                                    value={selectedParty}
                                    onChange={(e) => handlePartyChange(e.target.value)}
                                >
                                    <option value="">-- Select Party --</option>
                                    {parties.map(party => (
                                        <option key={party.value} value={party.value}>
                                            {party.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}

                        {(rfqSearchBy === 'buyer_by_party' || rfqSearchBy === 'customer_and_buyer') && (
                            <div className="col-md-6">
                                <label htmlFor="buyer-select" className="form-label fw-medium" style={{ 
                                    fontSize: '0.875rem',
                                    fontWeight: '500',
                                    color: '#374151',
                                    marginBottom: '0.5rem'
                                }}>Buyer</label>
                                <select 
                                    className="form-select" 
                                    id="buyer-select"
                                    value={selectedBuyer}
                                    onChange={(e) => setSelectedBuyer(e.target.value)}
                                    disabled={!selectedParty || loadingBuyers}
                                >
                                    <option value="">
                                        {!selectedParty ? '-- Select Party First --' : 
                                         loadingBuyers ? 'Loading Buyers...' : 
                                         '-- Select Buyer --'}
                                    </option>
                                    {buyers.map(buyer => (
                                        <option key={buyer.value} value={buyer.value}>
                                            {buyer.label}
                                        </option>
                                    ))}
                                </select>
                                {loadingBuyers && (
                                    <small className="form-text text-muted">
                                        <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                                        Loading buyers...
                                    </small>
                                )}
                            </div>
                        )}

                        <div className="col-md-4 d-flex align-items-end">
                            <button 
                                className={`btn btn-success w-100 ${isSearching ? 'disabled' : ''}`}
                                type="button" 
                                id="rfq-search-button"
                                onClick={handleSearch}
                                disabled={isSearching || !isRfqSearchReady()}
                            >
                                {isSearching ? (
                                    <>
                                        <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                                        Searching...
                                    </>
                                ) : (
                                    'Search RFQs'
                                )}
                            </button>
                        </div>
                    </div>
                )}

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
                                                style={{ textAlign: 'left' }}
                                            >
                                                {result.rfqData ? (
                                                    // Enhanced display for RFQ search results
                                                    <div>
                                                        <div className="d-flex justify-content-between align-items-start">
                                                            <div>
                                                                <strong>RFQ #{result.rfqData.pk}</strong>
                                                                {result.rfqData.customer_rfq_number && (
                                                                    <span className="text-muted ms-2">
                                                                        ({result.rfqData.customer_rfq_number})
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <small className="text-muted">
                                                                {new Date(result.rfqData.created_at).toLocaleDateString()}
                                                            </small>
                                                        </div>
                                                        <div className="mt-1">
                                                            <small className="text-muted">
                                                                <i className="bi bi-building me-1"></i>
                                                                {result.rfqData.customer}
                                                                {result.rfqData.buyer && (
                                                                    <>
                                                                        <span className="mx-2">•</span>
                                                                        <i className="bi bi-person me-1"></i>
                                                                        {result.rfqData.buyer}
                                                                    </>
                                                                )}
                                                            </small>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    // Standard display for other search results
                                                    result.label
                                                )}
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
