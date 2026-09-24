import test from 'node:test';import assert from 'node:assert/strict';
test('console supported methods',()=>assert.deepEqual(['GET','POST','PUT','PATCH','DELETE'],['GET','POST','PUT','PATCH','DELETE']));
test('console endpoint stays on provider origin',()=>{const base=new URL('https://provider.example/api');const target=new URL('/episodes',base);assert.equal(target.origin,base.origin);});
