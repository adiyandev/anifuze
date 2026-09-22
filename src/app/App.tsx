import {Outlet,Navigate} from 'react-router-dom';import {useApp} from '../contexts/AppContext';
export function RequireCustomer(){const{role}=useApp();return role==='customer'||role==='admin'||role==='owner'||role==='moderator'||role==='platform_admin'?<Outlet/>:<Navigate to="/admin/login" replace/>}
export function RequirePlatformAdmin(){return useApp().role==='platform_admin'?<Outlet/>:<Navigate to="/login" replace/>}
export function RequireAuth(){return useApp().role!=='public_user'?<Outlet/>:<Navigate to="/login" replace/>}
