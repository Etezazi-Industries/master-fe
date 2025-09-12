// @ts-check
const API_URL = 'http://127.0.0.1:8000/';


export async function getPartyData() {
    const res = await fetch(`${API_URL}rfq_gen/party`, { headers: { Accept: 'application/json' } });
    if (!res.ok) {
        console.error('Failed to users.', res.status);
        return {};
    }
    const data = await res.json();
    return data;
}

export async function getBuyers(party_pk) {
    const res = await fetch(`${API_URL}rfq_gen/${party_pk}/buyers`, { headers: { Accept: 'application/json' } });
    if (!res.ok) {
        console.error('Failed to users.', res.status);
        return {};
    }
    const data = await res.json();
    return data;
}
