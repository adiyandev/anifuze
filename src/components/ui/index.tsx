import type {ButtonHTMLAttributes,InputHTMLAttributes,ReactNode} from 'react';
export function Button({variant='primary',children,...props}:{variant?:'primary'|'ghost'|'danger'}&ButtonHTMLAttributes<HTMLButtonElement>){return <button className={variant==='primary'?'button':variant==='danger'?'danger':'button ghost'} {...props}>{children}</button>}
export function Input(props:InputHTMLAttributes<HTMLInputElement>){return <input {...props}/>}
export function Badge({children,tone='default'}:{children:ReactNode;tone?:string}){return <span className={`badge ${tone}`}>{children}</span>}
export function Card({title,children}:{title?:string;children:ReactNode}){return <section className="panel">{title&&<header><h3>{title}</h3></header>}{children}</section>}
export function EmptyState({title,action}:{title:string;action?:ReactNode}){return <div className="empty"><div><b>{title}</b><p>Use the available controls to configure this mock workspace.</p>{action}</div></div>}
export function StatCard({name,value,change='12.4%'}:{name:string;value:string;change?:string}){return <article className="stat"><span>{name}</span><strong>{value}</strong><small className="positive">↑ {change} vs previous period</small></article>}
export function ConfirmButton({children,onConfirm}:{children:ReactNode;onConfirm:()=>void}){return <button className="link-button" onClick={()=>window.confirm('Confirm this mock action?')&&onConfirm()}>{children}</button>}
