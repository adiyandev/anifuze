import test from 'node:test';
import assert from 'node:assert/strict';
import {createProviderContext,interpolate,normalizeProviderResponse,validateProviderDefinition} from './providerSdk.js';

test('provider SDK creates and interpolates a playback context',()=>{
 const c=createProviderContext({animeId:'a/b',episode:3});
 assert.equal(c.episodeId,'3');assert.equal(interpolate('/anime/{animeId}/episode/{episode}',c),'/anime/a%2Fb/episode/3');
});
test('provider SDK validates API and embed definitions',()=>{
 assert.equal(validateProviderDefinition({type:'API',source:{endpoint:'/sources'}}),true);
 assert.equal(validateProviderDefinition({type:'Embed',urlTemplate:'https://example.test/{animeId}/{episode}'}),true);
 assert.throws(()=>validateProviderDefinition({type:'API'}));
 assert.throws(()=>validateProviderDefinition({type:'Embed',urlTemplate:'javascript:alert(1)'}));
});
test('provider SDK normalizes common source response shapes',()=>{
 assert.deepEqual(normalizeProviderResponse({sources:[{file:'https://cdn.test/a.m3u8',quality:'1080p'}]}),[{url:'https://cdn.test/a.m3u8',type:'auto',quality:'1080p',language:''}]);
 assert.deepEqual(normalizeProviderResponse({data:{sources:['https://cdn.test/a.mp4']}}),[{url:'https://cdn.test/a.mp4',type:'auto',quality:'',language:''}]);
});
