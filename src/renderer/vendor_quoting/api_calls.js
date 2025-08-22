// @ts-check
const API_URL = 'http://127.0.0.1:8000/';
const EMAILS_BASE = `${API_URL}get-email-groups`; // used ONLY by loadAllEmailsOnce


export async function getEmailGroups() {
    const res = await fetch(EMAILS_BASE, { headers: { Accept: 'application/json' } });
    if (!res.ok) {
        console.error('Failed to load email groups', res.status);
        return;
    }
    const data = await res.json();
    return data;
};


export async function searchRfqOrItem(rfq_search_value, item_pk) {
    if (rfq_search_value) {
        const fullUrl = `${API_URL}search-rfq/${rfq_search_value}`;
        console.log(`Fetching URL: ${fullUrl}`);
        const res = await fetch(fullUrl, { headers: { 'Accept': 'application/json' } });
        const results = await res.json();
        return results;
    } else {
        const query = item_pk;
        // TODO: pending
    }
}


export async function getRfqDetails(rfq_pk) {
    if (!rfq_pk) return;
    const endpoint = `rfq-details/${rfq_pk}`;
    const fullUrl = `${API_URL}${endpoint}`;
    const res = await fetch(fullUrl, { headers: { Accept: 'application/json' } });
    const data = await res.json();
    return data
}


