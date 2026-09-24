import test from 'node:test';
import assert from 'node:assert/strict';

test('stream resolver module exports resolveStream',async()=>{
 const mod=await import('./streamResolver.js');
 assert.equal(typeof mod.resolveStream,'function');
});

test('stream resolver exposes cache invalidation',async()=>{const m=await import('./streamResolver.js');assert.equal(typeof m.invalidateStreamCache,'function');});
