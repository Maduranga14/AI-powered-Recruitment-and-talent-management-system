
const BASE_URL = 'http://localhost:5073/api';


async function request(endpoint, options = {}) {
    const token = localStorage.getItem('tp_token');

    const config = {
        headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            ...options.headers,
        },
        ...options,
    };

    const response = await fetch(`${BASE_URL}${endpoint}`, config);

    
    let data;
    try {
        data = await response.json();
    } catch {
        data = null;
    }

    if (!response.ok) {
        
        const message = data?.message || `Request failed with status ${response.status}`;
        const error = new Error(message);
        error.status = response.status;
        error.data = data;
        throw error;
    }

    return data;
}


export const authApi = {
    
    register: (payload) =>
        request('/auth/register', {
            method: 'POST',
            body: JSON.stringify(payload),
        }),

    
    login: (payload) =>
        request('/auth/login', {
            method: 'POST',
            body: JSON.stringify(payload),
        }),

   
    me: () => request('/auth/me'),
};


export const adminApi = {
    
    createUser: (payload) =>
        request('/admin/users', {
            method: 'POST',
            body: JSON.stringify(payload),
        }),

    
    getUsers: (params = {}) => {
        const query = new URLSearchParams(params).toString();
        return request(`/admin/users${query ? `?${query}` : ''}`);
    },

    
    getUserById: (id) => request(`/admin/users/${id}`),

    
    toggleUserStatus: (id) =>
        request(`/admin/users/${id}/toggle-status`, { method: 'PUT' }),

    
    resetPassword: (id, newPassword) =>
        request(`/admin/users/${id}/reset-password`, {
            method: 'PUT',
            body: JSON.stringify({ newPassword }),
        }),
};


export const tokenStorage = {
    save: (authData) => {
        localStorage.setItem('tp_token', authData.token);
        localStorage.setItem('tp_user', JSON.stringify({
            userId: authData.userId,
            email: authData.email,
            fullName: authData.fullName,
            role: authData.role,
            expiresAt: authData.expiresAt,
        }));
    },

    getUser: () => {
        try {
            return JSON.parse(localStorage.getItem('tp_user') || 'null');
        } catch {
            return null;
        }
    },

    isExpired: () => {
        const user = tokenStorage.getUser();
        if (!user?.expiresAt) return true;
        return new Date(user.expiresAt) <= new Date();
    },

    clear: () => {
        localStorage.removeItem('tp_token');
        localStorage.removeItem('tp_user');
    },
};
