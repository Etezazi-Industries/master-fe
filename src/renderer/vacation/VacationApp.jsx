import React, { useState, useEffect, useCallback } from 'react';
import { createRoot } from 'react-dom/client';
import SharedHeaderBar from '../components/shared/HeaderBar.jsx';
import VacationTable from './components/VacationTable.jsx';
import ApprovalActions from './components/ApprovalActions.jsx';
import EditReasonModal from './components/EditReasonModal.jsx';
import { getVacationRequests, approveVacationRequest, addVacationComment } from '../api_calls.js';

function VacationApp() {
    // State management
    const [vacationRequests, setVacationRequests] = useState([]);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingRequest, setEditingRequest] = useState(null);
    const [showApprovedOnly, setShowApprovedOnly] = useState(false);

    // Load vacation requests on mount
    useEffect(() => {
        loadVacationRequests();
    }, []);

    const loadVacationRequests = useCallback(async (approvedFilter = null) => {
        setIsLoading(true);
        try {
            const response = await getVacationRequests(approvedFilter);
            const requests = Array.isArray(response) ? response : (Array.isArray(response.data) ? response.data : []);
            setVacationRequests(requests);
        } catch (error) {
            console.error('[vacation] API load failed:', error);
            setVacationRequests([]);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const handleSelectRequest = useCallback((request) => {
        setSelectedRequest(request);
    }, []);

    const handleApproveRequest = useCallback(async () => {
        if (!selectedRequest) return;
        
        try {
            await approveVacationRequest(selectedRequest['Vacation ID']);
            
            // Update the request in our local state
            setVacationRequests(prev => prev.map(req => 
                req['Vacation ID'] === selectedRequest['Vacation ID'] 
                    ? { ...req, 'Approved': true }
                    : req
            ));
            
            // Update selected request
            setSelectedRequest(prev => prev ? { ...prev, 'Approved': true } : null);
        } catch (error) {
            console.error('Failed to approve request:', error);
            alert('Failed to approve request');
        }
    }, [selectedRequest]);

    const handleEditReason = useCallback((request) => {
        setEditingRequest(request);
        setIsEditModalOpen(true);
    }, []);

    const handleSaveComment = useCallback(async (comment) => {
        if (!editingRequest || !comment.trim()) return;
        
        try {
            await addVacationComment(editingRequest['Vacation ID'], comment);
            
            // Update the request in our local state
            setVacationRequests(prev => prev.map(req => 
                req['Vacation ID'] === editingRequest['Vacation ID'] 
                    ? { ...req, 'Reason': req['Reason'] ? `${req['Reason']}\n${comment}` : comment }
                    : req
            ));
            
            setIsEditModalOpen(false);
            setEditingRequest(null);
        } catch (error) {
            console.error('Failed to save comment:', error);
            alert('Failed to save comment');
        }
    }, [editingRequest]);

    const handleCloseEditModal = useCallback(() => {
        setIsEditModalOpen(false);
        setEditingRequest(null);
    }, []);

    const handleToggleApprovedFilter = useCallback(() => {
        const newShowApprovedOnly = !showApprovedOnly;
        setShowApprovedOnly(newShowApprovedOnly);
        loadVacationRequests(newShowApprovedOnly ? true : null);
    }, [showApprovedOnly, loadVacationRequests]);

    return (
        <div className="bg-white text-dark" style={{ 
            fontFamily: '"Inter", "Segoe UI", system-ui, -apple-system, sans-serif',
            letterSpacing: '-0.01em'
        }}>
            {/* Fixed container that stays below title bar */}
            <div style={{
                height: 'calc(100vh - 32px)', // Full height minus title bar
                display: 'flex',
                flexDirection: 'column',
                position: 'relative'
            }}>
                <SharedHeaderBar
                    icon="bi bi-calendar-check"
                    title="Vacation Requests"
                    subtitle="Auto Gen - Employee Management"
                    sticky={true}
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
                <div className="container" style={{ 
                    maxWidth: '1200px',
                    margin: '0 auto',
                    padding: '0 1.5rem 2rem 1.5rem',
                    marginLeft: '1.5rem' // Offset from sidebar
                }}>
                    <div className="d-flex flex-column" style={{ gap: '2rem' }}>
                        {/* Vacation Requests Table */}
                        <VacationTable
                            requests={vacationRequests}
                            selectedRequest={selectedRequest}
                            onSelectRequest={handleSelectRequest}
                            onEditReason={handleEditReason}
                            showApprovedOnly={showApprovedOnly}
                            onToggleApprovedFilter={handleToggleApprovedFilter}
                        />
                    </div>
                </div>

                {/* Scoped Loading Overlay - only covers content area */}
                {isLoading && (
                    <div style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'rgba(255, 255, 255, 0.8)',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        zIndex: 50,
                        backdropFilter: 'blur(2px)'
                    }}>
                        <div className="d-flex flex-column align-items-center">
                            <div 
                                className="spinner-border text-primary" 
                                style={{ width: '2.5rem', height: '2.5rem' }}
                                role="status"
                            >
                                <span className="visually-hidden">Loading...</span>
                            </div>
                            <div className="mt-3 text-dark">
                                <small>Loading vacation requests...</small>
                            </div>
                        </div>
                    </div>
                )}

            </div>

            {/* Approval Actions (floating button) */}
            <ApprovalActions
                selectedRequest={selectedRequest}
                onApprove={handleApproveRequest}
            />

                {/* Edit Reason Modal */}
                <EditReasonModal
                    isOpen={isEditModalOpen}
                    request={editingRequest}
                    onSave={handleSaveComment}
                    onClose={handleCloseEditModal}
                />
            </div>
        </div>
    );
}

// Mount the app as a React island
let appRoot = null;

export function mountVacationApp() {
    // Find the existing container (should exist in home.html)
    let container = document.getElementById('vacation-root');
    if (!container) {
        console.error('vacation-root container not found! Check home.html');
        return;
    }

    // Create root if needed
    if (!appRoot) {
        appRoot = createRoot(container);
    }

    // Render the app
    appRoot.render(<VacationApp />);
}

export function unmountVacationApp() {
    if (appRoot) {
        appRoot.unmount();
        appRoot = null;
    }
    // Don't remove the container - leave it in the DOM for reuse
    // The container is managed by home.html and should persist
}

// Export the component for direct use
export default VacationApp;
