import test from 'node:test';import assert from 'node:assert/strict';
import {compareVersions} from './updates.js';

test('version comparison handles v prefixes and missing patch numbers',()=>{assert.equal(compareVersions('v2.1.0','1.9.9'),1);assert.equal(compareVersions('1.2','1.2.0'),0);assert.equal(compareVersions('1.2.0','1.2.1'),-1)});
