import React, { useEffect, useRef } from 'react';

export default function PreviewModal({ isOpen, onClose, children }) {
    const modalRef = useRef(null);
    const bootstrapModalRef = useRef(null);

    useEffect(() => {
        if (!modalRef.current) return;

        if (isOpen) {
            // Create Bootstrap modal instance if it doesn't exist
            if (!bootstrapModalRef.current) {
                bootstrapModalRef.current = new window.bootstrap.Modal(modalRef.current, {
                    backdrop: 'static',
                    keyboard: false,
                    focus: true,
                });
            }
            bootstrapModalRef.current.show();
        } else {
            // Hide modal if it exists
            if (bootstrapModalRef.current) {
                bootstrapModalRef.current.hide();
            }
        }

        // Cleanup on unmount
        return () => {
            if (bootstrapModalRef.current) {
                bootstrapModalRef.current.dispose();
                bootstrapModalRef.current = null;
            }
        };
    }, [isOpen]);

    // Handle Bootstrap modal events
    useEffect(() => {
        const modalElement = modalRef.current;
        if (!modalElement) return;

        const handleHidden = () => {
            onClose?.();
        };

        modalElement.addEventListener('hidden.bs.modal', handleHidden);
        
        return () => {
            modalElement.removeEventListener('hidden.bs.modal', handleHidden);
        };
    }, [onClose]);

    return (
        <div 
            className="modal fade" 
            id="rfqRecipientsModal" 
            tabIndex="-1" 
            aria-hidden="true"
            ref={modalRef}
        >
            <div className="modal-dialog modal-dialog-centered modal-xl">
                <div className="modal-content">
                    {children}
                </div>
            </div>
        </div>
    );
}
