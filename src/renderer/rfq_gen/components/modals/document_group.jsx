// DualListModal.jsx
import React, { useState, useEffect } from "react";

/** Generic modal shell (parent) */
export function ModalShell({ open, title, onClose, onConfirm, children, confirmLabel = "OK" }) {
    if (!open) return null;
    return (
        <>
            <div className="modal d-block" tabIndex="-1" role="dialog" onClick={onClose}>
                <div className="modal-dialog modal-lg modal-dialog-centered" role="document" onClick={(e) => e.stopPropagation()}>
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title m-0">{title}</h5>
                            <button type="button" className="btn-close" aria-label="Close" onClick={onClose} />
                        </div>
                        <div className="modal-body">{children}</div>
                        <div className="modal-footer">
                            <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
                            <button className="btn btn-primary" onClick={onConfirm}>{confirmLabel}</button>
                        </div>
                    </div>
                </div>
            </div>
            <div className="modal-backdrop fade show" />
        </>
    );
}

/** Reusable list (child) */
function SelectList({
    items = [],
    multiple = false,
    selected,
    onSelect,
    getKey = (x) => (x && typeof x === "object" && "id" in x ? x.id : x),
    getLabel = (x) => {
        if (Array.isArray(x)) return String(x[0]);          // supports ["Display", value]
        if (x && typeof x === "object" && "label" in x) return String(x.label);
        return String(x);
    },
}) {
    const isActive = (key) => (multiple ? selected?.has(key) : selected === key);

    const handleClick = (key) => {
        if (multiple) {
            const next = new Set(selected ?? []);
            next.has(key) ? next.delete(key) : next.add(key);
            onSelect(next);
        } else {
            onSelect(key);
        }
    };

    return (
        <ul className="list-group border rounded overflow-auto" style={{ maxHeight: "40vh" }}>
            {items.map((item) => {
                // support strings, objects, or ["Display", value]
                const key = Array.isArray(item)
                    ? item[1]
                    : (item && typeof item === "object" && "id" in item ? item.id : item);
                const label = getLabel(item);

                return (
                    <li
                        key={key}
                        role="button"
                        className={`list-group-item d-flex justify-content-between align-items-center ${isActive(key) ? "active" : ""}`}
                        onClick={() => handleClick(key)}
                    >
                        {label}
                    </li>
                );
            })}
        </ul>
    );
}

/** Composed dual-list modal (left selection controls right list) */
export default function DualListModal({
    open,
    title = "Select Documents for Part",
    leftItems = [],                         // e.g. ["PN-001","PN-002"] or [{id, label}]
    rightMap = {},                          // e.g. { "PN-001": ["Cert","Drawing", ["SpecSheet","spec.pdf"]] }
    oneToOneOnly = false,                   // SINGLE (true) vs MULTIPLE (false) on right side
    onClose,
    onSubmit,                               // ({ left, right }) => void
}) {
    const keyOf = (x) => (Array.isArray(x) ? x[1] : (x && typeof x === "object" && "id" in x ? x.id : x));
    const labelOf = (x) => (Array.isArray(x) ? x[0] : (x && typeof x === "object" && "label" in x ? x.label : String(x)));

    const [leftSelected, setLeftSelected] = useState(null);
    const [rightSelected, setRightSelected] = useState(oneToOneOnly ? null : new Set());

    // Pick first left item by default
    useEffect(() => {
        if (!leftSelected && leftItems.length) setLeftSelected(keyOf(leftItems[0]));
    }, [leftItems, leftSelected]);

    // When left changes, reset right selection
    useEffect(() => {
        setRightSelected(oneToOneOnly ? null : new Set());
    }, [leftSelected, oneToOneOnly]);

    const rightItems = leftSelected != null ? (rightMap[leftSelected] ?? []) : [];

    const handleConfirm = () => {
        const rightValue = oneToOneOnly ? rightSelected : Array.from(rightSelected ?? []);
        onSubmit?.({ left: leftSelected, right: rightValue });
        onClose?.();
    };

    return (
        <ModalShell open={open} title={title} onClose={onClose} onConfirm={handleConfirm} confirmLabel="OK">
            <div className="container-fluid">
                <div className="row g-3">
                    <div className="col-12 col-md-6">
                        <div className="mb-2 fw-semibold">Part Numbers</div>
                        <SelectList
                            items={leftItems}
                            multiple={false}
                            selected={leftSelected}
                            onSelect={setLeftSelected}
                            getKey={keyOf}
                            getLabel={labelOf}
                        />
                    </div>
                    <div className="col-12 col-md-6">
                        <div className="mb-2 fw-semibold">Documents</div>
                        <SelectList
                            items={rightItems}
                            multiple={!oneToOneOnly}
                            selected={rightSelected}
                            onSelect={setRightSelected}
                            getKey={keyOf}
                            getLabel={labelOf}
                        />
                    </div>
                </div>
            </div>
        </ModalShell>
    );
}

