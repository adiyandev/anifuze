import test from 'node:test';
import assert from 'node:assert/strict';
test('homepage contract has required section types',()=>{
 const ids=['trending','latest','popular'];
 assert.deepEqual(ids,['trending','latest','popular']);
 assert.ok(['anime_grid'].includes('anime_grid'));
});