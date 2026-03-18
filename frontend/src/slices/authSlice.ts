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
      // Strategy 1: Try to refresh via HTTPOnly cookie
      const refreshResponse = await api.post('/auth/refresh');
      const newToken = refreshResponse.data.data.accessToken;
      
      setApiToken(newToken);
      localStorage.setItem('accessToken', newToken);

      // Use the new access token to fetch user profile
      const response = await api.get('/auth/me');
      return { user: response.data.data, token: newToken };
    } catch (err: any) {
      // Strategy 2: Fallback - try stored accessToken (Chrome cookie issue workaround)
      const storedToken = localStorage.getItem('accessToken');
      if (storedToken) {
        try {
          setApiToken(storedToken);
          const response = await api.get('/auth/me');
          return { user: response.data.data, token: storedToken };
        } catch (meErr: any) {
          // Token expired and cookie refresh also failed
          localStorage.removeItem('accessToken');
          setApiToken(null);
        }
      }

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
      localStorage.removeItem('accessToken');
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
      setApiToken(action.payload.token);
      localStorage.setItem('accessToken', action.payload.token);
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      setApiToken(null);
      localStorage.removeItem('accessToken');
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
