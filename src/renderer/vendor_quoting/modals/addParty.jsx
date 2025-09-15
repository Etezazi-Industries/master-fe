// addParty.jsx
// @ts-check
import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";

/**
 * Imperatively open the Add Party modal.
 * Pass your real API function as `createParty`.
 *
 * Example:
 * openAddPartyModal({
 *   createParty: (payload) => requestJson("/parties", { method: "POST", body: payload }),
 *   notify: (msg) => toast.success(msg),
 *   onCreated: (data, payload) => { /* refresh UI, select new party, etc. *-/ },
 * });
 */
export function openAddPartyModal(opts = {}) {
    const container = document.createElement("div");
    document.body.appendChild(container);
    const root = createRoot(container);

    const finish = () => {
        root.unmount();
        container.remove();
    };

    root.render(
        <AddPartyModal
            onFinish={finish}
            onCreated={opts.onCreated}
            notify={opts.notify}
            createParty={opts.createParty}
        />
    );
}

/**
 * AddPartyModal
 * Props:
 * - onFinish: () => void                 // unmount/cleanup (called after BS hides)
 * - onCreated?: (result:any, payload:any) => void
 * - notify?: (msg:string) => void
 * - createParty?: (payload:any) => Promise<any>  // your API function (optional but recommended)
 */
