//@ts-check
import React, { useEffect, useState, useCallback } from "react";
import { createRoot } from "react-dom/client";
import SharedHeaderBar from "../../components/shared/HeaderBar.jsx";
import CustomerBuyerPanel from "./customer_buyer_panel";
import FileUploadSection from "./file_input";
import DateSection from "./date_picker.jsx";
import ActionBar from "./action_bar";
import DualListModal from "./modals/document_group";
import DocumentMapModal from "./DocumentMapModal";
import { parseExcelFiles, generateRfq } from "../../api_calls";



export default function RfqApp() {
    // Define initial/default state
    const getInitialState = () => ({
        customer_pk: null,
        customer_name: null, // Store the party name
        buyer_pk: null,
        customer_rfq_number: null,
        files: { 
            excel: /** @type {Array<File & {path?: string}>} */ ([]), 
            estimation: /** @type {Array<File & {path?: string}>} */ ([]), 
            parts_requested: /** @type {Array<File & {path?: string}>} */ ([])
        },
        dates: { inquiry: "", due: "" },
        // Store mapping results
        mappings: {
            partToDoc: /** @type {Record<string, string[]>} */ ({}), // { [partNo]: documentKeys[] }
            partToTemplate: /** @type {Record<string, string[]>} */ ({}), // { [partNo]: templateKeys[] }
            docToGroup: /** @type {Record<string, string[]>} */ ({}) // { [docKey]: groupKeys[] }
        }
    });

    const [state, setState] = useState(getInitialState());
    
    // New modal state
    const getInitialModalState = () => ({
        open: false,
        mode: "part-doc"
    });
    
    const [documentMapModal, setDocumentMapModal] = useState(getInitialModalState());

    // Loading state for RFQ generation
    const [isGenerating, setIsGenerating] = useState(false);

    // Reset function to restore all state to factory defaults
    const resetToDefaults = useCallback(() => {
        setState(getInitialState());
        setDocumentMapModal(getInitialModalState());
        setIsGenerating(false);
    }, []);

    const handlePanelChange = useCallback((partial) => {
        setState(prev => ({ ...prev, ...partial }));
    }, []);

    const handleFileUpload = useCallback((name, newFiles) => {
        setState(prev => {
            const existing = prev.files[name] || [];
            const key = f => `${f.name}-${f.size}-${f.lastModified}`;

            // append then de-dupe by (name,size,lastModified)
            const mergedMap = new Map(existing.map(f => [key(f), f]));
            for (const f of newFiles) mergedMap.set(key(f), f);

            return {
                ...prev,
                files: { ...prev.files, [name]: Array.from(mergedMap.values()) },
            };
        });
    }, []);

    const handleFileRemove = useCallback((name, index) => {
        setState(prev => {
            const list = (prev.files[name] || []).slice();
            list.splice(index, 1);
            return { ...prev, files: { ...prev.files, [name]: list } };
        });
    }, []);

    // Handle date changes
    const handleDateChange = useCallback((field, value) => {
        setState(prev => ({
            ...prev,
            dates: { ...prev.dates, [field]: value }
        }));
    }, []);

    // Handle opening the new document map modal
    const handleMapPress = useCallback((mode) => {
        setDocumentMapModal({ open: true, mode });
    }, []);

    // Handle closing the modal
    const handleMapClose = useCallback(() => {
        setDocumentMapModal(prev => ({ ...prev, open: false }));
    }, []);

    // Handle saving mappings
    const handleMapSave = useCallback((result) => {
        console.log("Document mappings saved:", result);
        
        setState(prev => {
            const newMappings = { ...prev.mappings };
            
            if (result.mode === "part-doc") {
                newMappings.partToDoc = result.mappings;
            } else if (result.mode === "template") {
                newMappings.partToTemplate = result.mappings;
            } else if (result.mode === "doc-group") {
                newMappings.docToGroup = result.mappings;
            }
            
            return { ...prev, mappings: newMappings };
        });
        
        setDocumentMapModal(prev => ({ ...prev, open: false }));
    }, []);



    // Build RfqRequest payload from in-memory data
    const buildRfqRequestPayload = useCallback(() => {
        // Create part_to_quote_map: { [partNo]: quotePK } (use template mappings as quote mappings)
        const part_to_quote_map = {};
        Object.entries(state.mappings.partToTemplate).forEach(([partNo, templateKeys]) => {
            if (templateKeys.length > 0) {
                part_to_quote_map[partNo] = templateKeys[0]; // Use template as quote identifier
            }
        });
        
        // Create part_to_template_map: { [partNo]: templatePK } (same as quote for now)
        const part_to_template_map = {};
        Object.entries(state.mappings.partToTemplate).forEach(([partNo, templateKeys]) => {
            if (templateKeys.length > 0) {
                part_to_template_map[partNo] = templateKeys[0]; // Take first template if multiple
            }
        });
        
        // Create part_to_doc_map: { [partNo]: Document[] } where Document = { url, group_pk }
        const part_to_doc_map = {};
        Object.entries(state.mappings.partToDoc).forEach(([partNo, docKeys]) => {
            part_to_doc_map[partNo] = docKeys.map(docKey => {
                // Find the file object to get the full path
                const allFiles = [...(state.files.excel || []), ...(state.files.estimation || []), ...(state.files.parts_requested || [])];
                const fileObj = allFiles.find(f => f.name === docKey);
                const fullPath = fileObj?.path || docKey;
                
                // Find corresponding group_pk from doc→group map using the full path
                const groupKeys = state.mappings.docToGroup[fullPath] || state.mappings.docToGroup[docKey] || [];
                const group_pk = groupKeys.length > 0 ? groupKeys[0] : null; // Take first group if multiple
                
                return {
                    url: fullPath, // Use full path
                    group_pk: group_pk
                };
            });
        });
        
        // Prepare file arrays
        const excel_files = (state.files.excel || []).map(file => file.path || file.name);
        const estimation_files = (state.files.estimation || []).map(file => {
            // Find group_pk for this file using full path first, then fallback to name
            const fullPath = file.path || file.name;
            const groupKeys = state.mappings.docToGroup[fullPath] || state.mappings.docToGroup[file.name] || [];
            const group_pk = groupKeys.length > 0 ? groupKeys[0] : null;
            
            return {
                url: fullPath, // Use full path
                group_pk: group_pk
            };
        });
        
        // Build rfq_metadata
        const currentDate = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
        const rfq_metadata = {
            customer_rfq_number: state.customer_rfq_number,
            buyer_fk: state.buyer_pk,
            party_pk: state.customer_pk,
            party_name: state.customer_name, // Use stored customer name
            itar: false, // TODO: Add ITAR field to form if needed
            inquiry_date: state.dates.inquiry || currentDate,
            due_date: state.dates.due || currentDate,
            current_date: currentDate,
            update_rfq_pk: null // For updates, this would be populated
        };
        
        const payload = {
            part_to_quote_map,
            part_to_template_map,
            part_to_doc_map,
            excel_files,
            estimation_files,
            rfq_metadata
        };
        
        return payload;
    }, [state]);

    const openDocumentMap = useCallback(async () => {
        // 1) Gather Excel files for future API
        const excelFiles = state?.files?.excel ?? [];
        // Extract file paths from the file objects
        const filePaths = excelFiles.map(file => file.path || file.name);
        
        const res = await parseExcelFiles(filePaths);
        console.log(res);

        // TODO: Why is this here? 
        const left = /** @type {string[]} */ (["PN-001", "PN-002", "PN-003"]);
        const right = /** @type {Record<string, any[]>} */ ({
            "PN-001": ["Cert", "Drawing", ["SpecSheet", "spec_001.pdf"]],
            "PN-002": ["MSDS", "Work Instructions"],
            "PN-003": ["Traveler"],
        });

        // 3) Mount the modal (no other app state needed)
        let host = document.getElementById("docmap-modal-host");
        if (!host) {
            host = document.createElement("div");
            host.id = "docmap-modal-host";
            document.body.appendChild(host);
        }
        const root = createRoot(host);

        const close = () => {
            // unmount and clean up container
            root.unmount();
            host.remove();
        };

        root.render(
            <DualListModal
                open={true}
                title="Document Map"
                leftItems={/** @type {any[]} */ (left)}
                rightMap={right}
                oneToOneOnly={false}
                onClose={close}
                onSubmit={({ left: l, right: r }) => {
                    console.log("DocMap selection:", { left: l, right: r });
                    close();
                }}
            />
        );

        console.log("DocumentMap: prepared payload & fake lists", { excelFiles, left, right });
    }, [state.files, state.customer_pk, state.buyer_pk, state.customer_rfq_number]);


    return (
        <div className="bg-white text-dark" style={{ 
            fontFamily: '"Inter", "Segoe UI", system-ui, -apple-system, sans-serif',
            letterSpacing: '-0.01em'
        }}>
            {/* Fixed container that stays below title bar */}
            <div style={{
                height: 'calc(100vh - 32px)', // Full height minus title bar
                display: 'flex',
                flexDirection: 'column'
            }}>
                <SharedHeaderBar
                    icon="bi bi-file-earmark-text-fill"
                    title="RFQ Gen"
                    subtitle="Auto Gen - RFQ Management"
                    sticky={false}
                />
                
                {/* Main content with scrolling */}
                <div 
                    className="flex-grow-1"
                    style={{ 
                        overflowY: 'auto',
                        overflowX: 'hidden'
                    }}
                >
                    <div className="container" style={{ 
                        maxWidth: '1200px',
                        margin: '0 auto',
                        padding: '2rem 1.5rem',
                        marginLeft: '1.5rem' // Offset from sidebar
                    }}>
                        <div className="d-flex flex-column" style={{ gap: '2rem' }}>
                            <CustomerBuyerPanel
                                value={{ customer_pk: state.customer_pk, customer_name: state.customer_name, buyer_pk: state.buyer_pk, customer_rfq_number: state.customer_rfq_number }}
                                onChange={handlePanelChange}
                            />
                            <FileUploadSection
                                onChange={handleFileUpload}
                                onRemove={handleFileRemove}
                                onMapPress={handleMapPress}
                                files={state.files}
                            />
                            <DateSection 
                                inquiryDate={state.dates.inquiry}
                                dueDate={state.dates.due}
                                onDateChange={handleDateChange}
                            />
                            <ActionBar
                                onGenerate={async () => {
                                    setIsGenerating(true);
                                    try {
                                        const payload = buildRfqRequestPayload();
                                        console.log("Generate RFQ payload:", JSON.stringify(payload, null, 2));
                                        const result = await generateRfq(payload);
                                        console.log("RFQ generated successfully:", result);
                                        
                                        // Show success message with generated RFQ PK
                                        if (result && result.generated) {
                                            alert(`RFQ generated successfully! RFQ PK: ${result.generated}`);
                                        } else {
                                            alert("RFQ generated successfully!");
                                        }
                                        
                                        // Reset application state to factory defaults after successful generation
                                        resetToDefaults();
                                    } catch (error) {
                                        console.error("Failed to generate RFQ:", error);
                                        alert(`Failed to generate RFQ: ${error.message || error}`);
                                    } finally {
                                        setIsGenerating(false);
                                    }
                                }}
                                onUpdate={() => {
                                    const payload = buildRfqRequestPayload();
                                    console.log("Update RFQ payload:", JSON.stringify(payload, null, 2));
                                }}
                                onReset={resetToDefaults}
                            />
                        </div>
                    </div>
                </div>
                
                {/* Document Map Modal */}
                <DocumentMapModal
                    open={documentMapModal.open}
                    mode={documentMapModal.mode}
                    onClose={handleMapClose}
                    onSave={handleMapSave}
                    uploadedFiles={state.files}
                    existingMappings={state.mappings}
                />
                
                {/* Loading Overlay */}
                {isGenerating && (
                    <div style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'rgba(0, 0, 0, 0.5)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 9999
                    }}>
                        <div style={{
                            backgroundColor: 'white',
                            padding: '30px',
                            borderRadius: '8px',
                            textAlign: 'center',
                            minWidth: '200px'
                        }}>
                            <div className="spinner-border text-primary mb-3" role="status">
                                <span className="visually-hidden">Loading...</span>
                            </div>
                            <div style={{ fontSize: '16px', fontWeight: '500' }}>
                                Generating RFQ...
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

