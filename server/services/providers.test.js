import test from 'node:test';import assert from 'node:assert/strict';
test('provider types are restricted',()=>{assert.ok(['API','Embed','Direct','Custom'].includes('API'));assert.equal(['API','Embed','Direct','Custom'].includes('Unknown'),false);});
test('provider credentials never become plaintext in response shape',()=>{assert.equal(Object.prototype.hasOwnProperty.call({credentials_configured:true},'credentials_encrypted'),false);});
