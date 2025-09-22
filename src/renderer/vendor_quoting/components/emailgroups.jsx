// @ts-check
import React, { useEffect, useState, useCallback, useRef } from "react";
import { getEmailGroups } from "../../api_calls.js";


export default function EmailManager({ groups = [], onChange }) {
    // Instead of filtering by item commodity codes, show all available email categories from API
    const [availableCategories, setAvailableCategories] = useState(/** @type {string[]} */([]));
    const [currentCategory, setCurrentCategory] = useState("");
    const [cache, setCache] = useState({}); // { cat: [ {id,email} ] }
    const [editingId, setEditingId] = useState(null);

    const onChangeRef = useRef(onChange);
    useEffect(() => {
        onChangeRef.current = onChange;
    }, [onChange]);

    useEffect(() => {
        if (!currentCategory && availableCategories.length) setCurrentCategory(availableCategories[0]);
    }, [availableCategories, currentCategory]);

    const serialize = useCallback((mapObj) => {
        const out = {};
        for (const [cat, arr] of Object.entries(mapObj || {})) {
            out[cat] = (arr || []).map(x => x.email);
        }
        return out;
    }, []);


    const lastPayloadRef = useRef({});

    useEffect(() => {
        const payload = serialize(cache);
        // Skip if unchanged to avoid redundant parent updates
        const same =
            lastPayloadRef.current &&
            JSON.stringify(lastPayloadRef.current) === JSON.stringify(payload);
        if (same) return;
        lastPayloadRef.current = payload;
        onChangeRef.current?.(payload);
    }, [cache, serialize]);

    const updateCache = useCallback((updater) => {
        setCache(prev => (typeof updater === "function" ? updater(prev) : updater));
    }, []);

    // Load once, then mark didLoad=true and set cache
    useEffect(() => {
        (async () => {
            const data = await getEmailGroups(); // { CAT: string[] }
            const next = {};
            const categories = [];
            for (const cat of Object.keys(data || {})) {
                categories.push(cat);
                next[cat] = (data[cat] || []).map((email, idx) => ({
                    id: String(idx + 1),
                    email,
                }));
            }
            // Set all available categories from API response
            setAvailableCategories(categories.sort());
            updateCache(next);
            //didLoad.current = true;             // <-- gate opens AFTER cache populated
        })().catch(console.error);
    }, [updateCache]);

    const list = cache[currentCategory] || [];

    function saveEmail(id, nextValue) {
        const value = String(nextValue || "").trim();
        if (!value) { setEditingId(null); return; }
        const dup = list.some(r => r.id !== id && r.email.toLowerCase() === value.toLowerCase());
        if (dup) { setEditingId(null); return; }
        const newList = list.map(r => (r.id === id ? { ...r, email: value } : r));
        updateCache(prev => ({ ...prev, [currentCategory]: newList }));
        setEditingId(null);
    }

    function deleteEmail(id) {
        const newList = list.filter(r => r.id !== id);
        updateCache(prev => ({ ...prev, [currentCategory]: newList }));
    }

    return (
        <div>
            <div className="mb-2">
                <select
                    className="form-select form-select-sm"
                    value={currentCategory}
                    onChange={(e) => setCurrentCategory(e.target.value)}
                >
                    {availableCategories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
            </div>

            <ul className="list-group mb-2">
                {list.length ? list.map(({ id, email }) => (
                    <li key={id} className="list-group-item d-flex justify-content-between align-items-center">
                        {editingId === id ? (
                            <div className="input-group input-group-sm">
                                <input
                                    type="email"
                                    defaultValue={email}
                                    className="form-control"
                                    onKeyDown={(e) => { if (e.key === "Enter") saveEmail(id, /** @type {HTMLInputElement} */(e.target).value); }}
                                />
                                <button className="btn btn-primary" onClick={(e) => {
                                    const input = /** @type {HTMLInputElement} */(e.currentTarget.previousSibling);
                                    saveEmail(id, input && input.value);
                                }}>Save</button>
                                <button className="btn btn-outline-secondary" onClick={() => setEditingId(null)}>Cancel</button>
                            </div>
                        ) : (
                            <>
                                <span className="text-truncate" style={{ maxWidth: "75%" }}>{email}</span>
                                <div className="btn-group btn-group-sm">
                                    <button className="btn btn-outline-secondary" onClick={() => setEditingId(id)}>Edit</button>
                                    <button className="btn btn-outline-danger" onClick={() => deleteEmail(id)}>Del</button>
                                </div>
                            </>
                        )}
                    </li>
                )) : (
                    <li className="list-group-item text-muted">
                        No emails for {currentCategory || "—"}.
                    </li>
                )}
            </ul>

            <div className="form-text mt-2">
                You can edit or remove emails for {currentCategory || "—"}.
            </div>
        </div>
    );
}

