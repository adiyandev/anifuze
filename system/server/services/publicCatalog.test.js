import test from 'node:test';
import assert from 'node:assert/strict';
import {SORTS,TYPES,STATUSES} from './publicCatalog.js';
test('public catalog exposes supported filters',()=>{assert.equal(SORTS.popularity,'POPULARITY_DESC');assert.ok(TYPES.includes('MOVIE'));assert.ok(STATUSES.includes('RELEASING'));});