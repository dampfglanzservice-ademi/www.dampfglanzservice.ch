/* Prices in CHF. This proposal is not a binding quote; extras require review. */
(function(root){
 'use strict';
 const minimum=100;
 const labels={auto:'Autoinnenreinigung',wohnungsreinigung:'Wohnungsreinigung','endreinigung-abnahmegarantie':'Endreinigung',polsterreinigung:'Polsterreinigung'};
 function calculate(service,budget){
  const provided=budget!=='' && budget!==null && budget!==undefined;
  const value=provided?Number(budget):null;
  if(provided && (!Number.isFinite(value)||value<0||value>100000))return {valid:false,error:'Bitte geben Sie ein Budget zwischen CHF 0 und CHF 100’000 ein.'};
  const automatic=service==='auto';
  return {valid:true,automatic,minimum:automatic?minimum:null,budget:value,proposal:automatic?Math.round(Math.max(minimum,(minimum+(value??minimum))/2)*100)/100:null,belowMinimum:automatic&&value!==null&&value<minimum,label:labels[service]||'Reinigung',formula:'max(100, (100 + Budget) / 2)',version:'2026-10-09'};
 }
 const api={calculate,labels,minimum};
 root.DGSPrice=api;
 if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(typeof globalThis!=='undefined'?globalThis:this);
