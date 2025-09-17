import React, { useMemo, useState } from "react";

/**
 * NOTE:
 * - No manual esc(): React escapes by default.
 * - Keep Bootstrap classes you already use.
 * - "UncodedCard" exposes structured assignments on Apply.
 */

// ───────────────────────────────────────────────────────────────────────────────
// Small bits
function Chip({ email }) {
    const val = email ?? "";
    return (
        <span className="badge rounded-pill text-bg-light border me-1 mb-1">
            {val}
        </span>
    );
}

export const pendingAssignments = new Map(); // if you still want this handle around

function ItemRow({ it }) {
    const name = it?.name ?? it?.part_number ?? it?.PartNumber ?? "";
    const description = it?.Description ?? it?.description ?? "";
    const quantity = it?.qty ?? it?.QuantityRequired ?? 0;
    const emailCategory = it?.EmailCategory ?? it?.email_category ?? "";
    
    // Edit states
    const [isEditingCategory, setIsEditingCategory] = React.useState(false);
    const [isEditingQty, setIsEditingQty] = React.useState(false);
    const [editCategory, setEditCategory] = React.useState(emailCategory);
    const [editQty, setEditQty] = React.useState(quantity);
    
    // Available email categories (you might want to get this from props or global state)
    const emailCategories = [
        'ALUMINUM',
        'STEEL',
        'PLASTIC',
        'ELECTRONICS', 
        'HARDWARE',
        'CUSTOM',
        'UNCODED'
    ];
    
    // Edit handlers
    const handleCategoryEdit = () => {
        setIsEditingCategory(true);
    };
    
    const handleCategorySave = () => {
        setIsEditingCategory(false);
        // TODO: Implement save logic - update the item data
        console.log('Category updated:', editCategory);
    };
    
    const handleCategoryCancel = () => {
        setIsEditingCategory(false);
        setEditCategory(emailCategory); // Reset to original
    };
    
    const handleQtyEdit = () => {
        setIsEditingQty(true);
    };
    
    const handleQtySave = () => {
        setIsEditingQty(false);
        // TODO: Implement save logic - update the item data
        console.log('Quantity updated:', editQty);
    };
    
    const handleQtyCancel = () => {
        setIsEditingQty(false);
        setEditQty(quantity); // Reset to original
    };
    
    // Build dimensions string from available dimension fields
    const buildDimensions = () => {
        const dimensions = [];
        
        // Check for part dimensions
        if (it?.PartLength) dimensions.push(`L: ${it.PartLength}`);
        if (it?.PartWidth) dimensions.push(`W: ${it.PartWidth}`);
        if (it?.Thickness) dimensions.push(`T: ${it.Thickness}`);
        
        // If no part dimensions, check for stock dimensions
        if (dimensions.length === 0) {
            if (it?.StockLength) dimensions.push(`Stock L: ${it.StockLength}`);
            if (it?.StockWidth) dimensions.push(`Stock W: ${it.StockWidth}`);
        }
        
        return dimensions.length > 0 ? dimensions.join(' × ') : null;
    };
    
    const dimensionsStr = buildDimensions();
    
    return (
        <li className="list-group-item">
            <div className="d-flex flex-column">
                {/* Top row: Part Number + Email Category + Quantity (all editable) */}
                <div className="d-flex align-items-center gap-3 mb-2">
                    <div className="flex-grow-1">
                        <strong className="text-dark">{name}</strong>
                    </div>
                    
                    {/* Email Category - Editable */}
                    <div className="d-flex align-items-center gap-1">
                        <small className="text-muted">Category:</small>
                        {isEditingCategory ? (
                            <div className="d-flex align-items-center gap-1">
                                <select 
                                    className="form-select form-select-sm" 
                                    style={{ width: '120px', fontSize: '0.75rem' }}
                                    value={editCategory || ''}
                                    onChange={(e) => setEditCategory(e.target.value)}
                                    autoFocus
                                >
                                    <option value="">Select...</option>
                                    {emailCategories.map(cat => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                </select>
                                <button 
                                    className="btn btn-sm btn-success" 
                                    style={{ padding: '2px 6px' }}
                                    onClick={handleCategorySave}
                                    title="Save"
                                >
                                    <i className="bi bi-check" style={{ fontSize: '0.75rem' }}></i>
                                </button>
                                <button 
                                    className="btn btn-sm btn-outline-secondary" 
                                    style={{ padding: '2px 6px' }}
                                    onClick={handleCategoryCancel}
                                    title="Cancel"
                                >
                                    <i className="bi bi-x" style={{ fontSize: '0.75rem' }}></i>
                                </button>
                            </div>
                        ) : (
                            <div className="d-flex align-items-center gap-1">
                                <span 
                                    className="form-control form-control-sm bg-light" 
                                    style={{ 
                                        width: '120px', 
                                        fontSize: '0.75rem',
                                        border: '1px solid #dee2e6',
                                        display: 'flex',
                                        alignItems: 'center',
                                        height: '28px'
                                    }}
                                >
                                    {emailCategory || 'Not set'}
                                </span>
                                <button 
                                    className="btn btn-sm btn-outline-primary" 
                                    style={{ padding: '2px 6px' }}
                                    onClick={handleCategoryEdit}
                                    title="Edit Category"
                                >
                                    <i className="bi bi-pencil" style={{ fontSize: '0.75rem' }}></i>
                                </button>
                            </div>
                        )}
                    </div>
                    
                    {/* Quantity - Editable */}
                    <div className="d-flex align-items-center gap-1">
                        <small className="text-muted">Qty:</small>
                        {isEditingQty ? (
                            <div className="d-flex align-items-center gap-1">
                                <input 
                                    type="number" 
                                    className="form-control form-control-sm" 
                                    style={{ width: '80px', fontSize: '0.75rem' }}
                                    value={editQty || 0}
                                    onChange={(e) => setEditQty(Number(e.target.value))}
                                    min="0"
                                    step="1"
                                    autoFocus
                                />
                                <button 
                                    className="btn btn-sm btn-success" 
                                    style={{ padding: '2px 6px' }}
                                    onClick={handleQtySave}
                                    title="Save"
                                >
                                    <i className="bi bi-check" style={{ fontSize: '0.75rem' }}></i>
                                </button>
                                <button 
                                    className="btn btn-sm btn-outline-secondary" 
                                    style={{ padding: '2px 6px' }}
                                    onClick={handleQtyCancel}
                                    title="Cancel"
                                >
                                    <i className="bi bi-x" style={{ fontSize: '0.75rem' }}></i>
                                </button>
                            </div>
                        ) : (
                            <div className="d-flex align-items-center gap-1">
                                <span 
                                    className="form-control form-control-sm bg-light" 
                                    style={{ 
                                        width: '80px', 
                                        fontSize: '0.75rem',
                                        border: '1px solid #dee2e6',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        height: '28px'
                                    }}
                                >
                                    {quantity || 0}
                                </span>
                                <button 
                                    className="btn btn-sm btn-outline-primary" 
                                    style={{ padding: '2px 6px' }}
                                    onClick={handleQtyEdit}
                                    title="Edit Quantity"
                                >
                                    <i className="bi bi-pencil" style={{ fontSize: '0.75rem' }}></i>
                                </button>
                            </div>
                        )}
                    </div>
                </div>
                
                {/* Description row */}
                {description && (
                    <div className="text-muted" style={{ fontSize: '0.875rem' }}>
                        {description}
                    </div>
                )}
                
                {/* Dimensions row */}
                {dimensionsStr && (
                    <div className="mt-2">
                        <span 
                            className="badge bg-light text-dark border" 
                            style={{ fontSize: '0.75rem' }}
                            title="Dimensions"
                        >
                            <i className="bi bi-rulers me-1"></i>
                            {dimensionsStr}
                        </span>
                    </div>
                )}
            </div>
        </li>
    );
}

// ───────────────────────────────────────────────────────────────────────────────
// Cards
export function GroupCard({ code, items = [], emails = [] }) {
    // recipients (computed but not rendered in your original; keeping parity)
    const recipients =
        emails?.length > 0 ? (
            <div className="mt-2">
                {emails.map((e, i) => (
                    <Chip key={i} email={e.email_id || e.email || ""} />
                ))}
            </div>
        ) : null; // Remove "No recipients" label

    return (
        <div className="card mb-4">
            <div className="card-body">
                <div className="d-flex align-items-center justify-content-between">
                    <div className="d-flex align-items-center gap-2">
                        <span className="fw-semibold">{code}</span>
                    </div>
                    <span className="badge text-bg-primary rounded-pill">
                        {items.length} item{items.length === 1 ? "" : "s"}
                    </span>
                </div>

                {/* recipients were computed in your original but not shown.
            If you want them visible, keep this; otherwise remove. */}
                <div className="mt-2">{recipients}</div>

                <hr className="my-3" />
                <div className="row g-4">
                    <div>
                        <ul className="list-group list-group-flush">
                            {items.map((it) => (
                                <ItemRow key={String(it.item_pk ?? it.part_number ?? Math.random())} it={it} />
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Build <option> set from codes. Accepts strings OR {value,label} OR {code,label}
function CodeOptions({ codes = [], selected = "" }) {
    const normalized = useMemo(() => {
        const list = Array.isArray(codes) ? codes : [];
        const norm = list
            .map((c) => {
                if (typeof c === "string") return { value: c, label: c };
                if (c && typeof c === "object") {
                    if ("value" in c) return { value: String(c.value), label: c.label ?? String(c.value) };
                    if ("code" in c) return { value: String(c.code), label: c.label ?? String(c.code) };
                }
                return null;
            })
            .filter(Boolean)
            .sort((a, b) => a.label.localeCompare(b.label));
        return norm;
    }, [codes]);

    return (
        <>
            <option value="">Assign commodity code…</option>
            {normalized.map(({ value, label }) => (
                <option key={value} value={value} selected={value === selected}>
                    {label}
                </option>
            ))}
        </>
    );
}

/**
 * UncodedCard
 * - Shows uncoded items with a code <select>.
 * - Tracks selections in local state { [item_pk]: selectedCode }.
 * - When “Update” is clicked, calls onApply(assignmentsObject).
 */
export function UncodedCard({ items = [], codes = [], onApply }) {
    const [assignments, setAssignments] = useState({}); // { item_pk: code }

    if (!items?.length) return null;

    const handlePick = (item_pk, val) => {
        setAssignments((prev) => {
            const next = { ...prev };
            if (!val) delete next[item_pk];
            else next[item_pk] = val;
            return next;
        });
    };

    const hasUpdates = Object.keys(assignments).length > 0;

    return (
        <div className="card mb-1">
            <div className="card-body">
                <div className="d-flex align-items-center justify-content-between">
                    <div className="d-flex align-items-center gap-2">
                        <span className="fw-semibold">Uncategorized (no commodity code)</span>
                    </div>
                    <span className="badge text-bg-primary rounded-pill">
                        {items.length} item{items.length === 1 ? "" : "s"}
                    </span>
                </div>

                <hr className="my-3" />

                <ul className="list-group list-group-flush">
                    {items.map((it) => {
                        const name = it.name ?? it.part_number ?? "";
                        const key = String(it.item_pk);
                        return (
                            <li className="list-group-item" key={key}>
                                <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-2">
                                    <div className="me-3">
                                        <strong>{name}</strong>{" "}
                                        <span className="text-muted">• Qty {it.qty}</span>
                                    </div>
                                    <div className="d-flex align-items-center gap-2">
                                        <label className="form-label mb-0 small text-muted">Commodity</label>
                                        <select
                                            className="form-select form-select-sm code-picker"
                                            aria-label="Assign commodity code"
                                            value={assignments[key] ?? ""}
                                            onChange={(e) => handlePick(key, e.target.value)}
                                        >
                                            <CodeOptions codes={codes} />
                                        </select>
                                    </div>
                                </div>
                            </li>
                        );
                    })}
                </ul>

                {hasUpdates && (
                    <div className="mt-3">
                        <button
                            className="btn btn-primary btn-sm"
                            onClick={() => onApply?.(assignments)}
                        >
                            Update {items.length > 1 ? "Selected Items" : "Item"}
                        </button>
                        <span className="ms-2 text-muted">
                            {Object.keys(assignments).length} change
                            {Object.keys(assignments).length === 1 ? "" : "s"}
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
}

// ───────────────────────────────────────────────────────────────────────────────
// Data normalization (unchanged behavior, now plain JS)
export function normalizeFromYourApi(raw) {
    const items = Object.entries(raw).map(([item_pk, it]) => ({
        item_pk,
        name: it.PartNumber,
        qty: it.QuantityRequired,
        code: it.EmailCategory,
        // Preserve all the original data for ItemRow to use
        ...it,  // Spread all original fields
        // Ensure consistent field names for backward compatibility
        PartNumber: it.PartNumber,
        QuantityRequired: it.QuantityRequired,
        Description: it.Description,
        EmailCategory: it.EmailCategory,
        PartLength: it.PartLength,
        PartWidth: it.PartWidth,
        Thickness: it.Thickness,
        StockLength: it.StockLength,
        StockWidth: it.StockWidth,
        ItemTypeFK: it.ItemTypeFK,
        PurchaseOrderComment: it.PurchaseOrderComment,
        Category: it.Category,
    }));

    const byCode = new Map();
    for (const it of items) {
        const key = it.code ?? "UNCODED";
        if (!byCode.has(key)) byCode.set(key, { code: key, items: [], emails: [] });
        byCode.get(key).items.push(it);
    }

    return { groups: Array.from(byCode.values()), uncoded: [] };
}

