import { getStoredToken } from './authService';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://127.0.0.1:8080';

export async function uploadExerciseImage({ userId, conversationId, file }) {
  const token = getStoredToken();
  if (!token) {
    throw new Error('Debes iniciar sesión para subir una foto');
  }

  const form = new FormData();
  form.append('image', file);
  form.append('userId', String(userId));
  if (conversationId) {
    form.append('conversationId', String(conversationId));
  }

  const res = await fetch(`${API_BASE}/api/chat/vision`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: form,
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data?.message || data?.detail || `Error al subir imagen (${res.status})`);
  }

  return data;
}

export default { uploadExerciseImage };
