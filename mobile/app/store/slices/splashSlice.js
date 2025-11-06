import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  isFirstLaunch: true,
  hasSeenOnboarding: false,
  splashScreenShown: false,
};

const splashSlice = createSlice({
  name: "splash",
  initialState,
  reducers: {
    setFirstLaunch: (state, action) => {
      state.isFirstLaunch = action.payload;
    },
    setOnboardingSeen: (state, action) => {
      state.hasSeenOnboarding = action.payload;
    },
    setSplashScreenShown: (state, action) => {
      state.splashScreenShown = action.payload;
    },
  },
});

export const { setFirstLaunch, setOnboardingSeen, setSplashScreenShown } =
  splashSlice.actions;

export const selectIsFirstLaunch = (state) => state.splash.isFirstLaunch;
export const selectHasSeenOnboarding = (state) => state.splash.hasSeenOnboarding;
export const selectSplashScreenShown = (state) => state.splash.splashScreenShown;

export default splashSlice.reducer;