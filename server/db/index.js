import pg from 'pg';
import mysql from 'mysql2/promise';
import mariadb from 'mariadb';
import {config,assertSupportedDatabase} from '../config.js';
assertSupportedDatabase(config.db.client);
let pool;
function poolFor(d){
 if(d.client==='postgres') return new pg.Pool({host:d.host,port:d.port,database:d.name,user:d.user,password:d.password,ssl:d.ssl?{rejectUnauthorized:false}:false,max:10});
 if(d.client==='mysql') return mysql.createPool({host:d.host,port:d.port,database:d.name,user:d.user,password:d.password,ssl:d.ssl?{}:undefined,waitForConnections:true,connectionLimit:10});
 return mariadb.createPool({host:d.host,port:d.port,database:d.name,user:d.user,password:d.password,ssl:d.ssl?true:undefined,connectionLimit:10});
}
export function getPool(){if(!pool)pool=poolFor(config.db);return pool;}
export function createPoolForDatabase(d){assertSupportedDatabase(d.client);return poolFor(d);}
export async function closePool(p){if(p?.end) await p.end();}
export function useRuntimeDatabase(d){if(pool)throw new Error('Database pool already initialized.');Object.assign(config.db,{client:d.client,host:d.host,port:Number(d.port),name:d.name,user:d.user,password:d.password,ssl:Boolean(d.ssl)});}
export async function query(text,params=[]){
 const p=getPool();
 if(config.db.client==='postgres') return p.query(text,params);
 const conn=await p.getConnection();
 try{const sql=text.replace(/\$(\d+)/g,'?');const rows=await conn.query(sql,params);return {rows:Array.isArray(rows)?rows:[]};}finally{conn.release?.();}
}
export async function healthCheck(){await query('SELECT 1');return {ok:true,client:config.db.client};}
