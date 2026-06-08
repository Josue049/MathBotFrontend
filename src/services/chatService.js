const API_BASE = import.meta.env.VITE_API_BASE || 'https://mathbotbackendspringboot.onrender.com/';
const FASTAPI_BASE = import.meta.env.VITE_FASTAPI_BASE || 'https://mathbotbackendspringboot.onrender.com/';

function getAuthToken() {
    return localStorage.getItem('mathbot_token') || '';
}

async function requestJson(path, options = {}) {
    const token = getAuthToken();
    const res = await fetch(`${API_BASE}${path}`, {
        headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            ...(options.headers || {}),
        },
        ...options,
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
        throw new Error(data?.message || data?.detail || `Backend error ${res.status}`);
    }

    return data;
}

export async function startConversation(userId, firstMessage) {
    return requestJson('/api/chat/start', {
        method: 'POST',
        body: JSON.stringify({ userId, firstMessage }),
    });
}

export async function sendToBackend({ userId, conversationId, message }) {
    return requestJson('/api/chat', {
        method: 'POST',
        body: JSON.stringify({ userId, conversationId, message }),
    });
}

export async function getHistory(userId, limit = 6) {
    return requestJson(`/api/history/${userId}?limit=${limit}`);
}

export async function getConversation(userId, conversationId) {
    try {
        return await requestJson(`/api/history/${userId}/${conversationId}`);
    } catch (error) {
        if (!String(error?.message || '').includes('404')) {
            throw error;
        }

        const res = await fetch(`${FASTAPI_BASE}/api/history/${userId}/${conversationId}`);
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
            throw new Error(data?.message || data?.detail || `Backend error ${res.status}`);
        }
        return data;
    }
}

export default { startConversation, sendToBackend, getHistory, getConversation };
