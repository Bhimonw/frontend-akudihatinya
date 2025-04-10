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
    authState.token = result.data.token;
    authState.user = result.data.user;
    authState.isadmin = result.data.user.isadmin;

    // Simpan ke localStorage
    localStorage.setItem('token', authState.token);
    localStorage.setItem('user', JSON.stringify(authState.user));
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
  localStorage.removeItem('user');
  localStorage.removeItem('isadmin');
};

// Fungsi untuk restore autentikasi
export const restoreAuth = () => {
  const token = localStorage.getItem('token');
  const user = localStorage.getItem('user');
  const isadmin = localStorage.getItem('isadmin');

  if (token && user) {
    authState.token = token;
    authState.user = JSON.parse(user);
    authState.isadmin = isadmin === 'true'; // Konversi string ke boolean
  }
};

// Eksport state dan fungsi
export const getAuthState = () => authState;

// src/utils/auth.js

export const isAdmin = () => {
  return authState.isadmin; // Kembalikan nilai isadmin dari state
};

