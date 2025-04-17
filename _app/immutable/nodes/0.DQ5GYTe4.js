import{c as I,e as C,a as t,t as l,s as $,n as at,b as Oe}from"../chunks/nuOQF-VX.js";import{C as Qe,D as rt,B as st,E as it,K as ot,P as nt,as as lt,M as dt,p as Le,at as vt,i as g,j as Re,au as ct,k as r,l as a,s as n,t as J,v as y,a8 as ut,av as G,g as e,aw as xe,ax as pt,X as ye,ay as Y}from"../chunks/gyiEl3Uc.js";import{i as Fe}from"../chunks/BkNFsCzC.js";import{p as He,i as d,r as ft,s as mt,b as gt}from"../chunks/CtItQhWX.js";import{s as ht,e as Xe,a as _t,r as Ye,b as $e,i as bt,v as xt,c as yt,h as wt,u as Ge,d as kt,C as Je,H as ze,f as Tt,g as Ct}from"../chunks/7mLxvDnt.js";function Dt(D,v,b,s,c){var o;Qe&&rt();var i=(o=v.$$slots)==null?void 0:o[b],x=!1;i===!0&&(i=v.children,x=!0),i===void 0||i(D,x?()=>s:s)}function Mt(D,v,...b){var s=D,c=nt,i;st(()=>{c!==(c=v())&&(i&&(lt(i),i=null),i=ot(()=>c(s,...b)))},it),Qe&&(s=dt)}var Et=l('<div class="fixed inset-0 bg-black/60 flex items-center justify-center z-50" role="button" tabindex="0"><div class="bg-white rounded-lg p-6 max-w-xl w-full max-h-[90vh] overflow-auto" role="dialog" aria-modal="true"><div class="flex justify-between items-center mb-4"><h2 class="text-xl font-bold"> </h2> <button class="text-gray-500 hover:text-gray-700">✕</button></div> <div class="mb-4"><!></div> <div class="flex justify-end"><button class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">Close</button></div></div></div>');function We(D,v){Le(v,!1);let b=He(v,"showModal",12),s=He(v,"title",8,"");const c=vt();function i(){b(!1),c("close")}function x(u){u.key==="Escape"&&i()}function o(u){u.target===u.currentTarget&&i()}Fe();var p=I();C("keydown",ct,x);var N=g(p);{var f=u=>{var U=Et(),m=r(U),h=r(m),w=r(h),O=r(w,!0);a(w);var oe=n(w,2);a(h);var ae=n(h,2),we=r(ae);Dt(we,v,"default",{}),a(ae);var q=n(ae,2),me=r(q);a(q),a(m),a(U),J(()=>$(O,s())),C("click",oe,i),C("click",me,i),C("click",U,o),C("keydown",U,x),t(u,U)};d(N,u=>{b()&&u(f)})}t(D,p),Re()}var St=at('<svg><path fill="currentColor" d="M12 15.5A3.5 3.5 0 0 1 8.5 12A3.5 3.5 0 0 1 12 8.5a3.5 3.5 0 0 1 3.5 3.5a3.5 3.5 0 0 1-3.5 3.5m7.43-2.53c.04-.32.07-.64.07-.97s-.03-.66-.07-1l2.11-1.63c.19-.15.24-.42.12-.64l-2-3.46c-.12-.22-.39-.31-.61-.22l-2.49 1c-.52-.39-1.06-.73-1.69-.98l-.37-2.65A.506.506 0 0 0 14 2h-4c-.25 0-.46.18-.5.42l-.37 2.65c-.63.25-1.17.59-1.69.98l-2.49-1c-.22-.09-.49 0-.61.22l-2 3.46c-.13.22-.07.49.12.64L4.57 11c-.04.34-.07.67-.07 1s.03.65.07.97l-2.11 1.66c-.19.15-.25.42-.12.64l2 3.46c.12.22.39.3.61.22l2.49-1.01c.52.4 1.06.74 1.69.99l.37 2.65c.04.24.25.42.5.42h4c.25 0 .46-.18.5-.42l.37-2.65c.63-.26 1.17-.59 1.69-.99l2.49 1.01c.22.08.49 0 .61-.22l2-3.46c.12-.22.07-.49-.12-.64z"></path></svg>');function At(D,v){const b=ft(v,["$$slots","$$events","$$legacy"]);var s=St();let c;J(()=>c=ht(s,c,{viewBox:"0 0 24 24",width:"1.2em",height:"1.2em",...b},void 0,!0)),t(D,s)}var Vt=l('<button class="p-1 text-red-500 hover:text-red-700" title="Remove endpoint">✕</button>'),It=l('<div class="flex items-center gap-2 p-2 bg-gray-50 rounded border border-gray-200 svelte-1kec5vf" draggable="true"><div class="cursor-move p-1 svelte-1kec5vf">☰</div> <div class="flex-grow grid grid-cols-2 gap-2"><input type="text" class="p-2 border border-gray-300 rounded" placeholder="Display Name"> <input type="text" class="p-2 border border-gray-300 rounded" placeholder="URL"></div> <!></div>'),Nt=l('<div class="mb-4"><p class="text-sm text-gray-600 mb-2">Configure and reorder the endpoints. The first endpoint will be considered the primary source.</p> <div class="endpoints-list space-y-2 svelte-1kec5vf"></div> <div class="mt-4 flex justify-between"><button class="px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300">+ Add Endpoint</button> <button class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">Save Changes</button></div></div>');function Lt(D,v){Le(v,!1);let b=He(v,"showModal",12,!1),s=G([]);const c=Xe.subscribe(m=>{y(s,m.map((h,w)=>({name:h.name,url:h.url,id:`endpoint-${w}`})))});ut(()=>()=>{c()});function i(){const m=e(s).map(h=>({name:h.name,url:h.url}));Xe.set(m),b(!1)}function x(){const m={name:"New Endpoint",url:"https://"};y(s,[...e(s),{...m,id:`endpoint-${e(s).length}`}])}function o(m){y(s,e(s).filter((h,w)=>w!==m))}function p(m,h,w){const O=[...e(s)];O[m][h]=w,y(s,O)}let N;function f(m){N=m}function u(m){m.preventDefault()}function U(m){if(N===void 0)return;const h=[...e(s)],[w]=h.splice(N,1);h.splice(m,0,w),y(s,h),N=void 0}Fe(),We(D,{get showModal(){return b()},title:"Endpoint Settings",children:(m,h)=>{var w=Nt(),O=n(r(w),2);_t(O,5,()=>e(s),bt,(q,me,ne)=>{var le=It(),de=n(r(le),2),re=r(de);Ye(re);var ke=n(re,2);Ye(ke),a(de);var Ae=n(de,2);{var Ue=Q=>{var Ve=Vt();C("click",Ve,()=>o(ne)),t(Q,Ve)};d(Ae,Q=>{e(s).length>1&&Q(Ue)})}a(le),J(()=>{$e(re,e(me).name),$e(ke,e(me).url)}),C("input",re,Q=>p(ne,"name",Q.currentTarget.value)),C("input",ke,Q=>p(ne,"url",Q.currentTarget.value)),C("dragstart",le,()=>f(ne)),C("dragover",le,u),C("drop",le,()=>U(ne)),t(q,le)}),a(O);var oe=n(O,2),ae=r(oe),we=n(ae,2);a(oe),a(w),C("click",ae,x),C("click",we,i),t(m,w)},$$slots:{default:!0}}),Re()}var Rt=l('<div class="settings-button svelte-1so8a75"><button class="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors" title="Settings"><!></button> <!></div>');function Ut(D){let v=G(!1);function b(){y(v,!e(v))}var s=Rt(),c=r(s),i=r(c);At(i,{class:"h-6 w-6"}),a(c);var x=n(c,2);Lt(x,{get showModal(){return e(v)},set showModal(o){y(v,o)},$$legacy:!0}),a(s),C("click",c,b),t(D,s)}var jt=l('<div class="flex justify-center"><div class="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div></div>'),Bt=l('<div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"><strong class="font-bold">Error:</strong> <span class="block sm:inline"> </span></div>'),Pt=l('<p class="mt-2 text-sm">The attestation CID matches the selected CID.</p>'),Kt=l('<p class="mt-2 text-sm">The digital signature is valid and was created with a known public key.</p>'),qt=l('<p class="mt-2 text-sm">The timestamp proof is valid and anchored in the Bitcoin blockchain.</p>'),zt=l('<div class="flex items-center"><!> <span>Verification successful!</span></div> <!>',1),Ht=l(`<p class="mt-2 text-sm">The timestamp proof was recently verified and is valid. Using cached result to
									reduce blockchain queries.</p> <p class="mt-2 text-xs text-gray-600">Note: Cache expires after 5 minutes. Results from a fresh verification will be
									shown then.</p>`,1),Ft=l('<div class="flex items-center"><!> <span>Verification successful! (cached result)</span></div> <!>',1),Ot=l(`<p class="mt-2 text-sm">The timestamp was recently checked and couldn't be verified. Using cached result
									to reduce blockchain queries.</p> <p class="mt-2 text-xs text-gray-600">Note: Cache expires after 5 minutes. Results from a fresh verification will be
									shown then.</p>`,1),Xt=l('<div class="flex items-center"><!> <span>Verification failed! (cached result)</span></div> <!>',1),Yt=l('<div class="flex items-center"><!> <span>Signature verifies but is from an unknown public key</span></div> <p class="mt-2 text-sm">The signature is valid but was created with an unknown public key.</p>',1),$t=l('<p class="mt-2 text-sm">The signature exists but failed cryptographic verification. This could be due to:</p> <ul class="list-disc pl-5 mt-1"><li>The signature is invalid or has been tampered with</li> <li>The data was modified after signing</li></ul>',1),Gt=l(`<p class="mt-2 text-sm">The timestamp exists but could not be verified. This could be due to:</p> <ul class="list-disc text-sm pl-5 mt-1"><li>The timestamp proof isn't properly formatted</li> <li>The timestamp hasn't been anchored in the blockchain yet</li> <li>The data was modified after timestamping</li></ul>`,1),Jt=l('<div class="flex items-center"><!> <span><!></span></div> <!>',1),Qt=l('<p class="mt-2 text-sm">The attestation CID does not match the selected CID.</p>'),Wt=l('<p class="mt-2 text-sm">No signature was found for this attestation.</p>'),Zt=l('<p class="mt-2 text-sm">No timestamp was found for this attestation.</p>'),ea=l('<div class="flex items-center"><!> <span>Verification failed!</span></div> <!>',1),ta=l("<div><!></div>"),aa=l('<div class="mt-4 border-t pt-4"><h3 class="font-semibold mb-2">Technical Details</h3> <div class="bg-gray-100 p-3 rounded text-sm font-mono overflow-x-auto"><p> </p> <p> </p></div></div>'),ra=l('<div class="mt-4 border-t pt-4"><h3 class="font-semibold mb-2">Technical Details</h3> <div class="bg-gray-100 p-3 rounded text-sm font-mono"><p>Public Key:</p> <pre class="whitespace-pre-wrap break-all bg-gray-200 p-2 rounded"> </pre> <p class="mt-3">Signature:</p> <pre class="whitespace-pre-wrap break-all bg-gray-200 p-2 rounded"> </pre></div></div>'),sa=l('<p class="text-gray-600"> </p>'),ia=l('<div class="mt-4 border-t pt-4"><h3 class="font-semibold mb-2">Technical Details</h3> <div class="bg-gray-100 p-3 rounded text-sm font-mono overflow-x-auto"><p> </p> <p> </p> <!></div></div>'),oa=l('<div class="space-y-4"><p class="text-gray-700"> </p> <!> <!></div>');function na(D,v){Le(v,!1);const[b,s]=mt(),c=()=>gt(yt,"$verificationModalStore",b),i=G(),x=G(),o=G(),p=G(),N=G();let f=G(null),u=G(!0),U=G(null);async function m(){y(u,!0),y(U,null);try{y(f,await xt(e(o),e(p),e(N))),y(u,!1)}catch(q){y(U,q instanceof Error?q.message:"Unknown error occurred"),y(u,!1)}}function h(){return`${e(o).charAt(0).toUpperCase()+e(o).slice(1)} Verification`}function w(){switch(e(o)){case"hash":return"Verifying the attestation's hash.";case"signature":return"Verifying the digital signature using the embedded public key.";case"timestamp":return"Verifying the OpenTimestamps proof against Bitcoin blockchain.";default:return"Unknown verification type."}}function O(){wt()}xe(()=>c(),()=>{y(i,c())}),xe(()=>e(i),()=>{y(x,e(i).show)}),xe(()=>e(i),()=>{y(o,e(i).kind)}),xe(()=>e(i),()=>{y(p,e(i).data)}),xe(()=>e(i),()=>{y(N,e(i).selectedCID)}),xe(()=>(e(x),e(p)),()=>{e(x)&&e(p)&&m()}),pt(),Fe();var oe=I(),ae=g(oe);{var we=q=>{const me=ye(h);We(q,{get title(){return e(me)},get showModal(){return e(x)},$$events:{close:O},children:(ne,le)=>{var de=oa(),re=r(de),ke=r(re,!0);a(re);var Ae=n(re,2);{var Ue=M=>{var z=jt();t(M,z)},Q=M=>{var z=I(),ge=g(z);{var ve=T=>{var E=Bt(),H=n(r(E),2),W=r(H,!0);a(H),a(E),J(()=>$(W,e(U))),t(T,E)},Te=T=>{var E=I(),H=g(E);{var W=Z=>{var F=ta(),he=r(F);{var ce=X=>{var ue=zt(),pe=g(ue),De=r(pe);Je(De,{class:"w-6 h-6 text-green-500 mr-2"}),Y(2),a(pe);var ee=n(pe,2);{var j=B=>{var se=Pt();t(B,se)},te=B=>{var se=I(),Me=g(se);{var S=_=>{var P=Kt();t(_,P)},L=_=>{var P=I(),fe=g(P);{var K=k=>{var R=qt();t(k,R)};d(fe,k=>{e(o)==="timestamp"&&k(K)},!0)}t(_,P)};d(Me,_=>{e(o)==="signature"?_(S):_(L,!1)},!0)}t(B,se)};d(ee,B=>{e(o)==="hash"?B(j):B(te,!1)})}t(X,ue)},Ce=X=>{var ue=I(),pe=g(ue);{var De=j=>{var te=I(),B=g(te);{var se=S=>{var L=Ft(),_=g(L),P=r(_);Je(P,{class:"w-6 h-6 text-green-500 mr-2 opacity-90"}),Y(2),a(_);var fe=n(_,2);{var K=k=>{var R=Ht();Y(2),t(k,R)};d(fe,k=>{e(o)==="timestamp"&&k(K)})}t(S,L)},Me=S=>{var L=Xt(),_=g(L),P=r(_);ze(P,{class:"w-6 h-6 text-red-500 mr-2 opacity-90"}),Y(2),a(_);var fe=n(_,2);{var K=k=>{var R=Ot();Y(2),t(k,R)};d(fe,k=>{e(o)==="timestamp"&&k(K)})}t(S,L)};d(B,S=>{e(f).cachedValue?S(se):S(Me,!1)})}t(j,te)},ee=j=>{var te=I(),B=g(te);{var se=S=>{var L=Yt(),_=g(L),P=r(_);ze(P,{class:"w-6 h-6 text-orange-500 mr-2"}),Y(2),a(_),Y(2),t(S,L)},Me=S=>{var L=I(),_=g(L);{var P=K=>{var k=Jt(),R=g(k),Ie=r(R);ze(Ie,{class:"w-6 h-6 text-red-500 mr-2"});var Ne=n(Ie,2),je=r(Ne);{var Be=A=>{var V=Oe("Signature exists but doesn't verify cryptographically");t(A,V)},ie=A=>{var V=Oe("Timestamp present but doesn't verify");t(A,V)};d(je,A=>{e(o)==="signature"?A(Be):A(ie,!1)})}a(Ne),a(R);var _e=n(R,2);{var Pe=A=>{var V=$t();Y(2),t(A,V)},Ke=A=>{var V=I(),be=g(V);{var qe=Ee=>{var Se=Gt();Y(2),t(Ee,Se)};d(be,Ee=>{e(o)==="timestamp"&&Ee(qe)},!0)}t(A,V)};d(_e,A=>{e(o)==="signature"?A(Pe):A(Ke,!1)})}t(K,k)},fe=K=>{var k=ea(),R=g(k),Ie=r(R);Tt(Ie,{class:"w-6 h-6 text-red-500 mr-2"}),Y(2),a(R);var Ne=n(R,2);{var je=ie=>{var _e=Qt();t(ie,_e)},Be=ie=>{var _e=I(),Pe=g(_e);{var Ke=V=>{var be=Wt();t(V,be)},A=V=>{var be=I(),qe=g(be);{var Ee=Se=>{var tt=Zt();t(Se,tt)};d(qe,Se=>{e(o)==="timestamp"&&Se(Ee)},!0)}t(V,be)};d(Pe,V=>{e(o)==="signature"?V(Ke):V(A,!1)},!0)}t(ie,_e)};d(Ne,ie=>{e(o)==="hash"?ie(je):ie(Be,!1)})}t(K,k)};d(_,K=>{e(f).status==="present"?K(P):K(fe,!1)},!0)}t(S,L)};d(B,S=>{e(f).status==="unknown_key"?S(se):S(Me,!1)},!0)}t(j,te)};d(pe,j=>{e(f).status==="cached"?j(De):j(ee,!1)},!0)}t(X,ue)};d(he,X=>{e(f).status==="verified"?X(ce):X(Ce,!1)})}a(F),J(()=>kt(F,`${e(f).status==="verified"?"bg-green-100 border border-green-400 text-green-700":e(f).status==="cached"&&e(f).cachedValue?"bg-green-100 border border-green-400 text-green-700 opacity-90":e(f).status==="unknown_key"?"bg-orange-100 border border-orange-400 text-orange-700":e(f).status==="present"?"bg-orange-100 border border-red-400 text-red-700":"bg-red-100 border border-red-400 text-red-700"} px-4 py-3 rounded relative`)),t(Z,F)};d(H,Z=>{e(f)&&Z(W)},!0)}t(T,E)};d(ge,T=>{e(U)?T(ve):T(Te,!1)},!0)}t(M,z)};d(Ae,M=>{e(u)?M(Ue):M(Q,!1)})}var Ve=n(Ae,2);{var Ze=M=>{var z=aa(),ge=n(r(z),2),ve=r(ge),Te=r(ve);a(ve);var T=n(ve,2),E=r(T);a(T),a(ge),a(z),J(H=>{$(Te,`Selected CID: ${e(N)||"None"}`),$(E,`Attestation CID: ${H??""}`)},[()=>e(p).value.attestation.CID.toString()],ye),t(M,z)},et=M=>{var z=I(),ge=g(z);{var ve=T=>{var E=ra(),H=n(r(E),2),W=n(r(H),2),Z=r(W,!0);a(W);var F=n(W,4),he=r(F);a(F),a(H),a(E),J((ce,Ce)=>{$(Z,ce),$(he,`							${Ce??""}
						`)},[()=>Ge(e(p).value.signature.pubKey),()=>Ge(e(p).value.signature.sig)],ye),t(T,E)},Te=T=>{var E=I(),H=g(E);{var W=Z=>{var F=ia(),he=n(r(F),2),ce=r(he),Ce=r(ce);a(ce);var X=n(ce,2),ue=r(X);a(X);var pe=n(X,2);{var De=ee=>{var j=sa(),te=r(j);a(j),J(B=>$(te,`Cached: ${B??""}`),[()=>e(f).cacheTimestamp.toLocaleString()],ye),t(ee,j)};d(pe,ee=>{e(f)&&e(f).status==="cached"&&e(f).cacheTimestamp&&ee(De)})}a(he),a(F),J(ee=>{$(Ce,`Timestamp Message: ${ee??""}`),$(ue,`Upgraded: ${(e(p).value.timestamp.ots.upgraded?"Yes":"No")??""}`)},[()=>e(p).value.timestamp.ots.msg.toString()],ye),t(Z,F)};d(H,Z=>{e(o)==="timestamp"&&!e(u)&&e(p)&&Z(W)},!0)}t(T,E)};d(ge,T=>{e(o)==="signature"&&!e(u)&&e(p)?T(ve):T(Te,!1)},!0)}t(M,z)};d(Ve,M=>{e(o)==="hash"&&!e(u)&&e(p)?M(Ze):M(et,!1)})}a(de),J(M=>$(ke,M),[w],ye),t(ne,de)},$$slots:{default:!0}})};d(ae,q=>{e(x)&&e(p)&&q(we)})}t(D,oe),Re(),s()}var la=l('<div class="navbar sticky top-0 bg-white shadow-md z-50"><div class="logo"><img src="/logo.png" alt="AA Explorer Logo" class="logo-img"> <span>Authenticated Attributes Explorer</span></div> <div class="navbar-right"><!></div></div> <!> <div class="modal-container"><!></div>',1);function fa(D,v){Le(v,!0);function b(){Ct.set(null);const u=new URL(window.location.href);u.searchParams.delete("selectedCID"),window.history.pushState({},"",u),window.dispatchEvent(new Event("popstate"))}var s=la(),c=g(s),i=r(c),x=n(i,2),o=r(x);Ut(o),a(x),a(c);var p=n(c,2);Mt(p,()=>v.children);var N=n(p,2),f=r(N);na(f,{}),a(N),C("click",i,b),C("keydown",i,u=>u.key==="Enter"&&b()),t(D,s),Re()}export{fa as component};
