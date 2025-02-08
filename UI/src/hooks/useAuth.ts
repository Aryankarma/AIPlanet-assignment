import { useContext } from 'react';
import { AuthContext } from '../lib/auth/authContext';

export const useAuth = () => useContext(AuthContext);
