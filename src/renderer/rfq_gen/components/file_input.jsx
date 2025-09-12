// @ts-check
import React from "react";


// TODO: wire this up to change app state.
function ActionBar() {
    return (
        <div className="d-flex align-items-center gap-3 my-3">
            {/* Document Map button */}
            <button
                type="button"
                className="btn btn-primary"
            >
                Document Map
            </button>

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



function FileUpload({
    label, id, accept = "", multiple = false, name, onFiles, onRemove, files = []
}) {
    return (
        <div className="mb-3 w-100">
            {label && <label htmlFor={id} className="form-label">{label}</label>}
            <input
                type="file"
                className="form-control"
                id={id}
                accept={accept}
                multiple={multiple}
                onChange={(e) => {
                    const list = Array.from(e.target.files || []);
                    onFiles?.(name, list);   // append handled by parent now
                    e.target.value = "";     // allow re-selecting same file
                }}
            />

            {files.length > 0 && (
                <ul className="list-group mt-2">
                    {files.map((f, i) => (
                        <li
                            key={`${f.name}-${f.size}-${f.lastModified}-${i}`}
                            className="list-group-item py-2 d-flex justify-content-between align-items-center"
                        >
                            <div className="text-truncate" style={{ maxWidth: "75%" }}>
                                <span className="text-truncate d-block">{f.name}</span>
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

export default function FileUploadSection({ onChange, onRemove, files = {} }) {
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
                        files={files.excel || []}
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
                        files={files.estimation || []}
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
                        files={files.parts_requested || []}
                    />
                </div>
            </div>
            <ActionBar />
        </div>
    );
}

