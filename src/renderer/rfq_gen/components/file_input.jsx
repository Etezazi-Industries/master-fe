// @ts-check
import React from "react";


function ActionBar({ onMapPress }) {
    return (
        <div className="d-flex align-items-center gap-3 my-3 flex-wrap">
            {/* Three mapping buttons */}
            <div className="d-flex gap-2">
                <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    onClick={() => onMapPress("part-doc")}
                >
                    Part–Doc Map
                </button>
                <button
                    type="button"
                    className="btn btn-outline-primary btn-sm"
                    onClick={() => onMapPress("doc-group")}
                >
                    Doc Group Map
                </button>
                <button
                    type="button"
                    className="btn btn-outline-primary btn-sm"
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
                    className="btn btn-outline-primary"
                    onClick={handleFileSelection}
                >
                    📁 Select {label}
                </button>
            </div>

            {files.length > 0 && (
                <ul className="list-group mt-2">
                    {files.map((f, i) => (
                        <li
                            key={`${f.name}-${f.size}-${f.lastModified}-${i}`}
                            className="list-group-item py-2 d-flex justify-content-between align-items-center"
                        >
                            <div className="text-truncate" style={{ maxWidth: "75%" }}>
                                <span className="text-truncate d-block">{f.name}</span>
                                {f.path && (
                                    <small className="text-muted d-block text-truncate" title={f.path}>
                                        📂 {f.path}
                                    </small>
                                )}
                                <small className="text-muted">
                                    {(f.size / 1024 / 1024).toFixed(2)} MB
                                </small>
                            </div>
                            <button
                                type="button"
                                className="btn btn-sm btn-outline-danger"   // ← red outline style
                                aria-label={`Remove ${f.name}`}
                                onClick={() => onRemove?.(name, i)}
                                title="Remove"
                            >
                                ×
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

/**
 * @param {{onChange: Function, onRemove: Function, onMapPress: Function, files: {excel?: any[], estimation?: any[], parts_requested?: any[]}}} props
 */
export default function FileUploadSection({ onChange, onRemove, onMapPress, files = { excel: [], estimation: [], parts_requested: [] } }) {
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
            />
        </div>
    );
}

