import React from 'react';

/**
 * Floating approval actions component
 * @param {Object} props
 * @param {Object|null} props.selectedRequest - Currently selected request
 * @param {Function} props.onApprove - Callback when approve is clicked
 */
export default function ApprovalActions({ selectedRequest, onApprove }) {
    const isDisabled = !selectedRequest || selectedRequest['Approved'] === true;

    const buttonStyle = {
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        zIndex: 1050,
        borderRadius: '12px',
        padding: '14px 28px',
        fontSize: '1rem',
        fontWeight: '600',
        letterSpacing: '-0.01em',
        border: 'none',
        background: isDisabled ? '#6c757d' : '#1976d2',
        color: 'white',
        transition: 'all 0.2s ease',
        boxShadow: '0 4px 12px rgba(25, 118, 210, 0.3)',
        cursor: isDisabled ? 'not-allowed' : 'pointer'
    };

    const handleMouseEnter = (e) => {
        if (!isDisabled) {
            e.target.style.background = '#1565c0';
            e.target.style.transform = 'translateY(-2px)';
            e.target.style.boxShadow = '0 6px 16px rgba(25, 118, 210, 0.4)';
        }
    };

    const handleMouseLeave = (e) => {
        if (!isDisabled) {
            e.target.style.background = '#1976d2';
            e.target.style.transform = 'translateY(0)';
            e.target.style.boxShadow = '0 4px 12px rgba(25, 118, 210, 0.3)';
        }
    };

    return (
        <button
            style={buttonStyle}
            disabled={isDisabled}
            onClick={onApprove}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            title={isDisabled ? 'Select an unapproved request to approve' : 'Approve selected request'}
        >
            <i className="bi bi-check-circle me-2"></i>
            Approve
        </button>
    );
}
