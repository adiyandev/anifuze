import {Outlet,Navigate} from 'react-router-dom';import {useApp} from '../contexts/AppContext';
export function RequireCustomer(){const{adminVerified}=useApp();return adminVerified?<Outlet/>:<Navigate to="/admin/login" replace/>}
export function RequirePlatformAdmin(){return useApp().role==='platform_admin'?<Outlet/>:<Navigate to="/login" replace/>}
export function RequireAuth(){return useApp().role!=='public_user'?<Outlet/>:<Navigate to="/login" replace/>}
export function RequirePermission({permission}:{permission:string}){const{adminVerified,can}=useApp();if(!adminVerified)return <Navigate to="/admin/login" replace/>;return can(permission)?<Outlet/>:<Navigate to="/admin/dashboard" replace/>;}