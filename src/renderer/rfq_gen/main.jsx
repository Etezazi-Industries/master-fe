import React from "react";
import { createRoot } from "react-dom/client";
import RfqApp from "./components/rfq_app";

let root = null;

export function mountRfqGenApp() {
    const container = document.getElementById("rfq-gen-root");
    if (container && !root) {
        root = createRoot(container);
        root.render(<RfqApp />);
    }
}

export function unmountRfqGenApp() {
    if (root) {
        root.unmount();
        root = null;
    }
}
