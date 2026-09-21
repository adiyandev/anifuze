export type Role='public_user'|'customer'|'platform_admin';
export type ProviderType='API'|'Embed'|'Direct'|'Custom';
export interface Anime {id:string;title:string;type:string;status:string;episodes:number;views:string;genre:string;description:string;cover:string}
export interface Provider {id:string;name:string;type:ProviderType;status:'Healthy'|'Degraded'|'Offline';priority:number;latency:number;requests:number;enabled:boolean;baseUrl?:string;template?:string}
export interface Settings {siteName:string;tagline:string;primary:string;accent:string;logo:string}
export interface BuilderBlock {id:string;type:string;title:string;content:string;hidden?:boolean}
