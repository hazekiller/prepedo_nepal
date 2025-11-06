// store/slices/modeSlice.js
// Mode Management - Switch between User and Driver modes
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  currentMode: 'user', // 'user' | 'driver'
  isDriver: false,
  driverProfile: null,
  driverStatus: 'offline', // 'online' | 'offline' | 'busy'
  canSwitchToDriver: false, // Based on verification status
};

const modeSlice = createSlice({
  name: 'mode',
  initialState,
  reducers: {
    switchMode: (state, action) => {
      state.currentMode = action.payload; // 'user' or 'driver'
      state.isDriver = action.payload === 'driver';
    },
    setDriverProfile: (state, action) => {
      state.driverProfile = action.payload;
      state.canSwitchToDriver = !!action.payload;
    },
    setDriverStatus: (state, action) => {
      state.driverStatus = action.payload;
    },
    enableDriverMode: (state, action) => {
      state.canSwitchToDriver = true;
      state.driverProfile = action.payload;
    },
    disableDriverMode: (state) => {
      state.canSwitchToDriver = false;
      state.driverProfile = null;
      state.currentMode = 'user';
      state.isDriver = false;
    },
    resetMode: () => initialState,
  },
});

export const {
  switchMode,
  setDriverProfile,
  setDriverStatus,
  enableDriverMode,
  disableDriverMode,
  resetMode,
} = modeSlice.actions;

export default modeSlice.reducer;