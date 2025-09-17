//@ts-check
import React, { useState, useRef } from "react";


function DateField({ label, value = "", onDateChange, fieldName }) {
    const [showPicker, setShowPicker] = useState(false);
    const inputRef = useRef(/** @type {HTMLInputElement | null} */ (null));

    const handleCalClick = () => {
        setShowPicker(true);
        // Focus the date input to open the picker
        setTimeout(() => {
            if (inputRef.current) {
                inputRef.current.focus();
            }
        }, 0);
    };

    const handleDateInputChange = (e) => {
        const selectedDate = e.target.value;
        onDateChange(fieldName, selectedDate);
    };

    const handleInputBlur = () => {
        // Hide the picker when user clicks away
        setTimeout(() => setShowPicker(false), 150);
    };

    const formatDisplayDate = (dateStr) => {
        if (!dateStr) return "Select date...";
        try {
            const date = new Date(dateStr);
            return date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
        } catch {
            return dateStr;
        }
    };

    return (
        <div className="d-flex align-items-center gap-2 mb-2">
            <div className="fw-bold">{label}</div>
            <div className="flex-grow-1 position-relative">
                {!showPicker ? (
                    <span 
                        className="form-control border rounded px-2 w-100 d-block" 
                        style={{ minHeight: '38px', cursor: 'pointer', lineHeight: '1.5', paddingTop: '6px', paddingBottom: '6px' }} 
                        onClick={handleCalClick}
                    >
                        {formatDisplayDate(value)}
                    </span>
                ) : (
                    <input
                        ref={inputRef}
                        type="date"
                        className="form-control"
                        value={value}
                        onChange={handleDateInputChange}
                        onBlur={handleInputBlur}
                        style={{ width: '100%' }}
                    />
                )}
            </div>
        </div>
    );
}


/**
 * @param {{ inquiryDate?: string, dueDate?: string, onDateChange?: (field: string, value: string) => void }} props
 */
export default function DateSection({ inquiryDate = "", dueDate = "", onDateChange = () => {} }) {
    return (
        <div className="container my-3">
            <div className="row g-3">
                <div className="col-md-6">
                    <DateField 
                        label="Inquiry Date:" 
                        value={inquiryDate}
                        onDateChange={onDateChange}
                        fieldName="inquiry"
                    />
                </div>
                <div className="col-md-6">
                    <DateField 
                        label="Due Date:" 
                        value={dueDate}
                        onDateChange={onDateChange}
                        fieldName="due"
                    />
                </div>
            </div>
        </div>
    );
}


