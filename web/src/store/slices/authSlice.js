import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api';

// Async thunk for user login
export const loginUser = createAsyncThunk(
    'auth/login',
    async ({ email, password }, { rejectWithValue }) => {
        try {
            const response = await api.post('/api/auth/login', { email, password });

            const { data } = response;
            if (!data.success) {
                throw new Error(data.message || 'Login failed');
            }

            // Save to local storage
            localStorage.setItem('token', data.data.token);
            localStorage.setItem('user', JSON.stringify(data.data.user));
            if (data.data.driverInfo) {
                localStorage.setItem('driverInfo', JSON.stringify(data.data.driverInfo));
            }

            return data.data;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || error.message || 'Login failed'
            );
        }
    }
);

// Load user from local storage
export const loadUserFromStorage = createAsyncThunk(
    'auth/loadFromStorage',
    async (_, { rejectWithValue }) => {
        try {
            const token = localStorage.getItem('token');
            const userStr = localStorage.getItem('user');
            const driverInfoStr = localStorage.getItem('driverInfo');

            if (!token || !userStr) {
                throw new Error('No stored credentials');
            }

            const user = JSON.parse(userStr);
            const driverInfo = driverInfoStr ? JSON.parse(driverInfoStr) : null;

            return { token, user, driverInfo };
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const logoutUser = createAsyncThunk('auth/logout', async () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('driverInfo');
    return null;
});

const authSlice = createSlice({
    name: 'auth',
    initialState: {
        user: null,
        driverInfo: null,
        token: null,
        isAuthenticated: false,
        loading: false,
        error: null,
    },
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // Login
            .addCase(loginUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(loginUser.fulfilled, (state, action) => {
                state.loading = false;
                state.isAuthenticated = true;
                state.user = action.payload.user;
                state.token = action.payload.token;
                state.driverInfo = action.payload.driverInfo || null;
            })
            .addCase(loginUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
                state.isAuthenticated = false;
            })
            // Load from storage
            .addCase(loadUserFromStorage.fulfilled, (state, action) => {
                state.isAuthenticated = true;
                state.user = action.payload.user;
                state.token = action.payload.token;
                state.driverInfo = action.payload.driverInfo;
            })
            .addCase(loadUserFromStorage.rejected, (state) => {
                state.isAuthenticated = false;
                state.user = null;
                state.token = null;
            })
            // Logout
            .addCase(logoutUser.fulfilled, (state) => {
                state.isAuthenticated = false;
                state.user = null;
                state.token = null;
                state.driverInfo = null;
            });
    },
});

export const { clearError } = authSlice.actions;
export default authSlice.reducer;
