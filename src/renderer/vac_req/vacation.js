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
    approveBtn.disabled = isApproved === true;
}


approveBtn?.addEventListener('click', async () => {
    if (!selectedRow) return;
    const id = Number(selectedRow.dataset.id);
    const r = await fetch(`http://127.0.0.1:8000/employee-requests/approve-request/${id}`, { method: 'POST' });
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

    // TODO: make the pencil edit button and the value two columsn in the same column.
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
        <td>
          <div class="d-grid align-items-center" style="grid-template-columns: 1fr auto; column-gap:.5rem;">
            <span class="reason-text" style="white-space: pre-wrap;">${escapeHtml(reason ?? '')}</span>
            <div class="icon-wrap d-flex align-items-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="16"
                   fill="currentColor" class="bi bi-pencil text-muted edit-reason"
                   viewBox="0 0 16 16" role="button" data-id="${id}" tabindex="0" aria-label="Edit reason">
                <path d="M12.146.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1 0 .708l-10 10a.5.5 0 0 1-.168.11l-5 2a.5.5 0 0 1-.65-.65l2-5a.5.5 0 0 1 .11-.168l10-10zM11.207 2L3 10.207V13h2.793L14 4.793 11.207 2zM12 1.207L14.793 4 13.5 5.293 10.707 2.5 12 1.207z"/>
              </svg>
            </div>
          </div>
        </td>
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
            approveBtn.disabled = approved === true;
        });

        tbody.appendChild(tr);
    });
}


table?.addEventListener('click', (e) => {
    const pencil = e.target.closest('.edit-reason');
    if (!pencil) return;

    e.stopPropagation();
    const row = pencil.closest('tr');
    const id = row.dataset.id;
    const name = row.querySelector('td:nth-child(2)')?.textContent.trim();

    document.getElementById('modalRequestId').textContent = id;
    document.getElementById('modalRequestName').textContent = name;

    bootstrap.Modal.getOrCreateInstance(document.getElementById('editReasonModal')).show();
})


/**
 * API request to add comment to the vacation request.
 *
 * @async
 * @param {number} id - VacationRequestPK 
 * @param {string} comment - Comment text
 */
async function addComment(id, comment) {
    const normalize = comment.trim();
    const r = await fetch(`http://127.0.0.1:8000/employee-requests/add-comment/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ comment: normalize })
    });
    if (!r.ok) {
        const msg = await r.text().catch(() => r.statusText);
        throw new Error(`Save failed: ${r.status} ${msg}`);
    }
    return normalize;
}


const saveBtn = document.getElementById('saveReasonBtn');

saveBtn?.addEventListener('click', async () => {
    const reason = document.getElementById('editReason')?.value.trim();
    const id = Number(document.getElementById('modalRequestId')?.textContent);
    if (!id || !reason) return;

    try {
        const serverReason = await addComment(id, reason); // <-- use returned value

        const row = table?.querySelector(`tr[data-id="${id}"]`);
        if (row) {
            const cell = row.querySelector('td:nth-child(7)');
            if (cell) {
                const svg = cell.querySelector('svg.edit-reason');

                cell.style.whiteSpace = 'pre-wrap';

                let textNode = Array.from(cell.childNodes).find(n => n.nodeType === Node.TEXT_NODE);
                if (!textNode) {
                    textNode = document.createTextNode('');
                    cell.insertBefore(textNode, svg ?? null);
                }
                const current = textNode.textContent || '';
                textNode.textContent = current ? `${current}\n${serverReason}` : serverReason;

                if (svg && svg !== cell.lastChild) cell.appendChild(svg);
            }
        }

        bootstrap.Modal.getInstance(editReasonModal)?.hide();
    } catch (err) {
        console.error(err);
        alert('Failed to save comment');
    }
});

