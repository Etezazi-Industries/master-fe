import React, { useMemo, useState, useEffect } from "react";
import { getCommodityCodes, updateItemCommodityCode } from "../../api_calls.js";

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
    const commodityCode = it?.CommodityCode ?? "";
    
    // Edit states
    const [isEditingQty, setIsEditingQty] = React.useState(false);
    const [editQty, setEditQty] = React.useState(quantity);
    
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
                {/* Top row: Part Number + Commodity Code + Quantity */}
                <div className="d-flex align-items-center gap-3 mb-2">
                    <div className="flex-grow-1">
                        <strong className="text-dark">{name}</strong>
                    </div>
                    
                    {/* Commodity Code - Display only */}
                    <div className="d-flex align-items-center gap-1">
                        <small className="text-muted">Commodity:</small>
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
                            {commodityCode || 'Not set'}
                        </span>
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
                    <div className="d-flex align-items-center gap-2">
                        <div className="text-muted flex-grow-1" style={{ fontSize: '0.875rem' }}>
                            {description}
                        </div>
                        <button 
                            className="btn btn-sm btn-outline-secondary" 
                            style={{ 
                                padding: '2px 6px',
                                fontSize: '0.75rem',
                                minWidth: '28px',
                                height: '28px'
                            }}
                            onClick={() => {
                                // TODO: Send description to server for processing
                                console.log('Processing description:', description);
                            }}
                            title="Process Description"
                        >
                            <i className="bi bi-search" style={{ fontSize: '0.75rem' }}></i>
                        </button>
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
 * - Shows uncoded items with a commodity code <select>.
 * - Tracks selections in local state { [item_pk]: selectedCode }.
 * - When "Update" is clicked, calls onApply(assignmentsObject).
 * - Fetches commodity codes from API on mount.
 */
export function UncodedCard({ items = [], onApply }) {
    const [assignments, setAssignments] = useState({}); // { item_pk: code }
    const [commodityCodes, setCommodityCodes] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [updatingItems, setUpdatingItems] = useState(new Set()); // Track which items are being updated

    // Fetch commodity codes on mount
    useEffect(() => {
        const fetchCodes = async () => {
            try {
                const response = await getCommodityCodes();
                // Response format: { "codes": string[] }
                const codes = response.codes || [];
                setCommodityCodes(codes);
            } catch (error) {
                console.error('Failed to fetch commodity codes:', error);
                setCommodityCodes([]);
            } finally {
                setIsLoading(false);
            }
        };
        
        fetchCodes();
    }, []);

    if (!items?.length) return null;

    const handlePick = async (item_pk, selectedCode) => {
        if (!selectedCode) return; // Don't update if empty selection
        
        // Find the index of the selected code (1-based for API)
        const codeIndex = commodityCodes.indexOf(selectedCode);
        if (codeIndex === -1) {
            console.error('Selected code not found in commodity codes list:', selectedCode);
            return;
        }
        
        const codeId = codeIndex + 1; // Convert to 1-based index
        
        // Track that this item is being updated
        setUpdatingItems(prev => new Set(prev).add(item_pk));
        
        try {
            // Call the API to update the commodity code
            await updateItemCommodityCode(item_pk, codeId);
            
            // On success, update the local state
            setAssignments((prev) => {
                const next = { ...prev };
                next[item_pk] = selectedCode;
                return next;
            });
            
            // Optionally call onApply to notify parent component
            if (onApply) {
                onApply({ [item_pk]: selectedCode });
            }
            
        } catch (error) {
            console.error('Failed to update commodity code:', error);
            // You might want to show a user-friendly error message here
            alert(`Failed to update commodity code: ${error.message}`);
        } finally {
            // Remove from updating set
            setUpdatingItems(prev => {
                const next = new Set(prev);
                next.delete(item_pk);
                return next;
            });
        }
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

                {isLoading ? (
                    <div className="text-center py-3">
                        <span className="text-muted">Loading commodity codes...</span>
                    </div>
                ) : (
                    <ul className="list-group list-group-flush">
                        {items.map((it) => {
                            const name = it.name ?? it.part_number ?? "";
                            const key = String(it.item_pk);
                            const isUpdating = updatingItems.has(key);
                            const currentValue = assignments[key] ?? "";
                            
                            return (
                                <li className="list-group-item" key={key}>
                                    <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-2">
                                        <div className="me-3">
                                            <strong>{name}</strong>{" "}
                                            <span className="text-muted">• Qty {it.qty}</span>
                                            {isUpdating && (
                                                <span className="text-primary ms-2">
                                                    <i className="bi bi-arrow-clockwise spinner-border spinner-border-sm" role="status" aria-hidden="true"></i>
                                                    <span className="ms-1">Updating...</span>
                                                </span>
                                            )}
                                        </div>
                                        <div className="d-flex align-items-center gap-2">
                                            <label className="form-label mb-0 small text-muted">Commodity</label>
                                            <select
                                                className="form-select form-select-sm code-picker"
                                                aria-label="Assign commodity code"
                                                value={currentValue}
                                                onChange={(e) => handlePick(key, e.target.value)}
                                                disabled={isUpdating}
                                            >
                                                <CodeOptions codes={commodityCodes} />
                                            </select>
                                        </div>
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
                )}

                {hasUpdates && (
                    <div className="mt-3">
                        <div className="alert alert-success alert-sm mb-0" role="alert">
                            <i className="bi bi-check-circle me-2"></i>
                            {Object.keys(assignments).length} item{Object.keys(assignments).length === 1 ? "" : "s"} updated successfully
                        </div>
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
        code: it.CommodityCode,
        // Preserve all the original data for ItemRow to use
        ...it,  // Spread all original fields
        // Ensure consistent field names for backward compatibility
        PartNumber: it.PartNumber,
        QuantityRequired: it.QuantityRequired,
        Description: it.Description,
        CommodityCode: it.CommodityCode,
        PartLength: it.PartLength,
        PartWidth: it.PartWidth,
        Thickness: it.Thickness,
        StockLength: it.StockLength,
        StockWidth: it.StockWidth,
        ItemTypeFK: it.ItemTypeFK,
        PurchaseOrderComment: it.PurchaseOrderComment,
        Category: it.Category
    }));

    const byCode = new Map();
    for (const it of items) {
        const key = it.code ?? "UNCODED";
        if (!byCode.has(key)) byCode.set(key, { code: key, items: [], emails: [] });
        byCode.get(key).items.push(it);
    }

    return { groups: Array.from(byCode.values()), uncoded: [] };
}

