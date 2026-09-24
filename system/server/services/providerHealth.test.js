import test from 'node:test';import assert from 'node:assert/strict';
import {providerHealthRank,shouldAttemptProvider} from './providerHealth.js';
test('health ranking prefers healthy then degraded then offline',()=>{assert.ok(providerHealthRank({status:'Healthy'})<providerHealthRank({status:'Degraded'}));assert.ok(providerHealthRank({status:'Degraded'})<providerHealthRank({status:'Offline'}));});
test('offline providers without a check are eligible',()=>assert.equal(shouldAttemptProvider({enabled:true,status:'Offline',last_checked_at:null}),true));
test('disabled providers are never attempted',()=>assert.equal(shouldAttemptProvider({enabled:false,status:'Healthy'}),false));
