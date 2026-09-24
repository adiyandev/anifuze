import test from 'node:test';import assert from 'node:assert/strict';
import {securityHeaders,requestId} from '../middleware/security.js';

const res=()=>({headers:{},setHeader(k,v){this.headers[k]=v;}});
test('security headers are applied',()=>{const r=res();securityHeaders({secure:true,headers:{}},r,()=>{});assert.equal(r.headers['X-Content-Type-Options'],'nosniff');assert.equal(r.headers['X-Frame-Options'],'SAMEORIGIN');assert.match(r.headers['Strict-Transport-Security'],/max-age=31536000/);});
test('request id is generated and returned',()=>{const r=res();const req={headers:{}};requestId(req,r,()=>{});assert.ok(req.requestId);assert.equal(r.headers['X-Request-Id'],req.requestId);});
