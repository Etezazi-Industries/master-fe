// @ts-check
// recipientsModal.jsx
import React, { useMemo, useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import EmailManager from "../components/emailgroups.jsx";
import {
    GroupCard,
    UncodedCard,
    normalizeFromYourApi,
} from "../components/itemGroups.jsx";
import { prepareRfqEmails, createBuyer } from "../../api_calls.js"
import { openAddPartyModal } from "./addParty.jsx";


export function renderRecipientsModalReact(rawData, { rfqId } = {}) {
    const modalEl = document.getElementById("rfqRecipientsModal");
    if (!modalEl) return;

    // Use the .modal-content as our React container
    const container = modalEl.querySelector(".modal-content");
    if (!container) return;

    let root = container.__root;
    if (!root) {
        root = createRoot(container);
        container.__root = root;
    }
    root.render(<RecipientsModal rawData={rawData} rfqId={rfqId} />);
}


function RecipientsModal({ rawData, rfqId }) {
    const { groups } = useMemo(() => normalizeFromYourApi(rawData), [rawData]);

    const uncodedItems = useMemo(
        () => groups.find((g) => g.code === "UNCODED")?.items ?? [],
        [groups]
    );

    // 1) Recipients object from EmailManager: { [CATEGORY]: string[] }
    const [recipientsByCategory, setRecipientsByCategory] = useState({});
    useEffect(() => { console.log("[state] recipients", recipientsByCategory); }, [recipientsByCategory]);

    // 2) Item assignments: { [item_pk]: CATEGORY_CODE }
    const [assignments, setAssignments] = useState({});
    useEffect(() => { console.log("[state] assignments", assignments); }, [assignments]);

    // Update header labels outside React (or you can render them inside React below)
    useEffect(() => {
        const rfqNumEl = document.getElementById("rfq-number");
        if (rfqNumEl) rfqNumEl.textContent = rfqId ?? "—";

        const sectionCountEl = document.getElementById("section-count");
        if (sectionCountEl) {
            const shownGroups = groups.filter((g) => g.code !== "UNCODED").length;
            const count = shownGroups + (uncodedItems.length ? 1 : 0);
            sectionCountEl.textContent = String(count);
        }
    }, [groups, uncodedItems.length, rfqId]);

    // Collect assignment changes from child cards
    const handleAssignmentsChange = (partial) =>
        setAssignments((prev) => ({ ...prev, ...partial }));

    const handleApplyUncoded = (partial) =>
        setAssignments((prev) => ({ ...prev, ...partial }));
    // shape of partial should also be { [item_pk]: "CODE" }

    const submittingGuard =
        Object.keys(assignments).length === 0 && uncodedItems.length > 0;

    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");

    const handleCancel = () => {
        const el = document.getElementById("rfqRecipientsModal");
        if (!el) return;
        const inst = window.bootstrap?.Modal?.getOrCreateInstance(el);
        inst?.hide();
    };

    const handlePrepare = async () => {
        setError("");
        setSubmitting(true);
        try {
            const payload = {
                recipientsByCategory,            // { FIN: ['a@x.com', ...], MAT: [...] }
                dryRun: false,
            };

            await prepareRfqEmails(rfqId, payload).then(r => {
                if (!r.ok) throw new Error(`HTTP ${r.status}`);
            });

            // Close only after success:
            handleCancel();
        } catch (e) {
            setError(String(e?.message || e));
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <>
            {/* HEADER */}
            <div className="modal-header">
                <div>
                    <h5 className="modal-title">Send for Quote</h5>
                    <div className="subtle">
                        RFQ #<strong id="rfq-number">—</strong> •{" "}
                        <span id="section-count">0</span> sections
                    </div>
                </div>
                <button
                    type="button"
                    className="btn-close"
                    aria-label="Close"
                    onClick={handleCancel}
                    disabled={submitting}
                />
            </div>

            {/* BODY */}
            <div className="modal-body">
                {error && (
                    <div className="alert alert-danger mb-3" role="alert">
                        {error}
                    </div>
                )}

                <div className="row g-4">
                    {/* Left column: item groups */}
                    <div className="col-12 col-lg-7">
                        <div className="vstack gap-3">
                            {groups
                                .filter((g) => g.code !== "UNCODED")
                                .map((g) => (
                                    <GroupCard
                                        key={g.code}
                                        {...g}
                                        onAssignmentsChange={handleAssignmentsChange}
                                    /* Ensure GroupCard calls onAssignmentsChange({ [item_pk]: code }) */
                                    />
                                ))}
                            <UncodedCard
                                items={uncodedItems}
                                codes={window.codesCache || []}
                                onApply={handleApplyUncoded}
                            /* Ensure UncodedCard emits { [item_pk]: code } */
                            />
                        </div>
                    </div>

                    {/* Right column: email manager */}
                    <div className="col-12 col-lg-5">
                        {/* Ensure EmailManager accepts onChange and emits { [CAT]: string[] } */}
                        <EmailManager
                            groups={groups}
                            onChange={(obj) => setRecipientsByCategory(obj || {})}
                        />
                    </div>
                </div>
            </div>

            {/* FOOTER */}
            <div className="modal-footer d-flex justify-content-between">
                <div className="subtle">
                    <i className="bi bi-info-circle" /> Review items and recipients per
                    sub-category before sending.
                </div>
                <div className="d-flex gap-2">
                    <button
                        className="btn btn-outline-secondary"
                        onClick={handleCancel}
                        disabled={submitting}
                    >
                        Cancel
                    </button>
                    <button
                        className="btn btn-primary"
                        onClick={handlePrepare}
                        disabled={submitting || submittingGuard}
                        title={
                            submittingGuard
                                ? "Resolve uncoded items / add recipients before sending"
                                : ""
                        }
                    >
                        {submitting ? "Preparing…" : (<><i className="bi bi-send me-1"></i>Prepare Emails</>)}
                    </button>
                    <button
                        type="button"
                        className="btn btn-success"
                        onClick={() =>
                            openAddPartyModal({
                                createBuyer: createBuyer,
                                notify: (m) => console.log("[Notify]", m),
                                onCreated: (data) => console.log("[API] response:", data),
                            })
                        }
                        title="Add a new buyer to an existing party"
                    >
                        <i className="bi bi-person-plus me-1"></i>
                        Add New Buyer
                    </button>
                </div>
            </div>
        </>
    );
}

