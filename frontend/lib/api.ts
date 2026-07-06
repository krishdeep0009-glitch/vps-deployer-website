import axios from 'axios';

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
});

export function setAuthToken(token: string | null) {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    localStorage.setItem('vps_panel_token', token);
  } else {
    delete api.defaults.headers.common['Authorization'];
    localStorage.removeItem('vps_panel_token');
  }
}

export function loadAuthToken() {
  const token = typeof window !== 'undefined' ? localStorage.getItem('vps_panel_token') : null;
  if (token) setAuthToken(token);
  return token;
}
