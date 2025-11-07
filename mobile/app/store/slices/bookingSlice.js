// app/store/slices/bookingSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import API from '../../config/api';

// Async thunks
export const createBooking = createAsyncThunk(
  'bookings/createBooking',
  async (bookingData, { rejectWithValue }) => {
    try {
      const response = await API.bookings.create(bookingData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchMyBookings = createAsyncThunk(
  'bookings/fetchMyBookings',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await API.bookings.getMyBookings(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchBookingById = createAsyncThunk(
  'bookings/fetchBookingById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await API.bookings.getById(id);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const estimateFare = createAsyncThunk(
  'bookings/estimateFare',
  async (bookingDetails, { rejectWithValue }) => {
    try {
      const response = await API.bookings.estimateFare(bookingDetails);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const cancelBooking = createAsyncThunk(
  'bookings/cancelBooking',
  async ({ id, reason }, { rejectWithValue }) => {
    try {
      const response = await API.bookings.cancel(id, reason);
      return { id, ...response.data };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const rateRide = createAsyncThunk(
  'bookings/rateRide',
  async ({ id, rating, review }, { rejectWithValue }) => {
    try {
      const response = await API.bookings.rateRide(id, rating, review);
      return { id, ...response.data };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchActiveBookings = createAsyncThunk(
  'bookings/fetchActiveBookings',
  async (_, { rejectWithValue }) => {
    try {
      const response = await API.bookings.getActive();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  bookings: [],
  activeBookings: [],
  currentBooking: null,
  fareEstimate: null,
  bookingForm: {
    vehicleId: null,
    pickupLocation: null,
    dropoffLocation: null,
    pickupDate: null,
    pickupTime: null,
    duration: null,
    passengers: 1,
    specialRequests: '',
  },
  loading: false,
  error: null,
  success: false,
};

const bookingSlice = createSlice({
  name: 'bookings',
  initialState,
  reducers: {
    updateBookingForm: (state, action) => {
      state.bookingForm = { ...state.bookingForm, ...action.payload };
    },
    resetBookingForm: (state) => {
      state.bookingForm = initialState.bookingForm;
      state.fareEstimate = null;
      state.success = false;
    },
    setCurrentBooking: (state, action) => {
      state.currentBooking = action.payload;
    },
    clearCurrentBooking: (state) => {
      state.currentBooking = null;
    },
    clearError: (state) => {
      state.error = null;
    },
    clearSuccess: (state) => {
      state.success = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // Create booking
      .addCase(createBooking.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(createBooking.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.currentBooking = action.payload;
        state.bookings.unshift(action.payload);
        state.bookingForm = initialState.bookingForm;
        state.fareEstimate = null;
      })
      .addCase(createBooking.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      })
      
      // Fetch my bookings
      .addCase(fetchMyBookings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMyBookings.fulfilled, (state, action) => {
        state.loading = false;
        state.bookings = action.payload;
      })
      .addCase(fetchMyBookings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Fetch booking by ID
      .addCase(fetchBookingById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBookingById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentBooking = action.payload;
      })
      .addCase(fetchBookingById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Estimate fare
      .addCase(estimateFare.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(estimateFare.fulfilled, (state, action) => {
        state.loading = false;
        state.fareEstimate = action.payload;
      })
      .addCase(estimateFare.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Cancel booking
      .addCase(cancelBooking.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(cancelBooking.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.bookings.findIndex(b => b.id === action.payload.id);
        if (index !== -1) {
          state.bookings[index].status = 'cancelled';
        }
        if (state.currentBooking?.id === action.payload.id) {
          state.currentBooking.status = 'cancelled';
        }
      })
      .addCase(cancelBooking.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Rate ride
      .addCase(rateRide.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(rateRide.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.bookings.findIndex(b => b.id === action.payload.id);
        if (index !== -1) {
          state.bookings[index] = { ...state.bookings[index], ...action.payload };
        }
      })
      .addCase(rateRide.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Fetch active bookings
      .addCase(fetchActiveBookings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchActiveBookings.fulfilled, (state, action) => {
        state.loading = false;
        state.activeBookings = action.payload;
      })
      .addCase(fetchActiveBookings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const {
  updateBookingForm,
  resetBookingForm,
  setCurrentBooking,
  clearCurrentBooking,
  clearError,
  clearSuccess,
} = bookingSlice.actions;

export default bookingSlice.reducer;