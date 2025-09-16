import React, { useState, useEffect } from 'react';

/**
 * Modal for editing vacation request reasons/comments
 * @param {Object} props
 * @param {boolean} props.isOpen - Whether the modal is open
 * @param {Object|null} props.request - The request being edited
 * @param {Function} props.onSave - Callback when save is clicked
 * @param {Function} props.onClose - Callback when modal is closed
 */
export default function EditReasonModal({ isOpen, request, onSave, onClose }) {
    const [comment, setComment] = useState('');

    // Reset comment when modal opens/closes or request changes
    useEffect(() => {
        if (isOpen && request) {
            setComment('');
        }
    }, [isOpen, request]);

    const handleSave = () => {
        if (comment.trim()) {
            onSave(comment.trim());
            setComment('');
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && e.ctrlKey) {
            handleSave();
        }
    };

    const materialModalStyle = {
        background: 'rgba(0,0,0,0.4)'
    };

    const materialHeaderStyle = {
        background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
        color: 'white',
        borderBottom: 'none',
        padding: '1.5rem'
    };

    const materialBodyStyle = {
        background: '#ffffff',
        padding: '1.5rem'
    };

    const materialFooterStyle = {
        background: '#f8f9fa',
        borderTop: '1px solid #e9ecef',
        padding: '1rem 1.5rem'
    };

    if (!isOpen) return null;

    return (
        <div 
            className="modal fade show d-block" 
            style={materialModalStyle}
            tabIndex="-1" 
            role="dialog"
            onClick={onClose}
        >
            <div 
                className="modal-dialog modal-dialog-centered" 
                role="document"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="modal-content" style={{ borderRadius: '12px', border: 'none', overflow: 'hidden' }}>
                    <div className="modal-header" style={materialHeaderStyle}>
                        <h6 className="modal-title mb-0 fw-bold">
                            <i className="bi bi-chat-text me-2"></i>
                            {request && (
                                <>
                                    Request #{request['Vacation ID']} - {request['Employee']} - Add Comment
                                </>
                            )}
                        </h6>
                        <button 
                            type="button" 
                            className="btn-close btn-close-white" 
                            onClick={onClose}
                            aria-label="Close"
                        ></button>
                    </div>
                    
                    <div className="modal-body" style={materialBodyStyle}>
                        <div className="mb-3">
                            <label 
                                htmlFor="editReason" 
                                className="form-label fw-medium text-dark"
                                style={{ 
                                    fontSize: '0.875rem',
                                    fontWeight: '500',
                                    color: '#374151',
                                    marginBottom: '0.5rem'
                                }}
                            >
                                Comment
                            </label>
                            <textarea
                                id="editReason"
                                className="form-control"
                                rows="4"
                                placeholder="Enter your comment here..."
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                onKeyPress={handleKeyPress}
                                style={{
                                    borderRadius: '8px',
                                    border: '1px solid #d1d5db',
                                    fontSize: '0.875rem'
                                }}
                                autoFocus
                            />
                            <small className="form-text text-muted">
                                Tip: Press Ctrl+Enter to save quickly
                            </small>
                        </div>
                    </div>
                    
                    <div className="modal-footer" style={materialFooterStyle}>
                        <button 
                            type="button" 
                            className="btn btn-outline-secondary"
                            onClick={onClose}
                        >
                            <i className="bi bi-x-circle me-1"></i>
                            Cancel
                        </button>
                        <button 
                            type="button" 
                            className="btn btn-primary"
                            onClick={handleSave}
                            disabled={!comment.trim()}
                            style={{
                                background: comment.trim() ? '#1976d2' : undefined,
                                borderColor: comment.trim() ? '#1976d2' : undefined
                            }}
                        >
                            <i className="bi bi-check-circle me-1"></i>
                            Save Comment
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
