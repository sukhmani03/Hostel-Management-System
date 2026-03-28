// Utility functions for authentication (localStorage-based)

/** Get the JWT token from localStorage */
export const getToken = () => localStorage.getItem('token');

/** Get the user object from localStorage (JSON parsed) */
export const getUser = () => {
  try {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  } catch {
    return null;
  }
};

/** Save token and user to localStorage after login */
export const setAuth = (token, user) => {
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(user));
};

/** Remove token and user from localStorage (logout) */
export const clearAuth = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

/** Check if a token exists (user is logged in) */
export const isAuthenticated = () => !!getToken();

/** Check if the current user has the "admin" role */
export const isAdmin = () => {
  const user = getUser();
  return user && user.role === 'admin';
};

/** Check if the current user has the "warden" role */
export const isWarden = () => {
  const user = getUser();
  return user && user.role === 'warden';
};

/** Check if the current user has the "student" role */
export const isStudent = () => {
  const user = getUser();
  return user && user.role === 'student';
};
