import React, { useState, useCallback } from 'react';
import { createRoot } from 'react-dom/client';
import HeaderBar from './components/HeaderBar.jsx';
import SearchPanel from './components/SearchPanel.jsx';
import AttachmentsPanel from './components/AttachmentsPanel.jsx';
import ActionBar from './components/ActionBar.jsx';
import FooterActions from './components/FooterActions.jsx';
import PreviewModal from './components/PreviewModal.jsx';
import { searchRfqOrItem, getRfqDetails } from '../api_calls.js';
import { renderRecipientsModalReact } from './modals/reviewModal.js';
import { SharedModalState } from './shared-state.js';
import { openBoeingFinishModal } from './components/BoeingFinishModal.js';
import { openAddPartyModal } from './modals/addParty.jsx';
import { createParty } from '../api_calls.js';

function VendorQuotingApp() {
    // Search state
    const [searchResults, setSearchResults] = useState([]);
    const [selectedResult, setSelectedResult] = useState('');
    const [quantity, setQuantity] = useState(1);
    const [isSearching, setIsSearching] = useState(false);

    // Attachments state
    const [otherAttachments, setOtherAttachments] = useState([]);
    const [finishAttachments, setFinishAttachments] = useState([]);

    // Modal state
    const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
    const [isPreviewLoading, setIsPreviewLoading] = useState(false);

    const handleSearch = useCallback(async (query, type) => {
        if (!query.trim()) return;

        setIsSearching(true);
        setSearchResults([]);
        setSelectedResult('');

        try {
            const results = await searchRfqOrItem(query);
            const formattedResults = Object.entries(results.result || {}).map(([key, value]) => ({
                value: key,
                label: `${key} - ${value}`
            }));
            setSearchResults(formattedResults);
        } catch (error) {
            console.error('Search failed:', error);
            setSearchResults([]);
        } finally {
            setIsSearching(false);
        }
    }, []);

    const handleOpenPreview = useCallback(async () => {
        if (!selectedResult.trim()) {
            alert('Please select a result first');
            return;
        }

        setIsPreviewLoading(true);

        try {
            const rfqId = selectedResult.split(' - ')[0]?.trim();
            if (!rfqId) {
                throw new Error('Invalid RFQ selection');
            }

            const data = await getRfqDetails(rfqId);
            const lineItems = data['line-items'] || [];

            // Update shared state for the modal
            SharedModalState.currentLineItems = lineItems;
            SharedModalState.currentRfqId = rfqId;

            // Render the React modal content
            renderRecipientsModalReact(lineItems, { rfqId });

            // Open the modal
            setIsPreviewModalOpen(true);
        } catch (error) {
            console.error('Error fetching RFQ details:', error);
            alert(`Failed to load RFQ details: ${error.message}`);
        } finally {
            setIsPreviewLoading(false);
        }
    }, [selectedResult]);

    const handleClosePreview = useCallback(() => {
        setIsPreviewModalOpen(false);
    }, []);

    const handleOpenBoeingFinish = useCallback(() => {
        openBoeingFinishModal();
    }, []);

    const handleOpenAddParty = useCallback(() => {
        openAddPartyModal({
            createParty,
            notify: (msg) => {
                // You can add a toast notification here if needed
                console.log('Party created:', msg);
            },
            onCreated: (data, payload) => {
                console.log('New party created:', data);
                // You could refresh any party lists here if needed
            }
        });
    }, []);

    return (
        <div className="min-vh-100 bg-white text-dark">
            <HeaderBar />
            
            <div className="container-fluid py-4">
                <div className="d-flex flex-column gap-4">
                    {/* Search Section */}
                    <SearchPanel
                        onSearch={handleSearch}
                        searchResults={searchResults}
                        selectedResult={selectedResult}
                        onResultSelect={setSelectedResult}
                        quantity={quantity}
                        onQuantityChange={setQuantity}
                        isSearching={isSearching}
                    />

                    {/* File Attachments Section */}
                    <AttachmentsPanel
                        otherAttachments={otherAttachments}
                        finishAttachments={finishAttachments}
                        onOtherAttachmentsChange={setOtherAttachments}
                        onFinishAttachmentsChange={setFinishAttachments}
                    />

                    {/* Action Bar Section */}
                    <ActionBar
                        onOpenBoeingFinish={handleOpenBoeingFinish}
                        onOpenAddParty={handleOpenAddParty}
                    />

                    {/* Footer Actions Section */}
                    <FooterActions
                        onOpenPreview={handleOpenPreview}
                        isPreviewDisabled={isPreviewLoading}
                    />
                </div>
            </div>

            <PreviewModal
                isOpen={isPreviewModalOpen}
                onClose={handleClosePreview}
            >
                {/* Modal content will be rendered by renderRecipientsModalReact */}
            </PreviewModal>
        </div>
    );
}

// Mount the app as a React island
let appRoot = null;

export function mountVendorQuotingApp() {
    // Find the existing container (should exist in home.html)
    let container = document.getElementById('vendor-quoting-root');
    if (!container) {
        console.error('vendor-quoting-root container not found! Check home.html');
        return;
    }

    // Create root if needed
    if (!appRoot) {
        appRoot = createRoot(container);
    }

    // Render the app
    appRoot.render(<VendorQuotingApp />);
}

export function unmountVendorQuotingApp() {
    if (appRoot) {
        appRoot.unmount();
        appRoot = null;
    }
    // Don't remove the container - leave it in the DOM for reuse
    // The container is managed by home.html and should persist
}

// Export the component for direct use
export default VendorQuotingApp;
