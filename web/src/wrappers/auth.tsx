import useAuth from '@/hooks/useAuth';
import { Navigate, Outlet } from 'umi';

export default () => {
  const { isLogin } = useAuth();
  console.log('isLogin', isLogin)
  if (isLogin) {
    return <Outlet />;
  } else {
    return <Navigate to="/login" />;
  }
};