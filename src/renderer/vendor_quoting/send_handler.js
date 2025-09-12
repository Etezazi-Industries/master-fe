// @ts-check

import { RecipientsStore } from './recipients-store.js';
import { buildSendBody } from './payload_builder.js';

// Keep a reference to the last loaded server data (so React and vanilla can share it)
export const SharedModalState = {
    /** raw dict from server: data["line-items"] */
    currentLineItems: null,
    /** optional RFQ id for your URL path */
    currentRfqId: null,
};


// POST helper
async function postJson(url, body) {
    const res = await fetch(url, {
        method: 'POST',
        headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    });
    if (!res.ok) {
        const text = await res.text().catch(() => '');
        throw new Error(`HTTP ${res.status}: ${text || res.statusText}`);
    }
    return res.json().catch(() => ({}));
}


// Click listener
document.getElementById('sendMailBtn')?.addEventListener('click', async () => {
    console.log("Executing");
    try {
        const { currentLineItems, currentRfqId } = SharedModalState;
        if (!currentLineItems) throw new Error('No items loaded.');

        const recipientsByCategory = RecipientsStore.toObject();
        console.log(recipientsByCategory);
        const body = buildSendBody(currentLineItems, recipientsByCategory, /* dryRun: */ false);

        // Adjust to your real endpoint:
        // e.g. `/api/rfqs/${currentRfqId}/send` if you’re following your FastAPI route
        const API_URL = 'http://127.0.0.1:8000/';
        const url = `${API_URL}rfqs/${encodeURIComponent(currentRfqId)}/send`;

        console.log('Sending payload:', body);
        const resp = await postJson(url, body);

        // Success UX: close modal, toast, etc.
        console.log('Server response:', resp);
        // bootstrap modal close if desired
        // const modal = bootstrap.Modal.getInstance(document.getElementById('rfqRecipientsModal'));
        // modal?.hide();
    } catch (err) {
        console.error('Failed to send RFQ emails:', err);
        alert(`Send failed: ${err.message}`);
    }
});

