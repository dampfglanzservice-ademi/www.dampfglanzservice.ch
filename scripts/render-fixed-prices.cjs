#!/usr/bin/env node
'use strict';
// Generated HTML uses the same renderer and approved source as the browser.
// After editing fixed-prices.js: node scripts/render-fixed-prices.cjs --write
// Verify before publishing: node scripts/render-fixed-prices.cjs --check
// No request, contact, tracking, or deployment is performed by this build step.
const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..');
const F=require(path.join(root,'fixed-prices.js'));
const write=process.argv.includes('--write');
const start='<!-- fixed-prices:generated:start -->',end='<!-- fixed-prices:generated:end -->';
const checked=[];
for(const service of Object.keys(F.data.services)){
 const route=service==='auto'?'autoreinigung':service;
 const file=path.join(root,route,'index.html');if(!fs.existsSync(file))continue;
 let source=fs.readFileSync(file,'utf8');
 const tag='<div data-fixed-prices="'+service+'">',pos=source.indexOf(tag);
 if(pos<0)continue;
 if(source.indexOf(tag,pos+tag.length)>=0)throw Error('Duplicate price host: '+route);
 const innerStart=pos+tag.length;let close;
 if(source.startsWith('</div>',innerStart))close=innerStart;
 else{
  const a=source.indexOf(start,innerStart),b=source.indexOf(end,innerStart);
  if(a<0||b<a||source.slice(innerStart,a).trim())throw Error('Unknown price markup: '+route);
  close=source.indexOf('</div>',b+end.length);
  if(close<0||source.slice(b+end.length,close).trim())throw Error('Unclosed price host: '+route);
 }
 const host={innerHTML:''};F.render(host,service,true);
 const inner='\n'+start+'\n'+host.innerHTML+'\n'+end+'\n';
 const current=source.slice(innerStart,close);
 if(current!==inner){
  if(!write)throw Error('Price HTML needs regeneration: '+route+'; run --write');
  source=source.slice(0,innerStart)+inner+source.slice(close);fs.writeFileSync(file,source);
 }
 checked.push({service,file:path.relative(root,file),html:host.innerHTML});
}
if(!checked.length)throw Error('No existing price hosts found');
console.log(JSON.stringify({mode:write?'write':'check',blocks:checked.length,source:'fixed-prices.js',services:checked.map(x=>x.service)}));
