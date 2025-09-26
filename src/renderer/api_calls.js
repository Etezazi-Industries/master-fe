// @ts-check

let _apiBase = "";
let _baseReady;

// Type definitions for window extensions
/** @typedef {{backend?: {getApiBase?: () => Promise<string>, apiBase?: string}}} WindowWithBackend */

/** Set API base manually (tests/overrides). */
export function setApiBase(base) {
    _apiBase = base ? (base.endsWith("/") ? base : base + "/") : "";
    _baseReady = Promise.resolve(_apiBase);
}

function findBridge() {
    try {
        if (typeof window !== "undefined") {
            const win = /** @type {WindowWithBackend} */ (window);
            if (win.backend) return win.backend;
            const t = /** @type {WindowWithBackend} */ (window.top);
            if (t && t !== window && t.backend) return t.backend;
        }
    } catch { }
    return null;
}

function waitForBridge(timeoutMs = 8000) {
    return new Promise((resolve, reject) => {
        const start = Date.now();
        (function tick() {
            const br = findBridge();
            if (br && (typeof br.getApiBase === "function" || typeof br.apiBase === "string")) return resolve(br);
            if (Date.now() - start > timeoutMs) return reject(new Error("Preload bridge not available"));
            setTimeout(tick, 50);
        })();
    });
}

async function getApiBase() {
    // if (_apiBase) return _apiBase;
    // if (!_baseReady) {
    //     _baseReady = (async () => {
    //         const br = await waitForBridge();
    //         const base = typeof br.getApiBase === "function" ? await br.getApiBase() : br.apiBase;
    //         const b = (base || "").trim();
    //         if (!b) throw new Error("API base not provided by preload");
    //         _apiBase = b.endsWith("/") ? b : b + "/";
    //         return _apiBase;
    //     })();
    // }
    // return _baseReady;
    return "http://127.0.0.1:8000/"
}

function joinUrl(base, endpoint) {
    const e = String(endpoint || "").replace(/^\/+/, "");
    return base + e;
}

async function apiFetch(endpoint, init = {}, timeoutMs = 20000) {
    const base = await getApiBase();
    console.log(base);
    const url = joinUrl(base, endpoint);

    const ctrl = new AbortController();
    const id = setTimeout(() => ctrl.abort(), timeoutMs);
    try {
        return await fetch(url, { signal: ctrl.signal, ...init });
    } finally {
        clearTimeout(id);
    }
}

export async function requestJson(endpoint, init = {}, timeoutMs = 20000) {
    const res = await apiFetch(endpoint, {
        headers: { Accept: "application/json", ...(init.headers || {}) },
        ...init,
    }, timeoutMs);

    let data;
    const text = await res.text();
    try { data = text ? JSON.parse(text) : null; } catch { data = text; }

    if (!res.ok) {
        const msg = typeof data === "object" && data && ("detail" in data) ? data.detail : text || res.statusText;
        throw new Error(`HTTP ${res.status}: ${msg}`);
    }
    return data;
}

/* ---------------- Public API ---------------- */

export async function getEmailGroups() {
    return requestJson("email-groups");
}

export async function searchRfqOrItem(rfqSearchValue, itemPk) {
    if (rfqSearchValue != null && rfqSearchValue !== "") {
        return requestJson(`rfqs/${encodeURIComponent(rfqSearchValue)}`);
    }
    throw new Error("Item search path not implemented yet");
}

export async function getRfqDetails(rfqPk) {
    if (!rfqPk) throw new Error("rfqPk is required");
    return requestJson(`rfqs/${encodeURIComponent(rfqPk)}/line-items`);
}

export async function prepareRfqEmails(rfqId, payload) {
    console.log("[DEBUG] prepareRfqEmails payload:", JSON.stringify(payload, null, 2));
    
    // Validate payload structure before sending
    if (!payload.recipientsByCategory) {
        throw new Error("recipientsByCategory is required");
    }
    
    // Check for invalid emails
    for (const [category, emails] of Object.entries(payload.recipientsByCategory)) {
        console.log(`[DEBUG] Category ${category}:`, emails);
        if (!Array.isArray(emails)) {
            throw new Error(`recipientsByCategory.${category} must be an array`);
        }
        for (const email of emails) {
            if (!email || typeof email !== 'string' || !email.includes('@')) {
                console.error(`[DEBUG] Invalid email in ${category}:`, email);
                throw new Error(`Invalid email in ${category}: ${email}`);
            }
        }
    }
    
    if (!rfqId) throw new Error("rfqId is required");
    return requestJson(`rfqs/${encodeURIComponent(rfqId)}/emails`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload ?? {}),
    });
}

