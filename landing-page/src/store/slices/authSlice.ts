import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface User {
  id: string;
  name: string;
  email: string;
  username?: string | null;
  phone?: string | null;
  isEmailVerified?: boolean;
  isPhoneVerified?: boolean;
  isOnboarded: boolean;
  referralSource?: string | null;
  plan: string;
  trialEndsAt?: string | null;
  maxReminders: number;
  preferredVoice?: string;
  timezone?: string;
  avatarUrl?: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
};

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    initializeAuth: (state) => {
      if (typeof window !== "undefined") {
        try {
          const storedUser = localStorage.getItem("remind_auth_user");
          if (storedUser) {
            state.user = JSON.parse(storedUser);
            state.isAuthenticated = true;
          }
        } catch {
          state.user = null;
          state.isAuthenticated = false;
        }
      }
      state.isLoading = false;
    },
    loginStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    loginSuccess: (state, action: PayloadAction<{ user: User }>) => {
      state.isLoading = false;
      state.isAuthenticated = true;
      state.user = action.payload.user;
      state.error = null;

      if (typeof window !== "undefined") {
        localStorage.setItem("remind_auth_user", JSON.stringify(action.payload.user));
      }
    },
    loginFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.isAuthenticated = false;
      state.error = action.payload;
    },
    registerSuccess: (state, action: PayloadAction<{ user: User }>) => {
      state.isLoading = false;
      state.isAuthenticated = true;
      state.user = action.payload.user;
      state.error = null;

      if (typeof window !== "undefined") {
        localStorage.setItem("remind_auth_user", JSON.stringify(action.payload.user));
      }
    },
    updateUser: (state, action: PayloadAction<Partial<User>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
        if (typeof window !== "undefined") {
          localStorage.setItem("remind_auth_user", JSON.stringify(state.user));
        }
      }
    },
    setOnboarded: (state, action: PayloadAction<boolean>) => {
      if (state.user) {
        state.user.isOnboarded = action.payload;
        if (typeof window !== "undefined") {
          localStorage.setItem("remind_auth_user", JSON.stringify(state.user));
        }
      }
    },
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.isLoading = false;
      state.error = null;

      if (typeof window !== "undefined") {
        localStorage.removeItem("remind_auth_user");
      }
    },
    clearAuthError: (state) => {
      state.error = null;
    },
  },
});

export const {
  initializeAuth,
  loginStart,
  loginSuccess,
  loginFailure,
  registerSuccess,
  updateUser,
  setOnboarded,
  logout,
  clearAuthError,
} = authSlice.actions;

export default authSlice.reducer;
