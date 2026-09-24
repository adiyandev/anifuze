import test from 'node:test';
import assert from 'node:assert/strict';
import {createOAuthState,parseCookies,safeEqual} from './oauthSecurity.js';

test('OAuth state is high entropy and URL safe',()=>{
 const state=createOAuthState();
 assert.match(state,/^[A-Za-z0-9_-]{43}$/);
 assert.notEqual(state,createOAuthState());
});

test('OAuth state comparison rejects missing, malformed and different values',()=>{
 const state=createOAuthState();
 assert.equal(safeEqual(state,state),true);
 assert.equal(safeEqual(state,''),false);
 assert.equal(safeEqual(state,state.slice(1)),false);
 assert.equal(safeEqual(state,state.slice(0,-1)+'X'),false);
});

test('cookie parser decodes OAuth state safely',()=>{
 assert.deepEqual(parseCookies('foo=bar; anifuze_google_oauth_state=abc%2B123'),{foo:'bar',anifuze_google_oauth_state:'abc+123'});
 assert.deepEqual(parseCookies('broken=%E0%A4%A'),{broken:''});
});
