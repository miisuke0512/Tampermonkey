// ==UserScript==
// @name          raichan
// @version       4.5
// @match         https://ticket.expo2025.or.jp/*
// @description   表示最適化スクリプト
// @run-at        document-end
// @grant         none
// ==/UserScript==
(function(){
'use strict';
let p,c=()=>{};
function R(){
const l=location.href;
l.includes('/event_search/')?p!=='search'&&(c(),p='search',c=S()):l.includes('/event_time/')?p!=='time'&&(c(),p='time',c=T()):l.includes('/myticket_detail/')?p!=='detail'&&(c(),p='detail',c=L_detail()):(c(),p=null)
}
R();
let u=location.href;
setInterval(()=>{
location.href!==u&&(u=location.href,R())
},1e3);
function S(){
const F='expo_favorites_map',V='expo_search_full_visible',A='expo_favorite_filter_state',D='show_fav_only',E='hide_dislikes',G='show_all',H=()=>JSON.parse(localStorage.getItem(F)||'{}'),I=e=>localStorage.setItem(F,JSON.stringify(e)),J=e=>{const t=H(),o=t[e]||null;o===null?t[e]='favorite':o==='favorite'?t[e]='dislike':delete t[e];I(t);K()},K=()=>{const e=H();document.querySelectorAll('.expo-heart').forEach(t=>{const o=t.dataset.title,n=e[o]||null;n==='favorite'?(t.textContent='❤',t.style.color='red'):n==='dislike'?(t.textContent='❤\uFE0E',t.style.color='black'):(t.textContent='♡',t.style.color='red')})},L=()=>{document.querySelectorAll('.style_search_item_row__moqWC').forEach(e=>{const t=e.querySelector('button[data-event-index]');if(!t||t.querySelector('.expo-heart'))return;const o=t.querySelector('.style_search_item_title__aePLg');if(!o)return;const n=o.textContent.trim(),s=document.createElement('span');s.className='expo-heart';s.dataset.title=n;Object.assign(s.style,{marginLeft:'8px',fontSize:'25px',cursor:'pointer',userSelect:'none'});s.addEventListener('click',t=>{t.stopPropagation();J(n)});o.insertAdjacentElement('afterend',s)});K()},M=()=>{const e=localStorage.getItem(V)==='true',t=localStorage.getItem(A)||G,o=H();document.querySelectorAll('.style_search_item_row__moqWC').forEach(n=>{let s=!0;const a=n.querySelector('img[src="/asset/img/calendar_none.svg"]');a&&!e&&(s=!1);const i=n.querySelector('.style_search_item_title__aePLg');if(i){const e=i.textContent.trim(),a=o[e]||null;t===D&&a!=='favorite'&&(s=!1);t===E&&a==='dislike'&&(s=!1)}n.style.display=s?'':'none'})},N=()=>{if(document.getElementById('fullToggleBtn'))return;const e=document.querySelector('.style_form_result_caption__N_THN');if(!e)return;const t=document.createElement('button');t.id='fullToggleBtn';t.className='basic-btn type4';Object.assign(t.style,{margin:'25px 0 0 0',display:'flex',alignItems:'center'});const o=document.createElement('img');o.src='/asset/img/calendar_none.svg';o.style.marginRight='20px';const n=document.createElement('span'),s=()=>{n.textContent=localStorage.getItem(V)==='true'?'満員は非表示':'満員も表示'};t.append(o,n);t.addEventListener('click',()=>{const e=localStorage.getItem(V)==='true';localStorage.setItem(V,!e);s();M()});e.parentNode.insertBefore(t,e);s()},O=()=>{if(document.getElementById('favoriteFilterBtn'))return;const e=document.getElementById('fullToggleBtn');if(!e)return;const t=document.createElement('button');t.id='favoriteFilterBtn';t.className='basic-btn type4';Object.assign(t.style,{margin:'25px 0 0 0',display:'flex',alignItems:'center',justifyContent:'center'});const o=document.createElement('span'),n=()=>{const e=localStorage.getItem(A)||G;e===D?o.innerHTML='<span style="color:red;">❤</span>を表示':e===E?o.innerHTML='<span style="color:black;">❤\uFE0E</span>は非表示':o.innerHTML='<span style="color:red;">❤</span>も<span style="color:black;">❤\uFE0E</span>も全て表示'};t.append(o);t.addEventListener('click',()=>{const e=localStorage.getItem(A)||G;let t;t=e===G?D:e===D?E:G;localStorage.setItem(A,t);n();M()});e.insertAdjacentElement('afterend',t);n()},
P=()=>{
  const buttons = Array.from(document.querySelectorAll('button.style_more_btn__ymb22'))
    .filter(e => e.offsetParent !== null);

  buttons.forEach((btn, i) => {
    setTimeout(() => {
      btn.click();
    }, 1000 * i); // 1秒ごとに順番にクリック
  });
},
Q=new MutationObserver(()=>{Q.disconnect();N();O();P();L();M();Q.observe(document.body,{childList:!0,subtree:!0})});N();O();L();M();Q.observe(document.body,{childList:!0,subtree:!0});return()=>Q.disconnect()}
function L_detail(){
let b=false;const i=()=>{if(b)return;const c=document.querySelector('.style_info__rjheq');const d=document.querySelector('.style_main__ge7iK');if(c&&d){const B=d.querySelectorAll('.style_main__buttons__button__5GJ9z,.style_event_detail__button__eo_Zr');B.forEach(e=>{e.style.pointerEvents='none';e.style.opacity='0.2'});const t=document.createElement('button');t.id='expo-detail-toggle-buttons';t.className='style_main__buttons__button__5GJ9z';t.tabIndex=0;const S=document.createElement('span');S.className='style_renderer__ip0Pm';t.appendChild(S);Object.assign(t.style,{marginTop:'20px',marginBottom:'20px'});let a=true;const u=()=>{S.textContent=a?'🔒来場・抽選予約をロック中':'🔓来場・抽選予約のロックを解除中'};t.addEventListener('click',()=>{a=!a;const e=d.querySelectorAll('.style_main__buttons__button__5GJ9z,.style_event_detail__button__eo_Zr');e.forEach(e=>{if(a){e.style.pointerEvents='none';e.style.opacity='0.2'}else{e.style.pointerEvents='';e.style.opacity=''}});u()});const C=document.createElement('div');C.className='style_main__buttons__MP9In';Object.assign(C.style,{display:'flex',justifyContent:'center',alignItems:'center',flexWrap:'nowrap'});C.appendChild(t);c.nextSibling?c.parentNode.insertBefore(C,c.nextSibling):c.parentNode.appendChild(C);u();b=true;o.disconnect()}};const o=new MutationObserver((m,O)=>{i()});i();if(!b)o.observe(document.body,{childList:true,subtree:true});return()=>o.disconnect()
}
function T(){
const d='expo_time_hide_description',f='expo_time_full_visible',o=()=>{const e=document.querySelector('.style_description__o9igj');if(!e||e.dataset.processed)return;e.dataset.processed='true';const t=document.createElement('div');t.textContent='説明文を表示';Object.assign(t.style,{cursor:'pointer',textAlign:'center',display:'none'});e.parentNode.insertBefore(t,e.nextSibling);const s=()=>{const o=localStorage.getItem(d)==='true';e.style.display=o?'none':'';t.style.display=o?'':'none'};e.addEventListener('click',o=>{o.target.tagName.toLowerCase()!=='a'&&(localStorage.setItem(d,'true'),s())});t.addEventListener('click',()=>{localStorage.setItem(d,'false');s()});s()},n=()=>{const e=localStorage.getItem(f)==='true';document.querySelectorAll('.style_time_picker__wrap__UBImr').forEach(t=>{const o=t.querySelector('.style_time_picker__disabled___yvRh');o&&(t.style.display=e?'':'none')})},s=()=>{if(document.getElementById('expo-full-toggle'))return;const e=document.querySelector('.style_hour_unit_wrap__piAg4');if(!e)return;const o=document.createElement('button');o.id='expo-full-toggle';o.className='basic-btn type4';Object.assign(o.style,{marginTop:'10pt'});const n=document.createElement('img');n.src='/asset/img/ico_ng.svg';o.append(n);const a=document.createElement('span');Object.assign(a.style,{marginLeft:'6px'});const i=()=>{const e=localStorage.getItem(f)==='true';a.textContent=e?'満員は非表示':'満員も表示'};o.append(a);e.insertAdjacentElement('afterend',o);o.addEventListener('click',()=>{const e=localStorage.getItem(f)!=='true';localStorage.setItem(f,e);i();n()});i()},a=document.querySelector('.style_main__event_times__rkxuG')||document.body,i=new MutationObserver(()=>{i.disconnect();o();s();n();i.observe(a,{childList:!0,subtree:!0})});o();s();n();i.observe(a,{childList:!0,subtree:!0});return()=>i.disconnect()}
})();