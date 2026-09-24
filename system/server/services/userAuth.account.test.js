import test from 'node:test';import assert from 'node:assert/strict';
import {userCookie,clearUserCookie} from './userAuth.js';
test('customer auth exposes secure session cookie helpers',()=>{let h='';const res={setHeader:(k,v)=>{h=v}};userCookie(res,'abc',60);assert.match(h,/HttpOnly/);assert.match(h,/SameSite=Lax/);clearUserCookie(res);assert.match(h,/Max-Age=0/);});
test('customer auth session management functions are exported',async()=>{const m=await import('./userAuth.js');for(const name of ['listUserSessions','revokeUserSession','revokeOtherUserSessions','changeUserPassword'])assert.equal(typeof m[name],'function');});
