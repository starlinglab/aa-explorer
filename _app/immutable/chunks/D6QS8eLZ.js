import{S as T,o as Z,q as $,v as m,w as j,g as P,U as c,x as y,y as D,z,A as H,B as V,C as J,D as Q,E as q,F as W,G as X,H as k,I as p,J as ee,K as B,L as M,M as U,N as C,O as re,P as ae,Q as ne,f as F,R as te,T as ie,V as fe,b as G,W as se,X as ue,Y as le,Z as _e,_ as ve,$ as de,a0 as ce}from"./BhKqv_0E.js";function E(i,_=null,h){if(typeof i!="object"||i===null||T in i)return i;const v=V(i);if(v!==Z&&v!==$)return i;var t=new Map,l=J(i),o=m(0);l&&t.set("length",m(i.length));var g;return new Proxy(i,{defineProperty(f,e,r){(!("value"in r)||r.configurable===!1||r.enumerable===!1||r.writable===!1)&&H();var n=t.get(e);return n===void 0?(n=m(r.value),t.set(e,n)):y(n,E(r.value,g)),!0},deleteProperty(f,e){var r=t.get(e);if(r===void 0)e in f&&t.set(e,m(c));else{if(l&&typeof e=="string"){var n=t.get("length"),a=Number(e);Number.isInteger(a)&&a<n.v&&y(n,a)}y(r,c),K(o)}return!0},get(f,e,r){var d;if(e===T)return i;var n=t.get(e),a=e in f;if(n===void 0&&(!a||(d=D(f,e))!=null&&d.writable)&&(n=m(E(a?f[e]:c,g)),t.set(e,n)),n!==void 0){var s=P(n);return s===c?void 0:s}return Reflect.get(f,e,r)},getOwnPropertyDescriptor(f,e){var r=Reflect.getOwnPropertyDescriptor(f,e);if(r&&"value"in r){var n=t.get(e);n&&(r.value=P(n))}else if(r===void 0){var a=t.get(e),s=a==null?void 0:a.v;if(a!==void 0&&s!==c)return{enumerable:!0,configurable:!0,value:s,writable:!0}}return r},has(f,e){var s;if(e===T)return!0;var r=t.get(e),n=r!==void 0&&r.v!==c||Reflect.has(f,e);if(r!==void 0||z!==null&&(!n||(s=D(f,e))!=null&&s.writable)){r===void 0&&(r=m(n?E(f[e],g):c),t.set(e,r));var a=P(r);if(a===c)return!1}return n},set(f,e,r,n){var R;var a=t.get(e),s=e in f;if(l&&e==="length")for(var d=r;d<a.v;d+=1){var I=t.get(d+"");I!==void 0?y(I,c):d in f&&(I=m(c),t.set(d+"",I))}a===void 0?(!s||(R=D(f,e))!=null&&R.writable)&&(a=m(void 0),y(a,E(r,g)),t.set(e,a)):(s=a.v!==c,y(a,E(r,g)));var b=Reflect.getOwnPropertyDescriptor(f,e);if(b!=null&&b.set&&b.set.call(n,r),!s){if(l&&typeof e=="string"){var w=t.get("length"),A=Number(e);Number.isInteger(A)&&A>=w.v&&y(w,A+1)}K(o)}return!0},ownKeys(f){P(o);var e=Reflect.ownKeys(f).filter(a=>{var s=t.get(a);return s===void 0||s.v!==c});for(var[r,n]of t)n.v!==c&&!(r in f)&&e.push(r);return e},setPrototypeOf(){j()}})}function K(i,_=1){y(i,i.v+_)}function ge(i,_,h=!1){q&&W();var v=i,t=null,l=null,o=c,g=h?X:0,f=!1;const e=(n,a=!0)=>{f=!0,r(a,n)},r=(n,a)=>{if(o===(o=n))return;let s=!1;if(q){const d=v.data===k;!!o===d&&(v=p(),ee(v),B(!1),s=!0)}o?(t?M(t):a&&(t=U(()=>a(v))),l&&C(l,()=>{l=null})):(l?M(l):a&&(l=U(()=>a(v))),t&&C(t,()=>{t=null})),s&&B(!0)};Q(()=>{f=!1,_(e),f||r(null,null)},g),q&&(v=re)}let N=!1;function oe(i){var _=N;try{return N=!1,[i(),N]}finally{N=_}}function ye(i,_,h,v){var Y;var t=(h&ve)!==0,l=!le||(h&_e)!==0,o=(h&se)!==0,g=(h&ce)!==0,f=!1,e;o?[e,f]=oe(()=>i[_]):e=i[_];var r=T in i||ue in i,n=o&&(((Y=D(i,_))==null?void 0:Y.set)??(r&&_ in i&&(u=>i[_]=u)))||void 0,a=v,s=!0,d=!1,I=()=>(d=!0,s&&(s=!1,g?a=G(v):a=v),a);e===void 0&&v!==void 0&&(n&&l&&ae(),e=I(),n&&n(e));var b;if(l)b=()=>{var u=i[_];return u===void 0?I():(s=!0,d=!1,u)};else{var w=(t?F:te)(()=>i[_]);w.f|=ne,b=()=>{var u=P(w);return u!==void 0&&(a=void 0),u===void 0?a:u}}if(!(h&ie))return b;if(n){var A=i.$$legacy;return function(u,S){return arguments.length>0?((!l||!S||A||f)&&n(S?b():u),u):b()}}var R=!1,L=de(e),O=F(()=>{var u=b(),S=P(L);return R?(R=!1,S):L.v=u});return t||(O.equals=fe),function(u,S){if(arguments.length>0){const x=S?P(O):l&&o?E(u):u;return O.equals(x)||(R=!0,y(L,x),d&&a!==void 0&&(a=x),G(()=>P(O))),u}return P(O)}}export{E as a,ge as i,ye as p};
