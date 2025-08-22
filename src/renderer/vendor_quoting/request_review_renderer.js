// @ts-check

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]));
const chip = (email) => `<span class="badge rounded-pill text-bg-light border me-1 mb-1">${esc(email)}</span>`;
export let pendingAssignments = new Map();


const itemRow = (it) => {
    const name = it.name ?? it.part_number ?? '';
    return `
    <li class="list-group-item d-flex justify-content-between">
      <div><strong>${esc(name)}</strong></div>
      <span class="badge text-bg-secondary">Qty ${esc(it.qty)}</span>
    </li> `;
};


export function groupCard({ code, items = [], emails = [] }) {
    const recipients = (emails || []).map(e => chip(e.email_id || e.email || '')).join('') || `<span class="text-muted">No recipients</span>`;
    return `
    <div class="card mb-4">
      <div class="card-body">
        <div class="d-flex align-items-center justify-content-between">
          <div class="d-flex align-items-center gap-2">
            <span class="fw-semibold">${esc(code)}</span>
          </div>
          <span class="badge text-bg-primary rounded-pill">${items.length} item${items.length === 1 ? '' : 's'}</span>
        </div>
        <hr class="my-3" />
        <div class="row g-4">
          <div class="col-12 col-lg-7">
            <ul class="list-group list-group-flush">
              ${items.map(itemRow).join('')}
            </ul>
          </div>
          <div class="col-12 col-lg-5">
            <div class="text-muted mb-1">Recipients</div>
            <div>${recipients}</div>
          </div>
        </div>
      </div>
    </div>
  `;
}


function buildCodeOptions(selected = "") {
    const list = Array.isArray(window.codesCache) ? window.codesCache : [];

    // normalize to { value, label }
    const normalized = list.map((c) => {
        if (typeof c === 'string') return { value: c, label: c };
        if (c && typeof c === 'object') {
            if ('value' in c) return { value: String(c.value), label: c.label ?? String(c.value) };
            if ('code' in c) return { value: String(c.code), label: c.label ?? String(c.code) };
        }
        return null;
    }).filter(Boolean);

    // sort by label
    normalized.sort((a, b) => a.label.localeCompare(b.label));

    // placeholder + options
    const head = `<option value="">Assign commodity code…</option>`;
    const body = normalized.map(({ value, label }) =>
        `<option value="${esc(value)}"${value === selected ? ' selected' : ''}>${esc(label)}</option>`
    ).join('');

    return head + body;
}


export function uncodedCard(items = []) {
    if (!items.length) return '';

    const options = buildCodeOptions();

    const rows = items.map((it) => {
        const name = it.name ?? it.part_number ?? '';
        return `
      <li class="list-group-item">
        <div class="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-2">
          <div class="me-3"><strong>${esc(name)}</strong> <span class="text-muted">• Qty ${esc(it.qty)}</span></div>
          <div class="d-flex align-items-center gap-2">
            <label class="form-label mb-0 small text-muted">Commodity</label>
            <select class="form-select form-select-sm code-picker"
                    data-item-pk="${esc(it.item_pk)}"
                    aria-label="Assign commodity code">
              ${options}
            </select>
          </div>
        </div>
      </li>
    `;
    }).join('');

    return `
    <div class="card mb-1">
      <div class="card-body">
        <div class="d-flex align-items-center justify-content-between">
          <div class="d-flex align-items-center gap-2">
            <span class="fw-semibold">Uncategorized (no commodity code)</span>
          </div>
          <span class="badge text-bg-primary rounded-pill">${items.length} item${items.length === 1 ? '' : 's'}</span>
        </div>
        <hr class="my-3" />
        <ul class="list-group list-group-flush">${rows}</ul>

        <div id="uncoded-update-area" class="mt-3 d-none">
          <button id="apply-code-updates" class="btn btn-primary btn-sm">
            Update ${items.length > 1 ? 'Selected Items' : 'Item'}
          </button>
          <span id="uncoded-update-status" class="ms-2 text-muted"></span>
        </div>
      </div>
    </div>
  `;
}


export function normalizeFromYourApi(raw) {
    const items = Object.entries(raw).map(([item_pk, it]) => ({
        item_pk,
        name: it.PartNumber,
        qty: it.QuantityRequired,
        code: it.EmailCategory,
    }));

    // group by EmailCategory
    const byCode = new Map();
    for (const it of items) {
        const key = it.code ?? 'UNCODED';
        if (!byCode.has(key)) byCode.set(key, { code: key, items: [], emails: [] });
        byCode.get(key).items.push(it);
    }

    return { groups: [...byCode.values()], uncoded: [] };
}
