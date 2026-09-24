import test from 'node:test';
import assert from 'node:assert/strict';
import {normalizeTemplate,listTemplates,getTemplate,installTemplate,listInstalledTemplates,getActiveTemplate,activateTemplate} from './templates.js';

test('template service exposes the central marketplace contract',()=>{
 assert.equal(typeof normalizeTemplate,'function');
 assert.equal(typeof listTemplates,'function');
 assert.equal(typeof getTemplate,'function');
 assert.equal(typeof installTemplate,'function');
 assert.equal(typeof listInstalledTemplates,'function');
 assert.equal(typeof getActiveTemplate,'function');
 assert.equal(typeof activateTemplate,'function');
});

test('template normalization provides safe marketplace defaults',()=>{
 const template=normalizeTemplate({id:'  starter ',name:' Starter ',config:'{"homepage":{"hero":true}}'});
 assert.deepEqual(template,{id:'starter',name:'Starter',version:'1.0.0',status:'available',config:{homepage:{hero:true}},description:'',category:'',packageUrl:'',packageSha256:'',packageSignature:'',packageSize:0,compatibility:{}});
});

test('template normalization safely handles malformed config',()=>{
 const template=normalizeTemplate({id:'starter',name:'Starter',config:'not-json'});
 assert.deepEqual(template.config,{});
});