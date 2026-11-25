import * as THREE from 'three';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';
import {RoomEnvironment} from 'three/addons/environments/RoomEnvironment.js';
import {RectAreaLightUniformsLib} from 'three/addons/lights/RectAreaLightUniformsLib.js';
import {mergeGeometries,mergeVertices} from 'three/addons/utils/BufferGeometryUtils.js';
import {EffectComposer} from 'three/addons/postprocessing/EffectComposer.js';
import {RenderPass} from 'three/addons/postprocessing/RenderPass.js';
import {UnrealBloomPass} from 'three/addons/postprocessing/UnrealBloomPass.js';
import {OutputPass} from 'three/addons/postprocessing/OutputPass.js';
import {ShaderPass} from 'three/addons/postprocessing/ShaderPass.js';
import {startArcade,LESSON} from './arcade.js?v=20261126c';
import {mountStage} from './stage3d.js?v=20261126c';
import {enhance} from './site3d.js?v=20261126c';
const $=s=>document.querySelector(s),V=(x,y,z)=>new THREE.Vector3(x,y,z);
const D=JSON.parse($('#rdata').textContent),T=D.t,CV=D.cv;
/* ---------- kalite: donmayı önlemek için otomatik ayar ---------- */
const LOW=matchMedia('(pointer:coarse)').matches;
const GPU=(()=>{try{const g=document.createElement('canvas').getContext('webgl2')||document.createElement('canvas').getContext('webgl'),e=g&&g.getExtension('WEBGL_debug_renderer_info');return e?String(g.getParameter(e.UNMASKED_RENDERER_WEBGL)):''}catch(e){return ''}})();
const WEAK=/intel|uhd|iris|mali|adreno|powervr|apple gpu|radeon\(tm\)|radeon graphics|vega \d+ graphics|swiftshader|llvmpipe|basic render/i.test(GPU);
const QP=localStorage.getItem('q');const TIER=LOW?'low':QP==='high'?'high':QP==='perf'?'medium':(WEAK?'medium':'high');const HI=TIER==='high',SH=TIER!=='low';document.body.classList.toggle('perf',!HI);window.TIER=TIER;
const Q={pr:HI?Math.min(devicePixelRatio,1.0):(LOW?.85:1),max:HI?Math.min(devicePixelRatio,1.25):1,bloom:HI};
const R=new THREE.WebGLRenderer({antialias:true,powerPreference:'high-performance'});R.setPixelRatio(Q.pr);R.setSize(innerWidth,innerHeight);
R.shadowMap.enabled=SH;R.shadowMap.autoUpdate=false;R.shadowMap.type=THREE.PCFSoftShadowMap;R.toneMapping=THREE.ACESFilmicToneMapping;R.toneMappingExposure=.8;document.body.prepend(R.domElement);
const scene=new THREE.Scene();if(!LOW)RectAreaLightUniformsLib.init();
const roomEnv=new THREE.PMREMGenerator(R).fromScene(new RoomEnvironment(),.04).texture;scene.environment=roomEnv;let envTex=null;
const cam=new THREE.PerspectiveCamera(74,innerWidth/innerHeight,.15,1200);cam.rotation.order='YXZ';scene.add(cam);
let comp=null,bloom=null,grain=null;
if(Q.bloom){const rt0=new THREE.WebGLRenderTarget(innerWidth*Q.pr,innerHeight*Q.pr,{type:THREE.HalfFloatType,samples:2});rt0.depthTexture=new THREE.DepthTexture(innerWidth*Q.pr,innerHeight*Q.pr,THREE.UnsignedIntType);comp=new EffectComposer(R,rt0);comp.setPixelRatio(1);comp.addPass(new RenderPass(scene,cam));bloom=new UnrealBloomPass(new THREE.Vector2(innerWidth>>1,innerHeight>>1),.28,.55,.96);{const bs=bloom.setSize.bind(bloom);bloom.setSize=(w,h)=>bs(Math.max(1,w>>1),Math.max(1,h>>1))}comp.addPass(bloom);comp.addPass(new OutputPass());
 grain=new ShaderPass({uniforms:{tDiffuse:{value:null},t:{value:0}},vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
  fragmentShader:'uniform sampler2D tDiffuse;uniform float t;varying vec2 vUv;void main(){vec4 c=texture2D(tDiffuse,vUv);float l=dot(c.rgb,vec3(.299,.587,.114));c.rgb=mix(vec3(l),c.rgb,1.1);c.rgb=(c.rgb-.5)*1.05+.5;vec2 d=vUv-.5;float v=smoothstep(.9,.3,length(d*vec2(1.15,1.)));c.rgb*=mix(.8,1.,v);float n=fract(sin(dot(vUv*vec2(12.9898,78.233)+t,vec2(1.)))*43758.5453);c.rgb+=(n-.5)*.016;gl_FragColor=c;}'});comp.addPass(grain)}
const resize=()=>{cam.aspect=innerWidth/innerHeight;cam.fov=cam.aspect<1?84:74;cam.updateProjectionMatrix();R.setPixelRatio(Q.pr);R.setSize(innerWidth,innerHeight);if(comp){comp.setPixelRatio(Q.pr);comp.setSize(innerWidth,innerHeight)}};addEventListener('resize',resize);resize();
const TL=new THREE.TextureLoader(),tex=u=>{const t=TL.load('../assets/img/'+u);t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=4;return t};
const cTex=(w,h,fn)=>{const c=document.createElement('canvas');c.width=w;c.height=h;fn(c.getContext('2d'),w,h);const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=4;return t};
const M=(c,r=.8,m=0)=>new THREE.MeshStandardMaterial({color:c,roughness:r,metalness:m,envMapIntensity:.35});
const add=(g,m,x,y,z,o={})=>{const k=new THREE.Mesh(g,m);k.position.set(x,y,z);const flat=g.type==='PlaneGeometry'||g.type==='CircleGeometry'||g.type==='RingGeometry';k.castShadow=SH&&(o.cast??!flat);k.receiveShadow=SH;if(o.r)k.rotation.set(...o.r);(o.p||scene).add(k);return k};
const RB=(w,h,d,c,x,y,z,rad=.04,o={})=>add(new RoundedBoxGeometry(w,h,d,Math.max(w,h,d)<.6?2:3,rad),typeof c==='object'?c:M(c,o.rough??.8,o.m??0),x,y,z,o);
const BX=(w,h,d,c,x,y,z,o={})=>add(new THREE.BoxGeometry(w,h,d),typeof c==='object'?c:M(c,o.rough??.9),x,y,z,o);
const leds=[],LL=[];
const LED=(w,h,d,x,y,z,gl=1.4,c=0xffd49a)=>{const m=new THREE.MeshStandardMaterial({color:0x000000,emissive:c,emissiveIntensity:gl});add(new THREE.BoxGeometry(w,h,d),m,x,y,z,{cast:false});leds.push({m,gl});return m};
const lt=(l,i)=>{l.intensity=i;LL.push({l,i});scene.add(l);return l};
const W=7,D2=5,H=4.4,Z=D2,ZB=6.2;
const LX=-2.6,WL=W-LX,CX=(W-WL)/2;
const nrm=(n,fn,str,rep)=>{const c=document.createElement('canvas');c.width=c.height=n;const x=c.getContext('2d');fn(x,n);const d=x.getImageData(0,0,n,n).data,o=x.createImageData(n,n),Hh=(i,j)=>d[(((j+n)%n)*n+((i+n)%n))*4]/255;
 for(let j=0;j<n;j++)for(let i=0;i<n;i++){const dx=(Hh(i-1,j)-Hh(i+1,j))*str,dy=(Hh(i,j-1)-Hh(i,j+1))*str,l=Math.hypot(dx,dy,1),k=(j*n+i)*4;o.data[k]=(dx/l*.5+.5)*255;o.data[k+1]=(dy/l*.5+.5)*255;o.data[k+2]=(1/l*.5+.5)*255;o.data[k+3]=255}
 x.putImageData(o,0,0);const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(...rep);return t};
const plasterN=nrm(256,(x,n)=>{x.fillStyle='#808080';x.fillRect(0,0,n,n);for(let i=0;i<1400;i++){const v=110+Math.random()*40|0;x.fillStyle=`rgba(${v},${v},${v},.35)`;x.beginPath();x.arc(Math.random()*n,Math.random()*n,2+Math.random()*9,0,7);x.fill()}},1.4,[5,2]);
const woodN=nrm(256,(x,n)=>{x.fillStyle='#909090';x.fillRect(0,0,n,n);for(let r=0;r<5;r++){for(let j=0;j<90;j++){const v=120+Math.random()*50|0;x.fillStyle=`rgb(${v},${v},${v})`;x.fillRect(Math.random()*n,r*(n/5)+Math.random()*(n/5),40+Math.random()*200,1+Math.random()*1.5)}x.fillStyle='#3a3a3a';x.fillRect(0,r*(n/5)+n/5-3,n,3);x.fillRect(Math.random()*n,r*(n/5),3,n/5)}},2.2,[4,3]);
const fabN=nrm(256,(x,n)=>{for(let j=0;j<n;j+=4)for(let i=0;i<n;i+=4){const v=((i/4+j/4)%2?150:110)+Math.random()*20|0;x.fillStyle=`rgb(${v},${v},${v})`;x.fillRect(i,j,4,4)}},1.1,[6,6]);
/* ---------- NEW YORK: gün batımı gökyüzü ve şehir ---------- */
const sky=cTex(1024,512,(x,w,h)=>{const g=x.createLinearGradient(0,0,0,h);g.addColorStop(0,'#0e1233');g.addColorStop(.3,'#3a2a66');g.addColorStop(.46,'#c9627a');g.addColorStop(.5,'#ffb069');g.addColorStop(.52,'#241a3a');g.addColorStop(1,'#0a0a18');x.fillStyle=g;x.fillRect(0,0,w,h)});sky.mapping=THREE.EquirectangularReflectionMapping;scene.background=sky;
scene.fog=new THREE.Fog(0x8a5a72,70,900);
const winT=cTex(256,512,(x,w,h)=>{x.fillStyle='#0d1019';x.fillRect(0,0,w,h);for(let r=0;r<16;r++)for(let c=0;c<8;c++){const lit=Math.random()<.4;x.fillStyle=lit?`hsl(${34+Math.random()*18},90%,${58+Math.random()*22}%)`:'#161b27';x.fillRect(c*32+6,r*32+6,20,20)}});winT.wrapS=winT.wrapT=THREE.RepeatWrapping;
const bm=new THREE.MeshStandardMaterial({map:winT,emissiveMap:winT,emissive:0xffffff,emissiveIntensity:.9,roughness:.9,fog:true});
let sd=11;const rnd=()=>(sd=(sd*16807)%2147483647)/2147483647;const geos=[];
const bld=(x,z,w,d,h,y0=-150)=>{const g=new THREE.BoxGeometry(w,h,d),uv=g.attributes.uv,sc=[[d,h],[d,h],[w,d],[w,d],[w,h],[w,h]];for(let f=0;f<6;f++)for(let i=0;i<4;i++){const k=f*4+i;uv.setXY(k,uv.getX(k)*sc[f][0]/32,uv.getY(k)*sc[f][1]/56)}g.translate(x,y0+h/2,z);geos.push(g)};
for(let i=0;i<190;i++){const z0=34+rnd()*340,x0=(rnd()-.5)*(140+z0*1.5),w=10+rnd()*22,d=10+rnd()*22,h=40+rnd()*(55+z0*.55),m=Math.max(0,Math.min(3,Math.round((z0-80)/80))),k=Math.round((x0-40)/80),x=80*k+40+(rnd()-.5)*(60-w),z=80*m+80+(rnd()-.5)*(60-d);if(Math.abs(x-40)<30&&Math.abs(z-160)<30)continue;bld(x,z,w,d,h)}
bld(40,160,34,34,172);bld(40,160,24,24,24,22);bld(40,160,14,14,18,46);bld(-40,80,26,26,190);bld(-40,80,16,16,30,40);
const sk=new THREE.Mesh(mergeGeometries(geos),bm);sk.frustumCulled=false;scene.add(sk);
/* evin altı: oda ve oyun odası hizasında, çıkıntısız, yere kadar inen bina gövdesi (yalnızca iki düz kutu; ön yüz odanın ön duvarıyla aynı hizada) */
{const tw=(x0,x1,z0,z1)=>{const w=x1-x0,d=z1-z0,h=149.9,g=new THREE.BoxGeometry(w,h,d),uv=g.attributes.uv,sc=[[d,h],[d,h],[w,d],[w,d],[w,h],[w,h]];for(let f=0;f<6;f++)for(let i=0;i<4;i++){const k=f*4+i;uv.setXY(k,uv.getX(k)*sc[f][0]/32,uv.getY(k)*sc[f][1]/56)}g.translate((x0+x1)/2,-.05-h/2,(z0+z1)/2);const m=new THREE.Mesh(g,bm);m.frustumCulled=false;scene.add(m)};
 tw(-9.6,7,-6.2,5.1);tw(7,17,-5,5.1)}
const ant=new THREE.Mesh(new THREE.CylinderGeometry(.3,.9,38,6),M(0xcfd6e6,.4,.8));ant.position.set(40,83,160);scene.add(ant);const tip=new THREE.Mesh(new THREE.SphereGeometry(1.2,10,8),new THREE.MeshBasicMaterial({color:0xff3b30,fog:false}));tip.position.set(40,103,160);scene.add(tip);
const grd=cTex(1024,1024,(x,w,h)=>{x.fillStyle='#0c0e17';x.fillRect(0,0,w,h);for(let i=0;i<2600;i++){x.fillStyle=`rgba(${Math.random()<.5?255:0},${Math.random()<.5?220:0},${Math.random()<.5?160:0},${Math.random()*.035})`;x.fillRect(Math.random()*w,Math.random()*h,2,2)}
 const R=102,SW=26;x.fillStyle='#1c2030';[[0,0,R+SW,h],[w-R-SW,0,R+SW,h],[0,0,w,R+SW],[0,h-R-SW,w,R+SW]].forEach(a=>x.fillRect(...a));
 x.fillStyle='#13151d';[[0,0,R,h],[w-R,0,R,h],[0,0,w,R],[0,h-R,w,R]].forEach(a=>x.fillRect(...a));
 x.fillStyle='rgba(235,200,110,.8)';for(let i=0;i<w;i+=64){[[0,i],[w-3,i]].forEach(q=>x.fillRect(q[0],q[1],3,36));[[i,0],[i,h-3]].forEach(q=>x.fillRect(q[0],q[1],36,3))}
 x.fillStyle='rgba(255,205,130,.95)';for(let i=16;i<w;i+=100){[[R+SW-8,i],[w-R-SW+8,i],[i,R+SW-8],[i,h-R-SW+8]].forEach(q=>{x.beginPath();x.arc(q[0],q[1],3.4,0,7);x.fill()})}});
grd.wrapS=grd.wrapT=THREE.RepeatWrapping;grd.repeat.set(20,20);grd.anisotropy=8;
add(new THREE.PlaneGeometry(1600,1600),new THREE.MeshBasicMaterial({map:grd}),0,-150,200,{r:[-Math.PI/2,0,0]});
/* sokak lambaları: dönüşümlü (şaşırtmalı) dizilir; çoğu sodyum turuncusu, bir kısmı beyaz LED; lamba başı yola doğru uzanan kolun ucunda,
   ışığı yolun üstüne uzun, yumuşak bir leke olarak düşer (tek nokta bulutu + tek çizim çağrısı) */
{const dot=cTex(32,32,(x,w,h)=>{const g=x.createRadialGradient(16,16,1,16,16,16);g.addColorStop(0,'rgba(255,255,255,1)');g.addColorStop(.35,'rgba(255,255,255,.55)');g.addColorStop(1,'rgba(255,255,255,0)');x.fillStyle=g;x.fillRect(0,0,w,h)}),P=[],PC=[],Q2=[],QC=[],QA=[];
 const lamp=(x,z,tx,tz,ax)=>{const c=rnd()<.7?[2.4,1.6,.7]:[2,2,2.3];P.push(x,-143.5,z);PC.push(c[0],c[1],c[2]);Q2.push(tx,-149.85,tz);QC.push(c[0]*.5,c[1]*.45,c[2]*.45);QA.push(ax)};
 for(let k=-4;k<=4;k++)for(let z=10;z<430;z+=14){lamp(80*k-8.2,z,80*k-5.2,z,1);lamp(80*k+8.2,z+7,80*k+5.2,z+7,1)}
 for(let m=0;m<=4;m++)for(let x=-350;x<350;x+=14){const zc=40+80*m;lamp(x,zc-8.2,x,zc-5.2,0);lamp(x+7,zc+8.2,x+7,zc+5.2,0)}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(new Float32Array(P),3));g.setAttribute('color',new THREE.BufferAttribute(new Float32Array(PC),3));
 const bl=new THREE.Points(g,new THREE.PointsMaterial({size:2.2,map:dot,vertexColors:true,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,fog:false}));bl.frustumCulled=false;scene.add(bl);
 const n=QA.length,pools=new THREE.InstancedMesh(new THREE.PlaneGeometry(1,1).rotateX(-Math.PI/2),new THREE.MeshBasicMaterial({map:dot,color:0xffffff,transparent:true,opacity:.55,depthWrite:false,blending:THREE.AdditiveBlending,fog:false}),n),o=new THREE.Object3D(),cc=new THREE.Color();
 for(let i=0;i<n;i++){o.position.set(Q2[i*3],Q2[i*3+1],Q2[i*3+2]);QA[i]?o.scale.set(9,1,17):o.scale.set(17,1,9);o.updateMatrix();pools.setMatrixAt(i,o.matrix);cc.setRGB(QC[i*3],QC[i*3+1],QC[i*3+2]);pools.setColorAt(i,cc)}pools.frustumCulled=false;scene.add(pools)}
const cloudTs=[];
/* şehir trafiği: yollarda akan arabalar (üç çizim çağrısı: gövde, farlar, stop lambaları) */
const trafficAnim=(()=>{const cars=[],PAL=[0x1c2230,0x2a3140,0x5a1f2a,0x2b3f5a,0xb9bcc4,0x3a3a3a].map(c=>new THREE.Color(c));
 const mkc=(axis,fixed,lane,dir)=>{for(let i=0;i<6;i++)cars.push({axis,fx:fixed+lane,pos:rnd()*(axis?420:700),sp:(2.5+rnd()*3)*dir,dir,L:axis?420:700})};
 for(let k=-4;k<=4;k++){mkc(1,80*k,2.6,1);mkc(1,80*k,-2.6,-1)}for(let m=0;m<=4;m++){mkc(0,40+80*m,2.6,1);mkc(0,40+80*m,-2.6,-1)}
 const N=cars.length,body=new THREE.InstancedMesh(new THREE.BoxGeometry(2,1.2,4.4),new THREE.MeshBasicMaterial({color:0xffffff}),N),head=new THREE.InstancedMesh(new THREE.BoxGeometry(1.7,.5,.25),new THREE.MeshBasicMaterial({color:new THREE.Color(2.2,2,1.5),fog:false}),N),tail=new THREE.InstancedMesh(new THREE.BoxGeometry(1.7,.4,.25),new THREE.MeshBasicMaterial({color:new THREE.Color(2.4,.25,.2),fog:false}),N),o=new THREE.Object3D();
 [body,head,tail].forEach(m=>{m.frustumCulled=false;scene.add(m)});cars.forEach((c,i)=>body.setColorAt(i,PAL[i%6]));
 const place=(m,i,x,y,z,ry)=>{o.position.set(x,y,z);o.rotation.set(0,ry,0);o.updateMatrix();m.setMatrixAt(i,o.matrix)};
 const upd=dt=>{cars.forEach((c,i)=>{c.pos+=c.sp*dt;if(c.pos>c.L)c.pos-=c.L;else if(c.pos<0)c.pos+=c.L;const al=c.axis?10+c.pos:-350+c.pos,x=c.axis?c.fx:al,z=c.axis?al:c.fx,ry=c.axis?0:Math.PI/2,fx=c.axis?0:c.dir*2.3,fz=c.axis?c.dir*2.3:0;
  place(body,i,x,-149.3,z,ry);place(head,i,x+fx,-149.2,z+fz,ry);place(tail,i,x-fx,-149.2,z-fz,ry)});[body,head,tail].forEach(m=>m.instanceMatrix.needsUpdate=true)};upd(0);let acc=0;return dt=>{cloudTs.forEach((t,i)=>{t.offset.x+=dt*(.0012+i*.0006)});acc+=dt;if(acc<.066)return;upd(acc);acc=0}})();
/* ---------- ODA: modern, sıcak ve gerçekçi ışık ---------- */
const floorT=cTex(1024,1024,(x,w,h)=>{for(let i=0;i<10;i++){x.fillStyle=`hsl(28,${22+Math.random()*8}%,${30+Math.random()*7}%)`;x.fillRect(0,i*103,w,101);for(let j=0;j<60;j++){x.fillStyle=`rgba(40,22,10,${Math.random()*.1})`;x.fillRect(Math.random()*w,i*103+Math.random()*101,50+Math.random()*250,1.5)}x.fillStyle='#17100a';x.fillRect(0,i*103+101,w,2)}});floorT.wrapS=floorT.wrapT=THREE.RepeatWrapping;floorT.repeat.set(2,1.5);
add(new THREE.PlaneGeometry(W+WL,Z+ZB),new THREE.MeshStandardMaterial({map:floorT,normalMap:woodN,normalScale:new THREE.Vector2(.5,.5),roughness:.36,metalness:.05,envMapIntensity:.6}),CX,0,(Z-ZB)/2,{r:[-Math.PI/2,0,0]});
const wl=(w,h,c,x,y,z,ry)=>{const m=M(c,.95);m.normalMap=plasterN;m.normalScale.set(.35,.35);return add(new THREE.PlaneGeometry(w,h),m,x,y,z,{r:[0,ry,0]})};
wl(W+WL,H,0x77716a,CX,H/2,-ZB,0);wl(Z+ZB,H,0x5f5c5b,-WL,H/2,(Z-ZB)/2,Math.PI/2);wl(3.66+ZB,H,0x15161a,W,H/2,(3.66-ZB)/2,-Math.PI/2);wl(1.28,H-2.3,0x15161a,W,(H+2.3)/2,4.3,-Math.PI/2);add(new THREE.PlaneGeometry(W+WL,Z+ZB),M(0xc9c3ba,1),CX,H,(Z-ZB)/2,{r:[Math.PI/2,0,0]});
/* ön duvar: zemin-tavan cam, New York manzarası */
const fw=0x8d867d;BX(WL-5.6,H,.2,fw,-(WL+5.6)/2,H/2,Z,{cast:true});BX(1.4,H,.2,fw,6.3,H/2,Z,{cast:true});BX(11.2,.25,.2,fw,0,.125,Z,{cast:true});BX(11.2,H-3.35,.2,fw,0,(H+3.35)/2,Z,{cast:true});
add(new THREE.PlaneGeometry(11.2,3.1),new THREE.MeshBasicMaterial({color:0xcfe6ff,transparent:true,opacity:.035,depthWrite:false}),0,1.8,Z-.025,{r:[0,Math.PI,0],cast:false});
const steel=M(0x15161a,.35,.7);[-5.6,-2.8,0,2.8,5.6].forEach(x=>BX(.07,3.1,.14,steel,x,1.8,Z-.02,{cast:true}));
/* ahşap çıta duvar (sinema arkası) */
{const g=[];const ns=Math.floor((3.55+ZB)/.16);for(let i=0;i<ns;i++){const b=new THREE.BoxGeometry(.07,H-.1,.09);b.translate(W-.05,(H-.1)/2,-ZB+.05+i*.16);g.push(b)}const m=new THREE.Mesh(mergeGeometries(g),M(0x6e4f36,.7));scene.add(m)}
/* tavan: sıcak gizli LED + gömme spotlar */
[[W+WL-.5,.05,.1,CX,H-.06,-ZB+.35],[W+WL-.5,.05,.1,CX,H-.06,Z-.35],[.1,.05,Z+ZB-.7,-WL+.35,H-.06,(Z-ZB)/2],[.1,.05,Z+ZB-.7,W-.35,H-.06,(Z-ZB)/2]].forEach(a=>LED(...a,1.3));
{const m=new THREE.MeshStandardMaterial({color:0,emissive:0xffe0b8,emissiveIntensity:2});const g=[];for(let i=0;i<10;i++){const c=new THREE.CylinderGeometry(.08,.08,.02,14);c.translate(-7.6+(i%5)*3.6,H-.01,-2.4+Math.floor(i/5)*4.8);g.push(c)}scene.add(new THREE.Mesh(mergeGeometries(g),m))}
/* ışıklar: az sayıda, bilinçli */
lt(new THREE.HemisphereLight(0xaab8d6,0x3a322e,.22),.22);
const sun=lt(new THREE.SpotLight(0xff9a58,2.2,0,.5,.85,0),2.2);sun.position.set(-30,10,60);sun.target.position.set(0,0,-2);scene.add(sun.target);
if(SH){sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);sun.shadow.radius=3;sun.shadow.camera.near=40;sun.shadow.camera.far=120;sun.shadow.bias=-.0004;
 if(HI){const wlight=lt(new THREE.RectAreaLight(0xffb48a,2.2,11,3),2.2);wlight.position.set(0,1.8,Z-.1);wlight.lookAt(0,1.8,0)}}


if(!LOW){const sp1=lt(new THREE.SpotLight(0xffc98a,9,9,.6,.9,1.6),9);sp1.position.set(-5.6+LX,H-.1,-4.4);sp1.target.position.set(-5.6+LX,.5,-4.9);sp1.castShadow=HI;sp1.shadow.mapSize.set(1024,1024);sp1.shadow.radius=5;sp1.shadow.bias=-.0005;scene.add(sp1.target);
 const sp2=lt(new THREE.SpotLight(0xffd2a0,8,9,.7,.95,1.6),8);sp2.position.set(4.4,H-.1,-.3);sp2.target.position.set(4.6,0,-.3);sp2.castShadow=HI;sp2.shadow.mapSize.set(1024,1024);sp2.shadow.radius=5;sp2.shadow.bias=-.0005;scene.add(sp2.target)}
