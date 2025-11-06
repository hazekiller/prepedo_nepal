import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { router } from 'expo-router';
import { selectIsAuthenticated, selectUser } from '../store/slices/userSlice';

export default function useAuthGuard(requiredRole = null) {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const user = useSelector(selectUser);

  useEffect(() => {
    if (!isAuthenticated || !user) {
      router.replace('/login');
      return;
    }

    if (requiredRole && user.role !== requiredRole) {
      if (user.role === 'admin') {
        router.replace('/admin/dashboard');
      } else {
        router.replace('/user/dashboard');
      }
    }
  }, [isAuthenticated, user, requiredRole]);

  return { isAuthenticated, user };
}