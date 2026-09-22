import pg from 'pg';
import mysql from 'mysql2/promise';
import mariadb from 'mariadb';
import {config,assertSupportedDatabase} from '../config.js';

assertSupportedDatabase(config.db.client);
let pool;
export function getPool(){
  if(pool) return pool;
  const d=config.db;
  if(d.client==='postgres') pool=new pg.Pool({host:d.host,port:d.port,database:d.name,user:d.user,password:d.password,ssl:d.ssl?{rejectUnauthorized:false}:false,max:10});
  else if(d.client==='mysql') pool=mysql.createPool({host:d.host,port:d.port,database:d.name,user:d.user,password:d.password,waitForConnections:true,connectionLimit:10});
  else pool=mariadb.createPool({host:d.host,port:d.port,database:d.name,user:d.user,password:d.password,connectionLimit:10});
  return pool;
}
export async function query(text,params=[]){
  const p=getPool();
  if(config.db.client==='postgres') return p.query(text,params);
  const conn=await p.getConnection();
  try { const sql=text.replace(/\\$(\\d+)/g,'?'); const rows=await conn.query(sql,params); return {rows:Array.isArray(rows)?rows:[]}; }
  finally { conn.release?.(); }
}
export async function healthCheck(){ await query('SELECT 1'); return {ok:true,client:config.db.client}; }
