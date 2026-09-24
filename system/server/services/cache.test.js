import test from 'node:test';import assert from 'node:assert/strict';
import {cacheClear,cacheGet,cacheSet,cacheStats,withCache} from './cache.js';

test('cache stores and returns values',()=>{cacheClear();cacheSet('phase37',{ok:true});assert.deepEqual(cacheGet('phase37'),{ok:true});cacheClear()});
test('cache expires entries',async()=>{cacheClear();cacheSet('expires','value',1000);await new Promise(r=>setTimeout(r,1050));assert.equal(cacheGet('expires'),undefined);cacheClear()});
test('withCache only invokes loader on a miss',async()=>{cacheClear();let calls=0;const loader=async()=>{calls++;return 'loaded'};assert.equal(await withCache('loader',loader),'loaded');assert.equal(await withCache('loader',loader),'loaded');assert.equal(calls,1);assert.ok(cacheStats().hits>=1);cacheClear()});