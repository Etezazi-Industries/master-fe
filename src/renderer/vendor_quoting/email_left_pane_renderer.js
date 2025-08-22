// @ts-check
import { getEmailGroups } from "./api_calls.js";


const esc = (s) => String(s ?? '').replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]));


// local state
const emailState = {
    categories: [],            // ['fin','mat-al',...]
    currentCategory: null,     // string
    cache: new Map(),          // Map<category, Array<{id,email}>>
    seq: new Map(),            // Map<category, number> for local id generation
    editingId: null            // currently editing email id (optional)
};


const el = (sel) => document.querySelector(sel);
const emailItem = ({ id, email }) => `
  <li class="list-group-item d-flex justify-content-between align-items-center" data-id="${id}">
    <span class="text-truncate" style="max-width: 75%">${esc(email)}</span>
    <div class="btn-group btn-group-sm">
      <button class="btn btn-outline-secondary email-edit">Edit</button>
      <button class="btn btn-outline-danger email-del">Del</button>
    </div>
  </li>
`;

function getList(cat = emailState.currentCategory) {
    return emailState.cache.get(cat) || [];
}
function setList(list, cat = emailState.currentCategory) {
    emailState.cache.set(cat, list);
}

function normalizeEmails(arr, cat) {
    const seen = new Set();
    const list = [];
    arr.forEach((v) => {
        if (typeof v !== 'string') return;
        const t = v.trim();
        if (!t) return;
        const key = t.toLowerCase();
        if (seen.has(key)) return;
        seen.add(key);
        list.push({ id: nextId(cat), email: t });
    });
    return list;
}


function nextId(cat) {
    const cur = emailState.seq.get(cat) || 0;
    const nx = cur + 1;
    emailState.seq.set(cat, nx);
    return String(nx);
}



async function loadAllEmailsOnce() {
    try {
        const data = await getEmailGroups();
        const apiCats = Object.keys(data || {});

        if (!emailState.categories?.length) {
            emailState.categories = apiCats;
            emailState.currentCategory = apiCats[0] || null;
            renderCategorySelect();
        }

        for (const cat of apiCats) {
            const arr = Array.isArray(data[cat]) ? data[cat] : [];
            const list = normalizeEmails(arr, cat);
            setList(list, cat);
            // Ensure seq is set above the largest id we just generated (already handled by nextId calls)
            if (!emailState.seq.has(cat)) emailState.seq.set(cat, list.length);
        }
        renderEmailList();
    } catch (e) {
        console.error('Error loading email groups:', e);
    }
}


async function ensureEmailsLoaded(category) {
    if (!emailState.cache.has(category)) {
        await loadAllEmailsOnce(); // loads all categories at once
    }
    renderEmailList();
}


function renderCategorySelect() {
    const sel = el('#email-category-select');
    if (!sel) return;
    sel.innerHTML = emailState.categories
        .map(
            (c) => `
    <option value="${esc(c)}"${emailState.currentCategory === c ? ' selected' : ''}>${esc(c)}</option>
  `
        )
        .join('');
}


function renderEmailList() {
    const ul = el('#email-list');
    const hint = el('#email-hint');
    if (!ul) return;

    const list = getList();
    ul.innerHTML = list.length
        ? list.map(emailItem).join('')
        : `<li class="list-group-item text-muted">No emails for ${esc(emailState.currentCategory)}.</li>`;

    if (hint) {
        hint.textContent = `You can add, edit, or remove emails for ${emailState.currentCategory}.`;
    }

    ul.querySelectorAll('.email-edit').forEach((btn) => {
        btn.addEventListener('click', () => startInlineEdit(btn.closest('li')));
    });
    ul.querySelectorAll('.email-del').forEach((btn) => {
        btn.addEventListener('click', () => deleteEmail(btn.closest('li')));
    });
}

// --- LOCAL CRUD ---
async function addEmail() {
    const input = el('#email-input');
    const email = input?.value.trim();
    if (!email) return;

    const category = emailState.currentCategory;
    const list = getList(category);

    // dedupe by lowercase
    const key = email.toLowerCase();
    if (list.some((r) => r.email.toLowerCase() === key)) {
        input.value = '';
        renderEmailList();
        return;
    }

    list.push({ id: nextId(category), email });
    setList(list, category);

    input.value = '';
    renderEmailList();
}

// Edit (inline)
function startInlineEdit(li) {
    if (!li) return;
    const id = li.getAttribute('data-id');
    const span = li.querySelector('span');
    const current = span?.textContent?.trim() || '';
    emailState.editingId = id;

    li.innerHTML = `
    <div class="input-group input-group-sm">
      <input type="email" class="form-control" value="${esc(current)}" />
      <button class="btn btn-primary email-save">Save</button>
      <button class="btn btn-outline-secondary email-cancel">Cancel</button>
    </div>
  `;

    li.querySelector('.email-save').addEventListener('click', () => {
        const next = li.querySelector('input').value.trim();
        if (!next) return;
        const category = emailState.currentCategory;
        const list = getList(category);

        // prevent duplicates
        const key = next.toLowerCase();
        if (list.some((r) => r.id !== id && r.email.toLowerCase() === key)) {
            emailState.editingId = null;
            renderEmailList();
            return;
        }

        const idx = list.findIndex((r) => r.id === id);
        if (idx !== -1) {
            list[idx] = { ...list[idx], email: next };
            setList(list, category);
        }

        emailState.editingId = null;
        renderEmailList();
    });

    li.querySelector('.email-cancel').addEventListener('click', () => {
        emailState.editingId = null;
        renderEmailList();
    });
}

// Delete
async function deleteEmail(li) {
    if (!li) return;
    const id = li.getAttribute('data-id');
    const category = emailState.currentCategory;
    const list = getList(category).filter((r) => r.id !== id);
    setList(list, category);
    renderEmailList();
}

// --- Wiring ---
function wireEmailManagerStaticHandlers() {
    const addBtn = el('#email-add-btn');
    const catSel = el('#email-category-select');

    if (addBtn) addBtn.addEventListener('click', addEmail);
    if (catSel)
        catSel.addEventListener('change', async () => {
            emailState.currentCategory = catSel.value;
            await ensureEmailsLoaded(emailState.currentCategory);
        });
}

// AFTER you’ve rendered the modal sections so we know the categories
export function initEmailManagerFromGroups(groups) {
    // derive categories from your groups[].code
    console.log(groups);
    const cats = [...new Set((groups || []).map((g) => g.code).filter(Boolean))];
    emailState.categories = cats;
    emailState.currentCategory = cats[0] || null;

    // initialize per-category seq if not present
    for (const c of cats) if (!emailState.seq.has(c)) emailState.seq.set(c, getList(c).length);

    renderCategorySelect();
    wireEmailManagerStaticHandlers();

    if (emailState.currentCategory) {
        // load everything once (optional). If you want fully local, comment next line.
        loadAllEmailsOnce();
    } else {
        renderEmailList();
    }
}
