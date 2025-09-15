import React, { useState } from 'react';

function FileUploadSection({ title, buttonId, inputId, files, onFilesChange }) {
    const handleBrowseClick = () => {
        const input = document.getElementById(inputId);
        input?.click();
    };

    const handleFileChange = (e) => {
        const fileList = Array.from(e.target.files || []);
        onFilesChange?.(fileList);
    };

    const removeFile = (index) => {
        const newFiles = files.filter((_, i) => i !== index);
        onFilesChange?.(newFiles);
    };

    return (
        <div className="mb-3">
            <label className="form-label text-dark fw-semibold">{title}</label>
            <div className="d-flex gap-2 mb-2">
                <button 
                    type="button" 
                    className="btn btn-outline-secondary"
                    id={buttonId}
                    onClick={handleBrowseClick}
                >
                    <i className="bi bi-folder2-open me-1"></i>
                    Browse
                </button>
                <input 
                    type="file" 
                    className="d-none" 
                    id={inputId} 
                    multiple
                    onChange={handleFileChange}
                />
            </div>
            
            {files.length > 0 && (
                <ul className="list-group list-group-flush">
                    {files.map((file, index) => (
                        <li key={index} className="list-group-item d-flex justify-content-between align-items-center py-2">
                            <span className="text-truncate">{file.name}</span>
                            <button
                                type="button"
                                className="btn btn-sm btn-outline-danger"
                                onClick={() => removeFile(index)}
                                title="Remove file"
                            >
                                <i className="bi bi-x"></i>
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

export default function AttachmentsPanel({ 
    otherAttachments = [], 
    finishAttachments = [], 
    onOtherAttachmentsChange,
    onFinishAttachmentsChange
}) {
    const materialCardStyle = {
        borderRadius: '12px',
        border: 'none',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1), 0 1px 3px rgba(0,0,0,0.08)',
        overflow: 'hidden'
    };

    const materialHeaderStyle = {
        background: 'linear-gradient(135deg, #2c2c2c 0%, #424242 100%)',
        padding: '1rem 1.5rem',
        borderBottom: 'none',
        borderLeft: '4px solid #d32f2f'
    };

    return (
        <div className="card" style={materialCardStyle}>
            <div className="card-header text-white" style={materialHeaderStyle}>
                <h6 className="mb-0 fw-bold">File Attachments</h6>
            </div>
            <div className="card-body">
                <div className="row g-4">
                    <div className="col-md-6">
                        <FileUploadSection
                            title="Other Attachments"
                            buttonId="browse-other-attachments"
                            inputId="other-attachments-input"
                            files={otherAttachments}
                            onFilesChange={onOtherAttachmentsChange}
                        />
                    </div>
                    <div className="col-md-6">
                        <FileUploadSection
                            title="Finish Attachments"
                            buttonId="browse-finish-attachments"
                            inputId="finish-attachments-input"
                            files={finishAttachments}
                            onFilesChange={onFinishAttachmentsChange}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
