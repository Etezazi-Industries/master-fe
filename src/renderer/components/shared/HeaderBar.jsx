import React from 'react';

/**
 * Shared HeaderBar component for all applications
 * @param {Object} props
 * @param {string} props.icon - Bootstrap icon class (e.g., "bi-briefcase-fill")
 * @param {string} props.title - Main title text
 * @param {string} props.subtitle - Subtitle text
 * @param {React.ReactNode} [props.actions] - Optional action buttons/elements
 * @param {boolean} [props.sticky] - Whether header should be sticky
 */
export default function HeaderBar({ icon, title, subtitle, actions, sticky = false }) {
    const headerStyle = {
        background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%)',
        boxShadow: '0 2px 4px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.08)',
        padding: '1rem 0',
        marginBottom: '1.5rem',
        paddingLeft: '1.5rem',
        position: sticky ? 'sticky' : 'relative',
        top: sticky ? '0' : 'auto',
        zIndex: sticky ? '100' : 'auto',
        overflow: 'hidden',
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
                            <i className={icon}></i>
                        </div>
                        <div>
                            <h4 className="mb-0 text-white fw-bold">{title}</h4>
                            <small className="text-white-50">{subtitle}</small>
                        </div>
                    </div>
                    
                    {actions || (
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
                    )}
                </div>
            </div>
        </div>
    );
}
