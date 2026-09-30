import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
export function ProtectedRoute(){const {user,loading}=useAuth();if(loading)return <div className="min-h-screen grid place-items-center">Loading…</div>;return user?<Outlet/>:<Navigate to="/login" replace/>;}
