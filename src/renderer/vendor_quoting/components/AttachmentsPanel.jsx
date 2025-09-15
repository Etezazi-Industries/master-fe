import React, { useState } from 'react';

function FileUploadSection({ title, buttonId, inputId, files, onFilesChange }) {
    const handleBrowseClick = () => {
        const input = document.getElementById(inputId);
        input?.click();
    };

    const handleFileChange = (e) => {
        const newFiles = Array.from(e.target.files || []);
        
        // Filter out duplicate files based on name and size
        const filteredNewFiles = newFiles.filter(newFile => {
            return !files.some(existingFile => 
                existingFile.name === newFile.name && 
                existingFile.size === newFile.size
            );
        });
        
        // Show alert if duplicates were found
        const duplicateCount = newFiles.length - filteredNewFiles.length;
        if (duplicateCount > 0) {
            alert(`${duplicateCount} duplicate file${duplicateCount > 1 ? 's' : ''} skipped.`);
        }
        
        // Append only unique files to existing files
        const updatedFiles = [...files, ...filteredNewFiles];
        onFilesChange?.(updatedFiles);
        
        // Reset the input value to allow re-selecting the same files if needed
        e.target.value = '';
    };

    const removeFile = (index) => {
        const newFiles = files.filter((_, i) => i !== index);
        onFilesChange?.(newFiles);
    };

    return (
        <div className="mb-3">
            <label className="form-label fw-medium" style={{ 
                fontSize: '0.875rem',
                fontWeight: '500',
                color: '#374151',
                marginBottom: '0.5rem'
            }}>{title}</label>
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
                <div 
                    className="border rounded bg-light"
                    style={{ 
                        maxHeight: '150px', // Height for about 5 files
                        overflowY: 'auto',
                        overflowX: 'hidden'
                    }}
                >
                    <ul className="list-group list-group-flush">
                        {files.map((file, index) => (
                            <li key={index} className="list-group-item d-flex justify-content-between align-items-center py-2 border-0">
                                <div className="d-flex align-items-center flex-grow-1 me-2">
                                    <i className="bi bi-file-earmark me-2 text-muted" style={{ fontSize: '0.875rem' }}></i>
                                    <span className="text-truncate" style={{ fontSize: '0.875rem' }} title={file.name}>
                                        {file.name}
                                    </span>
                                </div>
                                <button
                                    type="button"
                                    className="btn btn-sm btn-outline-danger"
                                    onClick={() => removeFile(index)}
                                    title="Remove file"
                                    style={{ 
                                        minWidth: '32px',
                                        height: '28px',
                                        padding: '0',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}
                                >
                                    <i className="bi bi-x" style={{ fontSize: '0.875rem' }}></i>
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
            
            {files.length > 0 && (
                <small className="text-muted mt-1 d-block" style={{ fontSize: '0.75rem' }}>
                    {files.length} file{files.length !== 1 ? 's' : ''} selected
                </small>
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
    const cardStyle = {
        border: '1px solid #e9ecef',
        borderRadius: '16px',
        boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
        background: '#ffffff'
    };

    return (
        <div className="card" style={cardStyle}>
            <div className="card-body" style={{ padding: '2rem' }}>
                {/* Clean title */}
                <h5 className="mb-4 fw-semibold text-dark" style={{ 
                    fontSize: '1.25rem',
                    fontWeight: '600',
                    letterSpacing: '-0.02em',
                    color: '#1a1a1a'
                }}>
                    File Attachments
                </h5>
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
