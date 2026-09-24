import test from 'node:test';
import assert from 'node:assert/strict';
import {checkRequirements} from './requirements.js';

test('requirements checks do not accumulate between calls',async()=>{
 const a=await checkRequirements();
 const b=await checkRequirements();
 assert.equal(a.checks.length,b.checks.length);
 assert.ok(a.checks.length>=6);
});
