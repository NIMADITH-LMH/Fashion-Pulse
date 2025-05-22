import { createSlice } from '@reduxjs/toolkit'
import axios from 'axios'

// Load initial state from localStorage
const loadState = () => {
    try {
        const savedUser = localStorage.getItem('user');
        const savedToken = localStorage.getItem('token');
        return {
            user: savedUser ? JSON.parse(savedUser) : null,
            token: savedToken || null
        };
    } catch (error) {
        console.error('Error loading state from localStorage:', error);
        // Clear potentially corrupted data
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        return {
            user: null,
            token: null
        };
    }
};

const initialState = loadState();

// Configure axios with saved token if it exists
if (initialState.token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${initialState.token}`;
}

export const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        setUserDetails: (state, action) => {
            try {
                if (!action.payload) {
                    throw new Error('No user data provided');
                }

                // Extract token and user data
                const { token, ...userData } = action.payload;

                // Update state
                state.user = {
                    ...userData,
                    role: userData.role || 'USER'
                };
                
                if (token) {
                    state.token = token;
                    // Update axios default headers
                    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
                    // Save token to localStorage
                    localStorage.setItem('token', token);
                }

                // Save user data to localStorage
                localStorage.setItem('user', JSON.stringify(state.user));
                
                console.log('Updated user state:', {
                    user: state.user,
                    hasToken: !!state.token
                });
            } catch (error) {
                console.error('Error setting user details:', error);
                state.user = null;
                state.token = null;
                localStorage.removeItem('user');
                localStorage.removeItem('token');
                delete axios.defaults.headers.common['Authorization'];
            }
        },
        clearUserDetails: (state) => {
            state.user = null;
            state.token = null;
            localStorage.removeItem('user');
            localStorage.removeItem('token');
            delete axios.defaults.headers.common['Authorization'];
            console.log('Cleared user state');
        }
    }
})
  
// Action creators
export const { setUserDetails, clearUserDetails } = userSlice.actions
  
// Selectors
export const selectUser = (state) => state.user.user;
export const selectToken = (state) => state.user.token;
  
export default userSlice.reducer

