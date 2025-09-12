//@ts-check
import React from "react";


function DateField({ label, value = "", onCalClick }) {
    return (
        <div className="d-flex align-items-center gap-2 mb-2">
            <div className="fw-bold">{label}</div>
            <div className="flex-grow-1">
                <span className="form-control-plaintext border rounded px-2 w-100">
                    {value}
                </span>
            </div>
            <button
                type="button"
                className="btn btn-outline-secondary btn-sm"
                onClick={onCalClick}
            >
                Cal
            </button>
        </div>
    );
}


export default function DateSection() {
    return (
        <div className="container my-3">
            <div className="row g-3">
                <div className="col-md-6">
                    <DateField label="Inquiry Date:" onCalClick={() => { }} />
                </div>
                <div className="col-md-6">
                    <DateField label="Due Date:" onCalClick={() => { }} />
                </div>
            </div>
        </div>
    );
}