export function AddPartyModal({ onFinish, onCreated, notify, createParty }) {
    const [form, setForm] = useState({
        name: "",
        short_name: "",
        job_title: "",
        phone: "",
        email: "",
        website: "",
        is_customer: false,
        is_salesperson: false,
        is_supplier: false,
    });
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");

    const canSubmit = useMemo(() => form.name.trim().length > 0, [form.name]);
    const setField = (k, v) => setForm((p) => ({ ...p, [k]: v }));

    // Unique modal id for Bootstrap instance
    const [modalId] = useState(() => `add-party-${Date.now()}-${Math.random().toString(36).slice(2)}`);

    // Bootstrap show/hide + cleanup wiring
    useEffect(() => {
        const el = document.getElementById(modalId);
        const bs = window.bootstrap?.Modal?.getOrCreateInstance(el, {
            backdrop: "static",
            keyboard: false,
            focus: true,
        });
        bs?.show();

        const onHidden = () => onFinish?.();
        el?.addEventListener("hidden.bs.modal", onHidden);

        return () => {
            el?.removeEventListener("hidden.bs.modal", onHidden);
            // ensure hide to release focus/backdrop if still present
            try { window.bootstrap?.Modal?.getInstance(el)?.hide(); } catch { }
        };
    }, [modalId, onFinish]);

    const close = () => {
        const el = document.getElementById(modalId);
        window.bootstrap?.Modal?.getInstance(el)?.hide();
    };

    const normalizePayload = (f) => {
        const nn = (s) => (s && String(s).trim() ? String(s).trim() : null);
        let website = (f.website || "").trim();
        if (website && !/^https?:\/\//i.test(website)) website = "https://" + website;
        return {
            name: f.name.trim(),
            short_name: nn(f.short_name),
            job_title: nn(f.job_title),
            phone: nn(f.phone),
            email: nn(f.email),
            website: nn(website),
            is_customer: !!f.is_customer,
            is_salesperson: !!f.is_salesperson,
            is_supplier: !!f.is_supplier,
        };
    };

    const submit = async (e) => {
        e.preventDefault();
        if (!canSubmit || submitting) return;

        setSubmitting(true);
        setError("");
        const payload = normalizePayload(form);

        try {
            const submitter =
                createParty ??
                (async () => {
                    throw new Error("createParty function not provided. Pass it via openAddPartyModal({ createParty }) or as a prop.");
                });

            const result = await submitter(payload);
            onCreated?.(result, payload);
            (notify ?? ((m) => console.log(m)))("Party added successfully.");
            close(); // Let Bootstrap hide -> 'hidden.bs.modal' -> onFinish unmounts
        } catch (err) {
            setError(err?.message || "Failed to create party.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        // NOTE: No manual backdrop / d-block. Let Bootstrap manage everything.
        <div
            className="modal fade"
            id={modalId}
            tabIndex={-1}
            aria-hidden="true"
            aria-labelledby={`${modalId}-label`}
            data-bs-focus="true"
        >
            <div className="modal-dialog modal-lg modal-dialog-centered">
                <div className="modal-content shadow">
                    <div className="modal-header">
                        <h5 className="modal-title" id={`${modalId}-label`}>
                            <i className="bi bi-person-plus me-2" />
                            Add New Party
                        </h5>
                        <button type="button" className="btn-close" onClick={close} aria-label="Close" />
                    </div>

                    <form onSubmit={submit} noValidate>
                        <div className="modal-body">
                            {error && (
                                <div className="alert alert-danger" role="alert" aria-live="assertive">
                                    {error}
                                </div>
                            )}

                            <div className="row g-3">
                                {/* Core */}
                                <div className="col-12">
                                    <label className="form-label" htmlFor={`${modalId}-name`}>
                                        Name <span className="text-danger">*</span>
                                    </label>
                                    <input
                                        id={`${modalId}-name`}
                                        autoFocus
                                        type="text"
                                        className="form-control"
                                        value={form.name}
                                        onChange={(e) => setField("name", e.target.value)}
                                        required
                                        maxLength={200}
                                        placeholder="Acme Corp"
                                    />
                                </div>

                                <div className="col-md-6">
                                    <label className="form-label" htmlFor={`${modalId}-short-name`}>Short Name</label>
                                    <input
                                        id={`${modalId}-short-name`}
                                        type="text"
                                        className="form-control"
                                        value={form.short_name}
                                        onChange={(e) => setField("short_name", e.target.value)}
                                        placeholder="Acme"
                                    />
                                </div>

                                <div className="col-md-6">
                                    <label className="form-label" htmlFor={`${modalId}-job-title`}>Job Title</label>
                                    <input
                                        id={`${modalId}-job-title`}
                                        type="text"
                                        className="form-control"
                                        value={form.job_title}
                                        onChange={(e) => setField("job_title", e.target.value)}
                                        placeholder="Buyer, Purchasing Manager…"
                                    />
                                </div>

                                {/* Contact */}
                                <div className="col-md-6">
                                    <label className="form-label" htmlFor={`${modalId}-phone`}>Phone</label>
                                    <input
                                        id={`${modalId}-phone`}
                                        type="tel"
                                        className="form-control"
                                        value={form.phone}
                                        onChange={(e) => setField("phone", e.target.value)}
                                        placeholder="555-123-4567"
                                    />
                                </div>

                                <div className="col-md-6">
                                    <label className="form-label" htmlFor={`${modalId}-email`}>Email</label>
                                    <input
                                        id={`${modalId}-email`}
                                        type="email"
                                        className="form-control"
                                        value={form.email}
                                        onChange={(e) => setField("email", e.target.value)}
                                        placeholder="name@example.com"
                                    />
                                </div>

                                <div className="col-12">
                                    <label className="form-label" htmlFor={`${modalId}-website`}>Website</label>
                                    <input
                                        id={`${modalId}-website`}
                                        type="url"
                                        className="form-control"
                                        value={form.website}
                                        onChange={(e) => setField("website", e.target.value)}
                                        placeholder="https://example.com"
                                    />
                                    <div className="form-text">
                                        If you omit <code>https://</code>, we’ll add it.
                                    </div>
                                </div>

                                {/* Flags */}
                                <div className="col-12">
                                    <div className="form-check form-check-inline">
                                        <input
                                            id={`${modalId}-is_customer`}
                                            className="form-check-input"
                                            type="checkbox"
                                            checked={form.is_customer}
                                            onChange={(e) => setField("is_customer", e.target.checked)}
                                        />
                                        <label className="form-check-label" htmlFor={`${modalId}-is_customer`}>Customer</label>
                                    </div>

                                    <div className="form-check form-check-inline">
                                        <input
                                            id={`${modalId}-is_salesperson`}
                                            className="form-check-input"
                                            type="checkbox"
                                            checked={form.is_salesperson}
                                            onChange={(e) => setField("is_salesperson", e.target.checked)}
                                        />
                                        <label className="form-check-label" htmlFor={`${modalId}-is_salesperson`}>Salesperson</label>
                                    </div>

                                    <div className="form-check form-check-inline">
                                        <input
                                            id={`${modalId}-is_supplier`}
                                            className="form-check-input"
                                            type="checkbox"
                                            checked={form.is_supplier}
                                            onChange={(e) => setField("is_supplier", e.target.checked)}
                                        />
                                        <label className="form-check-label" htmlFor={`${modalId}-is_supplier`}>Supplier</label>
                                    </div>
                                    <div className="form-check form-check-inline">
                                        <input
                                            id={`${modalId}-is_prospect`}
                                            className="form-check-input"
                                            type="checkbox"
                                            checked={form.is_supplier}
                                            onChange={(e) => setField("is_prospect", e.target.checked)}
                                        />
                                        <label className="form-check-label" htmlFor={`${modalId}-is_supplier`}>Supplier</label>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="modal-footer">
                            <button type="button" className="btn btn-outline-secondary" onClick={close} disabled={submitting}>
                                Cancel
                            </button>
                            <button type="submit" className="btn btn-success" disabled={!canSubmit || submitting}>
                                {submitting ? "Creating…" : "Create Party"}
                            </button>
                        </div>
                    </form>

                </div>
            </div>
        </div>
    );
}