/* halı + temas gölgeleri */
const blobT=cTex(128,128,(x,w,h)=>{const g=x.createRadialGradient(64,64,10,64,64,64);g.addColorStop(0,'rgba(0,0,0,.55)');g.addColorStop(1,'rgba(0,0,0,0)');x.fillStyle=g;x.fillRect(0,0,w,h)});
const blob=(x,z,w,d)=>add(new THREE.PlaneGeometry(w,d),new THREE.MeshBasicMaterial({map:blobT,transparent:true,depthWrite:false,fog:false}),x,.034,z,{r:[-Math.PI/2,0,0]});
const rugT=cTex(1024,768,(x,w,h)=>{x.fillStyle='#22303a';x.fillRect(0,0,w,h);x.strokeStyle='#7a5e3c';x.lineWidth=14;x.strokeRect(30,30,w-60,h-60);x.strokeStyle='#3e5563';x.lineWidth=6;x.strokeRect(70,70,w-140,h-140);for(let i=0;i<14;i++){x.fillStyle=i%2?'#2c3d48':'#283844';x.fillRect(100+i*59,110,40,40);x.fillRect(100+i*59,h-150,40,40)}x.fillStyle='#2f4350';x.beginPath();x.ellipse(w/2,h/2,230,150,0,0,7);x.fill();x.strokeStyle='#8a6c46';x.lineWidth=5;x.beginPath();x.ellipse(w/2,h/2,190,120,0,0,7);x.stroke();for(let i=0;i<3000;i++){x.fillStyle=`rgba(255,255,255,${Math.random()*.02})`;x.fillRect(Math.random()*w,Math.random()*h,2,2)}});
add(new THREE.PlaneGeometry(4.4,3.3),new THREE.MeshStandardMaterial({map:rugT,roughness:1}),4.7,.022,-.3,{r:[-Math.PI/2,0,Math.PI/2]});
const BX0=-5.6+LX,NX0=-3.9+LX;
/* ---- yatak (arka sol) ---- */
blob(BX0,-5.05,3.6,3.6);
RB(2.14,.3,2.3,0x3a2f28,BX0,.2,-5.05,.04,{rough:.6});RB(2.36,1.35,.12,0x3d4350,BX0,.95,-6.17,.05,{rough:.9});[-.7,-.35,0,.35,.7].forEach(x=>RB(.3,1.15,.04,0x495060,BX0+x,.95,-6.1,.03,{rough:1}));LED(2.1,.025,.025,BX0,1.66,-6.1,1.0,0xffc98a);
RB(2.04,.24,2.2,0xf3efe8,BX0,.47,-5.05,.09,{rough:1});RB(2.08,.12,1.55,0x39506d,BX0,.63,-4.3,.05,{rough:1});RB(2.1,.06,.55,0xe8e2d6,BX0,.68,-5.08,.03,{rough:1});RB(2.1,.05,.42,0xb98a4a,BX0,.69,-3.7,.02,{rough:1});
[-.5,.5].forEach(dx=>RB(.78,.16,.46,0xfbf8f2,BX0+dx,.66,-5.8,.07,{rough:1,r:[.35,0,0]}));[-.6,.6].forEach((dx,i)=>RB(.4,.14,.3,i?0xd9a441:0x7da0c8,BX0+dx,.73,-5.45,.05,{rough:1,r:[.4,0,i?.2:-.2]}));
RB(1.7,.1,.42,0x6e4f36,BX0,.46,-3.45,.03,{rough:.6});RB(1.66,.08,.4,0xc8b89a,BX0,.55,-3.45,.04,{rough:1});[-.75,.75].forEach(dx=>RB(.06,.42,.36,0x3a2f28,BX0+dx,.21,-3.45,.01));
/* komodin + lamba + telefon */
RB(.6,.55,.5,0x6f4a30,NX0,.28,-5.9,.04);add(new THREE.CylinderGeometry(.05,.08,.3,12),M(0xd9b98a,.4,.5),NX0,.7,-5.9);
const shade=add(new THREE.CylinderGeometry(.13,.19,.22,20,1,true),new THREE.MeshStandardMaterial({color:0xffd9a0,emissive:0xffb35a,emissiveIntensity:1.5,side:THREE.DoubleSide}),NX0,.98,-5.9);
const lamp=lt(new THREE.PointLight(0xff9e4a,2.4,6),2.4);lamp.position.set(NX0,.98,-5.9);
const phM=new THREE.MeshStandardMaterial({color:0x0e0e14,emissive:0x4a7bff,emissiveIntensity:1,roughness:.3});RB(.09,.012,.19,0x15151c,NX0+.15,.565,-5.75,.01);add(new THREE.PlaneGeometry(.08,.17),phM,NX0+.15,.573,-5.75,{r:[-Math.PI/2,0,0]});
/* neon tabela (yatak başı) */
const neon=cTex(1024,256,(x,w,h)=>{x.fillStyle='#000';x.fillRect(0,0,w,h);x.shadowColor='#ff7ac8';x.shadowBlur=26;x.fillStyle='#ffd6ef';x.font='700 150px system-ui';x.textAlign='center';x.fillText('berat',w/2,175)});
add(new THREE.PlaneGeometry(2.2,.55),new THREE.MeshBasicMaterial({map:neon,transparent:true,blending:THREE.AdditiveBlending,fog:false}),BX0,2.95,-ZB+.03);
/* ---- FOTOĞRAF DUVARI (arka duvar, büyük) ---- */
const pickP=[],gPh=[];const px=CX,py=2.35;
{const P=D.photos,N=P.length,cols=Math.max(5,Math.round(N/2)),areaW=10.2,gap=.42,gv=.36,top=4.0,bot=.75,colW=(areaW-gap*(cols-1))/cols;
 RB(areaW+.3,top-bot+.7,.05,0x3a2c22,px,(top+bot)/2,-ZB+.03,.02,{rough:.95});
 {const pw=areaW+.3,ph=top-bot+.7,pcy=(top+bot)/2;
  /* ceviz çıta panel: zeminle aynı sıcak ahşap, odayla bütünleşir */
  const slat=cTex(1024,256,(x,w,h)=>{x.fillStyle='#2b1f17';x.fillRect(0,0,w,h);for(let i=0;i<w/12;i++){const v=34+Math.random()*26;x.fillStyle=`rgb(${v+44},${v+22},${v})`;x.fillRect(i*12+1,0,10,h);for(let k=0;k<26;k++){x.fillStyle=`rgba(0,0,0,${Math.random()*.16})`;x.fillRect(i*12+1+Math.random()*10,Math.random()*h,1,10+Math.random()*50)}}});
  add(new THREE.PlaneGeometry(pw,ph),new THREE.MeshStandardMaterial({map:slat,roughness:.55,metalness:.05}),px,pcy,-ZB+.057,{cast:false});
  /* pirinç kenar profili */
  [[pw+.06,.03,px,pcy+ph/2],[pw+.06,.03,px,pcy-ph/2]].forEach(a=>add(new THREE.BoxGeometry(a[0],a[1],.04),M(0xb8955a,.3,.9),a[2],a[3],-ZB+.07,{cast:false}));
  [-1,1].forEach(sd=>add(new THREE.BoxGeometry(.03,ph,.04),M(0xb8955a,.3,.9),px+sd*(pw/2+.015),pcy,-ZB+.07,{cast:false}));
  /* alttan sıcak LED sızıntısı: panel duvardan süzülüyormuş gibi */
  LED(pw-.1,.025,.03,px,pcy-ph/2+.07,-ZB+.09,1.8,0xffc27a);
  const up=cTex(8,64,(x,w,h)=>{const g=x.createLinearGradient(0,h,0,0);g.addColorStop(0,'rgba(255,196,120,.7)');g.addColorStop(1,'rgba(255,196,120,0)');x.fillStyle=g;x.fillRect(0,0,w,h)});
  add(new THREE.PlaneGeometry(pw,.9),new THREE.MeshBasicMaterial({map:up,transparent:true,blending:THREE.AdditiveBlending,depthWrite:false,fog:false,opacity:.55}),px,pcy-ph/2+.5,-ZB+.075,{cast:false})}
 const TRL=document.documentElement.lang==='tr';
 
 add(new THREE.BoxGeometry(areaW,.012,.03),M(0xb8955a,.3,.9),px,.022,-ZB+1.5,{cast:false});
 add(new THREE.BoxGeometry(areaW+.4,.04,.07),M(0x1a1a1e,.4,.6),px,H-.1,-ZB+.9,{cast:false});
 const wash=cTex(128,256,(x,w,h)=>{const g=x.createRadialGradient(64,0,4,64,40,210);g.addColorStop(0,'rgba(255,214,160,.5)');g.addColorStop(1,'rgba(255,214,160,0)');x.fillStyle=g;x.fillRect(0,0,w,h)});
 const C=[...Array(cols)].map(()=>[]);P.forEach((a,i)=>C[i%cols].push(i));
 C.forEach((ids,c)=>{if(!ids.length)return;const cx=px-areaW/2+colW/2+c*(colW+gap),inv=ids.reduce((s2,i)=>s2+P[i][2]/P[i][1],0),w=Math.min(colW,(top-bot-gv*(ids.length-1))/inv),tot=ids.reduce((s2,i)=>s2+w*P[i][2]/P[i][1],0)+gv*(ids.length-1);let y=(top+bot)/2+tot/2;
  {const hy=H-.28,ty=(top+bot)/2,dy=hy-ty,dz=.8,ph=Math.atan2(dz,dy),L=Math.hypot(dy,dz);add(new THREE.CylinderGeometry(.045,.06,.18,10),M(0x1a1a1e,.4,.6),cx,hy,-ZB+.9,{r:[ph,0,0],cast:false});add(new THREE.ConeGeometry(.6,L,24,1,true),new THREE.MeshBasicMaterial({color:0xffe4b8,transparent:true,opacity:.05,blending:THREE.AdditiveBlending,depthWrite:false,fog:false,side:THREE.DoubleSide}),cx,(hy+ty)/2,-ZB+.5,{r:[ph,0,0],cast:false})}add(new THREE.PlaneGeometry(w*1.3,1.1),new THREE.MeshBasicMaterial({map:wash,transparent:true,blending:THREE.AdditiveBlending,depthWrite:false,fog:false,opacity:.3}),cx,y-.45,-ZB+.065,{cast:false});
  ids.forEach(i=>{const a=P[i],h=w*a[2]/a[1],cy=y-h/2;y-=h+gv;const g=new THREE.Group();g.position.set(cx,cy,-ZB+.11);
   add(new RoundedBoxGeometry(w+.16,h+.16,.045,2,.008),M(0x16171b,.45,.4),0,0,0,{p:g});const mt=new THREE.Mesh(new THREE.PlaneGeometry(w+.1,h+.1),M(0xf7f2e8,.9));mt.position.z=.024;g.add(mt);
   const im=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({map:tex(a[0]),color:0xd8d8d8}));im.position.z=.026;im.userData={i};g.add(im);pickP.push(im);
   const sh=new THREE.Mesh(new THREE.PlaneGeometry(w+.6,h+.6),new THREE.MeshBasicMaterial({map:blobT,transparent:true,depthWrite:false,fog:false}));sh.position.set(cx+.05,cy-.08,-ZB+.06);scene.add(sh);
   g.userData={base:-ZB+.11};scene.add(g);gPh[i]={g,sh,pop:0}})})}
/* ---- HAKKIMDA DUVARLARI (sol duvar) ---- */
const wrap=(x,t,X,Y,mw,lh)=>{let l='';for(const w of t.split(' ')){const tt=l+w+' ';if(x.measureText(tt).width>mw&&l){x.fillText(l,X,Y);l=w+' ';Y+=lh}else l=tt}x.fillText(l,X,Y);return Y+lh};
const bar=(x,w,c1,c2)=>{const g=x.createLinearGradient(0,0,w,0);g.addColorStop(0,c1);g.addColorStop(1,c2);x.fillStyle=g;x.fillRect(0,0,w,14)};
const pImg=new Image();pImg.src='../assets/img/portrait.jpg';const PW=HI?2048:1536,PH=Math.round(PW*1480/2048),paint=fn=>(x,w)=>{x.save();x.scale(w/2048,w/2048);fn(x,2048,1480);x.restore()};
const hudBase=(x,w,h,tag,id)=>{x.clearRect(0,0,w,h);x.fillStyle='rgba(9,15,28,.93)';x.fillRect(0,0,w,h);{const bg=x.createLinearGradient(0,0,w,h);bg.addColorStop(0,'rgba(40,70,120,.22)');bg.addColorStop(.55,'rgba(0,0,0,0)');bg.addColorStop(1,'rgba(255,150,70,.10)');x.fillStyle=bg;x.fillRect(0,0,w,h)}x.strokeStyle='rgba(127,228,255,.055)';x.lineWidth=1;for(let i=0;i<w;i+=64){x.beginPath();x.moveTo(i,0);x.lineTo(i,h);x.stroke()}for(let j=0;j<h;j+=64){x.beginPath();x.moveTo(0,j);x.lineTo(w,j);x.stroke()}
 x.strokeStyle='#7fe4ff';x.lineWidth=6;[[40,40,1,1],[w-40,40,-1,1],[40,h-40,1,-1],[w-40,h-40,-1,-1]].forEach(([a,b,sx,sy])=>{x.beginPath();x.moveTo(a,b+70*sy);x.lineTo(a,b);x.lineTo(a+70*sx,b);x.stroke()});
 const g=x.createLinearGradient(0,0,w,0);g.addColorStop(0,'#ffb25a');g.addColorStop(1,'#7fe4ff');x.fillStyle=g;x.fillRect(90,70,260,6);x.font='600 30px ui-monospace,monospace';x.fillStyle='#7fe4ff';x.fillText(tag,90,130);x.textAlign='right';x.fillStyle='#5f7a96';x.fillText(id,w-90,130);x.textAlign='left'};
const scan=(x,w,h)=>{x.fillStyle='rgba(255,255,255,.022)';for(let j=0;j<h;j+=4)x.fillRect(0,j,w,1);const v=x.createRadialGradient(w/2,h/2,h*.35,w/2,h/2,w*.62);v.addColorStop(0,'rgba(255,240,220,.05)');v.addColorStop(1,'rgba(0,0,0,.38)');x.fillStyle=v;x.fillRect(0,0,w,h)};
const drawA=(x,w,h)=>{hudBase(x,w,h,CV.tag,'ID // 20261129005');
 const fx=90,fy=180,fw=440,fh=550;x.save();x.beginPath();x.roundRect(fx,fy,fw,fh,24);x.clip();if(pImg.complete&&pImg.naturalWidth)x.drawImage(pImg,fx,fy,fw,fh);else{x.fillStyle='#101826';x.fillRect(fx,fy,fw,fh)}const pg=x.createLinearGradient(0,fy,0,fy+fh);pg.addColorStop(.6,'rgba(5,9,17,0)');pg.addColorStop(1,'rgba(5,9,17,.75)');x.fillStyle=pg;x.fillRect(fx,fy,fw,fh);x.restore();
 x.strokeStyle='#ffb25a';x.lineWidth=4;x.beginPath();x.roundRect(fx,fy,fw,fh,24);x.stroke();x.fillStyle='#ffb25a';x.font='700 26px ui-monospace,monospace';x.fillText('● ONLINE',fx+24,fy+fh-28);
 x.fillStyle='#fff';x.font='800 150px system-ui';x.fillText(CV.name,590,320);x.fillStyle='#ffb25a';x.font='600 44px system-ui';x.fillText(CV.sub,594,392);
 CV.stats.forEach((st,i)=>{const tx=594+i*345,ty=450,tw=320,th=200;x.fillStyle='rgba(127,228,255,.07)';x.beginPath();x.roundRect(tx,ty,tw,th,22);x.fill();x.strokeStyle='rgba(127,228,255,.35)';x.lineWidth=2;x.stroke();x.fillStyle='#fff';x.font='800 84px system-ui';x.fillText(st[0],tx+28,ty+110);x.fillStyle='#9fb5cc';x.font='500 30px system-ui';x.fillText(st[1],tx+28,ty+165)});
 x.fillStyle='#7fe4ff';x.font='600 30px ui-monospace,monospace';x.fillText(CV.bioT,90,820);x.fillStyle='#dfe8f5';x.font='400 30px system-ui';let y=880;CV.bio.slice(0,2).forEach(pp=>{y=wrap(x,pp,90,y,960,43)+14});
 x.fillStyle='#7fe4ff';x.font='600 30px ui-monospace,monospace';x.fillText(CV.skillsT,1130,820);
 CV.skills.forEach((sk,i)=>{const cx=1230+(i%3)*290,cy=930+Math.floor(i/3)*240,r=78;x.lineWidth=16;x.strokeStyle='rgba(255,255,255,.08)';x.beginPath();x.arc(cx,cy,r,0,Math.PI*2);x.stroke();const gg=x.createLinearGradient(cx-r,cy,cx+r,cy);gg.addColorStop(0,'#ffb25a');gg.addColorStop(1,'#7fe4ff');x.strokeStyle=gg;x.lineCap='round';x.beginPath();x.arc(cx,cy,r,-Math.PI/2,-Math.PI/2+Math.PI*2*sk[1]/100);x.stroke();x.lineCap='butt';x.fillStyle='#fff';x.font='800 40px system-ui';x.textAlign='center';x.fillText(sk[1]+'%',cx,cy+14);x.fillStyle='#b9c8da';x.font='600 28px system-ui';x.fillText(sk[0],cx,cy+r+48);x.textAlign='left'});
 const ry=1385;x.strokeStyle='rgba(255,178,90,.5)';x.lineWidth=3;x.beginPath();x.moveTo(90,ry);x.lineTo(w-90,ry);x.stroke();CV.road.forEach((st,i)=>{const rx=90+i*620;x.fillStyle='#ffb25a';x.beginPath();x.arc(rx+12,ry,12,0,7);x.fill();x.fillStyle='#fff';x.font='700 32px system-ui';x.fillText(st[0],rx+40,ry-14);x.fillStyle='#9fb5cc';x.font='400 28px system-ui';x.fillText(st[1],rx+40,ry+36)});scan(x,w,h)};
const COLS=['#ff9a6b','#6fd6f5','#b79cff','#62d9a6','#f2cf6b','#f07fa0','#79a8f2','#f5a65a','#52cbbd','#c28bf0'];
const drawB=(x,w,h)=>{hudBase(x,w,h,CV.schT,'TIMETABLE // v2');x.fillStyle='#fff';x.font='800 110px system-ui';x.fillText(CV.week,90,270);
 const gx=270,gy=330,cw=(w-90-gx)/5,rh=112;
 CV.days.forEach((d,i)=>{x.fillStyle='rgba(127,228,255,.08)';x.beginPath();x.roundRect(gx+i*cw+6,gy,cw-12,56,14);x.fill();x.fillStyle='#7fe4ff';x.font='700 32px system-ui';x.textAlign='center';x.fillText(d,gx+i*cw+cw/2,gy+39);x.textAlign='left'});
 for(let r=0;r<9;r++){const y=gy+72+r*rh;x.fillStyle='#5f7a96';x.font='500 28px ui-monospace,monospace';x.fillText(`${String(8+r).padStart(2,'0')}:30`,90,y+38);x.strokeStyle='rgba(255,255,255,.06)';x.lineWidth=1;x.beginPath();x.moveTo(gx,y);x.lineTo(w-90,y);x.stroke();if(r===4){x.fillStyle='rgba(255,255,255,.03)';x.fillRect(gx,y,w-90-gx,rh);x.fillStyle='#5f7a96';x.font='500 26px system-ui';x.textAlign='center';x.fillText(CV.lunch,gx+(w-90-gx)/2,y+66);x.textAlign='left'}}
 const codes=[];CV.sched.forEach(sc=>{const di=CV.days.indexOf(sc[0]);if(di<0)return;const tt=sc[1].split('-'),r0=parseInt(tt[0])-8,r1=parseInt(tt[1])-8-1;let ci=codes.indexOf(sc[2]);if(ci<0){codes.push(sc[2]);ci=codes.length-1}const col=COLS[ci%COLS.length];
  const bx=gx+di*cw+8,by=gy+72+r0*rh+6,bw=cw-16,bh=(r1-r0+1)*rh-12;x.fillStyle=col+'2a';x.beginPath();x.roundRect(bx,by,bw,bh,16);x.fill();x.fillStyle=col;x.fillRect(bx,by+10,6,bh-20);x.strokeStyle=col+'88';x.lineWidth=2;x.beginPath();x.roundRect(bx,by,bw,bh,16);x.stroke();
  x.fillStyle=col;x.font='700 28px ui-monospace,monospace';x.fillText(sc[2],bx+22,by+42);x.fillStyle='#fff';x.font='600 30px system-ui';let yy=wrap(x,sc[3],bx+22,by+84,bw-36,36);if(yy<by+bh-10){x.fillStyle='#9fb5cc';x.font='500 24px system-ui';x.fillText(`${sc[1]} · ${sc[4]}`,bx+22,Math.min(yy+4,by+bh-18))}});scan(x,w,h)};
const cvA=cTex(PW,PH,paint(drawA)),cvB=cTex(PW,PH,paint(drawB));pImg.onload=()=>{paint(drawA)(cvA.image.getContext('2d'),PW);cvA.needsUpdate=true};
const glowT=cTex(256,256,(x,w,h)=>{const g=x.createRadialGradient(128,128,10,128,128,128);g.addColorStop(0,'rgba(150,200,255,.12)');g.addColorStop(1,'rgba(150,200,255,0)');x.fillStyle=g;x.fillRect(0,0,w,h)});
const sweepT=cTex(8,256,(x,w,h)=>{const g=x.createLinearGradient(0,0,0,h);g.addColorStop(0,'rgba(127,228,255,0)');g.addColorStop(.5,'rgba(127,228,255,.5)');g.addColorStop(1,'rgba(127,228,255,0)');x.fillStyle=g;x.fillRect(0,0,w,h)});sweepT.wrapT=THREE.RepeatWrapping;sweepT.repeat.set(1,.18);
const wallGlow=cTex(256,256,(x,w,h)=>{const g=x.createRadialGradient(128,128,20,128,128,128);g.addColorStop(0,'rgba(170,210,255,.30)');g.addColorStop(.6,'rgba(150,190,255,.10)');g.addColorStop(1,'rgba(150,190,255,0)');x.fillStyle=g;x.fillRect(0,0,w,h)});
const floorGlow=cTex(256,256,(x,w,h)=>{const g=x.createRadialGradient(128,128,10,128,128,128);g.addColorStop(0,'rgba(150,195,255,.20)');g.addColorStop(1,'rgba(150,195,255,0)');x.fillStyle=g;x.fillRect(0,0,w,h)});
const projM=[];
[[cvA,-1.95],[cvB,2.4]].forEach(([t,z])=>{
 add(new THREE.PlaneGeometry(6.6,4.4),new THREE.MeshBasicMaterial({map:wallGlow,transparent:true,blending:THREE.AdditiveBlending,depthWrite:false,fog:false}),-WL+.05,2.2,z,{r:[0,Math.PI/2,0]});
 add(new THREE.PlaneGeometry(4.6,3.4),new THREE.MeshBasicMaterial({map:floorGlow,transparent:true,blending:THREE.AdditiveBlending,depthWrite:false,fog:false}),-WL+1.7,.02,z,{r:[-Math.PI/2,0,0],cast:false});
 if(HI)lt(new THREE.PointLight(0x9cc4ff,1.5,7),1.5).position.set(-WL+1.5,2.0,z);
 const pm=new THREE.MeshBasicMaterial({map:t,transparent:true,color:new THREE.Color(1.12,1.12,1.18),fog:false,depthWrite:false});projM.push(pm);add(new THREE.PlaneGeometry(4.1,2.97),pm,-WL+.08,2.2,z,{r:[0,Math.PI/2,0]});
 add(new THREE.PlaneGeometry(4.1,2.97),new THREE.MeshBasicMaterial({map:sweepT,transparent:true,blending:THREE.AdditiveBlending,depthWrite:false,fog:false,opacity:.14}),-WL+.09,2.2,z,{r:[0,Math.PI/2,0]});
 const pv=V(-2.2+LX,H-.24,z),tg=V(-WL+.1,2.2,z),dir=tg.clone().sub(pv),L=dir.length();dir.normalize();
 RB(.52,.18,.4,0x1c1d22,pv.x,pv.y,pv.z,.05,{rough:.35,m:.3});add(new THREE.CylinderGeometry(.07,.08,.08,20),M(0x0a0a0c,.15,.9),pv.x-.29,pv.y,pv.z,{r:[0,0,Math.PI/2]});add(new THREE.CircleGeometry(.055,20),new THREE.MeshBasicMaterial({color:0xcfe8ff}),pv.x-.335,pv.y,pv.z,{r:[0,-Math.PI/2,0]});add(new THREE.CylinderGeometry(.012,.012,.2,6),M(0x333333),pv.x,H-.1,pv.z);
 const cone=new THREE.Mesh(new THREE.ConeGeometry(1.75,L,40,1,true),new THREE.MeshBasicMaterial({color:0xcfe0ff,transparent:true,opacity:.028,depthWrite:false,blending:THREE.AdditiveBlending,side:THREE.DoubleSide,fog:false}));cone.position.copy(pv).addScaledVector(dir,L/2);cone.quaternion.setFromUnitVectors(V(0,-1,0),dir);scene.add(cone)});
/* ---- SİNEMA (sağ duvar) ---- */
const sc=document.createElement('canvas');sc.width=1280;sc.height=720;const sx=sc.getContext('2d'),sT=new THREE.CanvasTexture(sc);sT.colorSpace=THREE.SRGBColorSpace;
RB(.12,3.7,6.5,0x050608,W-.1,1.95,-.3,.05,{rough:.3});add(new THREE.PlaneGeometry(6.2,3.49),new THREE.MeshBasicMaterial({map:sT,color:new THREE.Color(1.45,1.45,1.45)}),W-.17,1.95,-.3,{r:[0,-Math.PI/2,0]});
const cinM=[];[1.88,-1.88].forEach(dy=>cinM.push(LED(.05,.05,6.5,W-.18,1.95+dy,-.3,1.4,0xbcd0ff)));[3.26,-3.26].forEach(dz=>cinM.push(LED(.05,3.7,.05,W-.18,1.95,-.3+dz,1.4,0xbcd0ff)));
[-3.9,3.3].forEach(z=>{RB(.4,2.4,.5,0x0c0d10,W-.4,1.4,z,.05);[1.9,1.15].forEach(y=>add(new THREE.CylinderGeometry(.15,.15,.05,20),M(0x222222,.4,.6),W-.67,y,z,{r:[0,0,Math.PI/2]}))});
const scL=lt(new THREE.PointLight(0xcfe0ff,2,9),2);scL.position.set(W-1.4,1.9,-.3);
const ambC=new THREE.Color(0xbcd0ff),ambT=new THREE.Color(0xbcd0ff),WHT=new THREE.Color(1,1,1),ac8=document.createElement('canvas');ac8.width=ac8.height=8;const ax8=ac8.getContext('2d',{willReadFrequently:true});
function ambOf(im){try{ax8.drawImage(im,0,0,8,8);const d=ax8.getImageData(0,0,8,8).data;let r=0,g=0,b=0;for(let i=0;i<d.length;i+=4){r+=d[i];g+=d[i+1];b+=d[i+2]}ambT.setRGB(r/64/255,g/64/255,b/64/255,THREE.SRGBColorSpace);const o={};ambT.getHSL(o);ambT.setHSL(o.h,Math.min(1,o.s*1.5+.15),.55)}catch(e){}}
const PJ=D.proj;let si=0;const pim=PJ.map(p=>{const i=new Image();i.src='../assets/img/projects/'+p[0]+'.jpg';i.onload=()=>{if(pim[si]===i)drawS()};return i});
const scache=[],samb=[];function drawS(){if(scache[si]){sx.drawImage(scache[si],0,0);ambT.copy(samb[si]);sT.needsUpdate=true;return}sx.fillStyle='#000';sx.fillRect(0,0,1280,720);const im=pim[si];if(im.complete&&im.naturalWidth){sx.save();sx.filter='blur(30px) brightness(.7)';const s=Math.max(1280/im.naturalWidth,720/im.naturalHeight);sx.drawImage(im,(1280-im.naturalWidth*s)/2,(720-im.naturalHeight*s)/2,im.naturalWidth*s,im.naturalHeight*s);sx.restore();const k=Math.min(640/im.naturalHeight,1180/im.naturalWidth),w=im.naturalWidth*k,h=im.naturalHeight*k;sx.shadowColor='#000';sx.shadowBlur=36;sx.drawImage(im,(1280-w)/2,(720-h)/2-12,w,h);sx.shadowBlur=0;ambOf(im)}
 sx.fillStyle='#fff';sx.font='600 30px system-ui';sx.textAlign='center';sx.fillText(`${si+1} / ${PJ.length} · ${PJ[si][1]}`,640,706);if(im.complete&&im.naturalWidth){const c=document.createElement('canvas');c.width=1280;c.height=720;c.getContext('2d').drawImage(sc,0,0);scache[si]=c;samb[si]=ambT.clone()}sT.needsUpdate=true}drawS();setInterval(()=>{if(seat)next(1)},6000);
/* koltuk + sehpa */
blob(3.2,-.3,2.4,4.6);RB(1.3,.45,3.8,0x2e3440,3.2,.25,-.3,.12,{rough:1});RB(.4,.95,3.8,0x2e3440,2.55,.62,-.3,.12,{rough:1});[-2.1,1.5].forEach(z=>RB(1.3,.7,.35,0x2a2f3a,3.2,.38,z,.1,{rough:1}));[-1.4,-.3,.8].forEach(z=>RB(.9,.2,1.0,0x3b4352,3.35,.55,z,.1,{rough:1}));
RB(.9,.35,1.6,0x16181d,5.2,.2,-.3,.04,{rough:.3,m:.4});add(new THREE.BoxGeometry(.9,.03,1.6),new THREE.MeshPhysicalMaterial({color:0x9fd4ff,transparent:true,opacity:.35,roughness:.05}),5.2,.38,-.3);
RB(.9,.5,.9,0x3b4352,3.6,.28,-3.5,.15,{rough:1});RB(.9,.5,.9,0x3b4352,3.6,.28,2.9,.15,{rough:1});
/* ---- çalışma masası (pencere önü) + laptop ---- */
blob(-3.7,4.0,3.8,1.7);RB(3.4,.07,.95,0xb98d5f,-3.7,.76,4.1,.02,{rough:.45});[-5.3,-2.1].forEach(x=>RB(.06,.74,.8,0x1c1c22,x,.37,4.1,.01));
const blC=document.createElement('canvas');blC.width=1024;blC.height=576;const blX=blC.getContext('2d'),blT=new THREE.CanvasTexture(blC);blT.colorSpace=THREE.SRGBColorSpace;blT.anisotropy=4;
RB(1.9,1.12,.04,0x111216,-4.4,1.38,4.36,.02,{rough:.3});add(new THREE.PlaneGeometry(1.82,1.024),new THREE.MeshBasicMaterial({map:blT,color:new THREE.Color(1.25,1.25,1.25)}),-4.4,1.38,4.337,{r:[0,Math.PI,0]});RB(.08,.36,.08,0x2a2b30,-4.4,.95,4.42,.02,{m:.6,rough:.3});RB(.34,.02,.22,0x2a2b30,-4.4,.79,4.4,.01,{m:.6,rough:.3});
const drawBlog=el=>{const x=blX;x.fillStyle='#0d1220';x.fillRect(0,0,1024,576);x.fillStyle='#161d30';x.fillRect(0,0,1024,44);['#ff5f57','#febc2e','#28c840'].forEach((c,i)=>{x.fillStyle=c;x.beginPath();x.arc(24+i*22,22,7,0,7);x.fill()});x.fillStyle='#0a0e18';x.fillRect(110,10,520,24);x.fillStyle='#7f93b0';x.font='16px monospace';x.fillText('berat.dev/blog',124,27);
 x.fillStyle='#fff';x.font='700 40px system-ui';x.fillText('Blog',40,104);x.fillStyle='#ffb25a';x.fillRect(40,118,70,5);
 D.blogT.forEach((tt,i)=>{const y=150+i*136;x.fillStyle='#141b2c';x.beginPath();x.roundRect(40,y,600,116,14);x.fill();x.fillStyle=`hsl(${[200,30,280][i%3]},70%,55%)`;x.beginPath();x.roundRect(54,y+14,140,88,10);x.fill();x.fillStyle='#fff';x.font='600 24px system-ui';x.fillText(tt,212,y+48);x.fillStyle='#7f93b0';x.font='16px system-ui';x.fillText('5 min · IT',212,y+80)});
 x.fillStyle='#0a0e18';x.fillRect(670,64,320,480);x.font='17px monospace';['<article>','  <h2>Git</h2>','  <img alt="terminal">','  <p>git init …</p>','</article>','','.post {','  display: grid;','  gap: 1rem;','}'].forEach((l,i)=>{x.fillStyle=i<5?'#7dffb0':'#9ecbff';x.fillText(l,686,100+i*28)});
 if(Math.floor(el*2)%2){x.fillStyle='#ffb25a';x.fillRect(686,362,10,22)}blT.needsUpdate=true};drawBlog(0);
