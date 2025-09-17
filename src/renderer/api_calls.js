// @ts-check

let _apiBase = "";
let _baseReady;

/** Set API base manually (tests/overrides). */
export function setApiBase(base) {
    _apiBase = base ? (base.endsWith("/") ? base : base + "/") : "";
    _baseReady = Promise.resolve(_apiBase);
}

function findBridge() {
    try {
        if (typeof window !== "undefined") {
            if (window.backend) return window.backend;
            const t = window.top;
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
    //if (_apiBase) return _apiBase;
    //if (!_baseReady) {
    //    _baseReady = (async () => {
    //        const br = await waitForBridge();
    //        const base = typeof br.getApiBase === "function" ? await br.getApiBase() : br.apiBase;
    //        const b = (base || "").trim();
    //        if (!b) throw new Error("API base not provided by preload");
    //        _apiBase = b.endsWith("/") ? b : b + "/";
    //        return _apiBase;
    //    })();
    //}
    //return _baseReady;
    return "http://127.0.0.1:8000/";
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

export async function parseExcelFiles(body) {
    const res = await fetch("http://127.0.0.1:8000/rfq_gen/excel-files", { method: "POST", body: body });
    if (!res.ok) {
        console.error("422 detail:", await res.text()); // FastAPI explains what's missing
        throw new Error(`HTTP ${res.status}`);
    }
    const data = await res.json();
    return data;
}


export async function createParty(body) {
    const res = await fetch("http://127.0.0.1:8000/parties", {
        method: "POST",
        headers: { "Content-Type": "application/json" }, // <-- add this
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
    
    const res = await fetch(`http://127.0.0.1:8000/parties/${partyPk}/buyers`, {
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

