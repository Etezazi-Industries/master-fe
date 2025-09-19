// @ts-check
import React, { useState, useEffect } from "react";
import { ModalShell } from "./modals/document_group";
import { parseExcelFiles, requestJson, getDocGroups, getQuoteTemplates } from "../../api_calls";
import { autoAssignPartsToDocuments, autoAssignDocumentsToGroups, autoAssignPartsToTemplates } from "./file_input";

/**
 * Reusable list component with search functionality
 */
function SearchableList({
    items = /** @type {any[]} */ ([]),
    multiple = false,
    selected,
    onSelect,
    title = "Items",
    loading = false,
    error = /** @type {string | null} */ (null),
    onRetry = /** @type {(() => void) | null} */ (null),
    searchPlaceholder = "Search items...",
    mappedItems = /** @type {Set | undefined} */ (undefined), // Items that are already mapped
    showClearButton = false, // Whether to show clear selection button
    onClearSelection = /** @type {(() => void) | null} */ (null), // Handler for clear selection
    getKey = (x) => {
        if (x && typeof x === "object") {
            if ("id" in x) return x.id;
            if ("part_number" in x) return x.part_number;
        }
        return x;
    },
    getLabel = (x) => {
        if (Array.isArray(x)) return String(x[0]);
        if (x && typeof x === "object") {
            if ("part_number" in x) return String(x.part_number);
            if ("label" in x) return String(x.label);
        }
        return String(x);
    },
}) {
    const [searchTerm, setSearchTerm] = useState("");

    // Filter items based on search term
    const filteredItems = items.filter(item => {
        const label = getLabel(item).toLowerCase();
        return label.includes(searchTerm.toLowerCase());
    });

    const isActive = (key) => {
        if (multiple) {
            // For multiple selection, selected should be a Set
            return selected && typeof selected.has === 'function' ? selected.has(key) : false;
        } else {
            // For single selection, selected should be a string/key
            return selected === key;
        }
    };
    const isMapped = (key) => mappedItems?.has(key) || false;

    const handleClick = (key) => {
        if (multiple) {
            // Ensure we have a Set for multiple selection
            const currentSet = selected && typeof selected.has === 'function' ? selected : new Set();
            const next = new Set(currentSet);
            next.has(key) ? next.delete(key) : next.add(key);
            onSelect(next);
        } else {
            onSelect(key);
        }
    };

    // Check if there are any selections to clear
    const hasSelections = () => {
        if (multiple) {
            return selected && typeof selected.has === 'function' && selected.size > 0;
        } else {
            return selected !== null && selected !== undefined && selected !== "";
        }
    };

    return (
        <div className="d-flex flex-column" style={{ height: "800px" }}>
            <div className="mb-2 fw-semibold d-flex justify-content-between align-items-center">
                <span>{title}</span>
                {multiple && selected && typeof selected.has === 'function' && selected.size > 0 && (
                    <small className="text-muted">({selected.size} selected)</small>
                )}
            </div>
            
            {/* Clear Selection Button */}
            {showClearButton && (
                <div className="mb-2">
                    <button
                        type="button"
                        className="btn btn-outline-secondary btn-sm w-100"
                        onClick={() => {
                            if (multiple) {
                                onSelect(new Set());
                            } else {
                                onSelect(null);
                            }
                            onClearSelection?.();
                        }}
                        disabled={!hasSelections()}
                        title={hasSelections() ? "Clear all selections" : "No selections to clear"}
                    >
                        🗑️ Clear Selection
                    </button>
                </div>
            )}
            
            <div className="mb-2">
                <div className="position-relative">
                    <input
                        type="text"
                        className="form-control form-control-sm"
                        placeholder={searchPlaceholder}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{ paddingRight: searchTerm ? "35px" : undefined }}
                    />
                    {searchTerm && (
                        <button
                            type="button"
                            className="btn btn-sm position-absolute"
                            style={{
                                right: "5px",
                                top: "50%",
                                transform: "translateY(-50%)",
                                border: "none",
                                background: "none",
                                padding: "0",
                                width: "20px",
                                height: "20px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                color: "#6c757d"
                            }}
                            onClick={() => setSearchTerm("")}
                            title="Clear search"
                        >
                            ×
                        </button>
                    )}
                </div>
            </div>

            <div style={{ height: "650px", position: "relative" }}>
                {loading && (
                    <div className="d-flex justify-content-center align-items-center h-100">
                        <div className="spinner-border spinner-border-sm" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </div>
                    </div>
                )}
                
                {error && (
                    <div className="alert alert-danger d-flex justify-content-between align-items-center">
                        <small>{error}</small>
                        {onRetry && (
                            <button className="btn btn-sm btn-outline-danger" onClick={onRetry}>
                                Retry
                            </button>
                        )}
                    </div>
                )}
                
                {!loading && !error && (
                    <div className="border rounded overflow-auto" style={{ height: "650px", maxHeight: "650px" }}>
                        <ul className="list-group list-group-flush m-0">
                            {filteredItems.length === 0 ? (
                                <li className="list-group-item text-muted text-center">
                                    {searchTerm ? "No items match your search" : "No items available"}
                                </li>
                            ) : (
                                filteredItems.map((item) => {
                                    const key = getKey(item);
                                    const label = getLabel(item);
                                    const mapped = isMapped(key);
                                    const active = isActive(key);

                                    let className = "list-group-item d-flex justify-content-between align-items-center";
                                    if (active) {
                                        className += " active";
                                    } else if (mapped) {
                                        className += " list-group-item-success";
                                    }

                                    return (
                                        <li
                                            key={key}
                                            role="button"
                                            className={className}
                                            onClick={() => handleClick(key)}
                                        >
                                            <span className="text-truncate">{label}</span>
                                            {multiple && active && (
                                                <span className="badge bg-primary">✓</span>
                                            )}
                                            {multiple && mapped && !active && (
                                                <span className="badge bg-success">📎</span>
                                            )}
                                        </li>
                                    );
                                })
                            )}
                        </ul>
                    </div>
                )}
            </div>
        </div>
    );
}

