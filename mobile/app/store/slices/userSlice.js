import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import AsyncStorage from '@react-native-async-storage/async-storage';
import api, { setAuthToken } from "../../config/api";

// Helper functions
const getStoredUser = async () => {
  try {
    const user = await AsyncStorage.getItem("user");
    return user ? JSON.parse(user) : null;
  } catch (error) {
    console.error("Error parsing stored user:", error);
    return null;
  }
};

const getStoredToken = async () => {
  try {
    return await AsyncStorage.getItem("token");
  } catch (error) {
    console.error("Error getting token:", error);
    return null;
  }
};

const storeUserData = async (user, token) => {
  try {
    if (user) {
      await AsyncStorage.setItem("user", JSON.stringify(user));
    }
    if (token) {
      await AsyncStorage.setItem("token", token);
      setAuthToken(token);
    }
    console.log("💾 User data stored");
  } catch (error) {
    console.error("Error storing user data:", error);
  }
};

const clearUserData = async () => {
  try {
    await AsyncStorage.multiRemove(["user", "token", "refreshToken"]);
    setAuthToken(null);
    console.log("🗑️ User data cleared");
  } catch (error) {
    console.error("Error clearing user data:", error);
  }
};

// Async Thunks
export const registerUser = createAsyncThunk(
  "user/register",
  async (userData, { rejectWithValue }) => {
    try {
      const response = await api.post("/user/register", userData);
      const { user, token, refreshToken } = response.data.data || response.data;

      await storeUserData(user, token);
      if (refreshToken) {
        await AsyncStorage.setItem("refreshToken", refreshToken);
      }

      return { user, token, message: response.data.message };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Registration failed"
      );
    }
  }
);

export const loginUser = createAsyncThunk(
  "user/login",
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const response = await api.post("/user/login", { email, password });
      const { user, token, refreshToken } = response.data.data || response.data;

      await storeUserData(user, token);
      if (refreshToken) {
        await AsyncStorage.setItem("refreshToken", refreshToken);
      }

      return { user, token, message: response.data.message };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Login failed");
    }
  }
);

export const getUserProfile = createAsyncThunk(
  "user/getProfile",
  async (userId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/user/${userId}`);
      return response.data.user;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch user profile"
      );
    }
  }
);

export const getAllUsers = createAsyncThunk(
  "user/getAllUsers",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/user");
      return response.data.users;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch users"
      );
    }
  }
);

export const logoutUser = createAsyncThunk(
  "user/logout",
  async (_, { rejectWithValue }) => {
    try {
      try {
        await api.post("/user/logout");
      } catch (apiError) {
        console.log("API logout failed, continuing with local cleanup:", apiError.message);
      }
      
      await clearUserData();
      
      return { message: "Logged out successfully" };
    } catch (error) {
      await clearUserData();
      return rejectWithValue(
        error.response?.data?.message || "Logout failed"
      );
    }
  }
);

// Initial state
const initialState = {
  user: null,
  token: null,
  isAuthenticated: false,
  users: [],
  loading: false,
  error: null,
  message: null,
  loginLoading: false,
  registerLoading: false,
  profileLoading: false,
  usersLoading: false,
};

// User slice
const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearMessage: (state) => {
      state.message = null;
    },
    clearNotifications: (state) => {
      state.error = null;
      state.message = null;
    },
    logout: (state) => {
      clearUserData();
      Object.assign(state, initialState);
    },
    hydrateUser: (state, action) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = !!action.payload.token;
    },
  },
  extraReducers: (builder) => {
    builder
      // Register
      .addCase(registerUser.pending, (state) => {
        state.registerLoading = true;
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.registerLoading = false;
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.message = action.payload.message;
        state.error = null;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.registerLoading = false;
        state.loading = false;
        state.error = action.payload;
        state.isAuthenticated = false;
      })

      // Login
      .addCase(loginUser.pending, (state) => {
        state.loginLoading = true;
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loginLoading = false;
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.message = action.payload.message;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loginLoading = false;
        state.loading = false;
        state.error = action.payload;
        state.isAuthenticated = false;
      })

      // Get all users
      .addCase(getAllUsers.pending, (state) => {
        state.usersLoading = true;
        state.error = null;
      })
      .addCase(getAllUsers.fulfilled, (state, action) => {
        state.usersLoading = false;
        state.users = action.payload;
        state.error = null;
      })
      .addCase(getAllUsers.rejected, (state, action) => {
        state.usersLoading = false;
        state.error = action.payload;
      })

      // Logout
      .addCase(logoutUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(logoutUser.fulfilled, () => {
        return { ...initialState };
      })
      .addCase(logoutUser.rejected, () => {
        return { ...initialState };
      });
  },
});

export const {
  clearError,
  clearMessage,
  clearNotifications,
  logout,
  hydrateUser,
} = userSlice.actions;

// Selectors
export const selectUser = (state) => state.user.user;
export const selectIsAuthenticated = (state) => state.user.isAuthenticated;
export const selectToken = (state) => state.user.token;
export const selectUsers = (state) => state.user.users;
export const selectUserLoading = (state) => state.user.loading;
export const selectUserError = (state) => state.user.error;
export const selectUserMessage = (state) => state.user.message;
export const selectLoginLoading = (state) => state.user.loginLoading;
export const selectRegisterLoading = (state) => state.user.registerLoading;
export const selectUsersLoading = (state) => state.user.usersLoading;
export const selectIsAdmin = (state) => state.user.user?.role === "admin";

export default userSlice.reducer;