const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8080';

function storeSession(data) {
    if (typeof window === 'undefined' || !data?.token) {
        return;
    }

    localStorage.setItem('mathbot_token', data.token);
    localStorage.setItem('mathbot_user', JSON.stringify(data.user || {}));
}

export function getStoredToken() {
    if (typeof window === 'undefined') {
        return null;
    }

    return localStorage.getItem('mathbot_token');
}

async function postJson(path, payload) {
    const res = await fetch(`${API_BASE}${path}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
        const validationErrors = Array.isArray(data?.errors) && data.errors.length > 0
            ? `: ${data.errors.join(' | ')}`
            : '';
        throw new Error((data?.message || `Backend error ${res.status}`) + validationErrors);
    }

    return data;
}

async function getJson(path) {
    const token = getStoredToken();
    const res = await fetch(`${API_BASE}${path}`, {
        headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
        throw new Error(data?.message || data?.detail || `Backend error ${res.status}`);
    }

    return data;
}

export async function registerUser(payload) {
    const data = await postJson('/api/auth/register', payload);
    storeSession(data);
    return data;
}

export async function loginUser(payload) {
    const data = await postJson('/api/auth/login', payload);
    storeSession(data);
    return data;
}

export function getStoredUser() {
    if (typeof window === 'undefined') {
        return null;
    }

    const raw = localStorage.getItem('mathbot_user');
    return raw ? JSON.parse(raw) : null;
}

export async function getCurrentUser() {
    const token = getStoredToken();

    if (!token) {
        return getStoredUser();
    }

    const res = await fetch(`${API_BASE}/api/users/me`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
        throw new Error(data?.message || `Backend error ${res.status}`);
    }

    if (typeof window !== 'undefined') {
        localStorage.setItem('mathbot_user', JSON.stringify(data || {}));
    }

    return data;
}

export async function updateProfile(payload) {
    const token = getStoredToken();
    if (!token) {
        throw new Error('No hay sesión activa');
    }

    const res = await fetch(`${API_BASE}/api/users/me`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
        throw new Error(data?.message || `Backend error ${res.status}`);
    }

    if (typeof window !== 'undefined') {
        localStorage.setItem('mathbot_user', JSON.stringify(data || {}));
    }

    return data;
}

export async function getTeachersByInstitution(institution) {
    if (!institution?.trim()) {
        return [];
    }

    return getJson(`/api/auth/teachers?institution=${encodeURIComponent(institution.trim())}`);
}

export async function getClassroomsByTeacher(teacherId) {
    if (!teacherId) {
        return [];
    }

    return getJson(`/api/auth/classrooms?teacherId=${encodeURIComponent(String(teacherId))}`);
}

export async function createClassroom(payload) {
    const token = getStoredToken();
    if (!token) {
        throw new Error('No hay sesión activa');
    }

    const res = await fetch(`${API_BASE}/api/users/classrooms`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
        throw new Error(data?.message || `Backend error ${res.status}`);
    }

    return data;
}

export async function getTeacherDashboard() {
    return getJson('/api/users/dashboard/teacher');
}

export function logoutUser() {
    if (typeof window === 'undefined') {
        return;
    }

    localStorage.removeItem('mathbot_token');
    localStorage.removeItem('mathbot_user');
}

export default { registerUser, loginUser, getStoredUser, getStoredToken, getCurrentUser, updateProfile, logoutUser, getTeachersByInstitution, getClassroomsByTeacher, createClassroom, getTeacherDashboard };