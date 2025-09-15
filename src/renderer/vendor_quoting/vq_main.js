// @ts-check
import { searchRfqOrItem, getRfqDetails } from "../api_calls.js";
import { renderRecipientsModalReact } from "./modals/reviewModal.js";
import { SharedModalState } from "./send_handler.js";


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

    for (const [key, value] of Object.entries(results.result ?? {})) {
        const option = document.createElement('option');
        option.textContent = `${key} - ${value}`;
        resultsBox.appendChild(option);
    }
}


document.getElementById('search-button')?.addEventListener('click', triggerSearchForRfq);


const searchBox = document.getElementById('search-result-box');
const openBtn = document.getElementById('open-preview-modal');

let opening = false;

async function openPreviewModal() {
    if (opening) return;
    opening = true;
    openBtn?.setAttribute('disabled', 'true');

    try {
        if (!searchBox) return;
        const raw = (searchBox.value ?? '').trim();
        const rfqId = raw.split(' - ')[0]?.trim();
        if (!rfqId) return;

        const data = await getRfqDetails(rfqId);
        const lineItems = data['line-items'] ?? [];
        renderRecipientsModal(lineItems, { rfqId });

        const modalEl = document.getElementById('rfqRecipientsModal');
        if (!modalEl) return;

        const modal = bootstrap.Modal.getOrCreateInstance(modalEl, {
            backdrop: 'static',
            keyboard: false,
            focus: true,
        });
        modal.show();
    } catch (err) {
        console.error('Error fetching RFQ details:', err);
    } finally {
        opening = false;
        openBtn?.removeAttribute('disabled');
    }
}

openBtn?.addEventListener('click', openPreviewModal);


function renderRecipientsModal(rawData, { rfqId } = {}) {
    SharedModalState.currentLineItems = rawData;
    SharedModalState.currentRfqId = rfqId;
    renderRecipientsModalReact(rawData, { rfqId });
}
