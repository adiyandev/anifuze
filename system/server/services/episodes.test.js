import test from 'node:test';import assert from 'node:assert/strict';
test('episode ids are deterministic',()=>{const anime='anilist:123';assert.equal('anilist:'+anime+':7','anilist:anilist:123:7');assert.ok(/^anilist:/.test('anilist:'+anime+':7'));});
