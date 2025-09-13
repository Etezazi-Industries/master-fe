// @ts-check
import React, { useEffect, useState, useCallback, useRef } from "react";
import { getEmailGroups } from "../../api_calls.js";


export default function EmailManager({ groups = [], onChange }) {
    const categories = [...new Set(groups.map(g => g.code).filter(Boolean))];

    const [currentCategory, setCurrentCategory] = useState("");
    const [cache, setCache] = useState({}); // { cat: [ {id,email} ] }
    const [editingId, setEditingId] = useState(null);
    const [inputValue, setInputValue] = useState("");

    const onChangeRef = useRef(onChange);
    useEffect(() => {
        onChangeRef.current = onChange;
    }, [onChange]);

    useEffect(() => {
        if (!currentCategory && categories.length) setCurrentCategory(categories[0]);
    }, [categories, currentCategory]);

    const serialize = useCallback((mapObj) => {
        const out = {};
        for (const [cat, arr] of Object.entries(mapObj || {})) {
            out[cat] = (arr || []).map(x => x.email);
        }
        return out;
    }, []);


    const lastPayloadRef = useRef(null);

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
            for (const cat of Object.keys(data || {})) {
                next[cat] = (data[cat] || []).map((email, idx) => ({
                    id: String(idx + 1),
                    email,
                }));
            }
            updateCache(next);
            //didLoad.current = true;             // <-- gate opens AFTER cache populated
        })().catch(console.error);
    }, [updateCache]);

    const list = cache[currentCategory] || [];

    function addEmail() {
        const value = inputValue.trim();
        if (!value || !currentCategory) return;
        const exists = list.some(r => r.email.toLowerCase() === value.toLowerCase());
        if (exists) { setInputValue(""); return; }
        const newList = [...list, { id: String(Date.now()), email: value }];
        updateCache(prev => ({ ...prev, [currentCategory]: newList }));
        setInputValue("");
    }

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
                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
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
                                    onKeyDown={(e) => { if (e.key === "Enter") saveEmail(id, e.target.value); }}
                                />
                                <button className="btn btn-primary" onClick={(e) => {
                                    const input = e.currentTarget.previousSibling;
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

            <div className="input-group input-group-sm">
                <input
                    type="email"
                    className="form-control"
                    placeholder="Add email"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && addEmail()}
                />
                <button className="btn btn-primary" onClick={addEmail}>Add</button>
            </div>

            <div className="form-text mt-2">
                You can add, edit, or remove emails for {currentCategory || "—"}.
            </div>
        </div>
    );
}

