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
    const name = it?.name ?? it?.part_number ?? "";
    return (
        <li className="list-group-item d-flex justify-content-between">
            <div>
                <strong>{name}</strong>
            </div>
            <span className="badge text-bg-secondary">Qty {it?.qty}</span>
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
        ) : (
            <span className="text-muted">No recipients</span>
        );

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
    }));

    const byCode = new Map();
    for (const it of items) {
        const key = it.code ?? "UNCODED";
        if (!byCode.has(key)) byCode.set(key, { code: key, items: [], emails: [] });
        byCode.get(key).items.push(it);
    }

    return { groups: Array.from(byCode.values()), uncoded: [] };
}

