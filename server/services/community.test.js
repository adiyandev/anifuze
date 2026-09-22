import test from 'node:test';
import assert from 'node:assert/strict';
import {COMMENT_STATUSES,REPORT_STATUSES} from './community.js';
test('community status contracts',()=>{assert.deepEqual([...COMMENT_STATUSES].sort(),['deleted','hidden','visible']);assert.deepEqual([...REPORT_STATUSES].sort(),['dismissed','pending','resolved','reviewing']);});