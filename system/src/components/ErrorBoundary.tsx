import {Component,ReactNode} from 'react';
export class ErrorBoundary extends Component<{children:ReactNode},{hasError:boolean}>{
 state={hasError:false};
 static getDerivedStateFromError(){return {hasError:true}};
 render(){if(this.state.hasError)return <main style={{minHeight:'100vh',display:'grid',placeItems:'center',padding:24,textAlign:'center'}}><div><p style={{color:'#67E8F9',fontWeight:700}}>ANIFUZE ERROR</p><h1>Something went wrong.</h1><p style={{color:'#94A3B8'}}>The application recovered safely. Reload to continue.</p><button className="button" onClick={()=>location.reload()}>Reload application</button></div></main>;return this.props.children}
}