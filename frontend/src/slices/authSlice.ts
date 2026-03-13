import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import api, { setApiToken } from '../utils/api';

interface AuthState {
  user: any | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  isInitialized: boolean;
}

export const verifySession = createAsyncThunk(
  'auth/verifySession',
  async (_, { rejectWithValue }) => {
    try {
      // Step 1: Try to refresh the token using the HTTPOnly cookie
      const refreshResponse = await api.post('/auth/refresh');
      const newToken = refreshResponse.data.data.accessToken;
      
      setApiToken(newToken);

      // Step 2: Use the new access token to fetch user profile
      const response = await api.get('/auth/me');
      return { user: response.data.data, token: newToken };
    } catch (err: any) {
      setApiToken(null);
      return rejectWithValue(err.response?.data?.error?.message || 'Phiên làm việc đã hết hạn');
    }
  }
);

export const logoutUser = createAsyncThunk(
  'auth/logoutUser',
  async (_, { dispatch }) => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Logout failed on server', error);
    } finally {
      dispatch(logout());
      setApiToken(null);
      window.location.href = '/login';
    }
  }
);

const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  loading: false,
  isInitialized: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{ user: any; token: string }>
    ) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
      state.isInitialized = true;
      setApiToken(action.payload.token); // Store in memory API client
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      setApiToken(null);
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(verifySession.pending, (state) => {
        state.loading = true;
      })
      .addCase(verifySession.fulfilled, (state, action) => {
        state.loading = false;
        state.isInitialized = true;
        if (action.payload) {
          state.user = action.payload.user;
          state.token = action.payload.token;
          state.isAuthenticated = true;
        }
      })
      .addCase(verifySession.rejected, (state) => {
        state.loading = false;
        state.isInitialized = true;
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
      });
  },
});

export const { setCredentials, logout, setLoading } = authSlice.actions;
export default authSlice.reducer;