// ----------- RFQ GEN --------------------

export async function getPartyData() {
    const res = await apiFetch(`rfq_gen/party`, { headers: { Accept: 'application/json' } });
    if (!res.ok) {
        console.error('Failed to users.', res.status);
        return {};
    }
    const data = await res.json();
    return data;
}

export async function getBuyers(party_pk) {
    const res = await apiFetch(`rfq_gen/${party_pk}/buyers`, { headers: { Accept: 'application/json' } });
    if (!res.ok) {
        console.error('Failed to users.', res.status);
        return {};
    }
    const data = await res.json();
    return data;
}

export async function parseExcelFiles(filePaths) {
    const res = await apiFetch("rfq_gen/excel-files", { 
        method: "POST", 
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(filePaths)
    });
    if (!res.ok) {
        console.error("422 detail:", await res.text()); // FastAPI explains what's missing
        throw new Error(`HTTP ${res.status}`);
    }
    const data = await res.json();
    return data;
}

export async function getDocGroups() {
    return requestJson("rfq_gen/doc-groups");
}

export async function getQuoteTemplates() {
    return requestJson("rfq_gen/quote_templates");
}

export async function generateRfq(payload) {
    const res = await apiFetch("rfq_gen/rfq", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
    }, 300000); // 5 minutes timeout for RFQ generation
    if (!res.ok) {
        let errorDetail;
        try {
            const errorText = await res.text();
            errorDetail = JSON.parse(errorText);
        } catch {
            errorDetail = await res.text();
        }
        
        console.error("RFQ generation failed:", errorDetail);
        
        // Create a structured error object with status code and details
        const error = new Error(`RFQ generation failed`);
        /** @type {any} */ (error).status = res.status;
        /** @type {any} */ (error).detail = errorDetail;
        
        throw error;
    }
    const data = await res.json();
    return data;
}


export async function createParty(body) {
    const res = await apiFetch("parties", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
    });
    if (!res.ok) {
        console.error("422 detail:", await res.text());
        throw new Error(`HTTP ${res.status}`);
    }
    return res.json();
}

export async function createBuyer(partyPk, body) {
    if (!partyPk) throw new Error("Party PK is required");
    
    const res = await apiFetch(`parties/${partyPk}/buyers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
    });
    if (!res.ok) {
        console.error("422 detail:", await res.text());
        throw new Error(`HTTP ${res.status}`);
    }
    return res.json();
}

export async function searchBoeingFinishCode(finishCode) {
    if (!finishCode || !finishCode.trim()) {
        throw new Error("Finish code is required");
    }
    
    return requestJson(`boeing-finish-code?finish_code=${encodeURIComponent(finishCode.trim())}`);
}

// ----------- VACATION REQUESTS --------------------

export async function getVacationRequests() {
    return requestJson(`employee/vacation-requests/`);
}

export async function approveVacationRequest(id) {
    if (!id) throw new Error("Request ID is required");
    
    return requestJson(`employee/approve-request/${id}`, {
        method: "POST"
    });
}

export async function addVacationComment(id, comment) {
    if (!id) throw new Error("Request ID is required");
    if (!comment || !comment.trim()) {
        throw new Error("Comment is required");
    }
    
    return requestJson(`employee/add-comment/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ comment: comment.trim() })
    });
}

// ----------- COMMODITY CODES --------------------

export async function getCommodityCodes() {
    return requestJson("commodity-codes");
}

export async function updateItemCommodityCode(itemPk, codeId) {
    if (!itemPk) throw new Error("Item PK is required");
    if (codeId === null || codeId === undefined) throw new Error("Code ID is required");
    
    return requestJson(`item/${encodeURIComponent(itemPk)}/commodity-code/${encodeURIComponent(codeId)}`, {
        method: "PUT"
    });
}