RB(.66,.022,.46,0xb7bac2,-2.9,.81,3.95,.006,{rough:.25,m:1});const lid=RB(.66,.42,.016,0x25272e,-2.9,1.02,4.17,.006);lid.rotation.x=.22;
const lc=cTex(512,320,(x,w,h)=>{x.fillStyle='#0b1018';x.fillRect(0,0,w,h);x.fillStyle='#7dffb0';x.font='22px monospace';['$ git add .','$ git commit -m "yeni yazı"','[main 3f9a1c] yeni yazı','$ git push','✔ blog güncellendi'].forEach((l,i)=>x.fillText(l,20,48+i*46))});
const ls=add(new THREE.PlaneGeometry(.6,.37),new THREE.MeshBasicMaterial({map:lc,color:0xe0e0e0}),-2.9,1.02,4.162);ls.rotation.order='YXZ';ls.rotation.set(-.22,Math.PI,0);
RB(.5,.02,.16,0x1e1f24,-4.4,.8,3.85,.008,{rough:.5});add(new THREE.CylinderGeometry(.045,.04,.1,14),M(0xf6f1e8,.3),-4.95,.84,3.9);RB(.12,.02,.07,0x1e1f24,-3.9,.8,3.85,.01);
RB(.58,.09,.56,0x2b3140,-3.7,.52,3.0,.06,{rough:.8});RB(.58,.7,.08,0x2b3140,-3.7,.95,2.7,.06,{rough:.8});add(new THREE.CylinderGeometry(.035,.035,.45,10),M(0x444444,.3,.8),-3.7,.27,3.0);add(new THREE.CylinderGeometry(.32,.32,.03,5),M(0x222222,.4,.7),-3.7,.04,3.0);
const plant=(x,z,s=1)=>{add(new THREE.CylinderGeometry(.28*s,.22*s,.5*s,18),M(0xe8e2d8,.5),x,.25*s,z);for(let i=0;i<9;i++){const l=add(new THREE.SphereGeometry(.17*s,10,8),M(0x3f8f50,.6),x+Math.cos(i*.9)*.22*s,(.8+(i%4)*.22)*s,z+Math.sin(i*.9)*.22*s);l.scale.set(.5,1.7,.3);l.rotation.z=Math.cos(i)*.5}};plant(6.4,-ZB+.7,1.3);
/* ---- KAYDIRAK: gökdelenden denize ---- */
const slide=new THREE.CatmullRomCurve3([V(4.15,.95,8.3),V(4.15,.9,9.7),V(3.8,-1,12.4),V(2,-7,15.5),V(.5,-16,18),V(0,-27,19.5),V(1,-36,Z+15)]);
add(new THREE.TubeGeometry(slide,120,.5,16,false),new THREE.MeshStandardMaterial({color:0x2fb4ff,transparent:true,opacity:.6,roughness:.4,envMapIntensity:0,side:THREE.DoubleSide,depthWrite:false,emissive:0x0a5a9a,emissiveIntensity:.5}),0,0,0,{cast:false});
const seaT=cTex(512,512,(x,w,h)=>{const g=x.createRadialGradient(256,256,20,256,256,256);g.addColorStop(0,'#35d6ff');g.addColorStop(.72,'#0b7fb8');g.addColorStop(1,'rgba(8,60,110,0)');x.fillStyle=g;x.fillRect(0,0,w,h);x.strokeStyle='rgba(255,255,255,.35)';x.lineWidth=3;for(let i=1;i<9;i++){x.beginPath();x.arc(256,256,i*26+((i*13)%11),0,7);x.stroke()}});seaT.center.set(.5,.5);
add(new THREE.CircleGeometry(13,64),new THREE.MeshBasicMaterial({map:seaT,transparent:true,opacity:.95,depthWrite:false,fog:false}),1,-40,Z+15,{r:[-Math.PI/2,0,0],cast:false});
add(new THREE.RingGeometry(12.5,13,64),new THREE.MeshBasicMaterial({color:0x7fe4ff,transparent:true,opacity:.5,blending:THREE.AdditiveBlending,depthWrite:false,fog:false}),1,-39.95,Z+15,{r:[-Math.PI/2,0,0],cast:false});
/* kaydırakta görülenler: ağ kapıları (tarayıcı > DNS > sunucu > sayfa) ve bulutlar */
{const en=document.documentElement.lang==='en',lb=(t,col)=>{const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:cTex(256,96,(c,w,h)=>{c.shadowColor=col;c.shadowBlur=16;c.fillStyle=col;c.font='800 54px system-ui';c.textAlign='center';c.fillText(t,w/2,66)}),transparent:true,blending:THREE.AdditiveBlending,depthWrite:false,fog:false}));sp.scale.set(1.7,.64,1);return sp};
 [[.16,en?'BROWSER':'TARAYICI','#7fe4ff'],[.36,'DNS','#ffd166'],[.58,en?'SERVER':'SUNUCU','#ff9ac1'],[.8,en?'PAGE':'SAYFA','#5fe0a8']].forEach(a=>{const pt=slide.getPointAt(a[0]),tg=slide.getTangentAt(a[0]),r=add(new THREE.TorusGeometry(.95,.05,10,40),new THREE.MeshBasicMaterial({color:a[2],transparent:true,opacity:.9,blending:THREE.AdditiveBlending,depthWrite:false,fog:false}),pt.x,pt.y,pt.z,{cast:false});r.quaternion.setFromUnitVectors(V(0,0,1),tg);const sp=lb(a[1],a[2]);sp.position.set(pt.x,pt.y+1.5,pt.z);scene.add(sp)});
}
/* ---- SU ALTI: tüp dalış dünyası ---- */
const UY=-500,U=new THREE.Group();scene.add(U);const ub=[],kelp=[],jel=[],swim={x:0,y:0,z:0};let diveT=0,exT=1.5;
const sandT=cTex(512,512,(x,w,h)=>{x.fillStyle='#cdbd90';x.fillRect(0,0,w,h);for(let i=0;i<60;i++){x.strokeStyle=`rgba(120,96,56,${.08+Math.random()*.1})`;x.lineWidth=2+Math.random()*3;x.beginPath();x.moveTo(0,i*9);for(let k=0;k<=w;k+=32)x.lineTo(k,i*9+Math.sin(k*.05+i)*5);x.stroke()}});sandT.wrapS=sandT.wrapT=THREE.RepeatWrapping;sandT.repeat.set(24,24);
const terrH=(x,z)=>{const cx=Math.abs(x),d=Math.max(cx-9,z<-44?-44-z:0,z>8?z-8:0);if(d<=0)return 0;const f=Math.min(1,d/10),n=Math.sin(x*.07+1)*Math.cos(z*.06)*1.2+Math.sin(x*.19+z*.13)*.5+Math.sin(x*.41-z*.37)*.18;return Math.max(0,(n+1.1)*.75)*f};
const tg=(()=>{const g=new THREE.PlaneGeometry(300,300,LOW?70:110,LOW?70:110),q=g.attributes.position;for(let i=0;i<q.count;i++)q.setZ(i,terrH(q.getX(i),-q.getY(i)));g.computeVertexNormals();return g})();
add(tg,new THREE.MeshStandardMaterial({map:sandT,bumpMap:sandT,bumpScale:2.5,roughness:1}),0,UY,0,{r:[-Math.PI/2,0,0],p:U,cast:false});
const surfT=cTex(512,512,(x,w,h)=>{x.fillStyle='#9fe3ff';x.fillRect(0,0,w,h);for(let i=0;i<90;i++){x.fillStyle=`rgba(255,255,255,${Math.random()*.5})`;x.beginPath();x.ellipse(Math.random()*w,Math.random()*h,10+Math.random()*40,3+Math.random()*10,Math.random()*3,0,7);x.fill()}});surfT.wrapS=surfT.wrapT=THREE.RepeatWrapping;surfT.repeat.set(10,10);
add(new THREE.PlaneGeometry(300,300),new THREE.MeshBasicMaterial({map:surfT,transparent:true,opacity:.5,blending:THREE.AdditiveBlending,depthWrite:false,fog:false}),0,UY+18,0,{r:[Math.PI/2,0,0],p:U,cast:false});
/* ortada: sunucu alınınca beliren örnek site (yayına alınınca cıvıl cıvıl) */
const uAnim=[];const dotT=cTex(32,32,(x,w,h)=>{const g=x.createRadialGradient(16,16,1,16,16,16);g.addColorStop(0,'rgba(255,255,255,1)');g.addColorStop(.5,'rgba(255,255,255,.5)');g.addColorStop(1,'rgba(255,255,255,0)');x.fillStyle=g;x.fillRect(0,0,w,h)});const rockT=cTex(128,128,(x,w,h)=>{x.fillStyle='#888';x.fillRect(0,0,w,h);for(let i=0;i<900;i++){const v=90+Math.random()*120|0;x.fillStyle=`rgb(${v},${v},${v})`;x.fillRect(Math.random()*w,Math.random()*h,6,6)}});
const ENL=document.documentElement.lang==='en',siteC=document.createElement('canvas');siteC.width=768;siteC.height=480;const siteX=siteC.getContext('2d'),siteT=new THREE.CanvasTexture(siteC);siteT.colorSpace=THREE.SRGBColorSpace;siteT.anisotropy=4;
const drawSite=st=>{const x=siteX,w=768,h=480,rb=(a,b,c,d,r,f,sk)=>{x.beginPath();x.roundRect(a,b,c,d,r);if(f){x.fillStyle=f;x.fill()}if(sk){x.strokeStyle=sk;x.lineWidth=3;x.setLineDash([8,6]);x.stroke();x.setLineDash([])}},live=st>=6,col=st>=2;
 x.fillStyle=col?'#fff7e6':'#eef1f6';x.fillRect(0,0,w,h);x.fillStyle='#e3e7ee';x.fillRect(0,0,w,34);['#ff5f57','#febc2e','#28c840'].forEach((c,i)=>{x.fillStyle=c;x.beginPath();x.arc(20+i*20,17,6,0,7);x.fill()});rb(110,7,w-230,20,10,'#fff');x.fillStyle='#56607a';x.font='13px monospace';x.textAlign='left';x.fillText(live?'https://berat.dev':(ENL?'offline...':'çevrimdışı...'),124,22);
 if(st<1){x.fillStyle='#9aa4b5';x.font='800 120px system-ui';x.textAlign='center';x.fillText('?',w/2,270);x.font='600 24px system-ui';x.fillText(ENL?'Collect the packets to build the site':'Siteyi kurmak için paketleri topla',w/2,330);return}
 const G=['#ff6f91','#ffb25a','#7fe4ff','#5fe0a8','#ffd166','#c28bf0'];
 rb(24,52,w-48,46,12,col?G[0]:null,col?null:'#9aa4b5');if(col){x.fillStyle='#fff';x.font='800 22px system-ui';x.textAlign='left';x.fillText('Berat.dev',44,82);['Home','Projects','Blog'].forEach((t,i)=>{x.font='600 16px system-ui';x.fillText(t,w-260+i*80,80)})}
 if(col){const g=x.createLinearGradient(24,0,w-24,0);g.addColorStop(0,'#ffb25a');g.addColorStop(.5,'#ff6f91');g.addColorStop(1,'#7fe4ff');rb(24,112,w-48,150,18,g)}else rb(24,112,w-48,150,18,null,'#9aa4b5');
 if(col){x.fillStyle='#fff';x.textAlign='left';x.font='800 38px system-ui';x.fillText(ENL?'Hello, I am Berat!':'Merhaba, ben Berat!',48,170);x.font='500 20px system-ui';x.fillText(ENL?'Design, code and colour':'Tasarım, kod ve renk',48,204)}
 [0,1,2].forEach(i=>{const cx=24+i*((w-48-40)/3+20),cw=(w-48-40)/3;rb(cx,278,cw,104,16,col?[G[2],G[3],G[4]][i]:null,col?null:'#9aa4b5');if(col){x.fillStyle='#0b1220';x.font='700 18px system-ui';x.textAlign='left';x.fillText(['HTML','CSS','JS'][i],cx+16,312)}});
 rb(24,396,w-48,60,14,col?G[5]:null,col?null:'#9aa4b5');
 if(st>=3){rb(w-210,128,170,44,22,'#fff');x.fillStyle='#ff6f91';x.font='800 18px system-ui';x.textAlign='center';x.fillText(ENL?'Say hi ✨':'Merhaba de ✨',w-125,157);for(let i=0;i<26;i++){x.fillStyle=G[i%6];x.beginPath();x.arc((i*97)%w,52+(i*53)%200,4+(i%3)*2,0,7);x.fill()}}
 if(st>=4){rb(30,430-4,150,30,15,'#5fe0a8');x.fillStyle='#06301c';x.font='800 15px system-ui';x.textAlign='center';x.fillText('✓ 0 '+(ENL?'bugs':'hata'),105,449)}
 if(st>=5){rb(w-250,428,210,36,18,'#ffd166');x.fillStyle='#3a2600';x.font='800 15px system-ui';x.textAlign='center';x.fillText(ENL?'READY TO DEPLOY':'YAYINA HAZIR',w-145,452)}
 if(live){rb(w-170,48,140,36,18,'#28c840');x.fillStyle='#fff';x.font='800 16px system-ui';x.textAlign='center';x.fillText('● '+(ENL?'LIVE':'CANLI'),w-100,72);for(let i=0;i<70;i++){x.fillStyle=G[i%6];x.fillRect((i*131)%w,(i*71)%h,6,12)}}};drawSite(5);
const siteG=new THREE.Group();siteG.position.set(0,UY+2.7,-7);siteG.visible=false;U.add(siteG);
{const m=new THREE.Mesh(new THREE.PlaneGeometry(5.6,3.5),new THREE.MeshBasicMaterial({map:siteT,fog:false}));siteG.add(m);const fr=new THREE.Mesh(new THREE.BoxGeometry(5.8,3.7,.1),new THREE.MeshBasicMaterial({color:0x0b1020,fog:false}));fr.position.z=-.07;siteG.add(fr);
 [-1.8,1.8].forEach(sx=>{const lg=new THREE.Mesh(new THREE.CylinderGeometry(.06,.08,.95,8),M(0x2a3550,.5,.5));lg.position.set(sx,-2.2,-.1);siteG.add(lg)});
 const gl2=new THREE.Mesh(new THREE.PlaneGeometry(8,5.6),new THREE.MeshBasicMaterial({map:glowT,color:0x7fe4ff,transparent:true,opacity:.5,blending:THREE.AdditiveBlending,depthWrite:false,fog:false}));gl2.position.z=-.2;siteG.add(gl2)}
/* site yeri işareti: sunucu alınana kadar zeminde ince halka */
const drawLive=x=>{const w=768,h=480,g=x.createLinearGradient(0,0,w,h);g.addColorStop(0,'#052a4a');g.addColorStop(1,'#0b7aa8');x.fillStyle=g;x.fillRect(0,0,w,h);
 for(let i=0;i<5;i++){const rg=x.createRadialGradient(120+i*150,80,0,120+i*150,80,260);rg.addColorStop(0,'rgba(190,240,255,.18)');rg.addColorStop(1,'rgba(190,240,255,0)');x.fillStyle=rg;x.fillRect(0,0,w,h)}
 x.strokeStyle='rgba(255,255,255,.3)';x.lineWidth=2;for(let i=0;i<22;i++){x.beginPath();x.arc((i*131)%w,(i*89)%h,6+(i%4)*5,0,7);x.stroke()}
 x.beginPath();x.roundRect(w/2-72,40,144,38,19);x.fillStyle='#28c840';x.fill();x.fillStyle='#fff';x.font='800 17px system-ui';x.textAlign='center';x.fillText('● '+(ENL?'LIVE':'CANLI'),w/2,65);
 x.shadowColor='#7fe4ff';x.shadowBlur=24;x.fillStyle='#fff';x.font='800 80px system-ui';x.fillText(ENL?'You are live!':'Yayındasın!',w/2,175);x.shadowBlur=0;x.fillStyle='#ffb25a';x.fillRect(w/2-60,198,120,5);
 x.fillStyle='#e8f8ff';x.font='500 26px system-ui';x.textAlign='left';wrap(x,ENL?'You combined the five packets. This is how a web page arrives: your browser asks, the server sends. And when a bug appears, you stay calm and fix it. Well done, you finished this dive!':'Beş paketi birleştirdin. Bir web sayfası böyle gelir: tarayıcın ister, sunucu gönderir. Hata çıkarsa sakin kalıp çözersin. Tebrikler, bu dalışı tamamladın!',60,250,648,36);
 x.fillStyle='#9fd8ff';x.font='italic 20px system-ui';x.textAlign='center';x.fillText(ENL?'Use the button above to surface.':'Yüzeye çıkmak için yukarıdaki düğmeyi kullan.',w/2,444)};
const liveC=document.createElement('canvas');liveC.width=768;liveC.height=480;const liveT=new THREE.CanvasTexture(liveC);liveT.colorSpace=THREE.SRGBColorSpace;liveT.anisotropy=4;drawLive(liveC.getContext('2d'));
const liveG=new THREE.Group();liveG.position.set(0,UY+5.6,-37);liveG.visible=false;U.add(liveG);
{const m=new THREE.Mesh(new THREE.PlaneGeometry(6.4,4),new THREE.MeshBasicMaterial({map:liveT,fog:false}));liveG.add(m);const fr=new THREE.Mesh(new THREE.BoxGeometry(6.6,4.2,.1),new THREE.MeshBasicMaterial({color:0x0b1020,fog:false}));fr.position.z=-.07;liveG.add(fr);
 const gl3=new THREE.Mesh(new THREE.PlaneGeometry(9,6.2),new THREE.MeshBasicMaterial({map:glowT,color:0x7fe4ff,transparent:true,opacity:.55,blending:THREE.AdditiveBlending,depthWrite:false,fog:false}));gl3.position.z=-.2;liveG.add(gl3)}
const revealLive=()=>{siteG.userData.on=false;siteG.visible=false;const u=liveG.userData;u.on=true;u.t=0;liveG.scale.setScalar(.01);liveG.visible=true};
uAnim.push((el,dt)=>{const u=liveG.userData;if(!u.on)return;if(u.t<1){u.t=Math.min(1,u.t+dt*.8);liveG.scale.setScalar(Math.max(.01,1-Math.pow(1-u.t,3)))}liveG.position.y=UY+5.6+Math.sin(el*1.2)*.06;const tg=Math.atan2(pos.x-liveG.position.x,pos.z-liveG.position.z);liveG.rotation.y+=ang(liveG.rotation.y,tg)*Math.min(1,dt*3)});
const revealSite=st=>{drawSite(st);siteT.needsUpdate=true;const u=siteG.userData;if(!u.on){u.on=true;u.t=0;siteG.scale.setScalar(.01)}siteG.visible=true};
uAnim.push((el,dt)=>{const u=siteG.userData;if(!u.on)return;if(u.t<1){u.t=Math.min(1,u.t+dt*.8);siteG.scale.setScalar(Math.max(.01,1-Math.pow(1-u.t,3)))}siteG.position.y=UY+2.7+Math.sin(el*1.2)*.06;const tg=Math.atan2(pos.x-siteG.position.x,pos.z-siteG.position.z);siteG.rotation.y+=ang(siteG.rotation.y,tg)*Math.min(1,dt*3)});
{const n=70,im=new THREE.InstancedMesh(new THREE.ConeGeometry(.25,1,7),M(0xffffff,.6),n),dm=new THREE.Object3D(),cols=[0xff6f91,0xff9671,0xffc75f,0xb86bff,0x4de1c1];
 for(let i=0;i<n;i++){const a=rnd()*6.283,r=5+rnd()*38,h=.5+rnd()*1.6;dm.position.set(Math.cos(a)*r,UY+h/2,Math.sin(a)*r-3);dm.scale.set(.6+rnd()*1.2,h,.6+rnd()*1.2);dm.rotation.set((rnd()-.5)*.3,0,(rnd()-.5)*.3);dm.updateMatrix();im.setMatrixAt(i,dm.matrix);im.setColorAt(i,new THREE.Color(cols[i%5]))}U.add(im)}
for(let i=0;i<0;i++){const a=rnd()*6.283,r=6+rnd()*40,k=add(new THREE.DodecahedronGeometry(1,1),new THREE.MeshStandardMaterial({color:0x6a7580,roughness:.95,bumpMap:rockT,bumpScale:3}),Math.cos(a)*r,UY+.3,Math.sin(a)*r-3,{p:U,cast:true});k.scale.set(1+rnd()*2,.6+rnd()*1.2,1+rnd()*2)}
for(let i=0;i<18;i++){const a=rnd()*6.283,r=7+rnd()*35,g=new THREE.Group();{let kx=Math.cos(a)*r,kz=Math.sin(a)*r-3;if(Math.abs(kx)<9&&kz>-44&&kz<8)kx+=kx<0?-12:12;g.position.set(kx,UY+terrH(kx,kz),kz)}for(let j=0;j<3;j++){const hh=4+rnd()*3,c=new THREE.Mesh(new THREE.CylinderGeometry(.015,.04,hh,6),M(0x3fae5a,.7));c.position.set((j-1)*.18,hh/2,0);g.add(c)}U.add(g);kelp.push({g,o:rnd()*6})}
for(let i=0;i<6;i++){const g=new THREE.Group(),m=new THREE.MeshStandardMaterial({color:0xff9ad0,emissive:0xff4fa8,emissiveIntensity:1.3,transparent:true,opacity:.7,roughness:.3}),b=new THREE.Mesh(new THREE.SphereGeometry(.4,16,10,0,Math.PI*2,0,Math.PI/2),m);g.add(b);for(let j=0;j<6;j++){const t=new THREE.Mesh(new THREE.CylinderGeometry(.01,.01,.9,5),m);t.position.set(Math.cos(j)*.22,-.45,Math.sin(j)*.22);g.add(t)}g.position.set((rnd()-.5)*22,UY+4+rnd()*8,-3+(rnd()-.5)*22);g.userData={y:g.position.y};U.add(g);jel.push(g)}
for(let i=0;i<0;i++){const f=new THREE.Group(),mt=M(new THREE.Color().setHSL(.5+Math.random()*.2,.8,.55),.4),b=new THREE.Mesh(new THREE.SphereGeometry(.18,10,8),mt);b.scale.set(1.6,.8,.5);const tl=new THREE.Mesh(new THREE.ConeGeometry(.12,.25,6),mt);tl.rotation.z=Math.PI/2;tl.position.x=-.3;f.add(b,tl);f.userData={r:3+Math.random()*9,s:.3+Math.random()*.5,o:Math.random()*6,y:UY+1+Math.random()*8};U.add(f);ub.push(f)}
{const g=new THREE.Group();g.position.set(7,UY+.5,-5);g.rotation.set(.3,.6,.25);const mt=M(0x6a5a4a,.8,.4);[[new THREE.CylinderGeometry(.06,.06,2.2,8),0,0],[new THREE.TorusGeometry(.18,.04,8,16),0,1.2],[new THREE.CylinderGeometry(.04,.04,1.1,8),0,.7]].forEach((a,i)=>{const m=new THREE.Mesh(a[0],mt);m.position.set(0,a[2],0);if(i===2)m.rotation.z=Math.PI/2;g.add(m)});const arm=new THREE.Mesh(new THREE.TorusGeometry(.7,.05,8,20,Math.PI),mt);arm.position.set(0,-1.0,0);arm.rotation.z=Math.PI;g.add(arm);U.add(g)}
const shaftT=cTex(8,128,(x,w,h)=>{const g=x.createLinearGradient(0,0,0,h);g.addColorStop(0,'#fff');g.addColorStop(.6,'#444');g.addColorStop(1,'#000');x.fillStyle=g;x.fillRect(0,0,w,h)}),shafts=[];
for(let i=0;i<8;i++){const c=new THREE.Mesh(new THREE.ConeGeometry(2.4,18,16,1,true),new THREE.MeshBasicMaterial({map:shaftT,color:0xaee9ff,transparent:true,opacity:.22,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide,fog:false}));c.position.set(-20+i*6,UY+9,-6-(i%3)*6);c.rotation.z=.18;U.add(c);shafts.push(c)}
uAnim.push(el=>shafts.forEach((c,i)=>{c.rotation.z=.18+Math.sin(el*.15+i)*.04;c.material.opacity=.2+Math.sin(el*.4+i*1.7)*.06}));
/* ---- daha detaylı deniz altı: ışık ağları, mercan bahçesi, balık sürüleri, kaplumbağa, batık veri merkezi ---- */
const AB2=THREE.AdditiveBlending;
{const ct=cTex(512,512,(x,w,h)=>{x.fillStyle='#000';x.fillRect(0,0,w,h);x.strokeStyle='rgba(190,240,255,.9)';x.lineWidth=2;for(let i=0;i<46;i++){x.beginPath();const cx=Math.random()*w,cy=Math.random()*h;for(let k=0;k<7;k++){const a=k/7*6.283,r=14+Math.random()*26;x[k?'lineTo':'moveTo'](cx+Math.cos(a)*r,cy+Math.sin(a)*r)}x.closePath();x.stroke()}});ct.wrapS=ct.wrapT=THREE.RepeatWrapping;ct.repeat.set(12,12);
 add(tg,new THREE.MeshBasicMaterial({map:ct,transparent:true,opacity:.22,blending:AB2,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-3,polygonOffsetUnits:-3}),0,UY+.03,0,{r:[-Math.PI/2,0,0],p:U,cast:false});const c2=ct.clone();c2.needsUpdate=true;c2.repeat.set(7,7);add(tg,new THREE.MeshBasicMaterial({map:c2,transparent:true,opacity:.16,blending:AB2,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-4,polygonOffsetUnits:-4}),0,UY+.05,0,{r:[-Math.PI/2,0,0],p:U,cast:false});uAnim.push(el=>{ct.offset.set(Math.sin(el*.2)*.1,el*.015);c2.offset.set(-el*.012,Math.cos(el*.17)*.1)})}
{const dm=new THREE.Object3D(),cols=[0xff6f91,0xff9671,0xffc75f,0xb86bff,0x4de1c1],inst=(g,m,n,fn)=>{n=LOW?Math.ceil(n/2):n;const im=new THREE.InstancedMesh(g,m,n);im.frustumCulled=false;im.castShadow=SH;im.receiveShadow=SH;for(let i=0;i<n;i++){fn(i,dm);dm.updateMatrix();im.setMatrixAt(i,dm.matrix)}U.add(im);return im};
 const tube=inst(new THREE.CylinderGeometry(.16,.22,1,8,1,true),new THREE.MeshStandardMaterial({color:0xffffff,roughness:.6,side:THREE.DoubleSide}),140,(i,o)=>{const a=rnd()*6.283,r=4+rnd()*42,hh=.6+rnd()*1.6;o.position.set(Math.cos(a)*r,UY+terrH(Math.cos(a)*r,Math.sin(a)*r-3)+hh/2,Math.sin(a)*r-3);o.scale.set(.5+rnd()*.8,hh,.5+rnd()*.8);o.rotation.set((rnd()-.5)*.3,rnd()*3,(rnd()-.5)*.3)});for(let i=0;i<140;i++)tube.setColorAt(i,new THREE.Color(cols[i%5]));
 const brain=inst(new THREE.IcosahedronGeometry(1,2),new THREE.MeshStandardMaterial({color:0xffffff,roughness:.8}),44,(i,o)=>{const a=rnd()*6.283,r=5+rnd()*40,sc=.7+rnd()*1.1;o.position.set(Math.cos(a)*r,UY+terrH(Math.cos(a)*r,Math.sin(a)*r-3)+.3*sc,Math.sin(a)*r-3);o.scale.set(sc,sc*.55,sc);o.rotation.set(0,rnd()*3,0)});['#d98c5f','#c96a8a','#8fbf6a','#d9b24a'].forEach((c,i)=>{for(let k=i;k<44;k+=4)brain.setColorAt(k,new THREE.Color(c))});
  /* deniz yelpazeleri (gorgon mercanı): gerçek dallanan ince dallar, kıvrık yelpaze, uçlara doğru açılan renk, akıntıyla sallanır */
 const mkFan=seed=>{let sd=seed;const rr=()=>{sd=(sd*9301+49297)%233280;return sd/233280},parts=[],base=new THREE.Color(.34,.2,.22),tipc=new THREE.Color(1,1,1),tmp=new THREE.Color();
  const grow=(x,y,z,ang,len,rad,d)=>{if(d>6||len<.05)return;const g=new THREE.CylinderGeometry(rad*.75,rad,len,4,1,true);g.translate(0,len/2,0);g.rotateZ(-ang);g.translate(x,y,z);
   const q=g.attributes.position,col=new Float32Array(q.count*3);for(let i=0;i<q.count;i++){const t=Math.min(1,Math.max(0,q.getY(i)/1.7));tmp.copy(base).lerp(tipc,Math.pow(t,1.2));col.set([tmp.r,tmp.g,tmp.b],i*3)}g.setAttribute('color',new THREE.BufferAttribute(col,3));parts.push(g);
   const ex=x+Math.sin(ang)*len,ey=y+Math.cos(ang)*len,ez=z+(rr()-.5)*.04,k=2+(rr()<.35?1:0);for(let i=0;i<k;i++)grow(ex,ey,ez,ang+(i-(k-1)/2)*(.55+rr()*.25)+(rr()-.5)*.15,len*(.72+rr()*.1),rad*.72,d+1)};
  grow(0,0,0,0,.45,.03,0);const g=mergeGeometries(parts);const q=g.attributes.position;for(let i=0;i<q.count;i++)q.setZ(i,q.getZ(i)+q.getX(i)*q.getX(i)*.12);g.computeVertexNormals();return g};
 const fm=new THREE.MeshStandardMaterial({vertexColors:true,roughness:.65,side:THREE.DoubleSide});fm.onBeforeCompile=sh=>{sh.uniforms.uT=uT;sh.vertexShader='uniform float uT;\n'+sh.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nfloat hh=position.y/1.8;transformed.x+=sin(uT*1.3+instanceMatrix[3].x*.8+instanceMatrix[3].z*.6)*.14*hh*hh;transformed.z+=cos(uT*1.1+instanceMatrix[3].z*.7)*.08*hh*hh;')};
 const fanCols=[0xff7ab8,0xb98bff,0xff9a6b,0xffd166,0xe8567a].map(c=>new THREE.Color(c));
 [11,29,47].forEach((sd,v)=>{const im=inst(mkFan(sd),fm,15,(i,o)=>{const a=rnd()*6.283,r=5+rnd()*40,sc=.9+rnd()*.9,fx=Math.cos(a)*r,fz=Math.sin(a)*r-3;o.position.set(fx,UY+terrH(fx,fz),fz);o.scale.setScalar(sc);o.rotation.set(0,rnd()*6.28,(rnd()-.5)*.12)});for(let i=0;i<15;i++)im.setColorAt(i,fanCols[(i+v)%5])})}
/* güneş ışığı + gölgeler (kum, mercan, kaya, sunucu dolapları) */
const usun=new THREE.DirectionalLight(0xbfefff,2.4);usun.position.set(-18,UY+40,12);usun.target.position.set(0,UY,-12);usun.castShadow=SH;usun.shadow.mapSize.set(HI?2048:1024,HI?2048:1024);{const sc=usun.shadow.camera;sc.left=sc.bottom=-50;sc.right=sc.top=50;sc.near=1;sc.far=120}usun.shadow.bias=-.0006;usun.shadow.normalBias=.06;usun.shadow.radius=3;usun.visible=false;U.add(usun,usun.target);
/* gerçekçi balıklar: gövde, kuyruk, sırt ve göğüs yüzgeci, gözler; üstü koyu karnı açık; kuyruk sallanır */
const uT={value:0};uAnim.push(el=>{uT.value=el});
const mkFish=(back,belly,stripe,th=1,lg=1)=>{const c1=new THREE.Color(back),c2=new THREE.Color(belly),cs=new THREE.Color(stripe||back),tmp=new THREE.Color();
 const col=(g,fn)=>{const q=g.attributes.position,a=new Float32Array(q.count*3);for(let i=0;i<q.count;i++){fn(q.getX(i),q.getY(i),q.getZ(i),tmp);a.set([tmp.r,tmp.g,tmp.b],i*3)}g.setAttribute('color',new THREE.BufferAttribute(a,3));return g};
 const ni=g=>{g=g.index?g.toNonIndexed():g;if(!g.attributes.uv)g.setAttribute('uv',new THREE.BufferAttribute(new Float32Array(g.attributes.position.count*2),2));return g};
 const body=ni(new THREE.SphereGeometry(.5,16,12));body.scale(lg,.42*th,.2);col(body,(x,y,z,o)=>{o.copy(c1).lerp(c2,THREE.MathUtils.smoothstep(-y,.02,.16));if(stripe&&Math.sin(x*22)>.55)o.lerp(cs,.85)});
 const tri=(pts,c)=>{const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(new Float32Array(pts.map(q=>[q[0]*lg,q[1]*th,q[2]]).flat()),3));g.computeVertexNormals();return col(ni(g),(x,y,z,o)=>o.copy(c))};
 const tail=tri([[-.42,0,0],[-.82,.28,0],[-.82,-.28,0]],c1.clone().multiplyScalar(.9)),dors=tri([[.1,.18,0],[-.2,.36,0],[-.3,.14,0]],c1.clone().multiplyScalar(.85)),pect=tri([[.15,-.06,.08],[-.05,-.16,.14],[.02,-.02,.1]],c2.clone());
 const eyes=[1,-1].map(sd=>{const e=ni(new THREE.SphereGeometry(.04,6,5));e.translate(.32*lg,.07,sd*.085);return col(e,(x,y,z,o)=>o.set(0x05060a))});
 return mergeGeometries([body,tail,dors,pect,...eyes])};
