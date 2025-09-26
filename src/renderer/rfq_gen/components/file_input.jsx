// @ts-check
import React from "react";
import { parseExcelFiles } from "../../api_calls";


function ActionBar({ onMapPress, itar = false, onItarChange }) {
    return (
        <div className="d-flex align-items-center gap-3 my-3 flex-wrap">
            {/* Three mapping buttons */}
            <div className="d-flex gap-2">
                <button
                    type="button"
                    className="btn btn-outline-dark btn-sm"
                    onClick={() => onMapPress("part-doc")}
                >
                    Part–Doc Map
                </button>
                <button
                    type="button"
                    className="btn btn-outline-dark btn-sm"
                    onClick={() => onMapPress("doc-group")}
                >
                    Doc Group Map
                </button>
                <button
                    type="button"
                    className="btn btn-outline-dark btn-sm"
                    onClick={() => onMapPress("template")}
                >
                    Template Map
                </button>
            </div>

            {/* ITAR restricted checkbox */}
            <div className="form-check">
                <input
                    className="form-check-input"
                    type="checkbox"
                    id="itarCheck"
                    checked={itar}
                    onChange={(e) => onItarChange?.(e.target.checked)}
                />
                <label className="form-check-label" htmlFor="itarCheck">
                    ITAR RESTRICTED
                </label>
            </div>
        </div>
    );
}



/**
 * @param {{label: string, id: string, accept?: string, multiple?: boolean, name: string, onFiles: Function, onRemove: Function, files?: any[]}} props
 */
