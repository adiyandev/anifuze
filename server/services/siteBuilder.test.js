import test from 'node:test';
import assert from 'node:assert/strict';
import {DEFAULT_BLOCKS} from './siteBuilder.js';
test('site builder ships safe predefined components',()=>{
 assert.ok(DEFAULT_BLOCKS.length>=5);
 assert.ok(DEFAULT_BLOCKS.every(b=>b.id&&b.page==='home'&&b.block_type&&b.title));
 assert.equal(DEFAULT_BLOCKS.find(b=>b.id==='trending').config.limit,6);
});
test('site builder has no arbitrary code component',()=>{
 assert.equal(DEFAULT_BLOCKS.some(b=>String(b.block_type).toLowerCase().includes('code')),false);
});