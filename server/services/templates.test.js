import test from 'node:test';
import assert from 'node:assert/strict';
import {DEFAULTS} from './templates.js';
test('template contract controls core page surfaces',()=>{
 assert.equal(DEFAULTS.homepage.hero,true);
 assert.deepEqual(DEFAULTS.homepage.sections,['trending','latest','popular']);
 assert.equal(DEFAULTS.watch.player,true);
 assert.equal(DEFAULTS.pages.home,true);
 assert.equal(DEFAULTS.pages.watch,true);
 assert.equal(DEFAULTS.layout.gridColumns.mobile,2);
});