import React from 'react';

/**
 * Vacation requests table component
 * @param {Object} props
 * @param {Array} props.requests - Array of vacation request objects
 * @param {Object|null} props.selectedRequest - Currently selected request
 * @param {Function} props.onSelectRequest - Callback when a request is selected
 * @param {Function} props.onEditReason - Callback when edit reason is clicked
 */
export default function VacationTable({ requests, selectedRequest, onSelectRequest, onEditReason }) {
    const cardStyle = {
        border: 'none',
        borderRadius: '16px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.08), 0 1px 3px rgba(0,0,0,0.05)',
        background: '#ffffff',
        overflow: 'hidden'
    };

    const headerStyle = {
        background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
        borderBottom: '2px solid #e2e8f0'
    };

    const escapeHtml = (str) => {
        return String(str)
            .replaceAll('&', '&amp;')
            .replaceAll('<', '&lt;')
            .replaceAll('>', '&gt;')
            .replaceAll('"', '&quot;')
            .replaceAll("'", '&#39;');
    };

    const handleRowClick = (request) => {
        onSelectRequest(request);
    };

    const handleEditClick = (e, request) => {
        e.stopPropagation();
        onEditReason(request);
    };

    return (
        <div className="card" style={cardStyle}>
            <div className="card-body" style={{ padding: '0' }}>
                <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0" style={{ fontSize: '0.875rem' }}>
                        <thead style={headerStyle}>
                            <tr>
                                <th style={{ 
                                    width: '60px', 
                                    fontSize: '0.75rem', 
                                    fontWeight: '600', 
                                    color: '#475569',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.5px',
                                    padding: '1rem 0.75rem',
                                    border: 'none'
                                }}>ID</th>
                                <th style={{ 
                                    width: '180px', 
                                    fontSize: '0.75rem', 
                                    fontWeight: '600', 
                                    color: '#475569',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.5px',
                                    padding: '1rem 0.75rem',
                                    border: 'none'
                                }}>Name</th>
                                <th style={{ 
                                    width: '120px', 
                                    fontSize: '0.75rem', 
                                    fontWeight: '600', 
                                    color: '#475569',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.5px',
                                    padding: '1rem 0.75rem',
                                    border: 'none'
                                }}>From Date</th>
                                <th style={{ 
                                    width: '120px', 
                                    fontSize: '0.75rem', 
                                    fontWeight: '600', 
                                    color: '#475569',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.5px',
                                    padding: '1rem 0.75rem',
                                    border: 'none'
                                }}>To Date</th>
                                <th style={{ 
                                    width: '120px', 
                                    fontSize: '0.75rem', 
                                    fontWeight: '600', 
                                    color: '#475569',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.5px',
                                    padding: '1rem 0.75rem',
                                    border: 'none'
                                }}>Start Time</th>
                                <th style={{ 
                                    width: '100px', 
                                    fontSize: '0.75rem', 
                                    fontWeight: '600', 
                                    color: '#475569',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.5px',
                                    padding: '1rem 0.75rem',
                                    border: 'none'
                                }}>Hours</th>
                                <th style={{ 
                                    width: '320px', 
                                    fontSize: '0.75rem', 
                                    fontWeight: '600', 
                                    color: '#475569',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.5px',
                                    padding: '1rem 0.75rem',
                                    border: 'none'
                                }}>Reason</th>
                                <th style={{ 
                                    width: '110px', 
                                    fontSize: '0.75rem', 
                                    fontWeight: '600', 
                                    color: '#475569',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.5px',
                                    padding: '1rem 0.75rem',
                                    border: 'none'
                                }}>Approved</th>
                            </tr>
                        </thead>
                        <tbody>
                            {requests.map((request) => {
                                const id = request['Vacation ID'];
                                const name = request['Employee'];
                                const fromDate = request['From Date'];
                                const toDate = request['To Date'];
                                const startTime = request['Start Time'];
                                const hours = request['Hours'];
                                const reason = request['Reason'];
                                const approved = request['Approved'] === true;
                                const isSelected = selectedRequest && selectedRequest['Vacation ID'] === id;

                                const rowStyle = {
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease',
                                    borderBottom: '1px solid #f1f5f9'
                                };

                                const cellStyle = {
                                    padding: '1rem 0.75rem',
                                    fontSize: '0.875rem',
                                    color: '#374151',
                                    fontWeight: '400',
                                    border: 'none'
                                };

                                return (
                                    <tr 
                                        key={id}
                                        className={`${isSelected ? 'table-active' : ''}`}
                                        style={{
                                            ...rowStyle,
                                            backgroundColor: isSelected ? '#f0f9ff' : 'transparent'
                                        }}
                                        onClick={() => handleRowClick(request)}
                                        onMouseEnter={(e) => {
                                            if (!isSelected) {
                                                e.target.closest('tr').style.backgroundColor = '#f8fafc';
                                            }
                                        }}
                                        onMouseLeave={(e) => {
                                            if (!isSelected) {
                                                e.target.closest('tr').style.backgroundColor = 'transparent';
                                            }
                                        }}
                                    >
                                        <td style={cellStyle}>
                                            <span className="fw-medium" style={{ color: '#1e40af' }}>{id}</span>
                                        </td>
                                        <td style={cellStyle}>
                                            <span className="fw-medium">{escapeHtml(name ?? '')}</span>
                                        </td>
                                        <td style={cellStyle}>{escapeHtml(String(fromDate ?? ''))}</td>
                                        <td style={cellStyle}>{escapeHtml(String(toDate ?? ''))}</td>
                                        <td style={cellStyle}>{escapeHtml(String(startTime ?? ''))}</td>
                                        <td style={cellStyle}>{escapeHtml(String(hours ?? ''))}</td>
                                        <td style={cellStyle}>
                                            <div className="d-flex align-items-center justify-content-between">
                                                <span 
                                                    className="reason-text flex-grow-1" 
                                                    style={{ 
                                                        whiteSpace: 'pre-wrap',
                                                        fontSize: '0.875rem',
                                                        marginRight: '0.75rem',
                                                        lineHeight: '1.4'
                                                    }}
                                                >
                                                    {escapeHtml(reason ?? '')}
                                                </span>
                                                <button
                                                    type="button"
                                                    className="btn btn-sm btn-outline-primary"
                                                    onClick={(e) => handleEditClick(e, request)}
                                                    title="Edit reason"
                                                    style={{
                                                        minWidth: '36px',
                                                        height: '32px',
                                                        padding: '0',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        borderRadius: '8px',
                                                        border: '1px solid #e2e8f0',
                                                        background: 'white',
                                                        color: '#64748b',
                                                        transition: 'all 0.2s ease'
                                                    }}
                                                    onMouseEnter={(e) => {
                                                        e.target.style.background = '#f1f5f9';
                                                        e.target.style.color = '#1e40af';
                                                        e.target.style.borderColor = '#bfdbfe';
                                                    }}
                                                    onMouseLeave={(e) => {
                                                        e.target.style.background = 'white';
                                                        e.target.style.color = '#64748b';
                                                        e.target.style.borderColor = '#e2e8f0';
                                                    }}
                                                >
                                                    <i className="bi bi-pencil" style={{ fontSize: '0.75rem' }}></i>
                                                </button>
                                            </div>
                                        </td>
                                        <td style={cellStyle}>
                                            <span 
                                                className={`badge ${approved ? 'bg-success' : 'bg-secondary'}`}
                                                style={{
                                                    fontSize: '0.75rem',
                                                    fontWeight: '500',
                                                    padding: '0.5rem 0.75rem',
                                                    borderRadius: '12px',
                                                    backgroundColor: approved ? '#059669' : '#6b7280'
                                                }}
                                            >
                                                {approved ? (
                                                    <>
                                                        <i className="bi bi-check-circle me-1" style={{ fontSize: '0.625rem' }}></i>
                                                        Approved
                                                    </>
                                                ) : (
                                                    <>
                                                        <i className="bi bi-clock me-1" style={{ fontSize: '0.625rem' }}></i>
                                                        Pending
                                                    </>
                                                )}
                                            </span>
                                        </td>
                                    </tr>
                                );
                            })}
                            {requests.length === 0 && (
                                <tr>
                                    <td colSpan="8" className="text-center text-muted" style={{ padding: '3rem 1rem' }}>
                                        <div style={{ opacity: '0.6' }}>
                                            <i className="bi bi-inbox" style={{ fontSize: '2rem', display: 'block', marginBottom: '0.5rem' }}></i>
                                            <span style={{ fontSize: '0.875rem', fontWeight: '500' }}>No vacation requests found</span>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
