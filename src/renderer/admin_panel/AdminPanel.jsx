import React, { useState, useEffect, useCallback } from 'react';
import { createRoot } from 'react-dom/client';
import SharedHeaderBar from '../components/shared/HeaderBar.jsx';
import UserList from './components/UserList.jsx';
import ApplicationList from './components/ApplicationList.jsx';
import { fetchUsers } from '../api_calls.js';

function AdminPanel() {
    // State management
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [applications, setApplications] = useState([]);
    const [selectedApplication, setSelectedApplication] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    // Hard-coded application data
    const hardCodedApplications = [
        {
            id: 'vendor_quoting',
            name: 'Vendor Quoting',
            description: 'Manage vendor quotes and procurement processes',
            status: 'active',
            version: '1.2.3'
        },
        {
            id: 'rfq_gen',
            name: 'RFQ Generator',
            description: 'Generate and manage Request for Quotations',
            status: 'active',
            version: '2.1.0'
        },
        {
            id: 'vacation',
            name: 'Vacation Management',
            description: 'Employee vacation request and approval system',
            status: 'active',
            version: '1.5.2'
        },
        {
            id: 'qv_dash_access',
            name: 'QuickView Dashboard',
            description: 'Quick access dashboard for data visualization',
            status: 'active',
            version: '1.0.8'
        },
        {
            id: 'admin_panel',
            name: 'Admin Panel',
            description: 'System administration and user management',
            status: 'active',
            version: '1.0.0'
        }
    ];

    // Load users and applications on mount
    useEffect(() => {
        loadUsers();
        loadApplications();
    }, []);

    const loadUsers = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await fetchUsers();
            console.log('[admin] User data response:', response);
            
            // Handle different response formats
            let userData = [];
            
            if (Array.isArray(response)) {
                userData = response;
            } else if (response && Array.isArray(response.data)) {
                userData = response.data;
            } else if (response && typeof response === 'object') {
                // Handle the Dict[int, List[str]] format from /users endpoint
                // Convert dictionary {user_id: [user_data_list]} to array of user objects
                userData = Object.entries(response).map(([userId, userDataArray]) => {
                    console.log(`[admin] Processing user ${userId}:`, userDataArray);
                    
                    // If userDataArray is an array, try to map it to user object properties
                    if (Array.isArray(userDataArray)) {
                        return {
                            id: parseInt(userId),
                            pk: parseInt(userId),
                            name: userDataArray[0] || 'Unknown User',
                            email: userDataArray[1] || '',
                            phone: userDataArray[2] || '',
                            department: userDataArray[3] || '',
                            role: userDataArray[4] || '',
                            // Add any other fields based on your backend structure
                            created_at: userDataArray[5] || null
                        };
                    } else {
                        // Fallback for unexpected format
                        return {
                            id: parseInt(userId),
                            pk: parseInt(userId),
                            name: `User ${userId}`,
                            email: '',
                            phone: ''
                        };
                    }
                });
                
                console.log('[admin] Transformed user data:', userData);
            }
            
            setUsers(userData);
        } catch (error) {
            console.error('[admin] Failed to load users:', error);
            setUsers([]);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const loadApplications = useCallback(() => {
        // For now, just set the hard-coded applications
        setApplications(hardCodedApplications);
    }, []);

    const handleSelectUser = useCallback((user) => {
        setSelectedUser(user);
        console.log('[admin] Selected user:', user);
    }, []);

    const handleSelectApplication = useCallback((application) => {
        setSelectedApplication(application);
        console.log('[admin] Selected application:', application);
    }, []);

    const handleRefreshUsers = useCallback(() => {
        loadUsers();
    }, [loadUsers]);

    const handleGiveAccess = useCallback(async () => {
        if (!selectedUser || !selectedApplication) {
            alert('Please select both a user and an application');
            return;
        }

        try {
            console.log(`[admin] Giving access to user ${selectedUser.id} for application ${selectedApplication.id}`);
            
            // TODO: Implement actual API call to grant access
            // This would typically call an endpoint like:
            // POST /users/{userId}/access/{applicationId}
            
            alert(`Access granted: ${selectedUser.name || selectedUser.id} now has access to ${selectedApplication.name}`);
            
            // Optionally refresh data or update UI state
            console.log('[admin] Access granted successfully');
            
        } catch (error) {
            console.error('[admin] Failed to grant access:', error);
            alert('Failed to grant access. Please try again.');
        }
    }, [selectedUser, selectedApplication]);

    return (
        <div className="text-light" style={{ 
            fontFamily: '"Inter", "Segoe UI", system-ui, -apple-system, sans-serif',
            letterSpacing: '-0.01em',
            background: '#0f1419',
            minHeight: '100vh'
        }}>
            <style>{`
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                .spin {
                    animation: spin 1s linear infinite;
                }
                .dark-card {
                    background: #1a1f2e !important;
                    border: 1px solid #2d3748 !important;
                    color: #e2e8f0 !important;
                }
                .dark-card:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3) !important;
                }
                .dark-summary-card {
                    background: linear-gradient(135deg, #1a202c 0%, #2d3748 100%) !important;
                    border: 1px solid #4a5568 !important;
                    color: #e2e8f0 !important;
                }
            `}</style>
            {/* Fixed container that stays below title bar */}
            <div style={{
                height: 'calc(100vh - 32px)', // Full height minus title bar
                display: 'flex',
                flexDirection: 'column',
                position: 'relative'
            }}>
                <SharedHeaderBar
                    icon="bi bi-terminal-fill"
                    title="Admin Panel"
                    subtitle="System Administration & User Management"
                    sticky={true}
                    actions={
                        <div className="d-flex align-items-center gap-2">
                            <button 
                                className="btn btn-outline-light btn-sm"
                                onClick={handleRefreshUsers}
                                title="Refresh User Data"
                                disabled={isLoading}
                                style={{
                                    background: isLoading ? 'rgba(255,255,255,0.1)' : 'transparent',
                                    borderColor: '#4a5568'
                                }}
                            >
                                <i className={`bi bi-arrow-clockwise ${isLoading ? 'spin' : ''}`}></i>
                            </button>
                            <button 
                                className="btn btn-outline-light btn-sm"
                                title="Settings"
                                style={{
                                    borderColor: '#4a5568'
                                }}
                            >
                                <i className="bi bi-gear"></i>
                            </button>
                        </div>
                    }
                />
                
                {/* Main content with scrolling */}
                <div 
                    className="flex-grow-1"
                    style={{ 
                        overflowY: 'auto',
                        overflowX: 'hidden',
                        position: 'relative',
                        height: 0 // Force height calculation from flex
                    }}
                >
                    <div className="container-fluid" style={{ 
                        maxWidth: '1400px',
                        margin: '0 auto',
                        padding: '2rem'
                    }}>
                        {/* Summary Cards */}
                        <div className="row mb-4">
                            <div className="col-md-4">
                                <div className="card dark-summary-card border-0 shadow-sm">
                                    <div className="card-body text-center">
                                        <div className="mb-2" style={{ color: '#60a5fa' }}>
                                            <i className="bi bi-people-fill" style={{ fontSize: '2rem' }}></i>
                                        </div>
                                        <h4 className="mb-1 text-light">{users.length}</h4>
                                        <small style={{ color: '#94a3b8' }}>Total Users</small>
                                    </div>
                                </div>
                            </div>
                            <div className="col-md-4">
                                <div className="card dark-summary-card border-0 shadow-sm">
                                    <div className="card-body text-center">
                                        <div className="mb-2" style={{ color: '#34d399' }}>
                                            <i className="bi bi-grid-3x3-gap-fill" style={{ fontSize: '2rem' }}></i>
                                        </div>
                                        <h4 className="mb-1 text-light">{applications.length}</h4>
                                        <small style={{ color: '#94a3b8' }}>Available Apps</small>
                                    </div>
                                </div>
                            </div>
                            <div className="col-md-4">
                                <div className="card dark-summary-card border-0 shadow-sm">
                                    <div className="card-body text-center">
                                        <div className="mb-2" style={{ color: '#fbbf24' }}>
                                            <i className="bi bi-shield-check" style={{ fontSize: '2rem' }}></i>
                                        </div>
                                        <h4 className="mb-1 text-light">
                                            {selectedUser && selectedApplication ? '1' : '0'}
                                        </h4>
                                        <small style={{ color: '#94a3b8' }}>Ready to Grant</small>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Main Content - Two Columns */}
                        <div className="row">
                            <div className="col-lg-6 mb-4">
                                <UserList
                                    users={users}
                                    selectedUser={selectedUser}
                                    onSelectUser={handleSelectUser}
                                    isLoading={isLoading}
                                />
                            </div>
                            <div className="col-lg-6 mb-4">
                                <ApplicationList
                                    applications={applications}
                                    selectedApplication={selectedApplication}
                                    onSelectApplication={handleSelectApplication}
                                />
                            </div>
                        </div>

                        {/* Selected Item Details */}
                        {(selectedUser || selectedApplication) && (
                            <div className="row">
                                <div className="col-12">
                                    <div className="card dark-card border-0 shadow-sm">
                                        <div className="card-header" style={{ background: '#2d3748', borderBottom: '1px solid #4a5568' }}>
                                            <h6 className="mb-0 text-light">
                                                <i className="bi bi-info-circle me-2" style={{ color: '#60a5fa' }}></i>
                                                Selection Details
                                            </h6>
                                        </div>
                                        <div className="card-body" style={{ background: '#1a1f2e' }}>
                                            <div className="row">
                                                {selectedUser && (
                                                    <div className="col-md-6">
                                                        <h6 style={{ color: '#60a5fa' }}>Selected User</h6>
                                                        <table className="table table-sm table-dark">
                                                            <tbody>
                                                                <tr>
                                                                    <td style={{ color: '#94a3b8', borderColor: '#4a5568' }}><strong>Name:</strong></td>
                                                                    <td style={{ color: '#e2e8f0', borderColor: '#4a5568' }}>{selectedUser.name || selectedUser.company_name || 'N/A'}</td>
                                                                </tr>
                                                                <tr>
                                                                    <td style={{ color: '#94a3b8', borderColor: '#4a5568' }}><strong>Email:</strong></td>
                                                                    <td style={{ color: '#e2e8f0', borderColor: '#4a5568' }}>{selectedUser.email || selectedUser.contact_email || 'N/A'}</td>
                                                                </tr>
                                                                <tr>
                                                                    <td style={{ color: '#94a3b8', borderColor: '#4a5568' }}><strong>Phone:</strong></td>
                                                                    <td style={{ color: '#e2e8f0', borderColor: '#4a5568' }}>{selectedUser.phone || 'N/A'}</td>
                                                                </tr>
                                                                <tr>
                                                                    <td style={{ color: '#94a3b8', borderColor: '#4a5568' }}><strong>ID:</strong></td>
                                                                    <td style={{ color: '#e2e8f0', borderColor: '#4a5568' }}>{selectedUser.pk || selectedUser.id || 'N/A'}</td>
                                                                </tr>
                                                                {selectedUser.created_at && (
                                                                    <tr>
                                                                        <td style={{ color: '#94a3b8', borderColor: '#4a5568' }}><strong>Created:</strong></td>
                                                                        <td style={{ color: '#e2e8f0', borderColor: '#4a5568' }}>{new Date(selectedUser.created_at).toLocaleString()}</td>
                                                                    </tr>
                                                                )}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                )}
                                                {selectedApplication && (
                                                    <div className="col-md-6">
                                                        <h6 style={{ color: '#34d399' }}>Selected Application</h6>
                                                        <table className="table table-sm table-dark">
                                                            <tbody>
                                                                <tr>
                                                                    <td style={{ color: '#94a3b8', borderColor: '#4a5568' }}><strong>Name:</strong></td>
                                                                    <td style={{ color: '#e2e8f0', borderColor: '#4a5568' }}>{selectedApplication.name}</td>
                                                                </tr>
                                                                <tr>
                                                                    <td style={{ color: '#94a3b8', borderColor: '#4a5568' }}><strong>Description:</strong></td>
                                                                    <td style={{ color: '#e2e8f0', borderColor: '#4a5568' }}>{selectedApplication.description}</td>
                                                                </tr>
                                                                <tr>
                                                                    <td style={{ color: '#94a3b8', borderColor: '#4a5568' }}><strong>Status:</strong></td>
                                                                    <td style={{ borderColor: '#4a5568' }}>
                                                                        <span className={`badge ${
                                                                            selectedApplication.status === 'active' ? 'bg-success' : 
                                                                            selectedApplication.status === 'maintenance' ? 'bg-warning' : 'bg-secondary'
                                                                        }`}>
                                                                            {selectedApplication.status}
                                                                        </span>
                                                                    </td>
                                                                </tr>
                                                                <tr>
                                                                    <td style={{ color: '#94a3b8', borderColor: '#4a5568' }}><strong>Version:</strong></td>
                                                                    <td style={{ color: '#e2e8f0', borderColor: '#4a5568' }}>v{selectedApplication.version}</td>
                                                                </tr>
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Give Access Button */}
                        {selectedUser && selectedApplication && (
                            <div className="row mt-4">
                                <div className="col-12">
                                    <div className="d-flex justify-content-center">
                                        <button 
                                            className="btn btn-success btn-lg px-5 py-3"
                                            onClick={handleGiveAccess}
                                            style={{
                                                background: 'linear-gradient(135deg, #34d399 0%, #10b981 100%)',
                                                border: 'none',
                                                borderRadius: '0.75rem',
                                                fontSize: '1.1rem',
                                                fontWeight: '600',
                                                boxShadow: '0 4px 15px rgba(52, 211, 153, 0.3)',
                                                transition: 'all 0.3s ease'
                                            }}
                                            onMouseEnter={(e) => {
                                                e.target.style.transform = 'translateY(-2px)';
                                                e.target.style.boxShadow = '0 6px 20px rgba(52, 211, 153, 0.4)';
                                            }}
                                            onMouseLeave={(e) => {
                                                e.target.style.transform = 'translateY(0)';
                                                e.target.style.boxShadow = '0 4px 15px rgba(52, 211, 153, 0.3)';
                                            }}
                                        >
                                            <i className="bi bi-shield-check me-2"></i>
                                            Give Access
                                        </button>
                                    </div>
                                    <div className="text-center mt-3">
                                        <small style={{ color: '#94a3b8' }}>
                                            Grant <strong style={{ color: '#60a5fa' }}>{selectedUser.name || selectedUser.id}</strong> access to <strong style={{ color: '#34d399' }}>{selectedApplication.name}</strong>
                                        </small>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

// Mount the app as a React island
let appRoot = null;

export function mountAdminPanel() {
    console.log('[admin-panel] Attempting to mount admin panel...');
    
    // Find the existing container (should exist in home.html)
    let container = document.getElementById('admin-panel-root');
    if (!container) {
        console.error('[admin-panel] admin-panel-root container not found!');
        console.log('[admin-panel] Available containers:', 
            Array.from(document.querySelectorAll('[id$="root"]')).map(el => el.id));
        return;
    }

    console.log('[admin-panel] Container found, creating React root...');

    // Create root if needed
    if (!appRoot) {
        appRoot = createRoot(container);
    }

    // Render the app
    console.log('[admin-panel] Rendering AdminPanel component...');
    appRoot.render(<AdminPanel />);
    console.log('[admin-panel] AdminPanel mounted successfully');
}

export function unmountAdminPanel() {
    if (appRoot) {
        appRoot.unmount();
        appRoot = null;
    }
    // Don't remove the container - leave it in the DOM for reuse
}

// Export the component for direct use
export default AdminPanel;