const fishMat=()=>{const m=new THREE.MeshStandardMaterial({vertexColors:true,roughness:.45,metalness:0,side:THREE.DoubleSide});m.onBeforeCompile=sh=>{sh.uniforms.uT=uT;sh.vertexShader='uniform float uT;\n'+sh.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nfloat ph=float(gl_InstanceID)*1.7;\ntransformed.z+=sin(uT*9.0+ph+position.x*7.0)*0.08*smoothstep(0.05,-0.4,position.x);')};return m};
const school=(cx,cz,cy,n,sp,sc,R,spd=.35)=>{if(LOW&&n>6)n=Math.ceil(n/2);const im=new THREE.InstancedMesh(mkFish(...sp),fishMat(),n),o=new THREE.Object3D(),ph=[...Array(n)].map(()=>[rnd()*6.28,.6+rnd()*.8,rnd()*3,.8+rnd()*.5]);im.frustumCulled=false;U.add(im);
 uAnim.push(el=>{for(let i=0;i<n;i++){const q=ph[i],a=el*spd+q[0]*.12+i*.07,r=R+Math.sin(el*.6+q[2])*1.5+q[1];o.position.set(cx+Math.cos(a)*r+Math.sin(el*2+i)*.1,cy+Math.sin(el*.8+q[2])*1.2+q[1]*.3,cz+Math.sin(a)*r);o.rotation.set(0,-a-Math.PI/2,Math.sin(el*.8+q[2])*.1);o.scale.setScalar(sc*q[3]);o.updateMatrix();im.setMatrixAt(i,o.matrix)}im.instanceMatrix.needsUpdate=true})};
/* küçük sürüler: haritaya dağıtılmış, farklı tür ve derinlikte */
school(-22,-6,UY+4.5,22,['#f5d33a','#fff3b0','#1a1a1a'],.5,5,.3);school(24,-12,UY+7,24,['#f5d33a','#fff3b0','#1a1a1a'],.5,6,.28);
school(-8,-24,UY+6,26,['#2f6bff','#8fb4ff'],.7,7,.32);school(26,-30,UY+5,22,['#2f6bff','#8fb4ff'],.7,6,.3);
school(-30,-30,UY+8,70,['#9fb2bf','#eef4f8'],.32,9,.4);school(10,-42,UY+9,60,['#9fb2bf','#eef4f8'],.3,8,.38);
school(-16,-2,UY+2.4,12,['#ff7a1a','#ffa860','#ffffff'],.42,2.6,.22);school(18,2,UY+2.4,12,['#ff7a1a','#ffa860','#ffffff'],.4,2.6,.22);
school(14,-6,UY+3,4,['#e8d8a0','#fff8e0','#2a2a2a',1.9],.8,3.4,.18);school(-20,-16,UY+3.4,4,['#e8d8a0','#fff8e0','#2a2a2a',1.9],.8,3.4,.16);
school(-4,4,UY+2.8,24,['#b05cff','#ffd24a'],.3,3.2,.28);school(22,-22,UY+3,20,['#b05cff','#ffd24a'],.3,3.6,.26);
school(16,-36,UY+6,6,['#6fa88a','#cfe8d8','#2f6f5a',1.1],.9,6,.2);school(-24,-40,UY+5,6,['#d9704a','#f2c19a',null,1.1],.9,6,.18);
/* iri ve uzun balıklar: barakuda sürüsü, gruper, köpekbalığı, balina köpekbalığı */
school(-26,-12,UY+5,7,['#9fb2bf','#e8eef2',null,.42,1.7],.9,10,.3);
school(-30,-20,UY+4.5,2,['#8a6a4a','#c8ad84'],2.4,10,.08);
school(18,-14,UY+9,1,['#6d7b88','#e8eef2',null,.55,1.5],3.4,14,.1);
school(0,-28,UY+13,1,['#3c5a7a','#d6e0ea','#ffffff'],9,26,.05);
/* manta: kanatlarını çırparak süzülür */
{const sh=new THREE.Shape(),hp=[[1.6,0],[.8,.8],[-.1,2.0],[-.7,2.9],[-.9,1.6],[-.7,.6],[-.9,.2],[-1.25,0]];sh.moveTo(1.6,0);hp.slice(1).forEach(q=>sh.lineTo(q[0],q[1]));hp.slice(0,-1).reverse().slice(0,-1).forEach(q=>sh.lineTo(q[0],-q[1]));sh.lineTo(-1.25,0);
 const g=new THREE.ShapeGeometry(sh);g.rotateX(-Math.PI/2);g.scale(1.5,1,1.5);const m=new THREE.MeshStandardMaterial({color:0x2c3a4a,roughness:.55,side:THREE.DoubleSide});m.onBeforeCompile=sh2=>{sh2.uniforms.uT=uT;sh2.vertexShader='uniform float uT;\n'+sh2.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\ntransformed.y+=sin(uT*1.6-abs(position.z)*.6)*abs(position.z)*.16;')};
 const mesh=new THREE.Mesh(g,m);U.add(mesh);uAnim.push(el=>{const a=el*.09+1.5;mesh.position.set(Math.cos(a)*22,UY+10+Math.sin(el*.3)*.8,-18+Math.sin(a)*22);mesh.rotation.y=-a-Math.PI/2})}
/* doğal taşlar: yumuşak, çok katmanlı gürültüyle çarpılmış; üstü yosunlu, altı karanlık, açık renkli lekeler; üç farklı biçim */
{const mkRock=(seed,flat,rough,det=LOW?5:6)=>{let g=new THREE.IcosahedronGeometry(1,det);g.deleteAttribute('uv');g.deleteAttribute('normal');g=mergeVertices(g,1e-4);const q=g.attributes.position,v=new THREE.Vector3(),S=seed;
  const fb=(x,y,z)=>{let t=0,f=1,am=1;for(let o=0;o<4;o++){t+=am*(Math.sin(x*f*1.7+S+o)*Math.cos(y*f*1.9-S*.7)+Math.sin(z*f*2.3+x*f*1.1+S*1.3)*.7);f*=2.1;am*=.5}return t};
  for(let i=0;i<q.count;i++){v.fromBufferAttribute(q,i);v.multiplyScalar(1+fb(v.x,v.y,v.z)*.11*rough);v.y*=flat;if(v.y<-.35*flat)v.y=-.35*flat+(v.y+.35*flat)*.15;q.setXYZ(i,v.x,v.y,v.z)}
  g.computeVertexNormals();const nm=g.attributes.normal,col=new Float32Array(q.count*3),uv=new Float32Array(q.count*2),c=new THREE.Color(),moss=new THREE.Color(.2,.38,.2),pale=new THREE.Color(.78,.76,.68);
  for(let i=0;i<q.count;i++){const up=nm.getY(i),vr=.5+.5*Math.sin(q.getX(i)*9+q.getZ(i)*7+S);c.setRGB(.3+vr*.14,.31+vr*.13,.33+vr*.12);if(up>.45)c.lerp(moss,Math.min(.8,(up-.45)*1.4));if(q.getY(i)<-.1)c.multiplyScalar(.75);if(vr>.93)c.lerp(pale,.5);col.set([c.r,c.g,c.b],i*3);uv.set([Math.atan2(q.getZ(i),q.getX(i))/6.283+.5,q.getY(i)*.5+.5],i*2)}
  g.setAttribute('color',new THREE.BufferAttribute(col,3));g.setAttribute('uv',new THREE.BufferAttribute(uv,2));return g};
 const rm=new THREE.MeshStandardMaterial({vertexColors:true,roughness:.95,bumpMap:rockT,bumpScale:2}),o=new THREE.Object3D();
 const pick=(r0,r1)=>{for(let k=0;k<14;k++){const a=rnd()*6.283,r=r0+rnd()*r1,x=Math.cos(a)*r,z=Math.sin(a)*r-3;if(!(Math.abs(x)<9&&z>-44&&z<8))return[x,z]}return[30,30]};
 const mk=(geo,n,fn,cast)=>{n=LOW?Math.ceil(n/2):n;const im=new THREE.InstancedMesh(geo,rm,n);im.frustumCulled=false;im.castShadow=cast&&SH;im.receiveShadow=SH;for(let i=0;i<n;i++){fn(i,o);o.updateMatrix();im.setMatrixAt(i,o.matrix)}U.add(im)};
 const A=mkRock(1.3,1,1.25),B=mkRock(4.1,.62,.85),C=mkRock(7.7,1.2,1.2);
 mk(A,34,(i,o)=>{const[qx,qz]=pick(8,46),sc=i<8?2+rnd()*2.6:.7+rnd()*1.4;o.position.set(qx,UY+terrH(qx,qz)+sc*.18,qz);o.scale.set(sc*(.8+rnd()*.5),sc*(.6+rnd()*.5),sc*(.8+rnd()*.5));o.rotation.set((rnd()-.5)*.35,rnd()*6.28,(rnd()-.5)*.35)},true);
 mk(B,30,(i,o)=>{const[qx,qz]=pick(6,46),sc=1+rnd()*2.4;o.position.set(qx,UY+terrH(qx,qz)+sc*.1,qz);o.scale.set(sc*(1+rnd()*.7),sc,sc*(.8+rnd()*.7));o.rotation.set((rnd()-.5)*.2,rnd()*6.28,(rnd()-.5)*.2)},true);
 mk(C,12,(i,o)=>{const[qx,qz]=pick(14,40),sc=1+rnd()*1.6;o.position.set(qx,UY+terrH(qx,qz)+sc*.3,qz);o.scale.set(sc*.95,sc*(.9+rnd()*.5),sc*.95);o.rotation.set((rnd()-.5)*.3,rnd()*6.28,(rnd()-.5)*.3)},true);
 mk(mkRock(9.9,.6,.8,3),260,(i,o)=>{const[qx,qz]=pick(3,48),sc=.08+rnd()*.26;o.position.set(qx,UY+terrH(qx,qz)+sc*.1,qz);o.scale.set(sc*1.3,sc*.7,sc);o.rotation.set(0,rnd()*6.28,0)},false)}
/* deniz çimi: dalgalanan yüzlerce yaprak (tek çizim çağrısı) */
{const bg=new THREE.PlaneGeometry(.12,1.5,1,5);bg.translate(0,.75,0);const bm=new THREE.MeshStandardMaterial({color:0xffffff,side:THREE.DoubleSide,roughness:.8});bm.onBeforeCompile=sh=>{sh.uniforms.uT=uT;sh.vertexShader='uniform float uT;\n'+sh.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nfloat hh=position.y/1.5;transformed.x+=sin(uT*1.7+instanceMatrix[3].x*.9+instanceMatrix[3].z*.7)*.22*hh*hh;transformed.z+=cos(uT*1.3+instanceMatrix[3].z*.8)*.12*hh*hh;')};
 const n=LOW?350:900,im=new THREE.InstancedMesh(bg,bm,n),o=new THREE.Object3D(),gc=['#2f8f4a','#3fae5a','#5cc46a','#287a40'].map(c=>new THREE.Color(c));im.frustumCulled=false;im.receiveShadow=SH;
 for(let i=0;i<n;i++){const cl=Math.floor(i/18),ca=(cl*2.399)%6.283,cr=4+((cl*37)%44),x=Math.cos(ca)*cr+(rnd()-.5)*2.4,z=Math.sin(ca)*cr-3+(rnd()-.5)*2.4;const gx=Math.abs(x)<9&&z>-44&&z<8?x+(x<0?-12:12):x;o.position.set(gx,UY+terrH(gx,z),z);o.rotation.set((rnd()-.5)*.2,rnd()*6.28,(rnd()-.5)*.2);const sc=.6+rnd()*1.1;o.scale.set(1,sc,1);o.updateMatrix();im.setMatrixAt(i,o.matrix);im.setColorAt(i,gc[i%4])}U.add(im)}
{const g=new THREE.Group(),m=M(0x6b8f4e,.7),sk=M(0xb8c77a,.8),sh=new THREE.Mesh(new THREE.SphereGeometry(.7,16,10),m);sh.scale.set(1.2,.5,1);g.add(sh);const hd=new THREE.Mesh(new THREE.SphereGeometry(.2,10,8),sk);hd.position.set(.95,0,0);g.add(hd);
 const fl=[[.4,.55],[.4,-.55],[-.45,.5],[-.45,-.5]].map(a=>{const f=new THREE.Mesh(new THREE.SphereGeometry(.3,8,6),sk);f.scale.set(1.4,.15,.6);f.position.set(a[0],-.05,a[1]);g.add(f);return f});U.add(g);
 uAnim.push(el=>{const a=el*.12;g.position.set(Math.cos(a)*16,UY+8+Math.sin(el*.3)*.8,-10+Math.sin(a)*16);g.rotation.y=-a-Math.PI/2;fl.forEach((f,i)=>f.rotation.x=Math.sin(el*1.6)*.5*(i%2?-1:1))})}
{const rm=new THREE.MeshStandardMaterial({color:0x66717c,roughness:.95,bumpMap:rockT,bumpScale:3});add(new THREE.TorusGeometry(4,1.3,16,28,Math.PI),rm,-18,UY+terrH(-18,-6),-6,{r:[0,.6,0],p:U,cast:true});add(new THREE.TorusGeometry(2.4,.9,14,24,Math.PI),rm,20,UY+terrH(20,-12),-12,{r:[0,-.4,0],p:U,cast:true})}
/* batık veri merkezi: yanıp sönen sunucu dolapları ve kablolar */
{const ledT=[0,1].map(()=>cTex(128,256,(x,w,h)=>{x.fillStyle='#0b0f18';x.fillRect(0,0,w,h);for(let r=0;r<14;r++)for(let c=0;c<4;c++){const on=Math.random()<.5;x.fillStyle=on?(c%2?'#5fe0a8':'#7fe4ff'):'#16202e';x.fillRect(10+c*28,10+r*17,22,10)}x.strokeStyle='#223';x.strokeRect(4,4,w-8,h-8)})),mats=ledT.map(t=>new THREE.MeshBasicMaterial({map:t})),racks=[];
 [[-6,-33],[-3.6,-33.6],[3.6,-33.6],[6,-33]].forEach((pp,i)=>{const g=new THREE.Group();g.position.set(pp[0],UY,pp[1]);g.rotation.set(0,(pp[0]<0?.35:-.35)+(i%2?.05:0),i%2?.06:-.05);const bd=new THREE.Mesh(new THREE.BoxGeometry(1.5,3.4,1.2),M(0x1d2330,.6,.5));bd.position.y=1.7;bd.castShadow=SH;g.add(bd);const fr=new THREE.Mesh(new THREE.PlaneGeometry(1.3,3.1),mats[i%2]);fr.position.set(0,1.7,.61);g.add(fr);racks.push(fr);U.add(g)});
 for(let i=0;i<8;i++){const tb=new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([V(-6+i*1.7,UY+.1,-33),V(-5+i*1.5,UY+.6+rnd(),-31+rnd()*3),V(-4+i*1.2,UY+.1,-28)]),12,.04,5),M(0x1b1b22,.7));U.add(tb)}
 const sg=cTex(512,128,(x,w,h)=>{x.shadowColor='#7fe4ff';x.shadowBlur=20;x.fillStyle='#bfefff';x.font='800 78px system-ui';x.textAlign='center';x.fillText('SERVER',w/2,92)});add(new THREE.PlaneGeometry(4.4,1.1),new THREE.MeshBasicMaterial({map:sg,transparent:true,blending:AB2,depthWrite:false}),0,UY+5.4,-34,{p:U,cast:false});
 uAnim.push(el=>{const k=Math.floor(el*2)%2;racks.forEach((m,i)=>{m.material=mats[(k+i)%2]})})}
/* yayına alma kapısı: beş paket toplanınca açılır */
const gate=new THREE.Group();gate.position.set(0,UY+3,-31);gate.visible=false;U.add(gate);
{const r1=new THREE.Mesh(new THREE.TorusGeometry(1.7,.06,10,48),new THREE.MeshBasicMaterial({color:0x7fe4ff,fog:false})),r2=new THREE.Mesh(new THREE.TorusGeometry(1.3,.04,10,48),new THREE.MeshBasicMaterial({color:0xffb25a,fog:false})),dsk=new THREE.Mesh(new THREE.CircleGeometry(1.7,40),new THREE.MeshBasicMaterial({color:0x7fe4ff,transparent:true,opacity:.18,blending:AB2,depthWrite:false,fog:false,side:THREE.DoubleSide}));
 const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:cTex(512,128,(x,w,h)=>{x.shadowColor='#ffb25a';x.shadowBlur=18;x.fillStyle='#ffd9a8';x.font='800 70px system-ui';x.textAlign='center';x.fillText(document.documentElement.lang==='en'?'DEPLOY':'YAYINA AL',w/2,86)}),transparent:true,blending:AB2,depthWrite:false,fog:false}));sp.scale.set(3.6,.9,1);sp.position.y=2.4;gate.add(r1,r2,dsk,sp);
 uAnim.push((el)=>{r1.rotation.z=el*.5;r2.rotation.z=-el*.8;dsk.scale.setScalar(1+Math.sin(el*3)*.04);if(gate.visible&&mode==='under'&&!gate.userData.done&&pos.distanceTo(gate.position)<2.6){gate.userData.done=1;showLesson(`<div class="dl-top"><span>${DV.k}</span></div><h3>${DV.done[0]}</h3><div class="dl-row"><p>${DV.done[1]}</p></div>`,0);localStorage.setItem('bdive','1');gate.visible=false;revealLive()}})}
const orbs=[],DV=D.dive;[[-5,2.6,-2],[7,3.2,-8],[-11,2.6,-15],[11,3.2,-18],[-1,4.5,-27]].forEach((pp,i)=>{const g=new THREE.Group();g.position.set(pp[0],UY+pp[1],pp[2]);const col=i%2?0x7fe4ff:0xffb25a,c=new THREE.Mesh(new THREE.SphereGeometry(.28,24,16),new THREE.MeshStandardMaterial({color:0x111111,emissive:col,emissiveIntensity:2.4})),h=new THREE.Mesh(new THREE.SphereGeometry(.7,20,14),new THREE.MeshBasicMaterial({color:col,transparent:true,opacity:.14,blending:THREE.AdditiveBlending,depthWrite:false,fog:false})),rg=new THREE.Mesh(new THREE.TorusGeometry(.5,.015,8,40),new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:.5,blending:THREE.AdditiveBlending,depthWrite:false}));const nm=document.documentElement.lang==='en'?['HTML','CSS','JS','BUG','SERVER']:['HTML','CSS','JS','HATA','SUNUCU'],lbl=new THREE.Sprite(new THREE.SpriteMaterial({map:cTex(256,96,(cx,w,h)=>{cx.shadowColor='#'+col.toString(16).padStart(6,'0');cx.shadowBlur=14;cx.fillStyle='#fff';cx.font='800 56px system-ui';cx.textAlign='center';cx.fillText(nm[i],w/2,66)}),transparent:true,blending:AB2,depthWrite:false,fog:false}));lbl.scale.set(1.5,.56,1);lbl.position.y=.95;g.add(c,h,rg,lbl);U.add(g);orbs.push({g,h,rg,got:false,i})});let orbN=0,dlT=0;
const dl2=$('#dlesson'),dq=$('#dq');
const showLesson=(html,ms)=>{dl2.innerHTML=html;dl2.hidden=false;clearTimeout(dlT);if(ms)dlT=setTimeout(()=>{dl2.hidden=true},ms)};
const lesson=(it,fin)=>{const dots=orbs.map(o=>`<i class="${o.got?'on':''}"></i>`).join('');showLesson(`<div class="dl-top"><span>${DV.k} ${orbN}/${orbs.length}</span><span class="dl-dots">${dots}</span></div><h3>${it[0]}</h3><div class="dl-row dive"><b>${DV.l1}</b><p>${it[1]}</p></div><div class="dl-row web"><b>${DV.l2}</b><p>${it[2]}</p></div>`+(fin?`<div class="dfin"><b>${DV.gate[0]}</b><p>${DV.gate[1]}</p></div>`:''),fin?0:9000);if(fin){gate.visible=true;gate.userData.open=1}};
const diveHint=()=>showLesson(`<div class="dl-top"><span>${DV.k} ${orbN}/${orbs.length}</span></div><h3>${DV.hint[0]}</h3><div class="dl-row"><p>${DV.hint[1]}</p></div>`,9000);
const bn=180,bp=new Float32Array(bn*3);for(let i=0;i<bn;i++)bp.set([(Math.random()-.5)*40,UY+Math.random()*18,(Math.random()-.5)*40],i*3);const bg=new THREE.BufferGeometry();bg.setAttribute('position',new THREE.BufferAttribute(bp,3));U.add(new THREE.Points(bg,new THREE.PointsMaterial({size:.13,map:dotT,color:0xbfefff,transparent:true,opacity:.75,depthWrite:false})));
const exN=36,exP=new Float32Array(exN*3).fill(-99999),exL=new Float32Array(exN).fill(9),exG=new THREE.BufferGeometry();exG.setAttribute('position',new THREE.BufferAttribute(exP,3));const exPts=new THREE.Points(exG,new THREE.PointsMaterial({size:.16,map:dotT,color:0xe8fbff,transparent:true,opacity:.85,depthWrite:false,fog:false}));exPts.frustumCulled=false;U.add(exPts);
function animDive(el,dt){
 ub.forEach(f=>{const u=f.userData,a=el*u.s+u.o;f.position.set(Math.cos(a)*u.r,u.y+Math.sin(a*2)*.4,-3+Math.sin(a)*u.r);f.rotation.y=-a+Math.PI});
 {const a=bg.attributes.position;for(let i=0;i<bn;i++){a.array[i*3+1]+=dt*.7;if(a.array[i*3+1]>UY+18)a.array[i*3+1]=UY}a.needsUpdate=true}
 kelp.forEach(k=>{k.g.rotation.z=Math.sin(el*.8+k.o)*.12;k.g.rotation.x=Math.cos(el*.6+k.o)*.08});
 jel.forEach((j,i)=>{j.position.y=j.userData.y+Math.sin(el*.7+i)*1.2;j.position.x+=Math.sin(el*.3+i)*dt*.2;j.children[0].scale.y=1+Math.sin(el*2+i)*.12});
 surfT.offset.set(el*.01,el*.008);seaT.rotation=el*.15;uAnim.forEach(f=>f(el,dt));
 orbs.forEach(o=>{if(o.got)return;o.h.scale.setScalar(1+Math.sin(el*3+o.i)*.15);o.rg.rotation.x=el*1.2+o.i;o.rg.rotation.y=el*.8;if(mode==='under'&&pos.distanceTo(o.g.position)<2.3){o.got=true;o.g.visible=false;orbN++;dq.textContent=`${orbN}/${orbs.length}`;lesson(DV.orbs[o.i],orbN===orbs.length)}});
 exT-=dt;if(exT<0){exT=4.2;for(let i=0;i<exN;i++){exL[i]=-i*.05;const o=i*3;exP[o]=pos.x+(Math.random()-.5)*.25;exP[o+1]=pos.y-.35;exP[o+2]=pos.z-.7+(Math.random()-.5)*.25}}
 for(let i=0;i<exN;i++){exL[i]+=dt;if(exL[i]>0&&exL[i]<4){const o=i*3;exP[o+1]+=dt*(.9+exL[i]*.3);exP[o]+=Math.sin(exL[i]*4+i)*dt*.12}else if(exL[i]>=4)exP[i*3+1]=-99999}exG.attributes.position.needsUpdate=true;
 const dep=Math.max(0,UY+18-pos.y),tank=Math.max(40,200-(diveT>7?(el-diveEl0)*.35:diveT*3)),sec=Math.floor(diveT>7?(el-diveEl0)+7:diveT),txt=`${dep.toFixed(1)} m`;if(txt!==dd.textContent){dd.textContent=txt;dtk.textContent=`${Math.round(tank)} bar`;dtm.textContent=`${String(Math.floor(sec/60)).padStart(2,'0')}:${String(sec%60).padStart(2,'0')}`}}
const dd=$('#dd'),dtk=$('#dt'),dtm=$('#dm');let diveEl0=0;
U.add(new THREE.HemisphereLight(0x9fe8ff,0x1a4a66,1.6));
/* ================= EVİN GENİŞLEMESİ: kapı, oyun odası, balkon, kahve barı, dekor, şehir hayatı ================= */
const GX=12,gleds=[],arcs=[],bulbs=[];const wood=0x6e4f36;
const GL=(w,h,d,x,y,z,off=0)=>{const m=new THREE.MeshStandardMaterial({color:0,emissive:0xff2a9a,emissiveIntensity:2.2});add(new THREE.BoxGeometry(w,h,d),m,x,y,z,{cast:false});gleds.push({m,off})};
[[.08,2.3,.08,W,1.15,3.66],[.08,2.3,.08,W,1.15,4.92],[.08,.08,1.36,W,2.34,4.3]].forEach(a=>BX(a[0],a[1],a[2],wood,a[3],a[4],a[5]));
const gw=(w,h,c,x,y,z,ry)=>add(new THREE.PlaneGeometry(w,h),new THREE.MeshStandardMaterial({color:c,roughness:.9,emissive:c,emissiveIntensity:.38}),x,y,z,{r:[0,ry,0]});
/* dış yüzler: balkondan bakınca yan oda içi görünmesin */

