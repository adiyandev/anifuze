import test from 'node:test';
import assert from 'node:assert/strict';
import {validateNavigationItems} from './navigation.js';

test('navigation validation accepts internal paths and normalizes defaults',()=>{
 const items=validateNavigationItems([{id:'browse',label:' Browse ',path:'/browse',visible:true}]);
 assert.equal(items[0].label,'Browse');
 assert.equal(items[0].sort_order,10);
});

test('navigation validation rejects external and protocol-relative paths',()=>{
 assert.throws(()=>validateNavigationItems([{id:'x',label:'X',path:'https://example.com'}]),/internal site paths/);
 assert.throws(()=>validateNavigationItems([{id:'x',label:'X',path:'//example.com'}]),/Invalid navigation path/);
});

test('navigation validation rejects duplicate ids and oversized labels',()=>{
 assert.throws(()=>validateNavigationItems([{id:'x',label:'X',path:'/a'},{id:'x',label:'Y',path:'/b'}]),/unique/);
 assert.throws(()=>validateNavigationItems([{id:'x',label:'a'.repeat(65),path:'/a'}]),/1 to 64/);
});