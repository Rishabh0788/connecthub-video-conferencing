import type React from 'react';
import { createContext, useContext, useEffect, useState } from 'react';
import { api } from '../services/api';
import type { User } from '../types';

type Auth = { user: User | null; loading: boolean; login: (email:string,password:string)=>Promise<void>; register:(name:string,email:string,password:string)=>Promise<void>; logout:()=>Promise<void> };
const Ctx = createContext<Auth | null>(null);
export function AuthProvider({children}:{children:React.ReactNode}) {
  const [user,setUser]=useState<User|null>(null); const [loading,setLoading]=useState(true);
  useEffect(()=>{ api.get('/api/auth/me').then(r=>setUser(r.data.user)).catch(()=>setUser(null)).finally(()=>setLoading(false)); },[]);
  const login=async(email:string,password:string)=>{const r=await api.post('/api/auth/login',{email,password});setUser(r.data.user);};
  const register=async(name:string,email:string,password:string)=>{const r=await api.post('/api/auth/register',{name,email,password});setUser(r.data.user);};
  const logout=async()=>{await api.post('/api/auth/logout');setUser(null);};
  return <Ctx.Provider value={{user,loading,login,register,logout}}>{children}</Ctx.Provider>;
}
export function useAuth(){const c=useContext(Ctx);if(!c)throw new Error('useAuth must be inside AuthProvider');return c;}