{const g=new THREE.PlaneGeometry(10,H),uv=g.attributes.uv;for(let i=0;i<4;i++)uv.setXY(i,uv.getX(i)*10/32,uv.getY(i)*H/56);const m=new THREE.Mesh(g,bm);m.position.set(GX,H/2,Z+.02);scene.add(m)}
add(new THREE.PlaneGeometry(10,10),new THREE.MeshStandardMaterial({color:0x2f2a56,roughness:.3,metalness:.1,envMapIntensity:.8,emissive:0x2f2a56,emissiveIntensity:.4}),GX,0,0,{r:[-Math.PI/2,0,0]});
gw(10,H,0x5b4c8f,GX,H/2,-Z,0);gw(10,H,0x5b4c8f,GX,H/2,Z,Math.PI);gw(10,H,0x4b3f7c,17,H/2,0,-Math.PI/2);gw(8.66,H,0x4b3f7c,W+.02,H/2,-.67,Math.PI/2);gw(1.44,H-2.3,0x4b3f7c,W+.02,(H+2.3)/2,4.38,Math.PI/2);gw(.16,2.3,0x4b3f7c,W+.02,1.15,5.02,Math.PI/2);
add(new THREE.PlaneGeometry(10,10),new THREE.MeshStandardMaterial({color:0x3b3360,roughness:1,emissive:0x3b3360,emissiveIntensity:.4}),GX,H,0,{r:[Math.PI/2,0,0]});
for(let i=0;i<5;i++)GL(9.6,.02,.06,GX,.012,-4+i*2,i*.2);[-4.6,4.6].forEach((z,i)=>GL(9.6,.05,.1,GX,H-.06,z,i*.5));[7.3,16.7].forEach((x,i)=>GL(.1,.05,9.2,x,H-.06,0,i*.5+.25));
const sign=(txt,col,w,h,x,y,z,ry)=>{const tx=cTex(1024,256,(c,a,b)=>{c.fillStyle='#000';c.fillRect(0,0,a,b);c.shadowColor=col;c.shadowBlur=28;c.fillStyle=col;c.font='800 150px system-ui';c.textAlign='center';c.fillText(txt,a/2,175)});add(new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({map:tx,transparent:true,blending:THREE.AdditiveBlending,fog:false}),x,y,z,{r:[0,ry,0]})};
const EN=document.documentElement.lang==='en';
sign('UI / UX','#7fe4ff',2.8,.7,GX-2.2,2.85,-Z+.04,0);
const art=(x,y,z,ry,w,h,draw)=>{const tx=cTex(512,Math.round(512*h/w),draw);RB(w+.06,h+.06,.04,0x0d0d14,x,y,z,.01,{r:[0,ry,0]});add(new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({map:tx}),x+Math.sin(ry)*.025,y,z+Math.cos(ry)*.025,{r:[0,ry,0],cast:false})};
/* tasarım masası + ekranlar: oynanabilir istasyon "Arayüz Atölyesi" */
var dkX,dkT;
{const dx=13.4,dz=-4.25;blob(dx,dz,4.2,1.9);RB(3.6,.07,1.0,0xd8d4cc,dx,.76,dz,.02,{rough:.4});[-1.7,1.7].forEach(o=>RB(.06,.74,.85,0x22242a,dx+o,.37,dz,.01));
 const dkC=document.createElement('canvas');dkC.width=1024;dkC.height=576;dkX=dkC.getContext('2d');dkT=new THREE.CanvasTexture(dkC);dkT.colorSpace=THREE.SRGBColorSpace;dkT.anisotropy=4;
 RB(1.5,.88,.04,0x111216,dx,1.42,dz-.38,.02,{rough:.3});add(new THREE.PlaneGeometry(1.44,.81),new THREE.MeshBasicMaterial({map:dkT,color:new THREE.Color(1.25,1.25,1.25)}),dx,1.42,dz-.357,{cast:false});RB(.08,.4,.08,0x2a2b30,dx,.98,dz-.42,.02,{m:.6,rough:.3});RB(.4,.02,.25,0x2a2b30,dx,.79,dz-.4,.01,{m:.6,rough:.3});
 const kd=cTex(320,560,(x,w,h)=>{x.fillStyle='#0b0f1a';x.fillRect(0,0,w,h);x.font='17px monospace';['<header>','  <nav>…</nav>','</header>','<main>','  <section class="hero">','    <h1>Merhaba</h1>','    <a class="btn">','  </section>','  <div class="cards">','</main>','<footer>…</footer>','','.btn {','  padding: 12px 20px;','  border-radius: 999px;','}'].forEach((l,i)=>{x.fillStyle=i<11?'#7dffb0':'#9ecbff';x.fillText(l,16,34+i*32)})});
 RB(.5,.86,.04,0x111216,dx-1.2,1.42,dz-.3,.02,{rough:.3,r:[0,.35,0]});add(new THREE.PlaneGeometry(.46,.8),new THREE.MeshBasicMaterial({map:kd,color:0xdddddd}),dx-1.2+Math.sin(.35)*.022,1.42,dz-.3+Math.cos(.35)*.022,{r:[0,.35,0],cast:false});
 RB(.6,.025,.2,0x1e1f24,dx,.8,dz+.15,.008,{rough:.5});RB(.36,.012,.26,0x15161a,dx+.75,.79,dz+.1,.01,{rough:.3});add(new THREE.CylinderGeometry(.006,.006,.2,6),M(0xdddddd,.3),dx+.72,.81,dz+.12,{r:[0,0,1.4]});
 add(new THREE.CylinderGeometry(.045,.04,.1,14),M(0x7fe4ff,.3),dx-.7,.84,dz+.2);RB(.18,.18,.18,0xffd166,dx+1.35,.89,dz+.05,.02,{rough:.6});
 add(new THREE.CylinderGeometry(.02,.02,.5,8),M(0x333333,.3,.7),dx+1.55,1.03,dz-.3);add(new THREE.ConeGeometry(.12,.16,16,1,true),new THREE.MeshStandardMaterial({color:0x222222,emissive:0xffd9a0,emissiveIntensity:1.2,side:THREE.DoubleSide}),dx+1.55,1.3,dz-.22);
 RB(.6,.09,.58,0x2b3140,dx,.52,dz+1.05,.06,{rough:.8});RB(.6,.78,.09,0x2b3140,dx,.98,dz+1.38,.06,{rough:.8});add(new THREE.CylinderGeometry(.035,.035,.45,10),M(0x444444,.3,.8),dx,.27,dz+1.05);add(new THREE.CylinderGeometry(.33,.33,.03,5),M(0x222222,.4,.7),dx,.04,dz+1.05)}
const drawDesk=el=>{const x=dkX,tt=el%12,w=1024,h=576;x.fillStyle='#0d1220';x.fillRect(0,0,w,h);x.fillStyle='#121a2b';x.fillRect(0,0,180,h);x.fillRect(w-200,0,200,h);x.font='15px system-ui';['Header','Hero','Cards','Form','Footer'].forEach((sx,i)=>{x.fillStyle=i===Math.floor(tt/1.2)%5?'#7fe4ff':'#7f93b0';x.fillText('▢ '+sx,16,40+i*30)});
 const k=Math.min(1,tt/6),fx=220,fy=40,fw=w-440,fh=h-80;x.fillStyle='#f4f6fa';x.fillRect(fx,fy,fw,fh);
 [[0,0,1,.12,'#0b0d16'],[0,.16,1,.32,'#5ee1ff'],[0,.52,.31,.22,'#ffb25a'],[.345,.52,.31,.22,'#ff6f91'],[.69,.52,.31,.22,'#4de1c1'],[0,.8,1,.2,'#22262e']].forEach((b,i,a)=>{const on=k*a.length>i,bx=fx+12+b[0]*(fw-24),by=fy+12+b[1]*(fh-24),bw=b[2]*(fw-24),bh=b[3]*(fh-24);x.strokeStyle='#9aa4b5';x.lineWidth=2;x.setLineDash(on?[]:[6,6]);if(on){x.globalAlpha=Math.min(1,k*a.length-i);x.fillStyle=b[4];x.fillRect(bx,by,bw,bh);x.globalAlpha=1}x.strokeRect(bx,by,bw,bh)});x.setLineDash([]);
 if(k>=1){x.fillStyle='#0b0d16';x.font='700 30px system-ui';x.fillText(EN?"Hello, I'm Berat":'Merhaba, ben Berat',fx+40,fy+fh*.33)}
 x.fillStyle='#7f93b0';x.font='14px monospace';['W 1440','H 900','Radius 16','Gap 24','#5EE1FF'].forEach((sx,i)=>x.fillText(sx,w-184,40+i*28));
 const cx=fx+((Math.sin(el*1.3)+1)/2)*fw,cy=fy+((Math.cos(el*.9)+1)/2)*fh;x.fillStyle='#ffb25a';x.beginPath();x.moveTo(cx,cy);x.lineTo(cx+14,cy+18);x.lineTo(cx+5,cy+16);x.lineTo(cx,cy+24);x.closePath();x.fill();dkT.needsUpdate=true};drawDesk(0);
const holo=new THREE.Mesh(new THREE.IcosahedronGeometry(.32,1),new THREE.MeshBasicMaterial({color:0x7fe4ff,wireframe:true,transparent:true,opacity:.75,blending:THREE.AdditiveBlending,depthWrite:false}));holo.position.set(12,1.45,0);holo.scale.setScalar(1.5);scene.add(holo);
const bean=(x,z,c)=>{const b=add(new THREE.SphereGeometry(.62,24,16),M(c,1),x,.3,z);b.scale.set(1,.55,1)};bean(10.0,-2.8,0x6a3de0);bean(10.1,1.5,0x1fb5a8);
/* ---- OYUN ODASI: tabela, arcade makineleri, duvar TV'si, konsol ---- */
sign('GAME ROOM','#ff3d9a',1.1,.28,W-.04,2.78,4.3,-Math.PI/2);
{const hp=cTex(1536,960,(c,w,h)=>{c.fillStyle='#140f2e';c.fillRect(0,0,w,h);const r=46,dx=r*1.5,dy=r*Math.sqrt(3);for(let q=-1;q<w/dx+1;q++)for(let j=-1;j<h/dy+1;j++){const x=q*dx,y=j*dy+(q%2?dy/2:0);c.beginPath();for(let i=0;i<6;i++){const a=i*Math.PI/3;c.lineTo(x+Math.cos(a)*(r-3),y+Math.sin(a)*(r-3))}c.closePath();const k=Math.random();c.fillStyle=k<.1?'rgba(255,61,154,.5)':k<.2?'rgba(127,228,255,.4)':k<.5?'rgba(110,90,220,.2)':'rgba(30,24,70,.55)';c.fill();c.strokeStyle='rgba(180,160,255,.3)';c.lineWidth=2;c.stroke()}const v=c.createRadialGradient(w/2,h/2,h*.2,w/2,h/2,w*.6);v.addColorStop(0,'rgba(0,0,0,0)');v.addColorStop(1,'rgba(8,5,20,.65)');c.fillStyle=v;c.fillRect(0,0,w,h)});
 add(new THREE.PlaneGeometry(5.9,3.6),new THREE.MeshBasicMaterial({map:hp,color:new THREE.Color(1.1,1.1,1.1)}),16.97,2.4,-1.75,{r:[0,-Math.PI/2,0],cast:false});
 [[.03,.04,5.94,4.2,-1.75],[.03,.04,5.94,.6,-1.75],[.03,3.64,.04,2.4,-4.7],[.03,3.64,.04,2.4,1.2]].forEach(a=>add(new THREE.BoxGeometry(a[0],a[1],a[2]),new THREE.MeshStandardMaterial({color:0,emissive:0x7fe4ff,emissiveIntensity:2.2}),16.95,a[3],a[4],{cast:false}));
 sign('GAME ROOM','#ff3d9a',3.8,.95,16.92,2.4,-1.75,-Math.PI/2)}
add(new THREE.PlaneGeometry(1.5,.7),new THREE.MeshBasicMaterial({map:glowT,color:0xff3d9a,transparent:true,blending:THREE.AdditiveBlending,depthWrite:false,fog:false,opacity:.5}),W-.05,2.78,4.3,{r:[0,-Math.PI/2,0],cast:false});
add(new THREE.CircleGeometry(2.6,56),M(0x4a3a8a,1),12,.012,0,{r:[-Math.PI/2,0,0],cast:false});
/* orta: yerden tavana büyük holografik sütun (yalnızca görsel) */
const hx=12,hz=0,AB=THREE.AdditiveBlending,glowE=c=>new THREE.MeshStandardMaterial({color:0,emissive:c,emissiveIntensity:2.2}),beamM=(c,o)=>new THREE.MeshBasicMaterial({color:c,transparent:true,opacity:o,blending:AB,depthWrite:false,side:THREE.DoubleSide,fog:false});
add(new THREE.CylinderGeometry(1.05,1.15,.3,56),M(0x2c2660,.22,.75),hx,.15,hz);add(new THREE.CylinderGeometry(.86,.86,.04,56),glowE(0x7fe4ff),hx,.32,hz,{cast:false});
add(new THREE.TorusGeometry(1.0,.022,10,72),glowE(0x7fe4ff),hx,.3,hz,{r:[Math.PI/2,0,0],cast:false});add(new THREE.CylinderGeometry(1.0,1.0,.08,56),glowE(0xb98bff),hx,H-.04,hz,{cast:false});
add(new THREE.CylinderGeometry(.82,.82,H-.5,48,1,true),beamM(0x7fe4ff,.055),hx,.3+(H-.5)/2,hz,{cast:false});add(new THREE.CylinderGeometry(.36,.36,H-.5,32,1,true),beamM(0xb98bff,.07),hx,.3+(H-.5)/2,hz,{cast:false});
const hRings=[...Array(5)].map((_,i)=>add(new THREE.TorusGeometry(.8,.012,8,64),beamM(0x9ceeff,.8),hx,.8,hz,{r:[Math.PI/2,0,0],cast:false}));
const hCube=add(new THREE.BoxGeometry(.85,.85,.85),new THREE.MeshBasicMaterial({color:0x7fe4ff,wireframe:true,transparent:true,opacity:.85,blending:AB,depthWrite:false}),hx,3.4,hz,{cast:false});
const hKnot=add(new THREE.TorusKnotGeometry(.3,.085,96,10),new THREE.MeshBasicMaterial({color:0xff9ac1,wireframe:true,transparent:true,opacity:.9,blending:AB,depthWrite:false}),hx,2.45,hz,{cast:false});
const holoLbl=[['HTML','#ff9a6b'],['CSS','#7fe4ff'],['JS','#ffd166'],['UI','#c28bf0']].map(([t,col])=>{const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:cTex(256,96,(c,w,h)=>{c.shadowColor=col;c.shadowBlur=18;c.fillStyle=col;c.font='800 64px system-ui';c.textAlign='center';c.fillText(t,w/2,68)}),transparent:true,blending:AB,depthWrite:false,fog:false}));sp.scale.set(1.1,.41,1);scene.add(sp);return sp});
const holoAnim=el=>{hCube.rotation.set(el*.4,el*.6,0);hKnot.rotation.set(el*.8,el*.4,0);hCube.position.y=3.35+Math.sin(el*1.1)*.08;hKnot.position.y=2.4+Math.sin(el*1.5+1)*.06;hRings.forEach((r,i)=>{r.position.y=.5+((el*.16+i/5)%1)*(H-1);r.rotation.z=el*.5});holoLbl.forEach((sp,i)=>{const a2=el*.5+i*Math.PI/2;sp.position.set(hx+Math.cos(a2)*1.6,1.9+Math.sin(el*1.2+i)*.12+(i%2)*.7,hz+Math.sin(a2)*1.6)})};holoAnim(0);
/* ================= OYUN ODASI v3: 3 oyun istasyonu + ders duvarı + 3B duvar kabartmaları ================= */
const mkP=(ox,oz,ry)=>{const c=Math.cos(ry),sn=Math.sin(ry);return(lx,ly,lz)=>[ox+lx*c+lz*sn,ly,oz-lx*sn+lz*c]};
const STN={},STN_OB=[];
const prev=(k)=>cTex(512,288,(c,w,h)=>{c.fillStyle='#0b1020';c.fillRect(0,0,w,h);
 if(k==='tag'){for(let i=0;i<8;i++){const x0=30+(i%4)*118,y0=40+Math.floor(i/4)*110;c.fillStyle=i%3?'#f4f6fa':'#7a5af0';c.beginPath();c.roundRect(x0,y0,100,90,12);c.fill();c.fillStyle=i%3?'#0b1020':'#fff';c.font='700 22px monospace';c.textAlign='center';c.fillText(['<h1>','Başlık','<p>','<a>','Link','<img>','<ul>','Liste'][i],x0+50,y0+55)}}
 else if(k==='bug'){['<h1>Home</h1>','<img src="cat.jpg">','<p>I am Berat.</p>','<a href="/x">Go</a>'].forEach((l,i)=>{c.fillStyle=i===1?'#5a1626':'#131a2e';c.fillRect(30,34+i*62,w-60,50);c.fillStyle=i===1?'#ff8fa8':'#7dffb0';c.font='600 24px monospace';c.textAlign='left';c.fillText(l,46,68+i*62)});c.strokeStyle='#ff5a6e';c.lineWidth=6;c.beginPath();c.arc(430,96,34,0,7);c.moveTo(454,120);c.lineTo(486,152);c.stroke()}
 else{c.font='54px serif';c.textAlign='center';for(let i=0;i<8;i++){c.fillStyle='#131a30';c.beginPath();c.roundRect(40+(i%4)*118,50+Math.floor(i/4)*110,100,90,20);c.fill()}c.fillText('🐞',90,130);c.fillText('🐞',326,240);c.fillText('🐞',208,130)}});
const station=(key,x,z,ry,col,name)=>{const P=mkP(x,z,ry),Ro=(w,h,d,c,lx,ly,lz,rad,o={})=>RB(w,h,d,c,...P(lx,ly,lz),rad,{...o,r:[0,ry,0]}),at=(g,m,lx,ly,lz,o={})=>add(g,m,...P(lx,ly,lz),{...o,r:[0,ry+(o.ry||0),0]}),cc=new THREE.Color(col),emi=new THREE.MeshStandardMaterial({color:0,emissive:cc,emissiveIntensity:2.2});
 /* masa: beyaz üst, grafit ayaklar, alt raf */
 Ro(2.4,.05,.9,0xf6f6f8,0,.76,.46,.02,{rough:.22});[-1.12,1.12].forEach(sx=>Ro(.05,.74,.8,0x2a2c34,sx,.37,.46,.01,{rough:.4,m:.5}));Ro(2.2,.04,.7,0x3a3d46,0,.3,.46,.01,{rough:.5});
 /* monitör: ince çerçeve, ışıklı ekran, alüminyum ayak */
 Ro(1.42,.84,.035,0x16171c,0,1.34,.15,.02,{rough:.25,m:.6});at(new THREE.PlaneGeometry(1.32,.76),new THREE.MeshBasicMaterial({map:prev(key),color:new THREE.Color(1.25,1.25,1.25)}),0,1.34,.171,{cast:false});
 Ro(.08,.36,.05,0xc9ccd4,0,.96,.14,.01,{rough:.3,m:.8});Ro(.4,.015,.22,0xc9ccd4,0,.79,.18,.01,{rough:.3,m:.8});
 /* klavye, fare, lamba, bitki */
 Ro(.54,.022,.17,0xe9e9ee,0,.795,.58,.01,{rough:.4});Ro(.07,.03,.11,0xe9e9ee,.5,.8,.58,.015,{rough:.4});
 at(new THREE.CylinderGeometry(.06,.07,.025,18),M(0x1c1d22,.4,.6),-.95,.79,.3);at(new THREE.CylinderGeometry(.01,.01,.42,8),M(0x333333,.3,.8),-.95,1.0,.3);at(new THREE.ConeGeometry(.1,.13,18,1,true),new THREE.MeshStandardMaterial({color:0x222222,emissive:0xffd9a0,emissiveIntensity:1.4,side:THREE.DoubleSide}),-.95,1.24,.3);
 at(new THREE.CylinderGeometry(.09,.07,.14,16),M(0xe8e2d8,.5),.98,.86,.32);for(let i=0;i<6;i++){const lf=at(new THREE.SphereGeometry(.07,10,8),M(0x3f8f50,.6),.98+Math.cos(i*1.1)*.05,1.02+(i%3)*.08,.32+Math.sin(i*1.1)*.05);lf.scale.set(.5,1.5,.3);lf.rotation.z=Math.cos(i)*.5}
 /* sandalye: yuvarlak minder, eğik sırtlık, kolçak, yıldız ayak */
 Ro(.54,.1,.52,0x23262e,0,.5,1.15,.05,{rough:.7});Ro(.5,.6,.08,col,0,.86,1.43,.06,{rough:.65});Ro(.3,.14,.07,0x23262e,0,1.28,1.46,.05,{rough:.7});[-.28,.28].forEach(sx=>Ro(.05,.05,.3,0x2a2c34,sx,.68,1.18,.02));
 at(new THREE.CylinderGeometry(.035,.035,.42,10),M(0x555555,.3,.8),0,.26,1.15);for(let i=0;i<5;i++){const a=i*Math.PI*2/5;at(new THREE.BoxGeometry(.34,.025,.045),M(0x2a2c34,.4,.6),Math.cos(a)*.17,.045,1.15+Math.sin(a)*.17,{ry:-a})}
 at(new THREE.BoxGeometry(2.4,.025,.03),emi,0,.69,.9,{cast:false});
 add(new THREE.PlaneGeometry(3.4,3.0),new THREE.MeshBasicMaterial({map:floorGlow,color:col,transparent:true,blending:THREE.AdditiveBlending,depthWrite:false,fog:false,opacity:.7}),...P(0,.02,.9),{r:[-Math.PI/2,0,0],cast:false});
 const cs=Math.abs(Math.cos(ry)),sn2=Math.abs(Math.sin(ry)),hw=1.2,dp=1.6,ex=hw*cs+dp*sn2*.5,ez=hw*sn2+dp*cs*.5,cq=P(0,0,dp/2);STN_OB.push([cq[0]-ex,cq[0]+ex,cq[2]-ez,cq[2]+ez]);
 {const q=P(0,2.85,.04);sign(name,'#'+cc.getHexString(),2.2,.55,q[0],2.85,q[2],ry)}
 const f=P(0,1.6,2.0),l=P(0,1.3,.14),pp=P(0,2.45,.5);STN[key]={p:V(pp[0],pp[1],pp[2]),f:V(f[0],f[1],f[2]),l:V(l[0],l[1],l[2])}};
station('tag',10.8,Z-.02,Math.PI,0xffb25a,EN?'TAGS':'ETİKET');
station('bug',14.6,Z-.02,Math.PI,0xb98bff,EN?'DETECTIVE':'DEDEKTİF');
station('squash',16.98,2.9,-Math.PI/2,0x7dffb0,EN?'SQUASH':'BÖCEK AVI');
/* ---- DERS DUVARI: seviyeye göre dönen animasyonlu mini ders ---- */
let lessonLevel=+(localStorage.getItem('lv')||0);if(!(lessonLevel>=0&&lessonLevel<3))lessonLevel=0;let lastLs=0,lsBase=0,lsReset=true;
const lsC=document.createElement('canvas');lsC.width=768;lsC.height=432;const lsW=lsC.getContext('2d'),lsT=new THREE.CanvasTexture(lsC);let lsX=lsW;lsT.colorSpace=THREE.SRGBColorSpace;lsT.anisotropy=4;
{const cz=-.65;RB(.12,3.5,6.1,0x0b0c10,W+.1,2.2,cz,.04,{rough:.3,m:.4});
 add(new THREE.PlaneGeometry(5.6,3.15),new THREE.MeshBasicMaterial({map:lsT,color:new THREE.Color(1.15,1.15,1.15)}),W+.17,2.2,cz,{r:[0,Math.PI/2,0],cast:false});
 [[.03,.03,5.9,W+.17,3.88,cz],[.03,.03,5.9,W+.17,.52,cz],[.03,3.4,.03,W+.17,2.2,cz+2.95],[.03,3.4,.03,W+.17,2.2,cz-2.95]].forEach(a=>add(new THREE.BoxGeometry(a[0],a[1],a[2]),glowE(0x7fe4ff),a[3],a[4],a[5],{cast:false}));
 add(new THREE.PlaneGeometry(8.2,5.2),new THREE.MeshBasicMaterial({map:wallGlow,transparent:true,blending:THREE.AdditiveBlending,depthWrite:false,fog:false,opacity:.5}),W+.045,2.2,cz,{r:[0,Math.PI/2,0],cast:false});
 add(new THREE.PlaneGeometry(4.4,3.4),new THREE.MeshBasicMaterial({map:floorGlow,transparent:true,blending:THREE.AdditiveBlending,depthWrite:false,fog:false,opacity:.45}),W+2.4,.02,cz,{r:[-Math.PI/2,0,0],cast:false});
 }
const rr=(x,y,w,h,r,f,st)=>{lsX.beginPath();lsX.roundRect(x,y,w,h,r);if(f){lsX.fillStyle=f;lsX.fill()}if(st){lsX.strokeStyle=st;lsX.lineWidth=2;lsX.stroke()}};
const tx=(t,x,y,f,c,a='left')=>{lsX.font=f;lsX.fillStyle=c;lsX.textAlign=a;lsX.fillText(t,x,y)};
const ez=v=>{v=Math.max(0,Math.min(1,v));return 1-Math.pow(1-v,3)};
const typed=(arr,t,cps)=>{let n=Math.floor(t*cps);return arr.map(l=>{const o=l.slice(0,Math.max(0,n));n-=l.length+6;return o})};
const mono='600 24px ui-monospace,monospace';
const mock=(x0,y0,w,h,o)=>{rr(x0,y0,w,h,16,o.bg,'#ffffff55');lsX.save();lsX.beginPath();lsX.roundRect(x0,y0,w,h,16);lsX.clip();lsX.fillStyle='#e3e7ee';lsX.fillRect(x0,y0,w,26);['#ff5f57','#febc2e','#28c840'].forEach((c,i)=>{lsX.fillStyle=c;lsX.beginPath();lsX.arc(x0+16+i*18,y0+13,5,0,7);lsX.fill()});
 if(o.h)tx(o.H,x0+26,y0+96,'800 '+(o.fs||40)+'px '+(o.ff||'system-ui'),o.hc);if(o.p)tx(o.P,x0+26,y0+140,'400 24px system-ui',o.tc);
 if(o.b){const bw=150,bx=x0+26,by=y0+h-84+(o.press?3:0);rr(bx,by,bw,48,o.br,o.bc);tx(o.B,bx+bw/2,by+32,'700 22px system-ui',o.bt||'#000','center')}if(o.big!==undefined)tx(String(o.big),x0+w-70,y0+104,'800 64px system-ui',o.hc,'center');lsX.restore()};
const HL=EN?'Hello':'Merhaba',PL=EN?"I'm Berat.":'Ben Berat.',BL=EN?'Click':'Tıkla';
const VSo=[
 t=>{[['HTML','#ff9a6b',EN?'skeleton':'iskelet'],['CSS','#7fe4ff',EN?'clothes':'giysi'],['JS','#ffd166',EN?'movement':'hareket']].forEach((a,i)=>{const k=ez((t-.3-i*1.3)/.7);if(k<=0)return;const x0=70+i*300,y0=110+(1-k)*40;lsX.globalAlpha=k;rr(x0,y0,260,230,26,'#ffffff10',a[1]);tx(a[0],x0+130,y0+118,'800 66px system-ui',a[1],'center');tx(a[2],x0+130,y0+178,'600 28px system-ui','#cfe0f2','center');lsX.globalAlpha=1;if(i<2&&k>.9)tx('+',x0+280,y0+130,'800 44px system-ui','#fff','center')})},
 t=>{const L=['<h1>'+HL+'</h1>','<p>'+PL+'</p>','<button>'+BL+'</button>'],s=typed(L,t,11);rr(40,90,430,300,18,'#0b1020','#7fe4ff55');s.forEach((z,i)=>tx(z,64,150+i*70,mono,'#7dffb0'));mock(500,90,420,300,{bg:'#fff',hc:'#000',tc:'#000',bc:'#e0e0e0',br:3,h:s[0]===L[0],p:s[1]===L[1],b:s[2]===L[2],H:HL,P:PL,B:BL})},
 t=>{const L=['body { background: #0b1220; }','h1 { color: #7fe4ff; }','button { background: #ffb25a;','  border-radius: 24px; }'],s=typed(L,t,10);rr(40,90,430,300,18,'#0b1020','#7fe4ff55');s.forEach((z,i)=>tx(z,56,146+i*56,'600 21px ui-monospace,monospace','#9ecbff'));const d0=s[0]===L[0],d1=s[1]===L[1],d3=s[3]===L[3];mock(500,90,420,300,{bg:d0?'#0b1220':'#fff',hc:d1?'#7fe4ff':'#000',tc:d0?'#cfe0f2':'#000',bc:s[2]===L[2]?'#ffb25a':'#e0e0e0',br:d3?24:3,h:1,p:1,b:1,H:HL,P:PL,B:BL})},
 t=>{const n=Math.floor(t/1.6),pr=(t%1.6)<.18;rr(40,90,430,300,18,'#0b1020','#7fe4ff55');['let n = 0;','button.onclick = () => {','  n++;','  show(n);','};'].forEach((z,i)=>tx(z,64,146+i*52,mono,(i===2||i===3)&&pr?'#ffd166':'#9ecbff'));mock(500,90,420,300,{bg:'#fff',hc:'#0b1220',tc:'#000',bc:pr?'#e8a23c':'#ffb25a',br:24,h:1,b:1,press:pr,H:EN?'Counter':'Sayaç',B:BL,big:n});const bx=500+26+75,by=90+300-84+24;lsX.fillStyle='#000';lsX.beginPath();lsX.moveTo(bx+20,by+22+(pr?3:0));lsX.lineTo(bx+20,by+50+(pr?3:0));lsX.lineTo(bx+28,by+43+(pr?3:0));lsX.lineTo(bx+40,by+43+(pr?3:0));lsX.closePath();lsX.fill()},
 t=>{const M2=['flex-start','center','space-between'],m=Math.floor(t/2.3)%3,pm=(m+2)%3,k=ez((t%2.3)/.6),pos=(md,i)=>md===0?150+i*120:md===1?310+i*120:150+i*290;rr(120,110,720,190,18,'#ffffff0c','#7fe4ff77');[0,1,2].forEach(i=>{const x0=pos(pm,i)+(pos(m,i)-pos(pm,i))*k;rr(x0,160,100,100,16,['#ff9a6b','#7fe4ff','#ffd166'][i]);tx(String(i+1),x0+50,225,'800 44px system-ui','#0b1220','center')});tx('display: flex;',200,350,mono,'#9ecbff');tx('justify-content: '+M2[m]+';',200,385,'700 24px ui-monospace,monospace','#ffd166')},
 t=>{const w=280+500*(.5+.5*Math.cos(t*.9)),x0=480-w/2,wide=w>520;rr(x0,90,w,270,16,'#f4f6fa','#fff6');lsX.save();lsX.beginPath();lsX.roundRect(x0,90,w,270,16);lsX.clip();lsX.fillStyle='#e3e7ee';lsX.fillRect(x0,90,w,26);const cs=['#ff9a6b','#7fe4ff','#ffd166'];cs.forEach((c,i)=>{if(wide){const cw=(w-80)/3;rr(x0+20+i*(cw+20),140,cw,190,14,c)}else rr(x0+20,132+i*72,w-40,60,12,c)});lsX.restore();tx(Math.round(w)+' px · '+(wide?(EN?'desktop':'bilgisayar'):(EN?'phone':'telefon')),480,395,'700 26px ui-monospace,monospace','#7fe4ff','center');tx('@media (max-width: 600px) { ... }',480,428,mono,'#ffd166','center')},
 t=>{[['#9aa0a6','#ffffff','2.6:1',0],['#595959','#ffffff','7.0:1',1],['#ffffff','#ffb25a','1.9:1',0],['#0b1220','#ffb25a','9.8:1',1]].forEach((a,i)=>{const k=ez((t-.3-i*1.4)/.5);if(k<=0)return;const x0=60+(i%2)*440,y0=90+Math.floor(i/2)*160;lsX.globalAlpha=k;rr(x0,y0,400,130,18,a[1],'#fff6');tx('Aa '+(EN?'Hello':'Merhaba'),x0+24,y0+78,'800 44px system-ui',a[0]);if(t>.8+i*1.4){tx(a[2],x0+270,y0+60,'700 28px ui-monospace,monospace',a[3]?'#0a7a3a':'#c0243a');tx(a[3]?'✓':'✗',x0+340,y0+104,'800 40px system-ui',a[3]?'#0a7a3a':'#c0243a')}lsX.globalAlpha=1})},
 t=>{const tips=[EN?'Shrink images':'Görselleri küçült',EN?'Lazy-load':'Geç yükle',EN?'Minify code':'Kodu sıkıştır'],stg=t<1.2?0:t<2.8?1:t<4.4?2:3,val=[4.2,3.0,2.0,1.1][stg],pv=[4.2,4.2,3.0,2.0][stg],k=ez((t-[0,1.2,2.8,4.4][stg])/.8),v=pv+(val-pv)*k;rr(80,100,800,60,14,'#ffffff12');rr(80,100,800*v/4.2,60,14,v>2.5?'#ff6f91':v>1.6?'#ffd166':'#5fe0a8');tx(v.toFixed(1)+' s',100,142,'800 36px system-ui','#0b1220');tips.forEach((a,i)=>{const on=stg>i;tx((on?'✓ ':'○ ')+a,100,230+i*54,'700 30px system-ui',on?'#5fe0a8':'#7f93b0')})},
 t=>{const it=['Home',EN?'Projects':'Projeler','Blog',EN?'Contact':'İletişim'],f=Math.floor(t/1.4)%4;rr(120,110,720,90,18,'#ffffff10','#fff3');it.forEach((a,i)=>{const x0=150+i*170;if(i===f){rr(x0-14,128,150,54,12,null,'#7fe4ff');lsX.lineWidth=5;rr(x0-14,128,150,54,12,'#7fe4ff22','#7fe4ff')}tx(a,x0+60,164,'700 26px system-ui','#fff','center')});tx('Tab ⭾',480,262,'700 30px system-ui','#ffd166','center');rr(220,300,520,90,24,'#ffffff12','#ffd16688');tx((EN?'Screen reader: ':'Ekran okuyucu: ')+'“'+it[f]+(EN?', link”':', bağlantı”'),480,356,'600 26px system-ui','#fff','center')},
 t=>{const T1='Berat Yanardağ | '+(EN?'Web Design':'Web Tasarım'),D1=EN?'Portfolio of a computer programming student: projects, blog and gallery.':'Bilgisayar programcılığı öğrencisinin projeleri, blogu ve galerisi.',a=T1.slice(0,Math.floor(t*14)),b=D1.slice(0,Math.max(0,Math.floor((t-2)*20)));rr(60,90,560,230,18,'#fff','#fff6');tx('beratyanardag.com',90,140,'600 22px system-ui','#0a7a3a');tx(a,90,186,'700 32px system-ui','#1a0dab');for(let i=0;i<2;i++)tx(b.slice(i*46,i*46+46),90,232+i*34,'400 24px system-ui','#4d5156');const tl=Math.min(a.length,60),dl=Math.min(b.length,155);tx('title '+tl+'/60',660,140,mono,'#7fe4ff');rr(660,156,240,14,7,'#ffffff18');rr(660,156,240*tl/60,14,7,'#5fe0a8');tx('description '+dl+'/155',660,226,mono,'#7fe4ff');rr(660,242,240,14,7,'#ffffff18');rr(660,242,240*dl/155,14,7,'#5fe0a8')}
];
const FULL=['<h1>'+HL+'</h1>','<p>'+PL+'</p>','<button>'+BL+'</button>'];
const htmlSlide=n=>t=>{const s2=FULL.slice(0,n).map((l,i)=>i<n-1?l:l.slice(0,Math.floor(t*6))),dn=s2[n-1]===FULL[n-1];rr(40,90,430,300,18,'#0b1020','#7fe4ff55');s2.forEach((z,i)=>tx(z,64,150+i*70,mono,'#7dffb0'));
 mock(500,90,420,300,{bg:'#fff',hc:'#000',tc:'#000',bc:'#e0e0e0',br:3,h:n>1||dn,p:n>2||(n===2&&dn),b:n===3&&dn,H:HL,P:PL,B:BL});if(dn){const k=.5+.5*Math.sin(t*3);rr(496,86,428,308,18,null,'rgba(255,178,90,'+(.3+.4*k)+')')}};