function FileUpload({
    label, id, accept = "", multiple = false, name, onFiles, onRemove, files = []
}) {
    const handleFileSelection = async () => {
        try {
            // Check if electronAPI is available
            if (!/** @type {any} */ (window).electronAPI || !/** @type {any} */ (window).electronAPI.selectFiles) {
                // Fallback to creating a hidden file input
                const input = document.createElement('input');
                input.type = 'file';
                input.accept = accept;
                input.multiple = multiple;
                input.onchange = (e) => {
                    const files = Array.from(/** @type {any} */ (e.target)?.files || []);
                    if (files.length > 0) {
                        onFiles?.(name, files);
                    }
                };
                input.click();
                return;
            }

            // Convert accept string to dialog filters
            const filters = [];
            if (accept) {
                if (accept.includes('.xlsx') || accept.includes('.xls') || accept.includes('.csv')) {
                    filters.push({ name: 'Excel Files', extensions: ['xlsx', 'xls', 'csv'] });
                } else {
                    filters.push({ name: 'All Files', extensions: ['*'] });
                }
            } else {
                filters.push({ name: 'All Files', extensions: ['*'] });
            }

            const result = await /** @type {any} */ (window).electronAPI.selectFiles({
                title: `Select ${label}`,
                filters,
                allowMultipleSelection: multiple
            });

            if (!result.canceled && result.files.length > 0) {
                onFiles?.(name, result.files);
            }
        } catch (error) {
            console.error('Error selecting files:', error);
            // Fallback to regular file input on error
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = accept;
            input.multiple = multiple;
            input.onchange = (e) => {
                const files = Array.from(/** @type {any} */ (e.target)?.files || []);
                if (files.length > 0) {
                    onFiles?.(name, files);
                }
            };
            input.click();
        }
    };

    return (
        <div className="mb-3 w-100">
            {label && <label className="form-label">{label}</label>}
            <div className="d-grid">
                <button
                    type="button"
                    className="btn btn-outline-dark"
                    onClick={handleFileSelection}
                >
                    📁 Select {label}
                </button>
            </div>

            {files.length > 0 && (
                <div 
                    className="mt-2 border rounded"
                    style={{ 
                        maxHeight: '200px', 
                        overflowY: 'auto',
                        fontSize: '0.75rem' // Smaller text size
                    }}
                >
                    <ul className="list-group list-group-flush">
                        {files.map((f, i) => (
                            <li
                                key={`${f.name}-${f.size}-${f.lastModified}-${i}`}
                                className="list-group-item py-1 d-flex justify-content-between align-items-center"
                                style={{ fontSize: '0.75rem' }} // Smaller text for each item
                            >
                                <div className="text-truncate" style={{ maxWidth: "75%" }}>
                                    <span className="text-truncate d-block fw-medium">{f.name}</span>
                                    {f.path && (
                                        <small className="text-muted d-block text-truncate" title={f.path} style={{ fontSize: '0.65rem' }}>
                                            📂 {f.path}
                                        </small>
                                    )}
                                </div>
                                <button
                                    type="button"
                                    className="btn btn-sm btn-outline-danger p-1"
                                    style={{ fontSize: '0.65rem', lineHeight: '1' }}
                                    aria-label={`Remove ${f.name}`}
                                    onClick={() => onRemove?.(name, i)}
                                    title="Remove"
                                >
                                    ×
                                </button>
                            </li>
                        ))}
                    </ul>
                    {files.length > 5 && (
                        <div className="text-center p-1 bg-light border-top">
                            <small className="text-muted" style={{ fontSize: '0.65rem' }}>
                                Showing all {files.length} files - scroll to see more
                            </small>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

/**
 * @param {{onChange: Function, onRemove: Function, onMapPress: Function, files: {excel?: any[], estimation?: any[], parts_requested?: any[]}, itar: boolean, onItarChange: Function}} props
 */
export default function FileUploadSection({ onChange, onRemove, onMapPress, files = { excel: [], estimation: [], parts_requested: [] }, itar = false, onItarChange }) {
    return (
        <div className="container my-4">
            <h5 className="mb-3">Upload Files</h5>
            <div className="row g-3 mt-3">
                <div className="col-12 col-md-4">
                    <FileUpload
                        label="Excel Files"
                        id="upload-excel"
                        name="excel"
                        accept=".xlsx,.xls,.csv"
                        multiple
                        onFiles={onChange}
                        onRemove={onRemove}
                        files={files.excel}
                    />
                </div>
                <div className="col-12 col-md-4">
                    <FileUpload
                        label="Estimation Files"
                        id="upload-estimation"
                        name="estimation"
                        multiple
                        onFiles={onChange}
                        onRemove={onRemove}
                        files={files.estimation}
                    />
                </div>
                <div className="col-12 col-md-4">
                    <FileUpload
                        label="Parts Requested Files"
                        id="upload-parts"
                        name="parts_requested"
                        multiple
                        onFiles={onChange}
                        onRemove={onRemove}
                        files={files.parts_requested}
                    />
                </div>
            </div>
            <ActionBar
                onMapPress={onMapPress}
                itar={itar}
                onItarChange={onItarChange}
            />
        </div>
    );
}

/**
 * Auto-assigns parts to documents based on part number strings found in file paths/names
 * @param {Array} parts - Array of part numbers from Excel files
 * @param {{excel?: any[], estimation?: any[], parts_requested?: any[]}} files - Uploaded files object
 * @returns {Record<string, string[]>} - Mapping of { [partNo]: [documentNames] }
 */
function autoAssignPartsToDocuments(parts, files) {
    /** @type {Record<string, string[]>} */
    const mapping = {};
    
    // Get all files from all categories
    const allFiles = [
        ...(files.excel || []),
        ...(files.estimation || []),
        ...(files.parts_requested || [])
    ];
    
    // For each part, find files that contain the part number in their path or name
    parts.forEach(part => {
        // Handle different part formats - extract part number string
        let partNo;
        if (typeof part === 'string') {
            partNo = part;
        } else if (part && typeof part === 'object') {
            // If part is an object, try to get part_number or other common fields
            partNo = part.part_number || part.partNumber || part.pn || part.id || String(part);
        } else {
            partNo = String(part);
        }
        
        // Ensure partNo is a valid string
        if (!partNo || typeof partNo !== 'string') {
            console.warn('Invalid part number:', part);
            return;
        }
        
        const matchingFiles = allFiles.filter(file => {
            const filePath = file.path || file.name || '';
            const fileName = file.name || '';
            
            // Check if part number exists in file path or name (case insensitive)
            return filePath.toLowerCase().includes(partNo.toLowerCase()) || 
                   fileName.toLowerCase().includes(partNo.toLowerCase());
        });
        
        if (matchingFiles.length > 0) {
            mapping[partNo] = matchingFiles.map(file => file.name);
        }
    });
    
    return mapping;
}

/**
 * Auto-assigns documents to document groups based on file extensions
 * @param {{excel?: any[], estimation?: any[], parts_requested?: any[]}} files - Uploaded files object
 * @returns {Record<string, string[]>} - Mapping of { [documentName]: [groupId] }
 */
function autoAssignDocumentsToGroups(files) {
    /** @type {Record<string, string[]>} */
    const mapping = {};
    
    // Get all files from all categories
    const allFiles = [
        ...(files.excel || []),
        ...(files.estimation || []),
        ...(files.parts_requested || [])
    ];
    
    // Define extension to group ID mappings
    const extensionGroupMap = {
        // CATIA extensions -> Group ID 29
        '.catia': '29',
        '.catpart': '29',
        '.catproduct': '29',
        '.catdrawing': '29',
        '.catshape': '29',
        '.cgr': '29',
        '.model': '29',
        // ixprj and xls extensions -> Group ID 28
        '.ixprj': '28',
        '.xls': '28'
    };
    
    // For each file, check extension first, then filename content to assign to appropriate group
    allFiles.forEach(file => {
        const fileName = file.name || '';
        const filePath = file.path || fileName;
        
        // PRIORITY 1: Check file extension first (convert to lowercase for comparison)
        const lastDotIndex = fileName.lastIndexOf('.');
        if (lastDotIndex !== -1) {
            const extension = fileName.substring(lastDotIndex).toLowerCase();
            const groupId = extensionGroupMap[extension];
            if (groupId) {
                mapping[fileName] = [groupId];
                return; // Found extension match, no need to check filename content
            }
        }
        
        // PRIORITY 2: Check for "PL" in filename (case-sensitive, uppercase only) - maps to Group ID 26
        if (fileName.includes('PL')) {
            mapping[fileName] = ['26'];
            return;
        }
        
        // PRIORITY 3: Check for "DWG" in filename (case-sensitive, uppercase only) - maps to Group ID 27
        if (fileName.includes('DWG')) {
            mapping[fileName] = ['27'];
            return;
        }
        
        // PRIORITY 4: Check for "PSDL" in filename (case-sensitive, uppercase only) - maps to Group ID 33
        if (fileName.includes('PSDL')) {
            mapping[fileName] = ['33'];
            return;
        }

        if (fileName.includes('LWG')) {
            mapping[fileName] = ['29'];
            return;
        }

        if (fileName.includes('CAD')) {
            mapping[fileName] = ['16'];
            return;
        }
    });
    
    return mapping;
}

/**
 * Auto-assigns parts to templates with a default template ID
 * @param {Array} parts - Array of part numbers from Excel files
 * @returns {Record<string, string[]>} - Mapping of { [partNumber]: [templateId] }
 */
function autoAssignPartsToTemplates(parts) {
    /** @type {Record<string, string[]>} */
    const mapping = {};
    
    // Default template ID for all parts
    const defaultTemplateId = '494';
    
    // For each part, assign the default template
    parts.forEach(part => {
        // Handle different part formats - extract part number string
        let partNo;
        if (typeof part === 'string') {
            partNo = part;
        } else if (part && typeof part === 'object') {
            // If part is an object, try to get part_number or other common fields
            partNo = part.part_number || part.partNumber || part.pn || part.id || String(part);
        } else {
            partNo = String(part);
        }
        
        // Ensure partNo is a valid string
        if (!partNo || typeof partNo !== 'string') {
            console.warn('Invalid part number:', part);
            return;
        }
        
        // Assign default template to this part
        mapping[partNo] = [defaultTemplateId];
    });
    
    return mapping;
}

// Export the auto-assignment functions for use in other components
export { autoAssignPartsToDocuments, autoAssignDocumentsToGroups, autoAssignPartsToTemplates };