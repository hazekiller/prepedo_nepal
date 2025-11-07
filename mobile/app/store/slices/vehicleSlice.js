// app/store/slices/vehicleSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import API from '../../config/api';

// Async thunks
export const fetchVehicles = createAsyncThunk(
  'vehicles/fetchVehicles',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await API.vehicles.getAll(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchVehicleById = createAsyncThunk(
  'vehicles/fetchVehicleById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await API.vehicles.getById(id);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchVehiclesByCategory = createAsyncThunk(
  'vehicles/fetchVehiclesByCategory',
  async (category, { rejectWithValue }) => {
    try {
      const response = await API.vehicles.getByCategory(category);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchFeaturedVehicles = createAsyncThunk(
  'vehicles/fetchFeaturedVehicles',
  async (_, { rejectWithValue }) => {
    try {
      const response = await API.vehicles.getFeatured();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const checkVehicleAvailability = createAsyncThunk(
  'vehicles/checkAvailability',
  async ({ vehicleId, date, duration }, { rejectWithValue }) => {
    try {
      const response = await API.vehicles.checkAvailability(vehicleId, date, duration);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  vehicles: [],
  featuredVehicles: [],
  selectedVehicle: null,
  selectedCategory: 'all',
  availability: null,
  loading: false,
  error: null,
};

const vehicleSlice = createSlice({
  name: 'vehicles',
  initialState,
  reducers: {
    setSelectedVehicle: (state, action) => {
      state.selectedVehicle = action.payload;
    },
    setSelectedCategory: (state, action) => {
      state.selectedCategory = action.payload;
    },
    clearSelectedVehicle: (state) => {
      state.selectedVehicle = null;
    },
    clearAvailability: (state) => {
      state.availability = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all vehicles
      .addCase(fetchVehicles.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchVehicles.fulfilled, (state, action) => {
        state.loading = false;
        state.vehicles = action.payload;
      })
      .addCase(fetchVehicles.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Fetch vehicle by ID
      .addCase(fetchVehicleById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchVehicleById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedVehicle = action.payload;
      })
      .addCase(fetchVehicleById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Fetch vehicles by category
      .addCase(fetchVehiclesByCategory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchVehiclesByCategory.fulfilled, (state, action) => {
        state.loading = false;
        state.vehicles = action.payload;
      })
      .addCase(fetchVehiclesByCategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Fetch featured vehicles
      .addCase(fetchFeaturedVehicles.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFeaturedVehicles.fulfilled, (state, action) => {
        state.loading = false;
        state.featuredVehicles = action.payload;
      })
      .addCase(fetchFeaturedVehicles.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Check availability
      .addCase(checkVehicleAvailability.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(checkVehicleAvailability.fulfilled, (state, action) => {
        state.loading = false;
        state.availability = action.payload;
      })
      .addCase(checkVehicleAvailability.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const {
  setSelectedVehicle,
  setSelectedCategory,
  clearSelectedVehicle,
  clearAvailability,
  clearError,
} = vehicleSlice.actions;

export default vehicleSlice.reducer;