const VS=[
 t=>{const nd=(x,l,c)=>{rr(x,110,210,130,22,'#ffffff10',c);tx(l,x+105,188,'700 30px system-ui',c,'center')};nd(70,EN?'Your browser':'Tarayıcın','#7fe4ff');nd(680,EN?'Server':'Sunucu','#ffd166');const ph=(t%8)/8,go=ph<.5,px=go?290+370*(ph/.5):660-370*((ph-.5)/.5);
  lsX.setLineDash([8,8]);lsX.strokeStyle='#ffffff55';lsX.lineWidth=3;lsX.beginPath();lsX.moveTo(290,175);lsX.lineTo(660,175);lsX.stroke();lsX.setLineDash([]);rr(px-24,154,48,42,10,go?'#7fe4ff':'#ffd166');tx(go?'?':'</>',px,184,'800 22px system-ui','#0b1220','center');
  tx((go?'▶ ':'  ')+(EN?'1  Browser asks: "give me the page"':'1  Tarayıcı ister: "sayfayı ver"'),120,310,'600 26px system-ui',go?'#fff':'#7f93b0');tx((go?'  ':'▶ ')+(EN?'2  Server sends HTML, CSS and JS files':'2  Sunucu HTML, CSS ve JS dosyalarını gönderir'),120,352,'600 26px system-ui',go?'#7f93b0':'#fff');tx(EN?'3  The browser puts them together: that is the page you see':'3  Tarayıcı bunları birleştirir: gördüğün sayfa budur',120,394,'600 26px system-ui','#7f93b0')},
 VSo[0],htmlSlide(1),htmlSlide(2),htmlSlide(3),
 t=>{const parts=[['<p>','#7fe4ff',EN?'opening tag':'açılış etiketi'],[EN?'Hello':'Merhaba','#fff',EN?'content':'içerik'],['</p>','#7fe4ff',EN?'closing tag (has a /)':'kapanış etiketi (/ var)']];let x0=100;parts.forEach((a,i)=>{const k=ez((t-.8-i*2.4)/.8);lsX.font='800 64px ui-monospace,monospace';const w=lsX.measureText(a[0]).width;if(k>0){lsX.globalAlpha=k;tx(a[0],x0,220,'800 64px ui-monospace,monospace',a[1]);rr(x0-4,236,w+8,5,3,a[1]);tx(a[2],x0+w/2,290,'600 22px system-ui',a[1],'center');lsX.globalAlpha=1}x0+=w+22})},
 t=>{const cs=['#ff9a6b','#7fe4ff','#ffd166','#c28bf0'],c=cs[Math.floor(t/3)%4];rr(40,90,430,300,18,'#0b1020','#7fe4ff55');tx('h1 {',64,160,mono,'#9ecbff');tx('  color:',64,214,mono,'#9ecbff');tx(c+';',64+9*14.4,214,'700 24px ui-monospace,monospace',c);tx('}',64,268,mono,'#9ecbff');mock(500,90,420,300,{bg:'#fff',hc:c,tc:'#000',h:1,p:1,H:HL,P:PL})},
 t=>{const k=.5+.5*Math.sin(t*.55),fs=Math.round(28+22*k),br=Math.round(30*k);rr(40,90,430,300,18,'#0b1020','#7fe4ff55');['h1 { font-size: '+fs+'px; }','button { border-radius: '+br+'px; }'].forEach((z,i)=>tx(z,50,170+i*80,'600 20px ui-monospace,monospace',i?'#ffd166':'#9ecbff'));mock(500,90,420,300,{bg:'#fff',hc:'#0b1220',tc:'#000',h:1,p:1,b:1,H:HL,P:PL,B:BL,bc:'#ffb25a',br,fs})},
 VSo[3],VSo[4],VSo[5],VSo[6],VSo[7],VSo[8],VSo[9]];
const LVL=[[0,1,2,3,4,5,6,7,8],[9,10,11],[12,13,14]],SL=9,LSPEED=1;
const drawLessonCtx=(ctx,cw,ch,lv,k,t)=>{const prev=lsX;lsX=ctx;ctx.setTransform(cw/960,0,0,ch/540,0,0);const w=960,h=540,L=LVL[lv],ix=L[k];
 const g=ctx.createLinearGradient(0,0,w,h);g.addColorStop(0,'#101a36');g.addColorStop(1,'#0a0d1a');ctx.fillStyle=g;ctx.fillRect(0,0,w,h);VS[ix](t);
 rr(0,444,w,96,0,'#00000066');const ti=LESSON.titles[ix],mo=LESSON.more&&LESSON.more[ix],body=(mo&&t>SL*.5)?'💡 '+mo[2]:ti[1];tx(ti[0],40,484,'800 34px system-ui','#fff');ctx.font='400 21px system-ui';let ln='',yy=514;for(const wd of body.split(' ')){const tt=ln+wd+' ';if(ctx.measureText(tt).width>880&&ln){tx(ln,40,yy,'400 21px system-ui','#cfe0f2');ln=wd+' ';yy+=24}else ln=tt}tx(ln,40,yy,'400 21px system-ui','#cfe0f2');
 rr(30,18,300,36,18,'#7fe4ff22','#7fe4ff77');tx('▶ '+(EN?'LEVEL ':'SEVİYE ')+(lv+1)+' · '+LESSON.names[lv].toUpperCase(),44,42,'700 15px system-ui','#bfefff');
 L.forEach((_,i)=>{ctx.fillStyle=i===k?'#ffb25a':'#ffffff33';ctx.beginPath();ctx.arc(920-(L.length-1-i)*20,36,6,0,7);ctx.fill()});ctx.setTransform(1,0,0,1,0,0);lsX=prev};
const drawLesson=el=>{if(lsReset){lsBase=el;lsReset=false}const tt=(el-lsBase)*LSPEED,k=Math.floor(tt/SL)%LVL[lessonLevel].length;drawLessonCtx(lsW,lsC.width,lsC.height,lessonLevel,k,tt%SL);lsT.needsUpdate=true};drawLesson(0);
/* isteyen dersin içine girer: büyük oynatıcı, kendi hızında ilerler */
function openLessonPlayer(){const root=$('#game');root.hidden=false;let lv=lessonLevel,k=0,t=0,play=!matchMedia('(prefers-reduced-motion: reduce)').matches,raf=0,last=performance.now(),lastD=0;
 const lbl=(a,b)=>EN?a:b;
 root.innerHTML=`<div class="gw lsw" role="dialog" aria-modal="true" aria-label="${lbl('Lesson','Ders')}"><button class="gx" aria-label="${lbl('Close','Kapat')}">✕</button><div class="ghead"><b>${lbl('Lesson','Ders')}</b><span class="gstep lsn"></span></div><div class="lvp">${LESSON.names.map((n,i)=>`<button data-l="${i}">${n}</button>`).join('')}</div><div class="lsbody"><div class="lsl"><canvas class="lsc" width="1280" height="720" aria-hidden="true"></canvas><div class="lsctl"><button data-a="prev" aria-label="${lbl('Previous','Önceki')}">◀</button><button data-a="play"></button><button data-a="next" aria-label="${lbl('Next','Sonraki')}">▶</button></div></div><div class="lsr"><div class="lst" aria-live="polite"><h3></h3><p></p><div class="lmore"></div></div></div></div></div>`;
 const cv=root.querySelector('.lsc'),cx=cv.getContext('2d'),pb=root.querySelector('[data-a=play]'),h3=root.querySelector('.lst h3'),pp=root.querySelector('.lst p'),sn=root.querySelector('.lsn'),lm=root.querySelector('.lmore');
 const sync=()=>{const ti=LESSON.titles[LVL[lv][k]];h3.textContent=ti[0];pp.textContent=ti[1];lm.textContent='';{const mo=LESSON.more&&LESSON.more[LVL[lv][k]];if(mo){const d=document.createElement('p'),pr=document.createElement('pre'),cd=document.createElement('code'),tp=document.createElement('p');d.textContent=mo[0];cd.textContent=mo[1];pr.appendChild(cd);tp.className='ltip';tp.textContent='💡 '+mo[2];lm.append(d,pr,tp)}}sn.textContent=(k+1)+' / '+LVL[lv].length;pb.textContent=play?'⏸ '+lbl('Pause','Duraklat'):'▶ '+lbl('Play','Oynat');root.querySelectorAll('.lvp button').forEach(b=>b.classList.toggle('on',+b.dataset.l===lv))};
 const step=d=>{k=(k+d+LVL[lv].length)%LVL[lv].length;t=0;sync()};
 const close=()=>{cancelAnimationFrame(raf);removeEventListener('keydown',key);root.hidden=true;root.innerHTML=''};
 const key=e=>{if(e.key==='Escape')close();else if(e.key==='ArrowRight')step(1);else if(e.key==='ArrowLeft')step(-1)};addEventListener('keydown',key);
 root.querySelector('.gx').onclick=close;root.querySelector('.gx').focus();root.querySelector('[data-a=prev]').onclick=()=>step(-1);root.querySelector('[data-a=next]').onclick=()=>step(1);pb.onclick=()=>{play=!play;sync()};
 root.querySelectorAll('.lvp button').forEach(b=>b.onclick=()=>{lv=+b.dataset.l;lessonLevel=lv;localStorage.setItem('lv',lv);k=0;t=0;sync()});
 const loop=now=>{raf=requestAnimationFrame(loop);const dt=Math.min((now-last)/1000,.1);last=now;if(play){t+=dt*LSPEED;if(t>=SL)step(1)}if(now-lastD>33){lastD=now;drawLessonCtx(cx,1280,720,lv,k,t)}};sync();raf=requestAnimationFrame(loop)}
/* ---- 3B duvar kabartmaları: petek (altıgen) paneller ---- */
const hexG=(()=>{const sh=new THREE.Shape();for(let i=0;i<6;i++){const a=i*Math.PI/3+Math.PI/6;i?sh.lineTo(Math.cos(a)*.17,Math.sin(a)*.17):sh.moveTo(Math.cos(a)*.17,Math.sin(a)*.17)}return new THREE.ExtrudeGeometry(sh,{depth:1,bevelEnabled:false})})();
const hexE=new THREE.MeshStandardMaterial({color:0,emissive:0x7fe4ff,emissiveIntensity:1.6});
const hexWall=(ox,oz,ry,cols,rows,y0)=>{const P=mkP(ox,oz,ry),n=cols*rows,pal=[0x6a5acd,0x3fa7c4,0xd96aa7,0x4a3d78].map(c=>new THREE.Color(c)),im=new THREE.InstancedMesh(hexG,new THREE.MeshStandardMaterial({color:0xffffff,roughness:.42,metalness:.3,envMapIntensity:1}),n),ie=new THREE.InstancedMesh(hexG,hexE,Math.ceil(n/7)+1),o=new THREE.Object3D();let k=0,ne=0;
 for(let r=0;r<rows;r++)for(let c=0;c<cols;c++){const q=P(c*.3+(r%2)*.15,y0+r*.26,0),dpt=.03+.09*(.5+.5*Math.sin(c*1.3+r*.9));if(ry<-1&&Math.abs(q[2]+2.2)<2.3&&q[1]>2.65&&q[1]<4.35)continue;o.position.set(q[0],q[1],q[2]);o.rotation.set(0,ry,0);o.scale.set(1,1,dpt);o.updateMatrix();
  if((r*cols+c)%7===3&&ne<ie.count)ie.setMatrixAt(ne++,o.matrix);else{im.setMatrixAt(k,o.matrix);im.setColorAt(k,pal[(c+r*2)%4]);k++}}
 im.count=k;ie.count=ne;[im,ie].forEach(m=>{m.frustumCulled=false;m.matrixAutoUpdate=false;scene.add(m)})};


if(HI)lt(new THREE.PointLight(0x7fe4ff,2.2,4.5),2.2).position.set(hx,2.0,hz);
/* oyun odasını aydınlat: tamamen karanlık kalmasın */

/* tasarım sistemi ekranı (doğu duvarı) */
const tvC=document.createElement('canvas');tvC.width=512;tvC.height=288;const tvX=tvC.getContext('2d'),tvT=new THREE.CanvasTexture(tvC);tvT.colorSpace=THREE.SRGBColorSpace;
RB(.1,1.95,3.3,0x07070c,16.94,1.75,.4,.03);add(new THREE.PlaneGeometry(3.1,1.74),new THREE.MeshBasicMaterial({map:tvT,color:new THREE.Color(1.3,1.3,1.3)}),16.87,1.75,.4,{r:[0,-Math.PI/2,0],cast:false});
const drawTV=el=>{const x=tvX;x.fillStyle='#0d1220';x.fillRect(0,0,512,288);x.fillStyle='#fff';x.font='700 22px system-ui';x.fillText('Design System',18,32);
 ['#0b0d16','#5ee1ff','#ffb25a','#ff6f91','#4de1c1'].forEach((k,i)=>{x.fillStyle=k;x.beginPath();x.roundRect(18+i*58,48,48,48,8);x.fill();if(Math.floor(el)%5===i){x.strokeStyle='#fff';x.lineWidth=3;x.stroke()}});
 const pu=(Math.sin(el*3)+1)/2;x.fillStyle=`rgba(255,178,90,${.7+pu*.3})`;x.beginPath();x.roundRect(18,116,150,44,22);x.fill();x.fillStyle='#2a1408';x.font='700 18px system-ui';x.fillText('Button',58,144);x.strokeStyle='#7fe4ff';x.lineWidth=2;x.beginPath();x.roundRect(182,116,150,44,22);x.stroke();x.fillStyle='#7fe4ff';x.fillText('Ghost',228,144);
 x.fillStyle='#fff';x.font='800 40px Georgia,serif';x.fillText('Aa',18,222);x.font='600 16px system-ui';x.fillStyle='#9fb5cc';x.fillText('H1 40 · Body 16 · Line 1.6',80,212);
 [8,16,24,32].forEach((sp,i)=>{x.fillStyle='#ff6f91';x.fillRect(360,40+i*36,sp*3,20);x.fillStyle='#9fb5cc';x.font='14px monospace';x.fillText(sp+'px',366+sp*3,56+i*36)});
 x.fillStyle='#141b2c';x.beginPath();x.roundRect(350,186,146,84,12);x.fill();x.fillStyle='#5ee1ff';x.fillRect(362,198,60,8);x.fillStyle='#9aa4b5';x.fillRect(362,216,120,6);x.fillRect(362,230,100,6);tvT.needsUpdate=true};drawTV(0);
/* raf + rozet kupası */
RB(2.0,.05,.3,wood,9.2,1.55,-Z+.2,.01);{const cube=cTex(128,128,(c,w,h)=>{const cl=['#e63946','#f4a261','#2a9d8f','#457b9d','#ffd23d','#ffffff'];for(let i=0;i<3;i++)for(let j=0;j<3;j++){c.fillStyle=cl[(i*3+j)%6];c.fillRect(i*42+2,j*42+2,38,38)}});add(new THREE.BoxGeometry(.18,.18,.18),new THREE.MeshStandardMaterial({map:cube,roughness:.4}),8.6,1.69,-Z+.2,{r:[0,.5,0]})}
const gold=new THREE.MeshStandardMaterial({color:0xffc83a,metalness:1,roughness:.25,emissive:0x6a4a00,emissiveIntensity:.5}),trophy=new THREE.Group();trophy.position.set(9.6,1.6,-Z+.22);scene.add(trophy);
[[new THREE.CylinderGeometry(.09,.1,.05,16),0,.025],[new THREE.CylinderGeometry(.02,.03,.12,12),0,.11],[new THREE.CylinderGeometry(.11,.05,.17,20),0,.25]].forEach(a=>{const m=new THREE.Mesh(a[0],gold);m.position.set(a[1],a[2],0);m.castShadow=true;trophy.add(m)});[-1,1].forEach(sx=>{const hh=new THREE.Mesh(new THREE.TorusGeometry(.05,.009,8,14),gold);hh.position.set(sx*.12,.25,0);trophy.add(hh)});trophy.scale.setScalar(1.5);
trophy.visible=!!localStorage.getItem('bwon');addEventListener('bwon',()=>{trophy.visible=true});

/* ================= BALKON ================= */
{BX(4.8,.15,3.2,0x3a3d45,4.2,-.075,6.55);const gl=new THREE.MeshBasicMaterial({color:0xbfe8ff,transparent:true,opacity:.1,side:THREE.DoubleSide,depthWrite:false});
 [[1.75,2.675],[1.85,5.675]].forEach(a=>add(new THREE.PlaneGeometry(a[0],1.1),gl,a[1],.58,8.15,{cast:false}));[1.8,6.6].forEach(x=>add(new THREE.PlaneGeometry(3.2,1.1),gl,x,.58,6.55,{r:[0,Math.PI/2,0],cast:false}));
 [[1.75,2.675],[1.85,5.675]].forEach(a=>BX(a[0],.04,.05,steel,a[1],1.13,8.15,{cast:false}));[3.55,4.75].forEach(x=>BX(.05,1.13,.05,steel,x,.56,8.15,{cast:false}));[1.8,6.6].forEach(x=>BX(.05,.04,3.2,steel,x,1.13,6.55,{cast:false}));
 RB(.72,.12,1.5,0xcdb89a,3.2,.3,6.5,.05,{rough:1});RB(.72,.55,.1,0xcdb89a,3.2,.55,5.8,.05,{rough:1,r:[-.45,0,0]});[[-.3,.1],[.3,.1],[-.3,1.4],[.3,1.4]].forEach(a=>BX(.04,.25,.04,0x6e4f36,3.2+a[0],.12,5.8+a[1]));
 add(new THREE.CylinderGeometry(.28,.28,.04,18),M(0x2a2d33,.4,.7),5.0,.5,6.9);add(new THREE.CylinderGeometry(.025,.025,.5,8),M(0x2a2d33,.4,.7),5.0,.25,6.9);add(new THREE.CylinderGeometry(.045,.04,.09,14),M(0xf6f1e8,.3),5.0,.57,6.9);
 for(let i=0;i<14;i++){if(i>=5&&i<=9)continue;const m=new THREE.MeshStandardMaterial({color:0,emissive:0xffd9a0,emissiveIntensity:1.8});add(new THREE.SphereGeometry(.03,8,6),m,1.8+i*.343,1.0+Math.sin(i*1.4)*.03,8.15,{cast:false});bulbs.push(m)}for(const sx of[1.8,6.6])for(let i=0;i<9;i++){const m=new THREE.MeshStandardMaterial({color:0,emissive:0xffd9a0,emissiveIntensity:1.8});add(new THREE.SphereGeometry(.03,8,6),m,sx,1.0+Math.sin(i*1.4)*.03,5.25+i*.36,{cast:false});bulbs.push(m)}}
/* ---- kaydırak girişi: basamak, kemer, tabela, destek halkaları ---- */
{const wh=0xf2f4f6;RB(1.5,.36,1.15,wh,4.15,.18,7.6,.06,{rough:.35});RB(1.5,.14,.5,wh,4.15,.07,6.85,.04,{rough:.35});
 
 
 
 for(let i=0;i<13;i++){const u=.03+i*.036,pt=slide.getPointAt(u),tg=slide.getTangentAt(u);const r=add(new THREE.TorusGeometry(.53,.025,8,24),M(wh,.3,.6),pt.x,pt.y,pt.z,{cast:false});r.quaternion.setFromUnitVectors(V(0,0,1),tg)}}
/* ---- ek dekorasyon: kredens + vazo + duvar saati, sarkıt lambalar ---- */
{const cx=5.5,cz=-ZB+.25;RB(1.7,.55,.42,0x3a2c22,cx,.275,cz,.03,{rough:.5});RB(1.74,.04,.46,0xb8955a,cx,.57,cz,.01,{rough:.3,m:.8});STN_OB.push([cx-.9,cx+.9,-ZB,-ZB+.5]);
 add(new THREE.CylinderGeometry(.06,.09,.3,16),M(0xe8e2d8,.4),cx-.55,.74,cz);for(let i=0;i<5;i++){const st=add(new THREE.CylinderGeometry(.006,.006,.42,5),M(0x3f6f3a,.7),cx-.55+(i-2)*.02,1.1,cz,{cast:false});st.rotation.z=(i-2)*.12;add(new THREE.SphereGeometry(.035,8,6),M([0xff8fa8,0xffd166,0xffffff,0xff9a6b,0xc28bf0][i],.6),cx-.55+(i-2)*.09,1.3,cz,{cast:false})}
 [[0xc0554a,.32],[0x4a7fc0,.28],[0xe0b84a,.24]].forEach((b2,i)=>RB(b2[1],.05,.22,b2[0],cx+.35+(i%2)*.02,.62+i*.05,cz,.008,{rough:.7}));add(new THREE.BoxGeometry(.3,.02,.2),M(0x1e1f24,.5),cx+.1,.595,cz+.05);
 const ck=cx,cy=3.1,cz2=-ZB+.05;add(new THREE.TorusGeometry(.34,.028,10,44),M(0x1a1a1e,.4,.6),ck,cy,cz2+.02);add(new THREE.CircleGeometry(.34,44),M(0xf4f1ea,.55),ck,cy,cz2,{cast:false});
 for(let i=0;i<12;i++){const a=i*Math.PI/6;add(new THREE.BoxGeometry(.012,i%3?.04:.07,.004),M(0x222222,.6),ck+Math.sin(a)*.29,cy+Math.cos(a)*.29,cz2+.01,{cast:false}).rotation.z=-a}
 add(new THREE.BoxGeometry(.016,.2,.004),M(0x111111,.5),ck-.04,cy+.06,cz2+.012,{cast:false}).rotation.z=.6;add(new THREE.BoxGeometry(.012,.27,.004),M(0x111111,.5),ck+.06,cy+.08,cz2+.012,{cast:false}).rotation.z=-.5;add(new THREE.SphereGeometry(.02,10,8),M(0xb8955a,.3,.9),ck,cy,cz2+.015,{cast:false})}
[[-1.3,-2.2],[-1.3,.9],[-1.3,3.4]].forEach(a=>{add(new THREE.CylinderGeometry(.006,.006,1.5,5),M(0x222222),a[0],H-.75,a[1],{cast:false});add(new THREE.SphereGeometry(.17,20,16),new THREE.MeshStandardMaterial({color:0xfff2dc,emissive:0xffc880,emissiveIntensity:1.5,roughness:.3}),a[0],H-1.55,a[1],{cast:false});add(new THREE.PlaneGeometry(1.4,1.4),new THREE.MeshBasicMaterial({map:glowT,color:0xffc880,transparent:true,blending:THREE.AdditiveBlending,depthWrite:false,fog:false,opacity:.6}),a[0],H-1.55,a[1],{cast:false}).lookAt(0,H-1.55,0)});
/* ================= SALON DEKORU ================= */

[-1.3,.7].forEach((z,i)=>RB(.1,.4,.4,i?0xd9a441:0x6a8fb8,2.68,.72,z,.05,{rough:1,r:[0,0,-.2]}));
add(new THREE.PlaneGeometry(2.7,1.4),M(0x3a3f4a,1),-4.8+LX,.026,-1.1,{r:[-Math.PI/2,0,0]});
[-1.4,-.3,.8].forEach(z=>{add(new THREE.CylinderGeometry(.006,.006,H-2.52,6),M(0x222222),3.25,(H+2.52)/2,z,{cast:false});add(new THREE.SphereGeometry(.14,16,12),new THREE.MeshStandardMaterial({color:0x222222,emissive:0xffd9a0,emissiveIntensity:1.6}),3.25,2.45,z,{cast:false})});
/* ================= SALON CANLILIĞI ================= */
const vinyl=new THREE.Group();
/* galeri konsolu (duvarın ortasında): pikap, hoparlörler, vazolar, kitaplar, heykel, lamba */
{const cx=px,cz=-ZB+.29,top=.46;
 RB(6.2,.42,.46,0x2c2a2e,cx,.21,cz,.03,{rough:.5});RB(6.3,.04,.5,0x9a8a70,cx,.44,cz,.01,{rough:.25,m:.4});[-2.9,2.9].forEach(dx=>RB(.05,.1,.4,0x8a7a62,cx+dx,.05,cz,.01,{rough:.3,m:.7}));
 RB(.5,.07,.4,0x3a2a20,cx-1.9,top+.035,cz,.02,{rough:.5});vinyl.position.set(cx-1.95,top+.085,cz);scene.add(vinyl);vinyl.add(new THREE.Mesh(new THREE.CylinderGeometry(.15,.15,.008,40),M(0x0c0c0e,.25,.2)));{const lb=new THREE.Mesh(new THREE.CylinderGeometry(.05,.05,.01,24),M(0xd94a3a,.6));lb.position.y=.002;vinyl.add(lb)}
 add(new THREE.BoxGeometry(.02,.012,.24),M(0xcccccc,.3,.9),cx-1.75,top+.1,cz-.04,{r:[0,.5,0]});[cx-2.55,cx-1.25].forEach(x=>RB(.22,.26,.22,0x1b1c20,x,top+.13,cz,.02,{rough:.6}));
 [[-.45,.3,.1],[-.1,.22,.08],[.25,.34,.07]].forEach(v=>add(new THREE.CylinderGeometry(v[2],v[2]*.7,v[1],16),M(0xd8c9b0,.5),cx+v[0],top+v[1]/2,cz));
 for(let i=0;i<5;i++){const st=add(new THREE.CylinderGeometry(.004,.004,.3+i*.03,5),M(0x3f6f3a,.7),cx+.25+(i-2)*.025,top+.5,cz,{cast:false});st.rotation.z=(i-2)*.12}
 [[0xc0554a,.38],[0x4a7fc0,.34],[0xe0b84a,.3]].forEach((b2,i)=>RB(b2[1],.05,.26,b2[0],cx+1.1+(i%2)*.02,top+.025+i*.05,cz,.008,{rough:.7,r:[0,(i-1)*.1,0]}));
 add(new THREE.TorusKnotGeometry(.09,.03,48,8),M(0xb8955a,.25,.9),cx+1.8,top+.14,cz);
 add(new THREE.CylinderGeometry(.02,.03,.28,10),M(0xb8955a,.3,.9),cx+2.5,top+.14,cz);add(new THREE.CylinderGeometry(.11,.15,.2,20,1,true),new THREE.MeshStandardMaterial({color:0xffe2b8,emissive:0xffc070,emissiveIntensity:1.3,side:THREE.DoubleSide}),cx+2.5,top+.38,cz,{cast:false})}
