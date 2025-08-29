// @ts-check

const API_URL = 'http://127.0.0.1:8000/employee-requests/get-vacation-requests';
const table = document.getElementById('vacation-table');
const tbody = table.querySelector('tbody');
const approveBtn = document.getElementById('approve-btn');
let selectedRow = null;
const loading = bootstrap.Modal.getOrCreateInstance(document.getElementById('loadingModal'));


async function withLoading(task, params) {
    loading.show();
    try {
        if (params) {
            return await task(params);
        }
        else {
            return await task();
        }
    }
    finally {
        loading.hide();
        setTimeout(() => {
            const el = document.getElementById('loadingModal');
            const stuck = document.body.classList.contains('modal-open') ||
                document.querySelectorAll('.modal-backdrop').length > 0;

            if (stuck) {
                console.warn('[fix] forcing modal cleanup');
                document.body.classList.remove('modal-open');
                document.querySelectorAll('.modal-backdrop').forEach(b => b.remove());
                if (el) {
                    el.classList.remove('show');
                    el.style.display = 'none';
                    el.setAttribute('aria-hidden', 'true');
                }
            }
        }, 150);  // 150 is the transition time for bootstrap
    }
}


if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        withLoading(loadData);
    });
} else {
    withLoading(loadData);
}


function selectRow(tr, isApproved) {
    if (selectedRow) selectedRow.classList.remove('table-active');
    selectedRow = tr;
    selectedRow.classList.add('table-active');
    console.log('[vacation] selectRow id=', tr.dataset.id, 'approved=', isApproved);
    approveBtn.disabled = isApproved === true;
}


approveBtn?.addEventListener('click', async () => {
    if (!selectedRow) return;
    const id = Number(selectedRow.dataset.id);
    console.log('[vacation] approve click for id=', id);

    const r = await fetch(`http://127.0.0.1:8000/employee-requests/approve-request/${id}`, { method: 'POST' });
    console.log('[vacation] approve response status=', r.status);

    selectedRow.querySelector('td:last-child').innerHTML = `<span class="badge bg-success">Yes</span>`;
    approveBtn.disabled = true;
});


function escapeHtml(str) {
    return String(str)
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#39;');
}


// ---- Data loader ----
async function loadData() {
    console.log('[vacation] loadData(raw) begin. Fetching:', API_URL);

    if (location.protocol === 'file:' && API_URL.startsWith('/')) {
        console.warn('[vacation] WARNING: /api path under file:// will fail. Use http://localhost:PORT/... or IPC.');
    }

    let rows;
    try {
        const res = await fetch(API_URL, { headers: { 'Accept': 'application/json' } });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        rows = Array.isArray(json) ? json : (Array.isArray(json.data) ? json.data : []);
    } catch (e) {
        console.error('[vacation] API load failed → using fallback. Error=', e);
    }

    tbody.innerHTML = '';
    rows.forEach((r) => {
        const id = r['Vacation ID'];
        const name = r['Employee'];
        const fromDate = r['From Date'];
        const toDate = r['To Date'];
        const startTime = r['Start Time'];
        const hours = r['Hours'];
        const reason = r['Reason'];
        const approved = r['Approved'] === true; // coerce to boolean

        const tr = document.createElement('tr');
        tr.dataset.id = id;

        tr.innerHTML = `
        <td>${id}</td>
        <td>${escapeHtml(name ?? '')}</td>
        <td>${escapeHtml(String(fromDate ?? ''))}</td>
        <td>${escapeHtml(String(toDate ?? ''))}</td>
        <td>${escapeHtml(String(startTime ?? ''))}</td>
        <td>${escapeHtml(String(hours ?? ''))}</td>
        <td>${escapeHtml(reason ?? '')}</td>
        <td>
            <span class="badge ${approved ? 'bg-success' : 'bg-secondary'}">
                ${approved ? 'Yes' : 'No'}
            </span>
        </td>
    `;

        tr.addEventListener('click', () => {
            if (selectedRow) selectedRow.classList.remove('table-active');
            selectedRow = tr;
            selectedRow.classList.add('table-active');
            console.log('[vacation] selectRow id=', id, 'approved=', approved);
            approveBtn.disabled = approved === true;
        });

        tbody.appendChild(tr);
    });
}
