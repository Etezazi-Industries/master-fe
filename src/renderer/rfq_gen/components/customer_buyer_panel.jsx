//@ts-check
import React, { useState, useEffect } from "react";
import { getPartyData, getBuyers } from "../../api_calls.js";

function TextInput({
    label,
    id,
    value,
    onChange,     // (val: string) => void
    placeholder = "",
}) {
    return (
        <div className="mb-3 w-100">
            <h5 className="mb-3">{label}</h5>
            <input
                type="text"
                className="form-control"
                id={id}
                value={value ?? ""}
                onChange={(e) => onChange?.(e.target.value)}
                placeholder={placeholder}
            />
        </div>
    );
}


function Select({
    label,
    id,
    options = [],
    value,               // if provided -> controlled
    onChange,            // (val | null) => void
    disabled = false,
    loading = false,
    placeholder = "Choose…",
    loadingText = "Loading…",
    emptyHint,           // shown when options.length === 0 (and not loading)
    disabledHint,        // shown when disabled (and not loading)
    parse = (v) => v,    // normalize id (e.g., Number)
}) {
    const controlled = value !== undefined && value !== null;

    return (
        <div className="mb-3">
            <h5 className="mb-3">{label}</h5>

            <select
                id={id}
                className="form-select"
                {...(controlled ? { value } : { defaultValue: "" })}
                {...(onChange ? { onChange: (e) => onChange(e.target.value || null) } : {})}
                disabled={disabled || loading}
                aria-busy={loading || undefined}
            >
                <option value="">{loading ? loadingText : placeholder}</option>
                {!loading && options.map(o => (
                    <option key={o.id} value={o.id}>
                        {o.label}
                    </option>
                ))}
            </select>

            {!loading && disabled && disabledHint && (
                <div className="form-text">{disabledHint}</div>
            )}
            {!loading && !disabled && options.length === 0 && emptyHint && (
                <div className="form-text">{emptyHint}</div>
            )}
        </div>
    );
}

function normalizeParties(obj) {
    return Object.entries(obj).map(([id, label]) => ({
        id: String(id),
        label: String(label),
    }));
}

/**
 * Props:
 * - value: { customer_pk, customer_name, buyer_pk, customer_rfq_number }
 * - onChange: (partial) => void
 */
export default function CustomerBuyerPanel({ value, onChange }) {
    const { customer_pk = null, customer_name = null, buyer_pk = null, customer_rfq_number = null } = value ?? {};

    const [customers, setCustomers] = useState([]);
    const [customersLoading, setCustomersLoading] = useState(false);
    const [err, setErr] = useState(null);

    // --- Load customers once ---
    useEffect(() => {
        const ac = new AbortController();
        (async () => {
            try {
                setCustomersLoading(true);
                const rows = await getPartyData(); // you implement
                setCustomers(normalizeParties(rows));
            } catch (e) {
                if (e.name !== "AbortError") setErr(e.message || "Failed to load customers");
            } finally {
                setCustomersLoading(false);
            }
        })();
        return () => ac.abort();
    }, []);

    const [buyers, setBuyers] = useState([]);
    const [buyersLoading, setBuyersLoading] = useState(false);

    useEffect(() => {
        // reset selected buyer in parent + clear list
        onChange?.({ buyer_pk: null });
        setBuyers([]);

        if (!customer_pk) {            // nothing selected
            setBuyersLoading(false);
            return;
        }

        const ac = new AbortController();
        setBuyersLoading(true);

        (async () => {
            try {
                const raw = await getBuyers(customer_pk);
                setBuyers(normalizeParties(raw));
            } catch (e) {
                if (e.name !== "AbortError") console.error(e);
                setBuyers([]);             // safe default
            } finally {
                setBuyersLoading(false);
            }
        })();

        return () => ac.abort();
    }, [customer_pk])

    const parseId = (v) => (v ? Number(v) : null);

    return (
        <div className="container my-4">
            {err && <div className="alert alert-danger py-2">{err}</div>}

            <div className="row row-cols-1 row-cols-sm-2 g-2">
                <div className="col">
                    <Select
                        label="Customer"
                        id="customer-select"
                        options={customers}
                        value={customer_pk ?? ""}
                        loading={customersLoading}
                        onChange={(v) => {
                            const next = parseId(v);
                            const selectedCustomer = customers.find(c => c.id === String(next));
                            const customerName = selectedCustomer ? selectedCustomer.label : null;
                            onChange?.({ customer_pk: next, customer_name: customerName, buyer_pk: null });
                        }}
                        placeholder="Choose customer."
                        disabledHint=""
                        loadingText="Loading customers..."
                        emptyHint="No customers found."
                    />
                </div>

                <div className="col">
                    <Select
                        label="Buyer"
                        id="buyer-select"
                        options={buyers}
                        value={buyer_pk ?? ""}
                        loading={buyersLoading}
                        onChange={(v) => onChange?.({ buyer_pk: parseId(v) })}
                        disabled={!customer_pk}
                        placeholder="Choose buyer."
                        disabledHint="Select a customer first."
                        emptyHint={
                            customer_pk
                                ? `No buyers for ${customer_pk}.`
                                : "No buyers."
                        }
                        loadingText="Loading buyers..."
                    />
                </div>
            </div>
            <TextInput
                label="Customer RFQ"
                id="Customer RFQ"
                value={customer_rfq_number}
                onChange={(v) => onChange?.({ customer_rfq_number: v })}
                placeholder="Customer RFQ#"
            />
        </div >
    );
}

