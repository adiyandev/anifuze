import test from 'node:test';
import assert from 'node:assert/strict';
import {normalizeSiteConfigInput,toPublicSiteConfig} from './siteConfig.js';

test('public site config exposes customer-safe customization fields',()=>{
 const value=toPublicSiteConfig({site_name:'Test',tagline:'Tag',description:'Desc',logo_url:'/logo.png',favicon_url:'/favicon.png',domain:'example.com',support_email:'a@example.com',primary_color:'#fff',accent_color:'#000',background_color:'#07070a',footer_text:'Footer',social_links:{discord:'https://discord.gg/test'},setup_completed:true});
 assert.deepEqual(value,{siteName:'Test',tagline:'Tag',description:'Desc',logoUrl:'/logo.png',faviconUrl:'/favicon.png',domain:'example.com',supportEmail:'a@example.com',primary:'#fff',accent:'#000',background:'#07070a',footerText:'Footer',socialLinks:{discord:'https://discord.gg/test'},setupCompleted:true});
});

test('site customization rejects invalid colors without requiring a database',()=>{
 assert.throws(()=>normalizeSiteConfigInput({primary_color:'red'}),/Invalid primary color/);
});

test('site customization validates URLs and social links',()=>{
 assert.throws(()=>normalizeSiteConfigInput({logo_url:'javascript:alert(1)'}),/Logo URL must be HTTP/);
 assert.throws(()=>normalizeSiteConfigInput({social_links:{discord:'javascript:alert(1)'}}),/Social link discord must be a valid HTTP/);
 const value=normalizeSiteConfigInput({logo_url:'/logo.png',social_links:{discord:'https://discord.gg/test',unknown:'https://example.com'}});
 assert.equal(value.logo_url,'/logo.png');
 assert.deepEqual(value.social_links,{discord:'https://discord.gg/test'});
});
