import axios from '../api'; // Impor instance Axios

// State lokal menggunakan reactive
const authState = {
  user: null,
  token: null,
  isadmin: false,
};

// Fungsi untuk login
export const login = async (username, password) => {
  try {
    const response = await fetch('http://localhost:8000/api/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    });

    if (!response.ok) {
      throw new Error('Login gagal');
    }

    const result = await response.json();

    // Simpan data user dan token
    authState.token = result.access_token;
    authState.user = result.user;
    authState.isadmin = result.user.role === 'admin';

    // Simpan ke localStorage
    localStorage.setItem('token', result.access_token);
    localStorage.setItem('refresh_token', result.refresh_token);
    localStorage.setItem('user', JSON.stringify(result.user));
    localStorage.setItem('isadmin', authState.isadmin);
  } catch (error) {
    throw error;
  }
};

// Fungsi untuk logout
export const logout = () => {
  authState.user = null;
  authState.token = null;
  authState.isadmin = false;

  // Hapus dari localStorage
  localStorage.removeItem('token');
  localStorage.removeItem('refresh_token');
  localStorage.removeItem('user');
  localStorage.removeItem('isadmin');
};

// Fungsi untuk restore autentikasi
export const restoreAuth = () => {
  const token = localStorage.getItem('token');
  const refreshToken = localStorage.getItem('refresh_token');
  const user = localStorage.getItem('user');
  const isadmin = localStorage.getItem('isadmin');

  if (token && user) {
    authState.token = token;
    authState.user = JSON.parse(user);
    authState.isadmin = isadmin === 'true'; // Konversi string ke boolean
  }
};

// Fungsi untuk refresh token
export const refreshToken = async () => {
  try {
    const refreshTokenStored = localStorage.getItem('refresh_token');
    if (!refreshTokenStored) {
      throw new Error('Refresh token tidak ditemukan');
    }

    const response = await fetch('http://localhost:8000/api/refresh', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authState.token}`, // Kirim access token lama
      },
      body: JSON.stringify({ refresh_token: refreshTokenStored }),
    });

    if (!response.ok) {
      throw new Error('Gagal memperbarui token');
    }

    const result = await response.json();

    // Update state dengan token baru
    authState.token = result.access_token;
    authState.user = result.user;
    authState.isadmin = result.user.role === 'admin';

    // Simpan token baru ke localStorage
    localStorage.setItem('token', result.access_token);
    localStorage.setItem('refresh_token', result.refresh_token);
    localStorage.setItem('user', JSON.stringify(result.user));
    localStorage.setItem('isadmin', authState.isadmin);
  } catch (error) {
    throw error;
  }
};

// Interceptor untuk menangani token kadaluwarsa
axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response && error.response.status === 401 && !error.config._retry) {
      error.config._retry = true; // Tandai agar tidak terjadi loop
      try {
        await refreshToken(); // Refresh token
        error.config.headers.Authorization = `Bearer ${authState.token}`; // Update header dengan token baru
        return axios(error.config); // Coba ulang permintaan
      } catch (refreshError) {
        logout(); // Logout jika refresh token gagal
        throw refreshError;
      }
    }
    return Promise.reject(error);
  }
);

// Eksport state dan fungsi
export const getAuthState = () => authState;

// src/utils/auth.js
export const isAdmin = () => {
  return authState.isadmin; // Kembalikan nilai isadmin dari state
};