// @ts-check
import React from "react";

export function ActionButton({ label, variant = "primary", onClick }) {
    return (
        <button
            type="button"
            className={`btn btn-${variant} w-100`}
            onClick={onClick}
        >
            {label}
        </button>
    );
}


export default function ActionBar({ onGenerate, onUpdate, onReset }) {
    return (
        <div className="container my-3 pt-4">
            <div className="row g-2">
                <div className="col">
                    <ActionButton
                        label="Generate RFQ"
                        variant="success"
                        onClick={onGenerate}
                    />
                </div>
                <div className="col">
                    <ActionButton
                        label="Update RFQ"
                        variant="warning"
                        onClick={onUpdate}
                    />
                </div>
                <div className="col">
                    <ActionButton
                        label="Reset GUI"
                        variant="danger"
                        onClick={onReset}
                    />
                </div>
            </div>
        </div>
    );
}
