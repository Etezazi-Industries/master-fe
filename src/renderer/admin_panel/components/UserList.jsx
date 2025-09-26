import React from 'react';

/**
 * UserList component displays user/party information in a list format
 * @param {Object} props
 * @param {Array} props.users - Array of user/party data
 * @param {Object} props.selectedUser - Currently selected user
 * @param {Function} props.onSelectUser - Callback when user is selected
 * @param {boolean} props.isLoading - Loading state
 */
export default function UserList({ users, selectedUser, onSelectUser, isLoading }) {
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
        borderLeft: '4px solid #60a5fa'
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

    if (isLoading) {
        return (
            <div style={containerStyle}>
                <div style={headerStyle}>
                    <h6 className="mb-0">
                        <i className="bi bi-people-fill me-2"></i>
                        User Information
                    </h6>
                </div>
                <div className="text-center py-4">
                    <div className="spinner-border" style={{ color: '#60a5fa' }} role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                    <div className="mt-2">
                        <small style={{ color: '#94a3b8' }}>Loading users...</small>
                    </div>
                </div>
            </div>
        );
    }

    if (!users || users.length === 0) {
        return (
            <div style={containerStyle}>
                <div style={headerStyle}>
                    <h6 className="mb-0">
                        <i className="bi bi-people-fill me-2"></i>
                        User Information
                    </h6>
                </div>
                <div className="text-center py-4">
                    <i className="bi bi-inbox" style={{ fontSize: '2rem', color: '#94a3b8' }}></i>
                    <div className="mt-2">
                        <small style={{ color: '#94a3b8' }}>No users found</small>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div style={containerStyle}>
            <div style={headerStyle}>
                <h6 className="mb-0">
                    <i className="bi bi-people-fill me-2"></i>
                    User Information ({users.length} users)
                </h6>
            </div>
            <div style={listStyle}>
                {users.map((user, index) => {
                    const isSelected = selectedUser && selectedUser.pk === user.pk;
                    return (
                        <div
                            key={user.pk || index}
                            style={isSelected ? selectedItemStyle : itemStyle}
                            className={isSelected ? 'selected' : ''}
                            onClick={() => onSelectUser(user)}
                            onMouseEnter={handleItemHover}
                            onMouseLeave={handleItemLeave}
                        >
                            <div>
                                <div className="fw-semibold" style={{ color: '#e2e8f0' }}>
                                    {user.name || user.company_name || `User ${index + 1}`}
                                </div>
                                <small style={{ color: '#94a3b8' }}>
                                    {user.email || user.contact_email || 'No email'}
                                </small>
                                {user.phone && (
                                    <div>
                                        <small style={{ color: '#94a3b8' }}>
                                            <i className="bi bi-telephone me-1"></i>
                                            {user.phone}
                                        </small>
                                    </div>
                                )}
                            </div>
                            <div className="text-end">
                                <small style={{ color: '#94a3b8' }}>
                                    ID: {user.pk || user.id || index + 1}
                                </small>
                                {user.created_at && (
                                    <div>
                                        <small style={{ color: '#94a3b8' }}>
                                            {new Date(user.created_at).toLocaleDateString()}
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
