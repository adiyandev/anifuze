import {createContext,useContext,useState,type ReactNode} from 'react';
import type {Role,Settings} from '../types';
import {settingsService} from '../services/mockServices';
type Toast={message:string;kind?:'success'|'error'|'info'};
type AppState={role:Role;setRole:(r:Role)=>void;settings:Settings;refresh:()=>void;toast:(m:string,k?:Toast['kind'])=>void};
const Context=createContext<AppState>(null!);
export const useApp=()=>useContext(Context);
export function AppProvider({children}:{children:ReactNode}){const[role,setRole]=useState<Role>(()=>(localStorage.getItem('anifuze_role') as Role)||'public_user');const[settings,setSettings]=useState(settingsService.get());const[note,setNote]=useState<Toast|null>(null);const updateRole=(r:Role)=>{localStorage.setItem('anifuze_role',r);setRole(r)};const refresh=()=>setSettings(settingsService.get());const toast=(message:string,kind:Toast['kind']='success')=>{setNote({message,kind});window.setTimeout(()=>setNote(null),3000)};return <Context.Provider value={{role,setRole:updateRole,settings,refresh,toast}}>{children}{note&&<div className={`toast ${note.kind}`}>{note.message}</div>}</Context.Provider>}