/* galeri önü: koşucu halı, müze bankı, duvar aplikleri, köşe bitkisi */
{const cx=px;
 const rt=cTex(256,1024,(x,w,h)=>{x.fillStyle='#2a2a30';x.fillRect(0,0,w,h);x.strokeStyle='#b8955a';x.lineWidth=10;x.strokeRect(14,14,w-28,h-28);x.strokeStyle='#4a5566';x.lineWidth=4;x.strokeRect(34,34,w-68,h-68);for(let i=0;i<9;i++){x.fillStyle=i%2?'#3a4254':'#2f3644';x.fillRect(60,80+i*100,w-120,60)}});
 add(new THREE.PlaneGeometry(2.4,5.8),new THREE.MeshStandardMaterial({map:rt,roughness:1}),cx,.013,-ZB+3.7,{r:[-Math.PI/2,0,0]});
 const bz=-ZB+2.7;blob(cx,bz,3.4,1.2);RB(2.6,.12,.5,0x4a3626,cx,.46,bz,.05,{rough:.55});[-1.1,1.1].forEach(dx=>RB(.05,.4,.4,0x1c1c20,cx+dx,.2,bz,.01,{m:.7,rough:.35}));
 plant(px+5.4,-ZB+.7,1.25)}
/* ışıkta uçuşan toz zerreleri */
const DN=HI?90:40,dpos=new Float32Array(DN*3);for(let i=0;i<DN;i++)dpos.set([(rnd()-.5)*10,.4+rnd()*3,Z-.5-rnd()*5],i*3);
const dustG=new THREE.BufferGeometry();dustG.setAttribute('position',new THREE.BufferAttribute(dpos,3));const dust=new THREE.Points(dustG,new THREE.PointsMaterial({size:.025,color:0xffe6c0,transparent:true,opacity:.55,depthWrite:false,blending:THREE.AdditiveBlending}));dust.frustumCulled=false;scene.add(dust);
function moveDust(el,dt){const a=dustG.attributes.position;for(let i=0;i<DN;i++){a.array[i*3]+=Math.sin(el*.3+i)*dt*.04;a.array[i*3+1]+=Math.cos(el*.25+i*1.3)*dt*.03}a.needsUpdate=true}
/* gitar (iki projeksiyonun arasında) */
{const g=new THREE.Group();g.position.set(-WL+.28,0,.5);g.rotation.set(0,Math.PI/2,-.12);scene.add(g);const wd=M(0xb5733a,.45),dk=M(0x2a1a10,.5);
 [[.21,.35],[.16,.68]].forEach(b=>{const m=new THREE.Mesh(new THREE.CylinderGeometry(b[0],b[0],.09,28),wd);m.rotation.x=Math.PI/2;m.position.y=b[1];m.castShadow=true;g.add(m)});
 const hole=new THREE.Mesh(new THREE.CircleGeometry(.055,20),M(0x0a0a0a,1));hole.position.set(0,.55,.047);g.add(hole);
 const nk=new THREE.Mesh(new THREE.BoxGeometry(.05,.55,.03),dk);nk.position.set(0,1.1,.01);g.add(nk);const hd=new THREE.Mesh(new THREE.BoxGeometry(.08,.16,.03),dk);hd.position.set(0,1.44,.01);g.add(hd)}
/* sehpa süsleri: kitaplar, vazo ve çiçekler, mum */
RB(.36,.05,.26,0x7a2f2f,5.0,.43,-.75,.01,{rough:.7});RB(.32,.04,.24,0x2f4a6a,5.0,.475,-.73,.01,{rough:.7});
add(new THREE.CylinderGeometry(.06,.05,.2,16),M(0xe8e2d8,.3),5.3,.5,.15);[0xff6f91,0xffd166,0xffffff,0xff8a5b].forEach((c,i)=>add(new THREE.SphereGeometry(.035,10,8),M(c,.7),5.3+Math.cos(i*1.6)*.05,.64+i%2*.03,.15+Math.sin(i*1.6)*.05));
add(new THREE.CylinderGeometry(.035,.035,.08,14),M(0xf4efe4,.8),5.4,.44,-.85);const flame=add(new THREE.SphereGeometry(.014,10,8),new THREE.MeshBasicMaterial({color:0xffc070}),5.4,.495,-.85,{cast:false});flame.scale.set(1,1.8,1);
/* yan sehpa + lamba */
add(new THREE.CylinderGeometry(.24,.24,.03,24),M(0x6e4f36,.5),2.55,.55,2.2);add(new THREE.CylinderGeometry(.02,.02,.54,8),M(0x222222,.3,.8),2.55,.27,2.2);add(new THREE.CylinderGeometry(.11,.15,.2,20,1,true),new THREE.MeshStandardMaterial({color:0xffe2b8,emissive:0xffc070,emissiveIntensity:1.2,side:THREE.DoubleSide}),2.55,.85,2.2);add(new THREE.CylinderGeometry(.012,.012,.2,6),M(0xb8955a,.3,.9),2.55,.66,2.2);
/* pencere yanında asılı bitki */
add(new THREE.CylinderGeometry(.005,.005,.8,6),M(0x777777),-4.6,H-.4,Z-.7,{cast:false});add(new THREE.SphereGeometry(.18,16,12,0,Math.PI*2,Math.PI/2,Math.PI/2),M(0xe6d8c4,.6),-4.6,H-.8,Z-.7);for(let i=0;i<7;i++){const l=add(new THREE.CylinderGeometry(.012,.004,.5+i%3*.25,5),M(0x3f8f50,.7),-4.6+Math.cos(i)*.14,H-1.05-(i%3)*.12,Z-.7+Math.sin(i)*.14,{cast:false});l.rotation.z=Math.cos(i)*.2}
const fan=new THREE.Group();fan.position.set(1.5,H-.12,.5);scene.add(fan);add(new THREE.CylinderGeometry(.12,.12,.1,16),M(0x222222,.4,.6),0,0,0,{p:fan});for(let i=0;i<4;i++){const b=add(new THREE.BoxGeometry(1.0,.02,.18),M(0xb9955f,.6),Math.cos(i*Math.PI/2)*.6,-.02,Math.sin(i*Math.PI/2)*.6,{p:fan});b.rotation.y=-i*Math.PI/2}
add(new THREE.CylinderGeometry(.02,.02,2.2,8),M(0x333333,.5,.6),1.7,1.0,-2.9);add(new THREE.SphereGeometry(.2,16,12),new THREE.MeshStandardMaterial({color:0xffe6c0,emissive:0xffcf8a,emissiveIntensity:1.6}),1.7,2.15,-2.9);
const curt=[-5.35,5.35].map(x=>BX(.9,H-.2,.14,0xd9c7b2,x,(H-.2)/2,Z-.2,{cast:false}));
const cornerTick=[];
/* ================= YENİLENEN KÖŞE: okuma köşesi, çalışma masası, cam önü (camı kapatmayan, alçak ve ince dekor) ================= */
{
 const _s0=scene.children.length;const Yv=V(0,1,0),rod=(a,b,r,m,seg=8)=>{const d=b.clone().sub(a),L=d.length(),k=new THREE.Mesh(new THREE.CylinderGeometry(r,r,L,seg),m);k.position.copy(a).addScaledVector(d,.5);k.quaternion.setFromUnitVectors(Yv,d.normalize());k.castShadow=SH&&r>.01;scene.add(k);return k};
 const brass=M(0xc9a15a,.25,.9),dark=M(0x1c1c22,.5,.3),glow=(c,i)=>new THREE.MeshStandardMaterial({color:0,emissive:c,emissiveIntensity:i,side:THREE.DoubleSide});
 /* ---- okuma köşesi: yatağın karşısı (sol-ön köşe). Alçak ve yumuşak, camı kapatmaz ---- */
 {const cream=0x3b4352,terra=0xd9a441,oak=0x6e4f36;
  blob(-8.35,3.9,2.0,2.0);
  {const t=cTex(512,512,(x,w,h)=>{x.fillStyle='#22303a';x.fillRect(0,0,w,h);[[236,'#7a5e3c',12],[200,'#3e5563',5],[150,'#2c3d48',18],[100,'#8a6c46',5]].forEach(([r,c,lw])=>{x.strokeStyle=c;x.lineWidth=lw;x.beginPath();x.arc(w/2,h/2,r,0,7);x.stroke()});for(let i=0;i<2500;i++){x.fillStyle=`rgba(255,255,255,${Math.random()*.02})`;x.fillRect(Math.random()*w,Math.random()*h,2,2)}});add(new THREE.CircleGeometry(1.3,48),new THREE.MeshStandardMaterial({map:t,roughness:1}),-8.3,.024,3.8,{r:[-Math.PI/2,0,0],cast:false})}
  /* yuvarlak bouclé koltuk: odaya, yatağa doğru bakar */
  {const g=new THREE.Group();g.position.set(-8.35,0,3.85);g.rotation.y=-.18;scene.add(g);const o={p:g};
   RB(.84,.22,.78,cream,0,.32,0,.1,{p:g,rough:1});add(new THREE.CylinderGeometry(.5,.5,.55,28,1,true,-Math.PI*.62,Math.PI*1.24),new THREE.MeshStandardMaterial({color:cream,roughness:1,side:THREE.DoubleSide}),0,.72,.06,o);
   RB(.72,.12,.62,0x495060,0,.46,.03,.06,{p:g,rough:1});RB(.32,.3,.1,terra,.2,.7,.2,.05,{p:g,rough:1,r:[-.3,.2,.1]});RB(.5,.05,.3,0x39506d,-.18,.54,-.1,.02,{p:g,rough:1,r:[0,.3,0]});
   [[-.3,-.28],[.3,-.28],[-.3,.28],[.3,.28]].forEach(([x,z])=>add(new THREE.CylinderGeometry(.018,.012,.2,8),brass,x,.1,z,o));
   STN_OB.push([-8.95,-7.8,3.4,4.35])}
  /* mermer yan sehpa: kitaplar, fincan, pampas */
  {const x=-7.35,z=4.05;add(new THREE.CylinderGeometry(.27,.27,.03,32),M(0x2c2a2e,.3,.2),x,.52,z);add(new THREE.TorusGeometry(.27,.008,6,32),brass,x,.52,z,{r:[Math.PI/2,0,0],cast:false});add(new THREE.CylinderGeometry(.02,.02,.5,8),brass,x,.26,z);add(new THREE.CylinderGeometry(.17,.19,.03,24),brass,x,.015,z);
   RB(.22,.03,.16,0x2f4a6a,x-.06,.555,z+.04,.005,{rough:.7,r:[0,.3,0]});RB(.2,.03,.15,terra,x-.06,.585,z+.04,.005,{rough:.7,r:[0,-.2,0]});add(new THREE.CylinderGeometry(.035,.03,.08,16),M(0xf4efe4,.4),x+.12,.57,z-.06);
   add(new THREE.CylinderGeometry(.04,.05,.14,16),M(0xb8955a,.3,.8),x-.1,.605,z-.1);for(let i=0;i<5;i++){const sx=x-.1+(i-2)*.03;const st=add(new THREE.CylinderGeometry(.003,.003,.4,4),M(0xd9c7a0,.8),sx,.82,z-.1,{cast:false});st.rotation.z=-(i-2)*.1;const tp=add(new THREE.SphereGeometry(.025,6,6),M(0xe8dcc0,1),x-.1+(i-2)*.075,1.0,z-.1,{cast:false});tp.scale.set(1,3,1)}
   STN_OB.push([-7.65,-7.05,3.75,4.35])}
  /* kemerli zemin lambası: koltuğun üstüne uzanır */
  {const cv=new THREE.CatmullRomCurve3([V(-7.7,.06,4.6),V(-7.7,1.2,4.55),V(-7.75,2.0,4.35),V(-8.0,2.15,4.05),V(-8.3,2.05,3.85)]);add(new THREE.TubeGeometry(cv,40,.012,6),dark,0,0,0,{cast:false});add(new THREE.CylinderGeometry(.15,.17,.06,24),M(0x1c1c22,.35,.5),-7.7,.03,4.6);
   add(new THREE.SphereGeometry(.17,20,14,0,Math.PI*2,0,Math.PI*.62),glow(0xffd9a0,1.5),-8.3,2.02,3.85,{cast:false})}
  /* köşe bitkisi (keman yapraklı incir) */
  {const px0=-9.1,pz0=4.5;add(new THREE.CylinderGeometry(.24,.19,.5,20),M(0xe8e2d8,.5),px0,.25,pz0);add(new THREE.CylinderGeometry(.02,.03,1.4,6),M(0x6b4a30,.8),px0,1.1,pz0);
   for(let i=0;i<16;i++){const a=i*2.4,l=add(new THREE.SphereGeometry(.14,10,8),M(i%2?0x3f8f50:0x4e9a5a,.6),px0+Math.cos(a)*.2,.85+i*.075,pz0+Math.sin(a)*.2);l.scale.set(.9,1.4,.25);l.rotation.y=-a;l.rotation.z=.35*Math.cos(i)}
   STN_OB.push([-9.45,-8.8,4.2,4.9])}
  /* duvar: üç çerçeveli sakin tablo + üstte sıcak LED */
  [[-9.0,2.15,.55,.78,0],[-8.35,2.3,.72,.98,1],[-7.7,2.05,.5,.64,2]].forEach(([x,y,w,h,k])=>{const t=cTex(256,Math.round(256*h/w),(c,cw,ch)=>{c.fillStyle=['#1d2733','#2c3d48','#22303a'][k];c.fillRect(0,0,cw,ch);if(k===0){c.fillStyle='#d9a441';c.beginPath();c.arc(cw/2,ch*.42,cw*.26,0,7);c.fill();c.fillStyle='#7fe4ff';c.fillRect(cw*.2,ch*.72,cw*.6,ch*.05)}else if(k===1){c.fillStyle='#3e5563';c.beginPath();c.moveTo(0,ch);c.quadraticCurveTo(cw*.5,ch*.3,cw,ch*.8);c.lineTo(cw,ch);c.fill();c.fillStyle='#ffb25a';c.beginPath();c.arc(cw*.7,ch*.3,cw*.12,0,7);c.fill()}else{c.strokeStyle='#b8955a';c.lineWidth=6;for(let i=0;i<6;i++){c.beginPath();c.moveTo(cw*.15,ch*(.2+i*.12));c.quadraticCurveTo(cw*.5,ch*(.1+i*.12),cw*.85,ch*(.2+i*.12));c.stroke()}}});
   RB(w+.06,h+.06,.04,k===1?oak:0x1b1b1f,x,y,4.88,.008);add(new THREE.PlaneGeometry(w,h),new THREE.MeshStandardMaterial({map:t,roughness:.9}),x,y,4.855,{r:[0,Math.PI,0],cast:false})});
  /* HOLOGRAM: "bir web sayfası 3 katmandır" (HTML iskelet, CSS giysi, JS hareket): ders duvarıyla aynı fikir */
  {const hx=-6.3,hz=4.4;add(new THREE.CylinderGeometry(.2,.24,.85,28),M(0x1c1c22,.35,.5),hx,.425,hz);add(new THREE.CylinderGeometry(.26,.26,.03,28),brass,hx,.015,hz,{cast:false});
   add(new THREE.TorusGeometry(.2,.012,8,40),glow(0x7fe4ff,2.2),hx,.86,hz,{r:[Math.PI/2,0,0],cast:false});add(new THREE.CircleGeometry(.16,32),new THREE.MeshBasicMaterial({color:new THREE.Color(.5,1.6,2.2),fog:false}),hx,.862,hz,{r:[-Math.PI/2,0,0],cast:false});
   add(new THREE.CylinderGeometry(.3,.12,.55,28,1,true),new THREE.MeshBasicMaterial({color:0x7fe4ff,transparent:true,opacity:.07,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide,fog:false}),hx,1.135,hz,{cast:false});
   const hg=new THREE.Group();hg.position.set(hx,1.5,hz);hg.rotation.y=Math.PI;scene.add(hg);
   const mk=k=>cTex(512,340,(x,w,h)=>{const col=['#7fe4ff','#ffb25a','#7dffb0'][k];x.strokeStyle=col;x.fillStyle=col;x.lineWidth=5;x.shadowColor=col;x.shadowBlur=14;x.beginPath();x.roundRect(8,8,w-16,h-16,22);x.stroke();
    x.font='700 46px ui-monospace,monospace';x.fillText(['HTML','CSS','JS'][k],30,66);x.font='600 24px system-ui';x.globalAlpha=.8;x.fillText([EN?'skeleton':'iskelet',EN?'clothes':'giysi',EN?'movement':'hareket'][k],30,100);x.globalAlpha=1;x.shadowBlur=8;
    if(k===0){x.strokeRect(30,126,w-60,34);x.strokeRect(30,174,150,100);x.strokeRect(196,174,w-226,44);x.strokeRect(196,230,w-226,44);x.strokeRect(30,288,w-60,24)}
    else if(k===1){x.globalAlpha=.5;x.fillRect(30,126,w-60,34);x.fillRect(30,174,150,100);x.globalAlpha=.28;x.fillRect(196,174,w-226,44);x.fillRect(196,230,w-226,44);x.globalAlpha=.5;x.fillRect(30,288,w-60,24);x.globalAlpha=1;['#ff6f91','#7fe4ff','#ffd166','#7dffb0'].forEach((c,i)=>{x.fillStyle=c;x.beginPath();x.arc(56+i*32,224,12,0,7);x.fill()})}
    else{x.font='700 120px ui-monospace,monospace';x.globalAlpha=.55;x.fillText('{ }',w-250,250);x.globalAlpha=1;x.beginPath();x.moveTo(110,150);x.lineTo(110,250);x.lineTo(136,226);x.lineTo(166,276);x.lineTo(186,266);x.lineTo(158,218);x.lineTo(194,214);x.closePath();x.fill();x.lineWidth=3;[34,58].forEach(r=>{x.beginPath();x.arc(110,150,r,0,7);x.stroke()})}}),
    cards=[0,1,2].map(k=>{const m=new THREE.MeshBasicMaterial({map:mk(k),transparent:true,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide,opacity:.95,fog:false}),c=new THREE.Mesh(new THREE.PlaneGeometry(.56,.37),m);hg.add(c);return c});
   const cap=new THREE.Mesh(new THREE.PlaneGeometry(.62,.1),new THREE.MeshBasicMaterial({map:cTex(512,84,(x,w,h)=>{x.shadowColor='#7fe4ff';x.shadowBlur=10;x.fillStyle='#d9f7ff';x.font='700 34px system-ui';x.textAlign='center';x.fillText(EN?'3 layers = 1 web page':'3 katman = 1 web sayfası',w/2,52)}),transparent:true,blending:THREE.AdditiveBlending,depthWrite:false,fog:false}));cap.position.set(hx,1.06,hz);cap.rotation.y=Math.PI;scene.add(cap);   cornerTick.push(el=>{const gp=.07+.08*(.5+.5*Math.sin(el*.8));cards.forEach((c,k)=>{c.position.z=(k-1)*gp;c.position.y=(k-1)*gp*.3;c.material.opacity=.88+Math.sin(el*19+k*2)*.05});hg.position.y=1.5+Math.sin(el*1.4)*.03;hg.rotation.y=Math.PI+Math.sin(el*.5)*.35});
   STN_OB.push([hx-.3,hx+.3,hz-.3,hz+.3])}
  /* telefon (dikey): kart açıkken sahneyi yukarı kaydır, hedef kartın üstündeki boş alanın ortasında kalsın */
  {let voff=0,cur2=0;cornerTick.push(()=>{const c=document.getElementById('card'),on=innerWidth<innerHeight&&c&&c.style.display==='block'&&mode==='room',tgt=on?Math.max(0,(c.offsetHeight-64)/2):0;voff+=(tgt-voff)*.2;if(Math.abs(voff-tgt)<.5)voff=tgt;const v=Math.round(voff);if(v!==cur2){cur2=v;if(v)cam.setViewOffset(innerWidth,innerHeight,0,v,innerWidth,innerHeight);else cam.clearViewOffset();cam.updateProjectionMatrix()}})}
  LED(1.8,.015,.03,-8.35,3.05,4.84,.8,0xffc98a)}
 /* ---- çalışma masası: ped, lamba, kitaplar, kupa, çekmece, alt ışık, halı, sarkıt lambalar ---- */
 add(new THREE.PlaneGeometry(2.1,.52),M(0x1b1d24,.95),-3.7,.797,3.93,{r:[-Math.PI/2,0,0],cast:false});
 {const p0=V(-2.3,.8,4.3),p1=V(-2.27,1.15,4.2),p2=V(-2.4,1.22,3.95);add(new THREE.CylinderGeometry(.09,.1,.03,18),dark,p0.x,.815,p0.z);rod(p0,p1,.009,dark);rod(p1,p2,.009,dark);add(new THREE.SphereGeometry(.018,8,6),brass,p1.x,p1.y,p1.z);
  const hd=add(new THREE.CylinderGeometry(.03,.1,.12,18,1,true),glow(0xffd9a0,1.6),p2.x,p2.y-.03,p2.z,{cast:false});hd.rotation.x=.35;}
 add(new THREE.CylinderGeometry(.04,.035,.09,16),M(0xf4efe4,.4),-2.45,.84,3.78);add(new THREE.CircleGeometry(.033,16),new THREE.MeshBasicMaterial({color:0x2a1a10}),-2.45,.886,3.78,{r:[-Math.PI/2,0,0],cast:false});add(new THREE.TorusGeometry(.025,.006,6,12),M(0xf4efe4,.4),-2.405,.84,3.78);
 RB(.3,.03,.22,0x7a2f2f,-4.78,.815,3.72,.005,{rough:.7,r:[0,.2,0]});RB(.28,.025,.2,0x2f4a6a,-4.78,.843,3.72,.005,{rough:.7,r:[0,-.15,0]});RB(.26,.025,.19,0xd9a441,-4.79,.868,3.72,.005,{rough:.7,r:[0,.1,0]});
 RB(.46,.56,.7,0x2a2b30,-4.85,.47,4.1,.02);[.62,.47,.32].forEach(y=>{RB(.4,.13,.02,0x3a3b42,-4.85,y,3.745,.006);add(new THREE.CylinderGeometry(.006,.006,.12,6),brass,-4.85,y,3.725,{r:[0,0,Math.PI/2],cast:false})});
 LED(3.2,.02,.02,-3.7,.72,3.67,.9,0x7fe4ff);
 {const t=cTex(512,512,(x,w,h)=>{x.fillStyle='#3a4a52';x.fillRect(0,0,w,h);[240,200,160,120,80].forEach((r,i)=>{x.strokeStyle=i%2?'#c9b08a':'#7a5e3c';x.lineWidth=14;x.beginPath();x.arc(w/2,h/2,r,0,7);x.stroke()})});add(new THREE.CircleGeometry(1.3,48),new THREE.MeshStandardMaterial({map:t,roughness:1}),-3.7,.025,3.3,{r:[-Math.PI/2,0,0],cast:false})}
 /* ---- cam önü: sadece ışık zinciri ve kısa, alçak bir bitki şeridi (görüş açık kalsın) ---- */
 {const bm=new THREE.MeshBasicMaterial({color:new THREE.Color(2.4,1.8,1.05),fog:false}),xs=[-5,-2.8,0,2.8,5],z0=Z-.28,pts=[];
  for(let i=0;i<4;i++){const a=xs[i],b=xs[i+1],cp=[];for(let k=0;k<=8;k++){const u=k/8;cp.push(V(a+(b-a)*u,3.3-.17*Math.sin(Math.PI*u),z0))}const cv=new THREE.CatmullRomCurve3(cp);add(new THREE.TubeGeometry(cv,24,.004,4),M(0x222222,.6),0,0,0,{cast:false});for(let k=1;k<12;k++)pts.push(cv.getPoint(k/12))}
  const im=new THREE.InstancedMesh(new THREE.SphereGeometry(.024,8,6),bm,pts.length),d=new THREE.Object3D();pts.forEach((p,i)=>{d.position.copy(p);d.updateMatrix();im.setMatrixAt(i,d.matrix)});im.frustumCulled=false;scene.add(im)}
 {const cx=1.2,cz=4.74,L=2.4;RB(L,.36,.34,0x3a3028,cx,.18,cz,.03,{rough:.8});add(new THREE.PlaneGeometry(L-.08,.3),M(0x1c140e,1),cx,.365,cz,{r:[-Math.PI/2,0,0],cast:false});
  const GN=HI?130:70,gi=new THREE.InstancedMesh(new THREE.ConeGeometry(.018,1,5),new THREE.MeshStandardMaterial({color:0xffffff,roughness:.7}),GN),d=new THREE.Object3D(),pal=[0x4e9a5a,0x6bb36a,0x3f8f50,0x86c27a].map(c=>new THREE.Color(c)),fl=[0xff6f91,0xffd166,0xffffff,0xff8a5b,0xb79cff].map(c=>new THREE.Color(c)),FN=Math.min(36,GN),fi=new THREE.InstancedMesh(new THREE.SphereGeometry(.03,8,6),new THREE.MeshStandardMaterial({color:0xffffff,roughness:.6}),FN);
  for(let i=0;i<GN;i++){const h=.2+rnd()*.26;d.position.set(cx+(rnd()-.5)*(L-.2),.36+h/2,cz+(rnd()-.5)*.22);d.rotation.set((rnd()-.5)*.35,rnd()*3,(rnd()-.5)*.35);d.scale.set(1,h,1);d.updateMatrix();gi.setMatrixAt(i,d.matrix);gi.setColorAt(i,pal[i%4]);if(i<FN){const tp=V(0,.5,0).applyMatrix4(d.matrix);d.position.copy(tp);d.rotation.set(0,0,0);d.scale.set(1,1,1);d.updateMatrix();fi.setMatrixAt(i,d.matrix);fi.setColorAt(i,fl[i%5])}}
  gi.instanceMatrix.needsUpdate=true;fi.instanceMatrix.needsUpdate=true;scene.add(gi,fi);STN_OB.push([cx-L/2-.05,cx+L/2+.05,4.55,5.0])}
 /* performans: bu bloktaki sabit, aynı malzemeli parçaları tek çizim çağrısında birleştir (parlayan/saydam/hareketli olanlara dokunma) */
 {const key=m=>[m.type,m.color&&m.color.getHex(),m.roughness,m.metalness,m.envMapIntensity,m.side,m.map&&m.map.uuid,m.normalMap&&m.normalMap.uuid].join('|'),groups={};
  scene.children.slice(_s0).forEach(o=>{if(!o.isMesh||o.isInstancedMesh||o.isSkinnedMesh)return;const m=o.material;if(Array.isArray(m)||m.transparent||m.blending!==THREE.NormalBlending||(m.emissive&&m.emissive.getHex()>0&&m.emissiveIntensity>0))return;o.updateMatrixWorld(true);const k=key(m)+'|'+o.castShadow+'|'+o.receiveShadow;(groups[k]=groups[k]||{m,cs:o.castShadow,rs:o.receiveShadow,g:[]}).g.push(o)});
  Object.values(groups).forEach(G=>{if(G.g.length<2)return;let mg=null;try{const gs=G.g.map(o=>{const g=o.geometry.clone();g.applyMatrix4(o.matrixWorld);Object.keys(g.attributes).forEach(n=>{if(n!=='position'&&n!=='normal'&&n!=='uv')g.deleteAttribute(n)});if(!g.index)g.setIndex([...Array(g.attributes.position.count).keys()]);return g});mg=mergeGeometries(gs,false)}catch(e){mg=null}
   if(!mg)return;const mesh=new THREE.Mesh(mg,G.m);mesh.castShadow=G.cs;mesh.receiveShadow=G.rs;mesh.matrixAutoUpdate=false;scene.add(mesh);G.g.forEach(o=>{scene.remove(o);o.geometry.dispose()})})}
}
/* şehir hayatı: trafik + helikopter */
const NT=0,trp=new Float32Array(NT*3),trc=new Float32Array(NT*3),tvv=[];for(let i=0;i<NT;i++){const ax=i%2,lane=Math.round((rnd()-.5)*20)*26.7,s=(rnd()<.5?-1:1)*(25+rnd()*45);tvv.push({ax,s});trp.set(ax?[(rnd()-.5)*600,-149.4,34+Math.round(rnd()*14)*26.7]:[lane,-149.4,34+rnd()*380],i*3);const c=new THREE.Color(s>0?0xfff2cc:0xff3b30);trc.set([c.r,c.g,c.b],i*3)}
const trG=new THREE.BufferGeometry();trG.setAttribute('position',new THREE.BufferAttribute(trp,3));trG.setAttribute('color',new THREE.BufferAttribute(trc,3));scene.add(new THREE.Points(trG,new THREE.PointsMaterial({size:3,vertexColors:true,fog:false,transparent:true,opacity:.9,depthWrite:false})));
const heli=new THREE.Group();scene.add(heli);{const b=new THREE.Mesh(new THREE.BoxGeometry(6,2.4,2.4),new THREE.MeshBasicMaterial({color:0x14141c,fog:false}));heli.add(b);const t2=new THREE.Mesh(new THREE.BoxGeometry(6,.3,.3),b.material);t2.position.set(-5,.4,0);heli.add(t2);var heliL=new THREE.Mesh(new THREE.SphereGeometry(.5,8,6),new THREE.MeshBasicMaterial({color:0xff3030,fog:false}));heliL.position.set(0,1.5,0);heli.add(heliL)}
let lastArc=0;
function animExtra(el,dt){
 curt.forEach((c,i)=>{c.rotation.z=Math.sin(el*.7+i*2)*.02;c.scale.x=1+Math.sin(el*.9+i)*.03});fan.rotation.y=el*2.4;cornerTick.forEach(f=>f(el));if(pos.z>-2)moveDust(el,dt);if(Math.cos(yaw)<.35)trafficAnim(dt);vinyl.rotation.y=el*3.5;flame.scale.y=1.8+Math.sin(el*17)*.25+Math.sin(el*7)*.15;holo.rotation.y=el*.7;holoAnim(el);holo.rotation.x=el*.35;holo.position.y=1.45+Math.sin(el*1.5)*.05;sweepT.offset.y=-(el*.12)%1;projM.forEach(m=>m.opacity=.96+Math.sin(el*23)*.02);
 gleds.forEach(o=>o.m.emissive.setHSL(.5+Math.sin(el*.25+o.off*6)*.1,.85,.55));
 if(pos.x>7.3&&el-lastLs>.066){lastLs=el;drawLesson(el)}if(el-lastArc>.25){lastArc=el;if(pos.x>6.5){drawDesk(el);drawTV(el)}if(pos.x<1&&pos.z>0)drawBlog(el)}
 {const a=trG.attributes.position;for(let i=0;i<NT;i++){const v=tvv[i];if(v.ax){a.array[i*3]+=v.s*dt;if(a.array[i*3]>320)a.array[i*3]=-320;if(a.array[i*3]<-320)a.array[i*3]=320}else{a.array[i*3+2]+=v.s*dt;if(a.array[i*3+2]>420)a.array[i*3+2]=34;if(a.array[i*3+2]<34)a.array[i*3+2]=420}}a.needsUpdate=true}
 heli.position.set(Math.cos(el*.18)*130,45+Math.sin(el*.5)*4,210+Math.sin(el*.18)*60);heli.rotation.y=-el*.18;heliL.visible=Math.sin(el*6)>0;bulbs.forEach((m,i)=>m.emissiveIntensity=1.6+Math.sin(el*2+i)*.8);

 /* ambilight: sinema LED'leri ve ışığı projenin baskın rengine uyar */
 ambC.lerp(ambT,Math.min(1,dt*3));cinM.forEach(m=>m.emissive.copy(ambC));scL.color.copy(ambC).lerp(WHT,.45);
}

