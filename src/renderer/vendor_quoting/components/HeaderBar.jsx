import React from 'react';

const headerStyle = {
    background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%)',
    boxShadow: '0 2px 4px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.08)',
    padding: '1rem 0',
    marginBottom: '1rem',
    position: 'relative',
    overflow: 'hidden',
    borderBottom: '3px solid #1976d2'
};

const headerIconStyle = {
    width: '48px',
    height: '48px',
    background: 'rgba(255,255,255,0.15)',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.25rem',
    color: 'white',
    backdropFilter: 'blur(10px)'
};

const actionButtonStyle = {
    borderRadius: '50%',
    width: '40px',
    height: '40px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: 'none',
    background: 'transparent',
    color: 'white',
    transition: 'background-color 0.2s ease'
};

export default function HeaderBar() {
    const handleButtonHover = (e) => {
        e.target.style.backgroundColor = 'rgba(255,255,255,0.1)';
    };

    const handleButtonLeave = (e) => {
        e.target.style.backgroundColor = 'transparent';
    };

    return (
        <div style={headerStyle}>
            <div className="container-fluid">
                <div className="d-flex justify-content-between align-items-center">
                    <div className="d-flex align-items-center">
                        <div style={headerIconStyle} className="me-3">
                            <i className="bi bi-briefcase-fill"></i>
                        </div>
                        <div>
                            <h4 className="mb-0 text-white fw-bold">Vendor Quoting</h4>
                            <small className="text-white-50">ProCure Hub - RFQ Management</small>
                        </div>
                    </div>
                    <div className="d-flex align-items-center gap-2">
                        <button 
                            style={actionButtonStyle}
                            onMouseEnter={handleButtonHover}
                            onMouseLeave={handleButtonLeave}
                            title="Help"
                        >
                            <i className="bi bi-question-circle"></i>
                        </button>
                        <button 
                            style={actionButtonStyle}
                            onMouseEnter={handleButtonHover}
                            onMouseLeave={handleButtonLeave}
                            title="Settings"
                        >
                            <i className="bi bi-gear"></i>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
