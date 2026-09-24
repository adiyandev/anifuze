import test from 'node:test';import assert from 'node:assert/strict';
test('error rate is calculated from requests and errors',()=>{const requests=250,errors=5;assert.equal(Number(((errors/requests)*100).toFixed(2)),2)});
test('zero requests has zero error rate',()=>assert.equal(0,0));
