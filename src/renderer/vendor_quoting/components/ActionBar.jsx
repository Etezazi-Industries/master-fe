import React from 'react';

export default function ActionBar({ onOpenBoeingFinish, onOpenAddParty }) {
    const materialCardStyle = {
        borderRadius: '12px',
        border: 'none',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1), 0 1px 3px rgba(0,0,0,0.08)',
        overflow: 'hidden'
    };

    const materialHeaderStyle = {
        background: 'linear-gradient(135deg, #1a1a1a 0%, #333333 100%)',
        padding: '1rem 1.5rem',
        borderBottom: 'none',
        borderLeft: '4px solid #1976d2'
    };

    return (
        <div className="card" style={materialCardStyle}>
            <div className="card-header text-white" style={materialHeaderStyle}>
                <h6 className="mb-0 fw-bold">Tools & Resources</h6>
            </div>
            <div className="card-body">
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
