import test from 'node:test';
import assert from 'node:assert/strict';
import {normalizeProviderListing,providerCompatibility} from './providerMarketplace.js';

test('provider marketplace normalizes valid listings',()=>{
 const item=normalizeProviderListing({id:'anilist',name:'AniList',type:'API',version:'1.2.0',baseUrl:'https://example.com',config:{source:{endpoint:'/anime'}}});
 assert.equal(item.id,'anilist'); assert.equal(item.type,'API'); assert.equal(item.version,'1.2.0');
});
test('provider marketplace rejects unsafe ids and types',()=>{
 assert.throws(()=>normalizeProviderListing({id:'../bad',name:'Bad'}),/id is invalid/);
 assert.throws(()=>normalizeProviderListing({id:'bad',name:'Bad',type:'Script'}),/type is unsupported/);
});
test('provider marketplace compatibility honors version bounds',()=>{
 assert.deepEqual(providerCompatibility({compatibility:{minVersion:'2.0.0'}},'1.0.0'),{compatible:false,reason:'Requires AniFuze 2.0.0 or newer.'});
 assert.deepEqual(providerCompatibility({compatibility:{maxVersion:'1.0.0'}},'1.0.0'),{compatible:true,reason:''});
});

test('marketplace listings strip credential-like configuration fields',()=>{
 const item=normalizeProviderListing({id:'safe',name:'Safe',type:'API',version:'1.0.0',baseUrl:'https://provider.test',config:{mode:'api',source:{endpoint:'/sources'},apiKey:'evil',headers:{Authorization:'evil',Accept:'application/json'}}});
 assert.equal(item.config.apiKey,undefined);assert.equal(item.config.headers.Authorization,undefined);assert.equal(item.config.headers.Accept,'application/json');
});
