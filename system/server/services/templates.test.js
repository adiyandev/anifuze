import test from 'node:test';
import assert from 'node:assert/strict';
import {normalizeTemplate,listTemplates,getTemplate,installTemplate,listInstalledTemplates,getActiveTemplate,activateTemplate} from './templates.js';
import {validateTemplateManifest,validateTemplatePackage} from './templatePackage.js';
import {validateTemplateSandboxEntries} from './templateSandbox.js';

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

test('template manifest validation accepts presentation-only config',()=>{
 assert.equal(validateTemplateManifest({id:'midnight',version:'1.2.3',type:'template',name:'Midnight',config:{primary:'#ff2d95',accent:'#7c3aed',radius:'12px',font:'Inter'}},{id:'midnight',version:'1.2.3'}),true);
});

test('template manifest validation rejects non-presentation config',()=>{
 assert.throws(()=>validateTemplateManifest({id:'bad',version:'1.0.0',config:{apiUrl:'https://example.com'}}),/presentation settings/);
});

test('template manifest validation rejects prototype-pollution keys',()=>{
 assert.throws(()=>validateTemplateManifest({id:'bad',version:'1.0.0',config:{constructor:{}}}),/forbidden config key/);
});

test('template manifest validation rejects invalid versions',()=>{
 assert.throws(()=>validateTemplateManifest({id:'bad',version:'1',config:{primary:'#fff'}}),/semantic versioning/);
});

test('template manifest validation accepts authoring metadata',()=>{
 assert.equal(validateTemplateManifest({id:'midnight',version:'1.2.3',name:'Midnight',description:'A dark presentation theme.',author:'AniFuze',category:'Dark',license:'MIT',config:{primary:'#ff2d95'}},{id:'midnight',version:'1.2.3'}),true);
});

test('template manifest validation rejects unknown top-level keys',()=>{
 assert.throws(()=>validateTemplateManifest({id:'bad',version:'1.0.0',config:{primary:'#fff'},routes:['/admin']}),/unsupported key/);
});

test('template manifest validation rejects oversized metadata',()=>{
 assert.throws(()=>validateTemplateManifest({id:'bad',version:'1.0.0',description:'x'.repeat(2049),config:{primary:'#fff'}}),/description is too long/);
});

test('template manifest validation rejects invalid author and category metadata',()=>{
 assert.throws(()=>validateTemplateManifest({id:'bad',version:'1.0.0',author:'',config:{primary:'#fff'}}),/author is invalid/);
 assert.throws(()=>validateTemplateManifest({id:'bad',version:'1.0.0',category:'x'.repeat(101),config:{primary:'#fff'}}),/category is invalid/);
});

test('template package validator is exposed for authoring workflows',()=>{
 assert.equal(typeof validateTemplatePackage,'function');
});



test('template sandbox accepts only manifest and static presentation assets',()=>{
 assert.equal(validateTemplateSandboxEntries(['anifuze-template.json','assets/','assets/theme.css','assets/images/','assets/logo.png','assets/font.woff2']),true);
});

test('template sandbox rejects executable content and files outside assets',()=>{
 assert.throws(()=>validateTemplateSandboxEntries(['anifuze-template.json','assets/theme.js']),/executable content/);
 assert.throws(()=>validateTemplateSandboxEntries(['anifuze-template.json','index.html']),/outside the presentation sandbox/);
 assert.throws(()=>validateTemplateSandboxEntries(['anifuze-template.json','assets/data.exe']),/executable content/);
});

test('template sandbox rejects unsafe asset paths',()=>{
 assert.throws(()=>validateTemplateSandboxEntries(['anifuze-template.json','assets/../secret.css']),/unsupported asset type|outside the presentation sandbox/);
 assert.throws(()=>validateTemplateSandboxEntries(['anifuze-template.json','../secret.css']),/outside the presentation sandbox/);
});
