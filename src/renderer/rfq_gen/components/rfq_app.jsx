//@ts-check
import React, { useEffect, useState, useCallback } from "react";
import { createRoot } from "react-dom/client";
import CustomerBuyerPanel from "./customer_buyer_panel";
import FileUploadSection from "./file_input";
import DateSection from "./date_picker";
import ActionBar from "./action_bar";
import DualListModal from "./modals/document_group";
import { parseExcelFiles } from "../../api_calls";

function HeaderBar({ title }) {
    return (
        <div className="container-fluid bg-body border-bottom py-2 mb-3">
            <div className="d-flex justify-content-between align-items-center">
                <h5 className="mb-0 fw-bold">{title}</h5>
            </div>
        </div>
    );
}

function PageHeading({ heading }) {
    return (
        <h3 className="text-center mb-4 fw-bold">{heading}</h3>
    )
}

export default function RfqApp() {
    const [state, setState] = useState({
        customer_pk: null,
        buyer_pk: null,
        customer_rfq_number: null,
        files: { excel: [], estimation: [], parts_requested: [] },
        dates: { inquiry: "", due: "" },
    });

    const handlePanelChange = useCallback((partial) => {
        setState(prev => ({ ...prev, ...partial }));
    }, []);

    const handleFileUpload = useCallback((name, newFiles) => {
        setState(prev => {
            const existing = prev.files[name] || [];
            const key = f => `${f.name}-${f.size}-${f.lastModified}`;

            // append then de-dupe by (name,size,lastModified)
            const mergedMap = new Map(existing.map(f => [key(f), f]));
            for (const f of newFiles) mergedMap.set(key(f), f);

            return {
                ...prev,
                files: { ...prev.files, [name]: Array.from(mergedMap.values()) },
            };
        });
    }, []);

    const handleFileRemove = useCallback((name, index) => {
        setState(prev => {
            const list = (prev.files[name] || []).slice();
            list.splice(index, 1);
            return { ...prev, files: { ...prev.files, [name]: list } };
        });
    }, []);

    const openDocumentMap = useCallback(async () => {
        // 1) Gather Excel files for future API
        const excelFiles = state?.files?.excel ?? [];
        const fd = new FormData();
        excelFiles.forEach((file) => fd.append("excel_files", file));
        fd.append("customer_pk", String(state.customer_pk ?? ""));
        fd.append("buyer_pk", String(state.buyer_pk ?? ""));
        fd.append("customer_rfq_number", String(state.customer_rfq_number ?? ""));
        // TODO: await fetch(..., { method: "POST", body: fd })
        //
        const res = await parseExcelFiles(fd);
        console.log(res);

        // 2) Fake data for now (replace with API response later)
        const left = ["PN-001", "PN-002", "PN-003"];
        const right = {
            "PN-001": ["Cert", "Drawing", ["SpecSheet", "spec_001.pdf"]],
            "PN-002": ["MSDS", "Work Instructions"],
            "PN-003": ["Traveler"],
        };

        // 3) Mount the modal (no other app state needed)
        let host = document.getElementById("docmap-modal-host");
        if (!host) {
            host = document.createElement("div");
            host.id = "docmap-modal-host";
            document.body.appendChild(host);
        }
        const root = createRoot(host);

        const close = () => {
            // unmount and clean up container
            root.unmount();
            host.remove();
        };

        root.render(
            <DualListModal
                open={true}
                title="Document Map"
                leftItems={left}
                rightMap={right}
                oneToOneOnly={false}
                onClose={close}
                onSubmit={({ left: l, right: r }) => {
                    console.log("DocMap selection:", { left: l, right: r, formData: fd });
                    close();
                }}
            />
        );

        console.log("DocumentMap: prepared payload & fake lists", { excelFiles, left, right });
    }, [state.files, state.customer_pk, state.buyer_pk, state.customer_rfq_number]);


    return (
        <div>
            <HeaderBar title="RFQ Gen" />
            <PageHeading heading="RFQ Gen" />
            <CustomerBuyerPanel
                value={{ customer_pk: state.customer_pk, buyer_pk: state.buyer_pk, customer_rfq_number: state.customer_rfq_number }}
                onChange={handlePanelChange}
            />
            <FileUploadSection
                onChange={handleFileUpload}
                onRemove={handleFileRemove}
                openDocMap={openDocumentMap}
                files={state.files}
            />
            <DateSection />
            <ActionBar
                onGenerate={() => console.log("Generate RFQ clicked")}
                onUpdate={() => console.log("Update RFQ clicked")}
                onReset={() => console.log("Reset GUI clicked")}
            />
        </div>
    );
}

