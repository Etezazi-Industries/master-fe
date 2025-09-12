//@ts-check
import React, { useEffect, useState, useCallback } from "react";
import CustomerBuyerPanel from "./customer_buyer_panel";
import FileUploadSection from "./file_input";
import DateSection from "./date_picker";
import ActionBar from "./action_bar";

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

    useEffect(() => {
        console.log("state changed", state);
    }, [state]);

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

