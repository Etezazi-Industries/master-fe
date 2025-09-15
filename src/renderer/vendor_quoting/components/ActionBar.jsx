import React from 'react';

export default function ActionBar({ onOpenBoeingFinish, onOpenAddParty }) {
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
                    Tools & Resources
                </h5>
                <div className="d-flex gap-2 flex-wrap">
                    <button 
                        type="button" 
                        className="btn btn-outline-primary" 
                        id="btn-boeing-finish"
                        onClick={onOpenBoeingFinish}
                    >
                        <i className="bi bi-search me-1"></i>
                        Boeing Finish Codes
                    </button>
                    <button 
                        type="button" 
                        className="btn btn-outline-success" 
                        id="btn-add-party"
                        onClick={onOpenAddParty}
                    >
                        <i className="bi bi-person-plus me-1"></i>
                        Add New Party
                    </button>
                    {/* Future action buttons can be added here */}
                </div>
            </div>
        </div>
    );
}
