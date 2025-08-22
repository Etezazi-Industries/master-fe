// @ts-check
import { searchRfqOrItem, getRfqDetails } from "./api_calls.js";
import { initEmailManagerFromGroups } from "./email_left_pane_renderer.js"
import { pendingAssignments, normalizeFromYourApi, uncodedCard, groupCard } from "./request_review_renderer.js";


function setupFileSelector(browseBtnId, inputId, listId) {
    const browseBtn = document.getElementById(browseBtnId);
    const fileInput = document.getElementById(inputId);
    const fileList = document.getElementById(listId);

    if (fileInput && browseBtn && fileList) {
        browseBtn.addEventListener('click', () => fileInput.click());
        fileInput.addEventListener('change', function(e) {
            const input = e.currentTarget;
            if (!input || !('files' in input) || !input.files) return;
            fileList.innerHTML = '';
            for (const file of input.files) {
                const li = document.createElement('li');
                li.className = 'list-group-item';
                li.textContent = file.name;
                fileList.appendChild(li);
            }
        });
    } else {
        console.error(`No element found with id ${inputId}`);
    }
}

// both attachment selectors
setupFileSelector('browse-other-attachments', 'other-attachments-input', 'other-attachments-select');
setupFileSelector('browse-finish-attachments', 'finish-attachments-input', 'finish-attachments-select');


async function triggerSearchForRfq() {
    console.log("Triggerred");
    const searchBoxEl = document.getElementById('rfq-or-item-search');
    const resultsBox = document.getElementById('search-result-box');

    if (!searchBoxEl || !resultsBox || !('value' in searchBoxEl)) {
        console.error('Search box or results box missing / wrong type');
        return;
    }

    const query = String(searchBoxEl.value).trim();
    resultsBox.innerHTML = '';

    if (!query) return;

    const results = await searchRfqOrItem(query);
    console.log(results);

    for (const [key, value] of Object.entries(results.result ?? {})) {
        const option = document.createElement('option');
        option.textContent = `${key} - ${value}`;
        resultsBox.appendChild(option);
    }
}


document.getElementById('search-button')?.addEventListener('click', triggerSearchForRfq);


const searchBox = document.getElementById('search-result-box');


searchBox?.addEventListener('dblclick', async () => {
    if (!('value' in searchBox)) return;
    const raw = searchBox.value || '';
    const rfqId = raw.split(' - ')[0]?.trim();
    if (!rfqId) return;

    try {
        const data = await getRfqDetails(rfqId);
        renderRecipientsModal(data, { rfqId });

        const modalEl = document.getElementById('rfqRecipientsModal');
        if (!modalEl) return;
        // @ts-ignore
        const modal = new bootstrap.Modal(modalEl);
        modal.show();
    } catch (err) {
        console.error('Error fetching RFQ details:', err);
    }
});


function renderRecipientsModal(rawData, { rfqId } = {}) {
    pendingAssignments.clear();

    const { groups, uncoded } = normalizeFromYourApi(rawData);

    const container = document.getElementById('rfq-sections');
    if (container) {
        container.innerHTML = groups.map(groupCard).join('') + uncodedCard(uncoded);
    }

    // header bits
    const rfqNumEl = document.getElementById('rfq-number');
    if (rfqNumEl) rfqNumEl.textContent = rfqId ?? '—';
    const sectionCountEl = document.getElementById('section-count');
    if (sectionCountEl) sectionCountEl.textContent = String(groups.length + (uncoded.length ? 1 : 0));

    // wire up dropdowns + update button visibility
    const selects = document.querySelectorAll('.code-picker');
    const updateArea = document.getElementById('uncoded-update-area');
    const updateBtn = document.getElementById('apply-code-updates');
    const statusEl = document.getElementById('uncoded-update-status');

    if (selects.length && updateArea && updateBtn) {
        selects.forEach(sel => {
            sel.addEventListener('change', () => {
                const itemPk = sel.getAttribute('data-item-pk');
                const val = sel.value.trim();
                if (val) {
                    pendingAssignments.set(itemPk, val);
                } else {
                    pendingAssignments.delete(itemPk);
                }
                updateArea.classList.toggle('d-none', pendingAssignments.size === 0);
                if (statusEl) statusEl.textContent = '';
            });
        });

        updateBtn.addEventListener('click', async () => {
            if (!pendingAssignments.size) return;

            updateBtn.disabled = true;
            if (statusEl) statusEl.textContent = 'Updating…';

            try {
                const payload = [...pendingAssignments].map(([item_pk, code]) => ({ item_pk, code }));
                console.log('Would PUT these updates:', payload);

                if (statusEl) statusEl.textContent = 'Saved (dummy).';
            } catch (e) {
                if (statusEl) statusEl.textContent = 'Update failed.';
                console.error(e);
            } finally {
                updateBtn.disabled = false;
            }
        });
    }
    initEmailManagerFromGroups(groups);
}

