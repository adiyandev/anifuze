const ALLOWED_ROOT_FILES=new Set(['anifuze-template.json']);
const ALLOWED_ASSET_EXTENSIONS=new Set(['.css','.json','.png','.jpg','.jpeg','.webp','.gif','.woff','.woff2','.ttf','.otf']);
const FORBIDDEN_EXTENSIONS=new Set(['.js','.mjs','.cjs','.ts','.tsx','.jsx','.html','.htm','.php','.py','.rb','.sh','.bash','.exe','.dll','.so','.wasm']);
const MAX_ASSET_PATH_LENGTH=512;

function extensionOf(value){
 const match=String(value).toLowerCase().match(/\.[a-z0-9]+$/);
 return match?match[0]:'';
}

export function validateTemplateSandboxEntries(entries){
 if(!Array.isArray(entries)||!entries.length)throw new Error('Template sandbox received no archive entries.');
 for(const raw of entries){
  const rawEntry=String(raw||'').replace(/\\/g,'/');
  const isDirectory=rawEntry.endsWith('/');
  const entry=rawEntry.replace(/\/$/,'');
  if(!entry||entry==='.'||entry.includes('\\0')throw new Error('Template package contains an invalid sandbox entry.');
  if(entry.length>MAX_ASSET_PATH_LENGTH)throw new Error('Template package contains an oversized sandbox path.');
  if(ALLOWED_ROOT_FILES.has(entry))continue;
  if(isDirectory) {
   if(entry!=='assets'&&!entry.startsWith('assets/'))throw new Error('Template package contains a directory outside the presentation sandbox.');
   continue;
  }
  if(!entry.startsWith('assets/')||entry==='assets')throw new Error('Template package contains a file outside the presentation sandbox.');
  const ext=extensionOf(entry);
  if(FORBIDDEN_EXTENSIONS.has(ext))throw new Error('Template package contains executable content, which is not allowed.');
  if(!ALLOWED_ASSET_EXTENSIONS.has(ext))throw new Error('Template package contains an unsupported asset type.');
 }
 return true;
}
