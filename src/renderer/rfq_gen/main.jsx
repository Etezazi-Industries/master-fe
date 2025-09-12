import React from "react";
import { createRoot } from "react-dom/client";
import RfqApp from "./components/rfq_app";


const container = document.getElementById("root");
const root = createRoot(container);
root.render(<RfqApp />);