/**
 * Document Map Modal with three modes:
 * - "part-doc": Parts (from Excel) ↔ Documents (uploaded files)
 * - "doc-group": Documents (uploaded files) ↔ Document Groups (from API)
 * - "template": Parts (from Excel) ↔ Templates (from API)
 */
export default function DocumentMapModal({
    open,
    mode = "part-doc", // "part-doc" | "doc-group" | "template"
    onClose,
    onSave,
    uploadedFiles = /** @type {{excel?: any[], estimation?: any[], parts_requested?: any[]}} */ ({}), // { excel: [], estimation: [], parts_requested: [] }
    existingMappings = /** @type {{partToDoc?: Record<string, string[]>, docToGroup?: Record<string, string[]>, partToTemplate?: Record<string, string[]>}} */ ({}),
}) {
    const [leftItems, setLeftItems] = useState(/** @type {any[]} */ ([]));
    const [rightItems, setRightItems] = useState(/** @type {any[]} */ ([]));
    const [leftLoading, setLeftLoading] = useState(false);
    const [rightLoading, setRightLoading] = useState(false);
    const [leftError, setLeftError] = useState(/** @type {string | null} */ (null));
    const [rightError, setRightError] = useState(/** @type {string | null} */ (null));
    const [autoAssignLoading, setAutoAssignLoading] = useState(false);
    
    const [leftSelected, setLeftSelected] = useState(/** @type {Set | string | null} */ (new Set()));
    const [rightSelected, setRightSelected] = useState(/** @type {Set | string | null} */ (new Set()));
    const [mappings, setMappings] = useState(new Map()); // leftKey -> Set of rightKeys

    // Get title and labels based on mode
    const getModalConfig = () => {
        switch (mode) {
            case "part-doc":
                return {
                    title: "Part–Document Map",
                    leftTitle: "Parts",
                    rightTitle: "Documents",
                    leftPlaceholder: "Search parts...",
                    rightPlaceholder: "Search documents..."
                };
            case "doc-group":
                return {
                    title: "Document Group Map",
                    leftTitle: "Document Groups",
                    rightTitle: "Documents",
                    leftPlaceholder: "Search groups...",
                    rightPlaceholder: "Search documents..."
                };
            case "template":
                return {
                    title: "Template Map",
                    leftTitle: "Templates",
                    rightTitle: "Parts",
                    leftPlaceholder: "Search templates...",
                    rightPlaceholder: "Search parts..."
                };
            default:
                return {
                    title: "Document Map",
                    leftTitle: "Left Items",
                    rightTitle: "Right Items",
                    leftPlaceholder: "Search...",
                    rightPlaceholder: "Search..."
                };
        }
    };

    const config = getModalConfig();

    // Fetch left items based on mode
    const fetchLeftItems = async () => {
        setLeftLoading(true);
        setLeftError(null);
        
        try {
            if (mode === "part-doc") {
                // Fetch parts from Excel files
                if (uploadedFiles.excel?.length) {
                    const filePaths = uploadedFiles.excel.map(file => file.path || file.name);
                    const result = await parseExcelFiles(filePaths);
                    setLeftItems(result.parts || []);
                } else {
                    setLeftItems([]);
                }
            } else if (mode === "template") {
                // Fetch templates from API for left panel
                try {
                    const templates = await getQuoteTemplates();
                    // API returns List[Tuple[str, int]] -> convert to [{id, label}] format
                    const formattedTemplates = (templates || []).map(([label, id]) => ({
                        id: id.toString(),
                        label: `${label} (ID: ${id})`
                    }));
                    setLeftItems(formattedTemplates);
                } catch (apiError) {
                    console.error("Failed to fetch quote templates:", apiError);
                    setLeftError("No data could be fetched, restart the API or contact developer");
                }
            } else if (mode === "doc-group") {
                // Fetch document groups from API for left panel
                try {
                    const groups = await getDocGroups();
                    // API returns List[Tuple[str, int]] -> convert to [{id, label}] format
                    const formattedGroups = (groups || []).map(([label, id]) => ({
                        id: id.toString(),
                        label: `${label} (ID: ${id})`
                    }));
                    setLeftItems(formattedGroups);
                } catch (apiError) {
                    console.error("Failed to fetch document groups:", apiError);
                    setLeftError("No data could be fetched, restart the API or contact developer");
                }
            }
        } catch (error) {
            console.error("Error fetching left items:", error);
            setLeftError(error.message);
        } finally {
            setLeftLoading(false);
        }
    };

    // Fetch right items based on mode
    const fetchRightItems = async () => {
        setRightLoading(true);
        setRightError(null);
        
        try {
            if (mode === "part-doc") {
                // Use uploaded documents
                const allDocs = [
                    ...(uploadedFiles.excel || []).map(f => ({ id: f.name, label: f.name, type: 'excel' })),
                    ...(uploadedFiles.estimation || []).map(f => ({ id: f.name, label: f.name, type: 'estimation' })),
                    ...(uploadedFiles.parts_requested || []).map(f => ({ id: f.name, label: f.name, type: 'parts_requested' }))
                ];
                setRightItems(allDocs);
            } else if (mode === "doc-group") {
                // Use uploaded documents for right panel
                const allDocs = [
                    ...(uploadedFiles.excel || []).map(f => ({ id: f.name, label: f.name, type: 'excel' })),
                    ...(uploadedFiles.estimation || []).map(f => ({ id: f.name, label: f.name, type: 'estimation' })),
                    ...(uploadedFiles.parts_requested || []).map(f => ({ id: f.name, label: f.name, type: 'parts_requested' }))
                ];
                setRightItems(allDocs);
            } else if (mode === "template") {
                // Fetch parts from Excel files for right panel
                if (uploadedFiles.excel?.length) {
                    const filePaths = uploadedFiles.excel.map(file => file.path || file.name);
                    const result = await parseExcelFiles(filePaths);
                    setRightItems(result.parts || []);
                } else {
                    setRightItems([]);
                }
            }
        } catch (error) {
            console.error("Error fetching right items:", error);
            setRightError(error.message);
        } finally {
            setRightLoading(false);
        }
    };

    // Load existing mappings and auto-populate defaults
    const loadMappings = async () => {
        const newMappings = new Map();
        
        // Load existing mappings based on mode
        let existingMap = {};
        if (mode === "part-doc" && existingMappings.partToDoc) {
            existingMap = existingMappings.partToDoc;
        } else if (mode === "doc-group" && existingMappings.docToGroup) {
            existingMap = existingMappings.docToGroup;
        } else if (mode === "template" && existingMappings.partToTemplate) {
            existingMap = existingMappings.partToTemplate;
        }
        
        // Convert existing mappings to Map format
        Object.entries(existingMap).forEach(([key, values]) => {
            if (values && values.length > 0) {
                newMappings.set(key, new Set(values));
            }
        });
        
        // Auto-populate defaults for part-doc mode if no existing mappings
        if (mode === "part-doc" && newMappings.size === 0) {
            try {
                // Get parts from Excel files
                if (uploadedFiles.excel?.length) {
                    setAutoAssignLoading(true);
                    const filePaths = uploadedFiles.excel.map(file => file.path || file.name);
                    const result = await parseExcelFiles(filePaths);
                    const parts = result.parts || [];
                    
                    if (parts.length > 0) {
                        // Generate auto-assignment mapping
                        const defaultMapping = autoAssignPartsToDocuments(parts, uploadedFiles);
                        
                        // Add default mappings to newMappings
                        Object.entries(defaultMapping).forEach(([partNo, docNames]) => {
                            if (docNames && docNames.length > 0) {
                                newMappings.set(partNo, new Set(docNames));
                            }
                        });
                        
                        console.log("Auto-populated default part-doc mappings:", defaultMapping);
                    }
                }
            } catch (error) {
                console.error("Error auto-populating defaults:", error);
            } finally {
                setAutoAssignLoading(false);
            }
        }
        
        // Auto-populate defaults for doc-group mode if no existing mappings
        if (mode === "doc-group" && newMappings.size === 0) {
            try {
                // Check if we have any files to process
                const totalFiles = (uploadedFiles.excel?.length || 0) + 
                                 (uploadedFiles.estimation?.length || 0) + 
                                 (uploadedFiles.parts_requested?.length || 0);
                
                if (totalFiles > 0) {
                    setAutoAssignLoading(true);
                    
                    // Generate auto-assignment mapping based on file extensions
                    const defaultMapping = autoAssignDocumentsToGroups(uploadedFiles);
                    
                    // Add default mappings to newMappings
                    Object.entries(defaultMapping).forEach(([docName, groupIds]) => {
                        if (groupIds && groupIds.length > 0) {
                            newMappings.set(docName, new Set(groupIds));
                        }
                    });
                    
                    console.log("Auto-populated default doc-group mappings:", defaultMapping);
                }
            } catch (error) {
                console.error("Error auto-populating doc-group defaults:", error);
            } finally {
                setAutoAssignLoading(false);
            }
        }
        
        // Auto-populate defaults for template mode if no existing mappings
        if (mode === "template" && newMappings.size === 0) {
            try {
                // Get parts from Excel files
                if (uploadedFiles.excel?.length) {
                    setAutoAssignLoading(true);
                    const filePaths = uploadedFiles.excel.map(file => file.path || file.name);
                    const result = await parseExcelFiles(filePaths);
                    const parts = result.parts || [];
                    
                    if (parts.length > 0) {
                        // Generate auto-assignment mapping (all parts to template 494)
                        const defaultMapping = autoAssignPartsToTemplates(parts);
                        
                        // Add default mappings to newMappings
                        Object.entries(defaultMapping).forEach(([partNo, templateIds]) => {
                            if (templateIds && templateIds.length > 0) {
                                newMappings.set(partNo, new Set(templateIds));
                            }
                        });
                        
                        console.log("Auto-populated default part-template mappings:", defaultMapping);
                    }
                }
            } catch (error) {
                console.error("Error auto-populating template defaults:", error);
            } finally {
                setAutoAssignLoading(false);
            }
        }
        
        setMappings(newMappings);
    };

    // Load data when modal opens or mode changes
    useEffect(() => {
        if (open) {
            fetchLeftItems();
            fetchRightItems();
            
            // Reset selections with proper types based on mode
            if (mode === "part-doc") {
                setLeftSelected(null); // Single selection for parts
                setRightSelected(new Set()); // Multiple selection for documents
            } else if (mode === "doc-group" || mode === "template") {
                setLeftSelected(null); // Single selection for groups/templates
                setRightSelected(new Set()); // Multiple selection for documents/parts
            } else {
                setLeftSelected(new Set()); // Multiple selection for other modes
                setRightSelected(new Set()); // Multiple selection for other modes
            }
            
            // Load existing mappings and auto-populate defaults
            loadMappings();
        }
    }, [open, mode, existingMappings, uploadedFiles]);

    // Handle assign operation
    const handleAssign = () => {
        if (mode === "part-doc") {
            // Single part to multiple documents
            const rightSet = rightSelected && typeof rightSelected === 'object' && 'has' in rightSelected ? /** @type {Set} */ (rightSelected) : new Set();
            if (!leftSelected || rightSet.size === 0) return;
            
            const newMappings = new Map(mappings);
            if (!newMappings.has(leftSelected)) {
                newMappings.set(leftSelected, new Set());
            }
            const existing = newMappings.get(leftSelected);
            rightSet.forEach(rightKey => existing.add(rightKey));
            
            setMappings(newMappings);
        } else if (mode === "doc-group") {
            // Single document group to multiple documents (but store one-to-one)
            const rightSet = rightSelected && typeof rightSelected === 'object' && 'has' in rightSelected ? /** @type {Set} */ (rightSelected) : new Set();
            if (!leftSelected || rightSet.size === 0) return;
            
            const newMappings = new Map(mappings);
            
            // For each selected document, remove from any existing group first (one-to-one constraint)
            rightSet.forEach(docKey => {
                // Remove document from all existing groups
                for (const [existingDocKey, groups] of newMappings.entries()) {
                    if (existingDocKey === docKey) {
                        groups.clear();
                    }
                }
                
                // Set the new mapping (one document to one group)
                if (!newMappings.has(docKey)) {
                    newMappings.set(docKey, new Set());
                }
                const existing = newMappings.get(docKey);
                existing.clear(); // Clear any existing groups
                existing.add(leftSelected);
            });
            
            setMappings(newMappings);
        } else if (mode === "template") {
            // Template mode: Single template to multiple parts (but store one-to-one part->template)
            const rightSet = rightSelected && typeof rightSelected === 'object' && 'has' in rightSelected ? /** @type {Set} */ (rightSelected) : new Set();
            if (!leftSelected || rightSet.size === 0) return;
            
            const newMappings = new Map(mappings);
            
            // For each selected part, remove from any existing template first (one-to-one constraint)
            rightSet.forEach(partKey => {
                // Remove part from all existing templates
                for (const [existingPartKey, templates] of newMappings.entries()) {
                    if (existingPartKey === partKey) {
                        templates.clear();
                    }
                }
                
                // Set the new mapping (one part to one template)
                if (!newMappings.has(partKey)) {
                    newMappings.set(partKey, new Set());
                }
                const existing = newMappings.get(partKey);
                existing.clear(); // Clear any existing templates
                existing.add(leftSelected);
            });
            
            setMappings(newMappings);
        }
    };

    // Handle unassign operation
    const handleUnassign = () => {
        if (mode === "part-doc") {
            // Single part to multiple documents
            const rightSet = rightSelected && typeof rightSelected === 'object' && 'has' in rightSelected ? /** @type {Set} */ (rightSelected) : new Set();
            if (!leftSelected || rightSet.size === 0) return;
            
            const newMappings = new Map(mappings);
            if (newMappings.has(leftSelected)) {
                const existing = newMappings.get(leftSelected);
                rightSet.forEach(rightKey => existing.delete(rightKey));
                if (existing.size === 0) {
                    newMappings.delete(leftSelected);
                }
            }
            
            setMappings(newMappings);
        } else if (mode === "doc-group") {
            // Single document group to multiple documents (but store one-to-one)
            const rightSet = rightSelected && typeof rightSelected === 'object' && 'has' in rightSelected ? /** @type {Set} */ (rightSelected) : new Set();
            if (!leftSelected || rightSet.size === 0) return;
            
            const newMappings = new Map(mappings);
            
            // For each selected document, remove the mapping if it exists
            rightSet.forEach(docKey => {
                if (newMappings.has(docKey)) {
                    const existing = newMappings.get(docKey);
                    existing.delete(leftSelected);
                    if (existing.size === 0) {
                        newMappings.delete(docKey);
                    }
                }
            });
            
            setMappings(newMappings);
        } else if (mode === "template") {
            // Template mode: Single template to multiple parts (but store one-to-one part->template)
            const rightSet = rightSelected && typeof rightSelected === 'object' && 'has' in rightSelected ? /** @type {Set} */ (rightSelected) : new Set();
            if (!leftSelected || rightSet.size === 0) return;
            
            const newMappings = new Map(mappings);
            
            // For each selected part, remove the mapping if it exists
            rightSet.forEach(partKey => {
                if (newMappings.has(partKey)) {
                    const existing = newMappings.get(partKey);
                    existing.delete(leftSelected);
                    if (existing.size === 0) {
                        newMappings.delete(partKey);
                    }
                }
            });
            
            setMappings(newMappings);
        }
    };

    // Handle save
    const handleSave = () => {
        const mappingResult = {};
        mappings.forEach((rightKeys, leftKey) => {
            mappingResult[leftKey] = Array.from(rightKeys);
        });
        
        onSave?.({
            mode,
            mappings: mappingResult,
            leftItems: leftItems,
            rightItems: rightItems
        });
        onClose?.();
    };

    // Get mapping count for display
    const getMappingCount = () => {
        let totalMappings = 0;
        mappings.forEach(rightKeys => {
            totalMappings += rightKeys.size;
        });
        return totalMappings;
    };

    return (
        <ModalShell
            open={open}
            title={config.title}
            onClose={onClose}
            onConfirm={handleSave}
            confirmLabel="Save Mappings"
        >
            <div className="container-fluid" style={{ height: "900px" }}>
                <div className="row g-3" style={{ height: "750px" }}>
                    {/* Left Panel */}
                    <div className="col-12 col-md-5">
                        <SearchableList
                            items={leftItems}
                            multiple={mode === "part-doc" || mode === "doc-group" || mode === "template" ? false : true}
                            selected={leftSelected}
                            onSelect={setLeftSelected}
                            title={config.leftTitle}
                            loading={leftLoading}
                            error={leftError}
                            onRetry={() => fetchLeftItems()}
                            searchPlaceholder={config.leftPlaceholder}
                        />
                    </div>

                    {/* Center Controls */}
                    <div className="col-12 col-md-2 d-flex flex-column justify-content-center align-items-center">
                        <button
                            className="btn btn-primary btn-sm mb-2"
                            onClick={handleAssign}
                            disabled={
                                mode === "part-doc" || mode === "doc-group" || mode === "template"
                                    ? !leftSelected || (typeof rightSelected === 'object' && rightSelected && rightSelected.size === 0) || false
                                        : !leftSelected || !(typeof leftSelected === 'object' && 'has' in leftSelected) || (/** @type {Set} */ (leftSelected)).size === 0 || (typeof rightSelected === 'object' && rightSelected && rightSelected.size === 0) || false
                            }
                            title="Assign selected items"
                        >
                            →
                        </button>
                        <button
                            className="btn btn-outline-secondary btn-sm mb-3"
                            onClick={handleUnassign}
                            disabled={
                                mode === "part-doc" || mode === "doc-group" || mode === "template"
                                    ? !leftSelected || (typeof rightSelected === 'object' && rightSelected && rightSelected.size === 0) || false
                                        : !leftSelected || !(typeof leftSelected === 'object' && 'has' in leftSelected) || (/** @type {Set} */ (leftSelected)).size === 0 || (typeof rightSelected === 'object' && rightSelected && rightSelected.size === 0) || false
                            }
                            title="Unassign selected items"
                        >
                            ←
                        </button>
                        <small className="text-muted text-center">
                            {getMappingCount()} mappings
                        </small>
                    </div>

                    {/* Right Panel */}
                    <div className="col-12 col-md-5">
                        <SearchableList
                            items={rightItems}
                            multiple={true}
                            selected={rightSelected}
                            onSelect={setRightSelected}
                            title={config.rightTitle}
                            loading={rightLoading}
                            error={rightError}
                            onRetry={() => fetchRightItems()}
                            searchPlaceholder={config.rightPlaceholder}
                            showClearButton={true}
                            onClearSelection={() => {
                                console.log("Right panel selection cleared");
                            }}
                            // For part-doc mode, highlight already mapped documents
                            // For doc-group mode, highlight documents already mapped to selected group
                            // For template mode, highlight parts already mapped to selected template
                            mappedItems={
                                mode === "part-doc" && leftSelected 
                                    ? mappings.get(leftSelected) 
                                    : (mode === "doc-group" || mode === "template") && leftSelected
                                        ? new Set(Array.from(mappings.entries())
                                            .filter(([itemKey, mappedTo]) => mappedTo.has(leftSelected))
                                            .map(([itemKey]) => itemKey))
                                        : undefined
                            }
                        />
                    </div>
                </div>

                {/* Mappings Preview */}
                {mappings.size > 0 && (
                    <div className="row mt-3">
                        <div className="col-12">
                            <div className="card">
                                <div className="card-header py-2">
                                    <small className="fw-semibold">Current Mappings ({mappings.size})</small>
                                </div>
                                <div className="card-body py-1" style={{ height: "80px", overflow: "auto" }}>
                                    {Array.from(mappings.entries()).map(([leftKey, rightKeys]) => (
                                        <div key={leftKey} className="mb-1" style={{ fontSize: "0.85rem" }}>
                                            <strong>{leftKey}</strong> → {Array.from(rightKeys).join(", ")}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
            
            {/* Auto-assign Loading Overlay */}
            {autoAssignLoading && (
                <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000,
                    borderRadius: '8px'
                }}>
                    <div style={{
                        textAlign: 'center',
                        padding: '20px'
                    }}>
                        <div className="spinner-border text-primary mb-3" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </div>
                        <div style={{ fontSize: '16px', fontWeight: '500', color: '#333' }}>
                            {mode === "part-doc" ? "Auto-assigning documents..." : 
                             mode === "doc-group" ? "Auto-assigning document groups..." : 
                             "Auto-assigning..."}
                        </div>
                    </div>
                </div>
            )}
        </ModalShell>
    );
}