/* ---------- ETKİLEŞİM ---------- */
const HS={about:{p:V(-WL+.2,3.8,-1.95),f:V(-3.6+LX,1.8,-1.95),l:V(-WL,2.2,-1.95)},schedule:{p:V(-WL+.2,3.8,2.4),f:V(-3.6+LX,1.8,2.4),l:V(-WL,2.2,2.4)},projects:{p:V(6.6,3.4,-.3),f:V(3.1,1.2,-.3),l:V(W,1.95,-.3),fp:V(1.4,1.75,-.3)},
 gallery:{p:V(px,4.25,-ZB+.4),f:V(px,1.9,-1.6),l:V(px,2.35,-ZB)},blog:{p:V(-4.4,2.1,4.2),f:V(-4.4,1.55,2.1),l:V(-4.4,1.38,4.3),fp:V(-4.4,1.6,1.15)},contact:{p:V(NX0+.15,1.0,-5.75),f:V(-3.3+LX,1.5,-4.4),l:V(NX0+.15,.57,-5.75)},slide:{p:V(4.15,2.4,7.2),f:V(4.15,1.65,5.6),l:V(4.15,.9,8.3)},game:{p:V(13.4,2.55,-4.3),f:V(13.4,1.55,-2.3),l:V(13.4,1.35,-4.65)},...STN,lesson:{p:V(W+.7,4.0,-.65),f:V(10.4,1.65,-.65),l:V(W,2.2,-.65),fp:V(13.3,1.65,-2.8)}};
Object.entries(HS).forEach(([k,h])=>{const t=D.hs[k];h.n=t[0];h.s=t[1];h.d=t[2];h.key=({schedule:'about',coffee:'about'})[k]||k;h.gr=['game','tag','bug','squash','lesson'].includes(k);const d=document.createElement('button');d.type='button';d.className='lbl';d.tabIndex=-1;d.innerHTML=`${h.n}<small>${h.s}</small>`;document.body.appendChild(d);h.el=d;d.onclick=()=>go(h)});
const card=$('#card'),F=$('#fade'),gameEl=$('#game'),promptEl=$('#prompt');let yaw=Math.PI,pitch=1.35,pos=V(BX0,1.0,-4.9),t=(location.hash.length>1||matchMedia('(prefers-reduced-motion: reduce)').matches)?4:0,ctrl=false,foc=null,seat=false,mode='room',ride=null,drag=false,lx=0,ly=0,cur=null,dimK=0;const K={};
const fade=fn=>{F.style.opacity=1;setTimeout(()=>{fn();if(needBake&&bakeFn&&mode==='room'){needBake=false;bakeFn()}F.style.opacity=0},380)};
const leave=k=>openSite(k);
const look=(f,l)=>{const d=l.clone().sub(f).normalize();return{yaw:Math.atan2(-d.x,-d.z),pitch:Math.asin(d.y)}};
function go(h,inst){if(mode!=='room'||!ctrl)return;cur=h;const asp=innerWidth/innerHeight,kk=asp<1?Math.min(2.1,1+(1-asp)*1.9):1;let fp=h.f.clone();if(kk>1){fp=h.fp?h.fp.clone():h.f.clone().sub(h.l).multiplyScalar(kk).add(h.l).setY(h.f.y);fp.x=Math.max(-9.3,Math.min(16.7,fp.x));fp.z=Math.max(-6,Math.min(4.7,fp.z))}const o=look(fp,h.l),to={p:fp,yaw:o.yaw,pitch:o.pitch};
 const open=()=>{card.querySelector('h2').textContent=h.n;card.querySelector('p').textContent=h===HS.projects?PJ[si][1]+' — '+PJ[si][2]:h.d;card.querySelector('.go').textContent=h===HS.slide?T.slide:(h===HS.game||h===HS.tag||h===HS.bug||h===HS.squash)?T.play:T.open;$('#pv').style.display=$('#nx').style.display=h===HS.projects?'inline-block':'none';card.style.display='block'};
 seat=h===HS.projects;if(inst){fade(()=>{pos.copy(to.p);yaw=to.yaw;pitch=to.pitch;foc={t:1,from:null,to};open()})}else foc={t:0,from:{p:pos.clone(),yaw,pitch},to,open}}
function next(d){si=(si+d+PJ.length)%PJ.length;drawS();if(cur===HS.projects)card.querySelector('p').textContent=PJ[si][1]+' — '+PJ[si][2]}
$('#pv').onclick=()=>next(-1);$('#nx').onclick=()=>next(1);
card.querySelector('.bk').onclick=()=>{card.style.display='none';seat=false;if(foc&&foc.from){foc.back=true;foc.t=1}else foc=null};
card.querySelector('.go').onclick=()=>{if(cur===HS.slide){card.style.display='none';seat=false;foc=null;ride={u:0};mode='ride'}else if([HS.game,HS.tag,HS.bug,HS.squash,HS.lesson].includes(cur)){card.style.display='none';seat=false;foc=null;startArcade(D.game,D.urls,c=>openSite('contact',c),cur===HS.game?'atelier':cur===HS.tag?'tag':cur===HS.bug?'bug':cur===HS.squash?'squash':'lesson',lv=>{lessonLevel=lv;lsReset=true})}else leave(cur.key)};
$('#dock').onclick=e=>{const b=e.target.closest('button');if(!b)return;const k=b.dataset.t;if(mode!=='room')return;card.style.display='none';foc=null;seat=false;if(k==='home')fade(()=>{pos.set(0,1.65,0);yaw=0;pitch=.05});else go(HS[k],true)};
$('#back').onclick=()=>fade(()=>{mode='room';setUnder(false);scene.environment=envTex||roomEnv;$('#dlesson').hidden=true;$('#back').style.display='none';scene.background=sky;scene.fog=new THREE.Fog(0x8a5a72,70,900);pos.set(0,1.65,2.4);yaw=Math.PI;pitch=0});
const sum=$('#summary');$('#sumbtn').onclick=()=>sum.classList.toggle('open');
const site=$('#site'),sbody=$('#sbody'),SLUG={};Object.entries(D.urls).forEach(([k,u])=>{SLUG[u.replace('.html','')]=k});let siteOpen=null;
let heroCtl=null;const killHero=()=>{if(heroCtl){heroCtl.stop();heroCtl=null}};
function fillSite(k,code){killHero();const tp=document.getElementById('tpl-'+k);sbody.innerHTML='';sbody.appendChild(tp.content.cloneNode(true));sbody.querySelectorAll('h1x').forEach(e=>{const h=document.createElement('h1');[...e.attributes].forEach(a=>h.setAttribute(a.name,a.value));h.append(...e.childNodes);e.replaceWith(h)});if(window.initContent)window.initContent(sbody);
 {if(!matchMedia('(prefers-reduced-motion: reduce)').matches){try{const swin=site.querySelector('.swin'),c={D,sbody,swin,state:{jp:0,jActive:false,jIdx:0},imgBase:'../assets/img/',tier:window.TIER},en=enhance(k,c);let st=null;try{st=innerWidth>700?mountStage(k,c):null}catch(e){swin.classList.remove('stage-on');console.warn('stage3d',e)}heroCtl={stop(){if(st)st.stop();en.stop()}}}catch(e){console.warn('site3d',e)}}}
 const slug=D.urls[k].replace('.html','');$('#surl').textContent=(location.host||'berat-yanardag')+'/'+slug;site.querySelectorAll('.stabs a').forEach(a=>a.classList.toggle('cur',a.dataset.site===k));
 if(code){const f=sbody.querySelector('#contact-form');if(f){const en=document.documentElement.lang==='en';f.querySelector('#subject').value=(en?'Web Design Badge: ':'Web Tasarım Rozeti: ')+code;f.querySelector('#message').value=en?`Hi Berat, I finished the UI Workshop game! My badge code is ${code}. Can I claim my coffee & web design chat?`:`Merhaba Berat, Arayüz Atölyesi oyununu bitirdim! Rozet kodum ${code}. Kahve eşliğindeki web/arayüz sohbeti ödülümü alabilir miyim?`}}
 sbody.scrollTop=0}
function openSite(k,code){if(!document.getElementById('tpl-'+k))return;card.style.display='none';seat=false;const was=siteOpen;siteOpen=k;history[was?'replaceState':'pushState']({s:1},'','#'+D.urls[k].replace('.html',''));
 site.hidden=false;site.classList.remove('closing');
 if(was){sbody.classList.add('out');setTimeout(()=>{fillSite(k,code);sbody.classList.remove('out');sbody.classList.add('in3d');setTimeout(()=>sbody.classList.remove('in3d'),560)},260)}else fillSite(k,code)}
function hideSite(){if(!siteOpen)return;siteOpen=null;site.classList.add('closing');if(foc&&foc.from){foc.back=true;foc.t=1}else foc=null;seat=false;setTimeout(()=>{if(!siteOpen){site.hidden=true;site.classList.remove('closing');killHero();sbody.innerHTML=''}},400)}
const closeSiteUI=()=>{if(history.state&&history.state.s)history.back();else hideSite()};
addEventListener('popstate',()=>{if(siteOpen)hideSite()});$('#sclose').onclick=closeSiteUI;site.querySelectorAll('.stabs a').forEach(a=>a.onclick=e=>{e.preventDefault();openSite(a.dataset.site)});
sbody.addEventListener('click',e=>{const a=e.target.closest('a');if(!a)return;const h=a.getAttribute('href')||'';if(h.startsWith('#')){e.preventDefault();const t=sbody.querySelector(h);t&&t.scrollIntoView({behavior:'smooth'});return}const k=SLUG[h.split('#')[0].replace('.html','')];if(k&&k!=='home'){e.preventDefault();openSite(k)}else if(k==='home'){e.preventDefault();closeSiteUI()}});
addEventListener('keydown',e=>{if(e.key==='Escape'&&siteOpen&&!document.querySelector('dialog[open]'))closeSiteUI();if(e.key==='Escape'&&(mode==='dive'||mode==='under'))$('#back').click()});
{const k0=SLUG[location.hash.slice(1)];if(k0&&k0!=='home')setTimeout(()=>openSite(k0),400)}
const PHs=D.photos,story=$('#story'),ray=new THREE.Raycaster(),mv=new THREE.Vector2();let sI=0,hov=-1,moved=0;
function openStory(i){sI=(i+PHs.length)%PHs.length;const a=PHs[sI];story.querySelector('img').src='../assets/img/'+a[0].replace('/t/','/');story.querySelector('img').alt=a[3]||'';story.querySelector('h2').textContent=a[3]||'';story.querySelector('.sc').textContent=a[4]||'';story.querySelector('.st').textContent=a[5]||'';lastFocus=document.activeElement;story.hidden=false;$('#sx').focus()}
let lastFocus=null;const closeStory=()=>{story.hidden=true;if(lastFocus&&lastFocus.focus)lastFocus.focus()};$('#sx').onclick=closeStory;addEventListener('photo:open',e=>openStory(e.detail));$('#sp').onclick=()=>openStory(sI-1);$('#sn').onclick=()=>openStory(sI+1);story.addEventListener('click',e=>{if(e.target===story)closeStory()});
addEventListener('keydown',e=>{if(story.hidden)return;if(e.key==='Escape')closeStory();if(e.key==='ArrowLeft')openStory(sI-1);if(e.key==='ArrowRight')openStory(sI+1)});
const hitP=e=>{mv.set(e.clientX/innerWidth*2-1,-(e.clientY/innerHeight)*2+1);ray.setFromCamera(mv,cam);const h=ray.intersectObjects(pickP,false)[0];return h&&h.distance<10?h.object.userData.i:-1};
R.domElement.addEventListener('pointermove',e=>{if(drag||mode!=='room'||!ctrl)return;hov=hitP(e);R.domElement.style.cursor=hov>=0?'pointer':''});
R.domElement.addEventListener('click',e=>{if(moved>6||mode!=='room'||!ctrl)return;const i=hitP(e);if(i>=0)openStory(i)});
let dragId=-1;R.domElement.addEventListener('pointerdown',e=>{if(drag)return;drag=true;dragId=e.pointerId;moved=0;lx=e.clientX;ly=e.clientY});['pointerup','pointercancel'].forEach(ev=>addEventListener(ev,e=>{if(e.pointerId===dragId){drag=false;dragId=-1}}));
addEventListener('pointermove',e=>{if(!drag||e.pointerId!==dragId||!ctrl||ride)return;if(foc&&!foc.back&&foc.t<1)return;moved+=Math.abs(e.clientX-lx)+Math.abs(e.clientY-ly);yaw-=(e.clientX-lx)*.005;pitch=Math.max(-1.3,Math.min(1.3,pitch-(e.clientY-ly)*.005));lx=e.clientX;ly=e.clientY});
addEventListener('keydown',e=>{if(/INPUT|TEXTAREA/.test(e.target.tagName)||!$('#story').hidden||!$('#game').hidden)return;K[e.code]=1;if(e.code==='KeyE'&&ctrl&&!foc&&mode==='room'){const n=near();if(n.h&&n.d<3)go(n.h)}});addEventListener('keyup',e=>K[e.code]=0);{const f=$('#fwd');f.innerHTML='<i></i>';const kn=f.firstChild;let jid=-1,cx=0,cy=0;const R2=46,set=(x,y)=>{K.jx=x;K.jy=y;kn.style.transform='translate('+x*R2+'px,'+(-y*R2)+'px)'};f.onpointermove=e=>{if(e.pointerId!==jid)return;let dx=(e.clientX-cx)/R2,dy=(cy-e.clientY)/R2;const m=Math.hypot(dx,dy);if(m>1){dx/=m;dy/=m}if(m<.12){dx=0;dy=0}set(dx,dy)};f.onpointerdown=e=>{if(jid!==-1)return;jid=e.pointerId;const r=f.getBoundingClientRect();cx=r.left+r.width/2;cy=r.top+r.height/2;try{f.setPointerCapture(e.pointerId)}catch(_){}f.onpointermove(e)};['onpointerup','onpointercancel','onlostpointercapture'].forEach(ev=>f[ev]=e=>{if(e&&e.pointerId!==undefined&&e.pointerId!==jid)return;jid=-1;set(0,0)})}[['#dup','KeyE'],['#ddn','KeyQ']].forEach(([id,k])=>{const b=$(id);if(!b)return;b.onpointerdown=()=>K[k]=1;['onpointerup','onpointerleave','onpointercancel'].forEach(ev=>b[ev]=()=>K[k]=0)});
const near=()=>{let b={h:null,d:99};for(const h of Object.values(HS)){const d=Math.hypot(pos.x-h.p.x,pos.z-h.p.z);if(d<b.d)b={h,d}}return b};
const OB=[[-6.8+LX,-4.4+LX,-6.2,-3.2],[-4.3+LX,-3.5+LX,-6.2,-5.5],[2.2,3.9,-2.3,1.7],[4.6,5.8,-1.2,.6],[-5.5,-1.9,3.55,4.7],[3.1,4.1,-4.1,-3],[3.1,4.1,2.4,3.4],[11.5,15.3,-5,-3.6],[-.9,4.1,-6.2,-5.5],[2.3,2.8,1.95,2.45],[3.0,4.2,6.0,7.0],[CX-1.5,CX+1.5,-ZB+2.4,-ZB+3.0],[10.9,13.1,-1.1,1.1],[9.3,10.7,-3.5,-2.1],[9.4,10.8,.8,2.2],...STN_OB];
const RG=[[-6.6+LX,6.6,-ZB+.4,4.1],[5.4,6.7,3.5,4.75],[6.3,7.7,3.85,4.75],[7.5,16.6,-4.6,4.6],[2.9,5.5,4.0,7.0]];
const blocked=(x,z)=>!RG.some(r=>x>r[0]&&x<r[1]&&z>r[2]&&z<r[3])||OB.some(o=>x>o[0]-.25&&x<o[1]+.25&&z>o[2]-.25&&z<o[3]+.25);
const sm=(a,b,x)=>{x=Math.max(0,Math.min(1,(x-a)/(b-a)));return x*x*(3-2*x)},lerp=(a,b,k)=>a+(b-a)*k,ang=(a,b)=>Math.atan2(Math.sin(b-a),Math.cos(b-a));
scene.traverse(o=>{if(o.isMesh&&o.geometry.type==='RoundedBoxGeometry'&&o.material.roughness>=.95&&!o.material.normalMap&&!o.material.map){o.material.normalMap=fabN;o.material.normalScale.set(.55,.55)}});
let bakeFn=null,ready=false,needBake=false;
const PERF=/[?&]perf/.test(location.search);let perfEl=null,pf=0,pt=0;if(PERF){perfEl=document.createElement('div');perfEl.style.cssText='position:fixed;left:50%;top:.5rem;transform:translateX(-50%);z-index:99;background:#000c;color:#7fe4ff;font:12px ui-monospace,monospace;padding:.3rem .7rem;border-radius:8px;pointer-events:none;white-space:pre';document.body.appendChild(perfEl);R.info.autoReset=false}
{const en=document.documentElement.lang==='en',b=document.createElement('button');b.type='button';b.id='qbtn';b.textContent=(en?'⚙ Quality: ':'⚙ Kalite: ')+(HI?(en?'High':'Yüksek'):(en?'Performance':'Performans'));b.title=GPU;b.onclick=()=>{localStorage.setItem('q',HI?'perf':'high');location.reload()};const top=$('.top');if(top)top.prepend(b)}
const setUnder=v=>{U.children.forEach(c=>{if(!c.isLight)c.visible=c===gate?(v&&!!gate.userData.open&&!gate.userData.done):c===siteG?(v&&!!siteG.userData.on):c===liveG?(v&&!!liveG.userData.on):v});LL.forEach(o=>o.l.visible=!v);usun.visible=v};
{const DYN=new Set([cam,fan,vinyl,flame,holo,heli,...curt,...ub,...jel,...kelp.map(k=>k.g),...orbs.flatMap(o=>[o.g,o.h,o.rg]),...gPh.flatMap(o=>o?[o.g,o.sh]:[])]);scene.traverse(o=>{if(o!==scene&&!DYN.has(o)){o.updateMatrix();o.matrixAutoUpdate=false}})}
{const envRT=new THREE.WebGLCubeRenderTarget(256,{type:THREE.HalfFloatType}),envCam=new THREE.CubeCamera(.1,60,envRT),pg=new THREE.PMREMGenerator(R);envCam.position.set(0,1.7,.5);scene.add(envCam);let baked=0;
 const bake=()=>{if(baked>1||mode!=='room')return;baked++;const fx=[U,heli];fx.forEach(o=>o.visible=false);envCam.update(R,scene);R.shadowMap.needsUpdate=true;fx.forEach(o=>o.visible=true);const t=pg.fromCubemap(envRT.texture).texture;if(envTex)envTex.dispose();envTex=t;scene.environment=t};
 bakeFn=bake}
R.shadowMap.needsUpdate=true;
(async()=>{let loaded=false;await new Promise(r=>{THREE.DefaultLoadingManager.onLoad=()=>{loaded=true;r()};setTimeout(r,1200)});
 /* zemine yatan tüm ince nesneler (halı, temas gölgesi, ışık lekesi) zeminle titremesin */
 scene.traverse(o=>{if(o.isMesh&&o.position.y>.001&&o.position.y<.06&&Math.abs(o.rotation.x+Math.PI/2)<.01){o.renderOrder=Math.round(o.position.y*1000);[].concat(o.material).forEach(m=>{m.polygonOffset=true;m.polygonOffsetFactor=-3;m.polygonOffsetUnits=-3;m.depthWrite=false})}});
 try{await R.compileAsync(scene,cam)}catch(e){try{R.compile(scene,cam)}catch(e2){}}
 scene.traverse(o=>{const ms=o.material?(Array.isArray(o.material)?o.material:[o.material]):[];ms.forEach(m=>['map','normalMap','emissiveMap'].forEach(k=>{if(m[k])R.initTexture(m[k])}))});
 if(bakeFn)bakeFn();R.shadowMap.needsUpdate=true;setUnder(false);
 if(comp&&Q.bloom)comp.render();else R.render(scene,cam);
 if(!loaded)THREE.DefaultLoadingManager.onLoad=()=>{needBake=true};
 clock.getDelta();ready=true;document.body.classList.add('ready')})();
const clock=new THREE.Clock(),tmp=new THREE.Vector3();let fa=0,fn=0;
(function loop(){const dt=Math.min(.05,clock.getDelta());if(!ready||siteOpen||!gameEl.hidden){requestAnimationFrame(loop);return}t+=dt;const el=clock.elapsedTime;
 /* otomatik performans ayarı */
 fa+=dt;fn++;if(fn>=45){const avg=fa/fn;fa=0;fn=0;/* yalnızca gerçekten takılırsa (≈<25 fps) çözünürlük kademeli düşer; akıcılaşınca geri artar. Efektler kapanmaz. */
  if(avg>.022){if(Q.pr>.75){Q.pr=Math.max(.75,Q.pr-.1);resize()}else if(grain&&grain.enabled)grain.enabled=false;else if(Q.bloom)Q.bloom=false}else if(avg<.0145&&Q.pr<Q.max){Q.pr=Math.min(Q.max,Q.pr+.05);resize()}}
 if(!ctrl&&new URLSearchParams(location.search).get('cam')){ctrl=true;const q=new URLSearchParams(location.search).get('cam').split(',').map(Number);pos.set(q[0],q[1],q[2]);yaw=q[3];pitch=q[4]||0}
 if(!ctrl&&new URLSearchParams(location.search).has('dive')){ctrl=true;mode='under';setUnder(true);R.shadowMap.needsUpdate=true;scene.background=new THREE.Color(0x0a6a98);scene.fog=new THREE.FogExp2(0x0a6a98,.034);scene.environment=null;pos.set(0,UY+3.2,4);yaw=0;pitch=-.1;diveEl0=el;document.body.classList.add('diving')}
 if(!ctrl){const a=sm(.55,2.85,t),b=sm(2.55,4.45,t),c=sm(3.1,5.0,t);pitch=lerp(lerp(1.35,.28,a),0,b);yaw=lerp(lerp(Math.PI,Math.PI+.9,a),Math.PI+.55,b);pos.set(lerp(BX0,-3.8+LX,c),lerp(.95,.85,a)+(1.65-.85)*b+Math.sin(el*1.6)*.01*(1-b),lerp(-4.9,-2.8,c));if(t>5.0){ctrl=true;pos.y=1.65;const dc=new URLSearchParams(location.search).get('cam');if(dc){const q=dc.split(',').map(Number);pos.set(q[0],q[1],q[2]);yaw=q[3];pitch=q[4]||0}if(new URLSearchParams(location.search).has('dive')){mode='under';setUnder(true);R.shadowMap.needsUpdate=true;scene.background=new THREE.Color(0x0a6a98);scene.fog=new THREE.FogExp2(0x0a6a98,.034);scene.environment=null;pos.set(0,UY+3.2,4);yaw=0;pitch=-.1;diveEl0=el;document.body.classList.add('diving')}}}
 else if(mode==='ride'){ride.u=Math.min(1,ride.u+dt*.14);const p=slide.getPointAt(ride.u),q=slide.getPointAt(Math.min(1,ride.u+.02));pos.copy(p).y+=.05;const o=look(p,q);yaw+=ang(yaw,o.yaw)*.12;pitch+=(o.pitch-.1-pitch)*.12;
  if(ride.u>=1&&!ride.done){ride.done=1;F.style.background='#0b6fa0';fade(()=>{mode='dive';setUnder(true);R.shadowMap.needsUpdate=true;ride=null;diveT=0;scene.background=new THREE.Color(0x0a6a98);scene.fog=new THREE.FogExp2(0x0a6a98,.034);scene.environment=null;$('#back').style.display='block';pos.set(0,UY+17,3);yaw=0;pitch=-.75;setTimeout(()=>{F.style.background='#fff'},600)})}}
 else if(mode==='dive'){diveT+=dt;const k=sm(0,7,diveT);pos.set(Math.sin(diveT*.5)*1.2,lerp(UY+17,UY+2.6,k),3-k*1.5);pitch=lerp(-.75,.02,k);yaw=Math.sin(diveT*.4)*.15;if(diveT>=7){mode='under';diveEl0=el;swim.x=swim.y=swim.z=0;diveHint()}}
 else if(foc){const f=foc;if(!f.back&&f.t<1){f.t=Math.min(1,f.t+dt*.85);const k=sm(0,1,f.t),a=f.from;pos.lerpVectors(a.p,f.to.p,k);yaw=a.yaw+ang(a.yaw,f.to.yaw)*k;pitch=lerp(a.pitch,f.to.pitch,k);if(f.t>=1&&f.open)f.open()}
  else if(f.back){f.t=Math.max(0,f.t-dt*1.1);const k=sm(0,1,f.t),a=f.from;pos.lerpVectors(a.p,f.to.p,k);yaw=a.yaw+ang(a.yaw,f.to.yaw)*k;pitch=lerp(a.pitch,f.to.pitch,k);if(f.t<=0)foc=null}}
 else{const sp=(K.ShiftLeft?4.8:2.8)*dt,fw2=Math.max(-1,Math.min(1,(K.KeyW||K.ArrowUp||K.Fwd?1:0)-(K.KeyS||K.ArrowDown?1:0)+(K.jy||0))),rt=Math.max(-1,Math.min(1,(K.KeyD||K.ArrowRight?1:0)-(K.KeyA||K.ArrowLeft?1:0)+(K.jx||0))),vx=(-Math.sin(yaw)*fw2+Math.cos(yaw)*rt)*sp,vz=(-Math.cos(yaw)*fw2-Math.sin(yaw)*rt)*sp;
  if(mode==='room'){const stuck=blocked(pos.x,pos.z);if(stuck||!blocked(pos.x+vx,pos.z))pos.x+=vx;if(stuck||!blocked(pos.x,pos.z+vz))pos.z+=vz;pos.y=1.65+(fw2||rt?Math.sin(el*9)*.025:Math.sin(el*1.4)*.006)}else{const ty=((K.KeyE?1:0)-(K.KeyQ?1:0))*1.2,kk=Math.min(1,dt*1.6);swim.x+=(vx/Math.max(dt,.001)*.7-swim.x)*kk;swim.z+=(vz/Math.max(dt,.001)*.7-swim.z)*kk;swim.y+=(ty-swim.y)*kk;pos.x+=swim.x*dt;pos.z+=swim.z*dt;pos.y=Math.max(UY+1.2+terrH(pos.x,pos.z),Math.min(UY+16,pos.y+swim.y*dt))}}
 cam.position.copy(pos);cam.rotation.set(pitch,yaw,0);
 /* sinema modunda oda ışıkları kısılır, ekran net görünür */
 dimK+=((seat?1:0)-dimK)*Math.min(1,dt*2.5);const dk=1-.8*dimK;LL.forEach(o=>{o.l.intensity=o.i*(o.l===scL?1+dimK*.8:dk)});leds.forEach(o=>o.m.emissiveIntensity=o.gl*(1-.6*dimK));
 phM.emissiveIntensity=1+(el%3<.5?Math.sin(el*60)*.2:0);shade.material.emissiveIntensity=1.5+Math.sin(el*2.3)*.07;tip.visible=Math.sin(el*2)>-.2;
 document.body.classList.toggle('diving',mode==='dive'||mode==='under');if(mode==='under'||mode==='dive')animDive(el,dt);else seaT.rotation=el*.15;
 for(const h of Object.values(HS)){tmp.copy(h.p).project(cam);const d=Math.hypot(pos.x-h.p.x,pos.z-h.p.z),on=ctrl&&!foc&&mode==='room'&&tmp.z<1&&d<10&&Math.abs(tmp.x)<1.1&&(h.gr?pos.x>7.4:pos.x<7.6);h.el.classList.toggle('on',on);h.el.tabIndex=on?0:-1;if(on){h.el.style.left=(tmp.x*.5+.5)*innerWidth+'px';h.el.style.top=(-tmp.y*.5+.5)*innerHeight+'px'}}
 const n=near(),pr=promptEl;pr.style.opacity=ctrl&&!foc&&mode==='room'&&n.d<3?1:0;if(n.h)pr.textContent='E · '+n.h.n;
 animExtra(el,dt);gPh.forEach((o,i)=>{const nw=pos.z<-ZB+7&&Math.abs(pos.x-px)<6?.05:0,tg=hov===i?.26:nw;o.pop+=(tg-o.pop)*Math.min(1,dt*6);o.g.position.z=o.g.userData.base+o.pop;o.g.rotation.y=THREE.MathUtils.clamp((pos.x-o.g.position.x)*.012,-.12,.12)*(hov===i?1:.4);o.sh.scale.setScalar(1+o.pop*1.6);o.sh.material.opacity=1-o.pop*1.1});
 if(grain)grain.uniforms.t.value=el%10;if(PERF)R.info.reset();if(comp&&Q.bloom)comp.render();else R.render(scene,cam);
 if(PERF){pf++;pt+=dt;if(pt>.5){perfEl.textContent=`${Math.round(pf/pt)} fps · ${R.info.render.calls} calls · ${(R.info.render.triangles/1000)|0}k tris · ${TIER} · pr ${Q.pr.toFixed(2)}${Q.bloom?' · bloom':''}`;pf=0;pt=0}}requestAnimationFrame(loop)})();
