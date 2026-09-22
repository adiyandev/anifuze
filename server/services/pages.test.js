import test from 'node:test';
import assert from 'node:assert/strict';
import {DEFAULT_PAGE_SLUGS} from './pages.js';

test('default page contract contains only predefined template pages',()=>{
 assert.deepEqual([...DEFAULT_PAGE_SLUGS].sort(),['anime','browse','genres','home','latest','login','register','schedule','search','trending','watch']);
});