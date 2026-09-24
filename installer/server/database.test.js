import test from 'node:test';import assert from 'node:assert/strict';
import {toEnv} from './database.js';

test('installer env output quotes sensitive values and marketplace URL',()=>{
 const env=toEnv({client:'postgres',host:'db',port:5432,name:'anifuze',user:'admin',password:'p@ss"word'},'install-1','lic-key','example.com','https://providers.example.com');
 assert.match(env,/DB_PASSWORD="p@ss\\"word"/);
 assert.match(env,/ANIFUZE_PROVIDER_MARKETPLACE_URL="https:\/\/providers\.example\.com"/);
 assert.match(env,/NODE_ENV=production/);
});
