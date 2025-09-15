import React from 'react';

export default function FooterActions({ onOpenPreview, isPreviewDisabled = false }) {
    const buttonStyle = {
        borderRadius: '12px',
        padding: '14px 40px',
        fontSize: '1rem',
        fontWeight: '600',
        letterSpacing: '-0.01em',
        border: 'none',
        background: '#1976d2',
        color: 'white',
        transition: 'all 0.2s ease',
        boxShadow: '0 2px 8px rgba(25, 118, 210, 0.3)'
    };

    return (
        <div className="d-flex justify-content-center" style={{ marginTop: '1rem' }}>
                    <button 
                        type="button" 
                        style={buttonStyle}
                        id="open-preview-modal"
                        onClick={onOpenPreview}
                        disabled={isPreviewDisabled}
                        onMouseEnter={(e) => {
                            if (!isPreviewDisabled) {
                                e.target.style.background = '#1565c0';
                                e.target.style.boxShadow = '0 4px 12px rgba(25, 118, 210, 0.4)';
                                e.target.style.transform = 'translateY(-1px)';
                            }
                        }}
                        onMouseLeave={(e) => {
                            e.target.style.background = '#1976d2';
                            e.target.style.boxShadow = '0 2px 8px rgba(25, 118, 210, 0.3)';
                            e.target.style.transform = 'translateY(0)';
                        }}
                    >
                        {isPreviewDisabled ? (
                            <>
                                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                Loading...
                            </>
                        ) : (
                            <>
                                Next
                                <i className="bi bi-arrow-right ms-2"></i>
                            </>
                        )}
                    </button>
        </div>
    );
}
