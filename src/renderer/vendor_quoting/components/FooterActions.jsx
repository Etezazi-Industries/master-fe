import React from 'react';

export default function FooterActions({ onOpenPreview, isPreviewDisabled = false }) {
    const materialCardStyle = {
        borderRadius: '12px',
        border: 'none',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1), 0 1px 3px rgba(0,0,0,0.08)',
        background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)'
    };

    const materialButtonStyle = {
        borderRadius: '25px',
        padding: '12px 32px',
        fontSize: '1.1rem',
        fontWeight: '600',
        boxShadow: '0 3px 6px rgba(0,0,0,0.16), 0 3px 6px rgba(0,0,0,0.23)',
        border: 'none',
        background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
        transition: 'all 0.3s ease'
    };

    return (
        <div className="card" style={materialCardStyle}>
            <div className="card-body" style={{ padding: '2rem' }}>
                <div className="d-flex justify-content-center">
                    <button 
                        type="button" 
                        style={materialButtonStyle}
                        id="open-preview-modal"
                        onClick={onOpenPreview}
                        disabled={isPreviewDisabled}
                        onMouseEnter={(e) => {
                            if (!isPreviewDisabled) {
                                e.target.style.transform = 'translateY(-2px)';
                                e.target.style.boxShadow = '0 6px 12px rgba(0,0,0,0.25), 0 4px 8px rgba(0,0,0,0.12)';
                            }
                        }}
                        onMouseLeave={(e) => {
                            e.target.style.transform = 'translateY(0)';
                            e.target.style.boxShadow = '0 3px 6px rgba(0,0,0,0.16), 0 3px 6px rgba(0,0,0,0.23)';
                        }}
                    >
                        {isPreviewDisabled ? (
                            <>
                                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                <span style={{ color: 'white' }}>Loading...</span>
                            </>
                        ) : (
                            <>
                                <span style={{ color: 'white' }}>Next</span>
                                <i className="bi bi-arrow-right ms-2" style={{ color: 'white' }}></i>
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
