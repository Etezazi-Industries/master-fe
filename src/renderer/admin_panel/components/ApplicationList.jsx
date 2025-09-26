import React from 'react';

/**
 * ApplicationList component displays available applications
 * @param {Object} props
 * @param {Array} props.applications - Array of application data
 * @param {Object} props.selectedApplication - Currently selected application
 * @param {Function} props.onSelectApplication - Callback when application is selected
 */
export default function ApplicationList({ applications, selectedApplication, onSelectApplication }) {
    const containerStyle = {
        background: '#1a1f2e',
        border: '1px solid #2d3748',
        borderRadius: '0.5rem',
        boxShadow: '0 0.15rem 1.75rem 0 rgba(0, 0, 0, 0.3)',
        overflow: 'hidden'
    };

    const headerStyle = {
        background: 'linear-gradient(135deg, #2d3748 0%, #4a5568 100%)',
        color: '#e2e8f0',
        padding: '1rem',
        borderBottom: '1px solid #4a5568'
    };

    const listStyle = {
        maxHeight: '400px',
        overflowY: 'auto'
    };

    const itemStyle = {
        padding: '0.75rem 1rem',
        borderBottom: '1px solid #2d3748',
        cursor: 'pointer',
        transition: 'background-color 0.2s ease',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        color: '#e2e8f0'
    };

    const selectedItemStyle = {
        ...itemStyle,
        backgroundColor: '#2a4365',
        borderLeft: '4px solid #34d399'
    };

    const handleItemHover = (e) => {
        if (!e.currentTarget.classList.contains('selected')) {
            e.currentTarget.style.backgroundColor = '#2d3748';
        }
    };

    const handleItemLeave = (e) => {
        if (!e.currentTarget.classList.contains('selected')) {
            e.currentTarget.style.backgroundColor = 'transparent';
        }
    };

    const getStatusBadge = (status) => {
        const badgeClass = status === 'active' ? 'bg-success' : 
                          status === 'maintenance' ? 'bg-warning' : 'bg-secondary';
        return (
            <span className={`badge ${badgeClass}`}>
                {status || 'active'}
            </span>
        );
    };

    const getApplicationIcon = (appName) => {
        const iconMap = {
            'vendor_quoting': 'bi-briefcase-fill',
            'rfq_gen': 'bi-file-earmark-text-fill',
            'vacation': 'bi-calendar-check-fill',
            'qv_dash_access': 'bi-speedometer2',
            'admin_panel': 'bi-gear-fill'
        };
        return iconMap[appName] || 'bi-app';
    };

    return (
        <div style={containerStyle}>
            <div style={headerStyle}>
                <h6 className="mb-0">
                    <i className="bi bi-grid-3x3-gap-fill me-2"></i>
                    Applications ({applications.length} apps)
                </h6>
            </div>
            <div style={listStyle}>
                {applications.map((app, index) => {
                    const isSelected = selectedApplication && selectedApplication.name === app.name;
                    return (
                        <div
                            key={app.name || index}
                            style={isSelected ? selectedItemStyle : itemStyle}
                            className={isSelected ? 'selected' : ''}
                            onClick={() => onSelectApplication(app)}
                            onMouseEnter={handleItemHover}
                            onMouseLeave={handleItemLeave}
                        >
                            <div className="d-flex align-items-center">
                                <div 
                                    className="me-3 d-flex align-items-center justify-content-center"
                                    style={{
                                        width: '40px',
                                        height: '40px',
                                        backgroundColor: isSelected ? '#34d399' : '#2d3748',
                                        borderRadius: '8px',
                                        color: isSelected ? '#1a202c' : '#94a3b8'
                                    }}
                                >
                                    <i className={getApplicationIcon(app.id)} style={{ fontSize: '1.1rem' }}></i>
                                </div>
                                <div>
                                    <div className="fw-semibold" style={{ color: '#e2e8f0' }}>
                                        {app.name}
                                    </div>
                                    <small style={{ color: '#94a3b8' }}>
                                        {app.description}
                                    </small>
                                </div>
                            </div>
                            <div className="text-end">
                                {getStatusBadge(app.status)}
                                {app.version && (
                                    <div className="mt-1">
                                        <small style={{ color: '#94a3b8' }}>
                                            v{app.version}
                                        </small>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
