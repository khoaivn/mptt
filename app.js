function renderHeap(s){
  $('heap-view').hidden=type!=='heap';
  if(type!=='heap')return;
  const size=s.a.length-s.done.length;
  const svg=$('heap-tree'),ns='http://www.w3.org/2000/svg';
  svg.replaceChildren();
  const levels=Math.max(1,Math.ceil(Math.log2(size+1))),width=Math.max(600,Math.pow(2,levels-1)*64),height=levels*80+24;
  svg.setAttribute('viewBox',`0 0 ${width} ${height}`);svg.style.minWidth='0';svg.style.width='100%';svg.style.height='auto';svg.style.aspectRatio=width+' / '+height;svg.setAttribute('preserveAspectRatio','xMidYMid meet');
  const points=Array.from({length:size},(_,i)=>{const level=Math.floor(Math.log2(i+1)),offset=i-(Math.pow(2,level)-1);return {x:(offset+.5)*width/Math.pow(2,level),y:36+level*80}});
  function add(tag,attrs,text,parent=svg){const el=document.createElementNS(ns,tag);for(const [key,value]of Object.entries(attrs))el.setAttribute(key,value);if(text!==undefined)el.textContent=text;parent.append(el);return el}
  for(let i=1;i<size;i++){const parent=Math.floor((i-1)/2);add('line',{x1:points[parent].x,y1:points[parent].y,x2:points[i].x,y2:points[i].y,class:'heap-edge'+(s.active.includes(i)&&s.active.includes(parent)?' highlighted':'')})}
  points.forEach((point,i)=>{const group=add('g',{class:'heap-node'+(s.pivot.includes(i)?' pivot':s.active.includes(i)?' active':''),'aria-label':`Nút ${i}, giá trị ${s.a[i]}`});add('title',{},`A[${i}] = ${s.a[i]}`,group);add('circle',{cx:point.x,cy:point.y,r:22},undefined,group);add('text',{x:point.x,y:point.y+5,'text-anchor':'middle',class:'heap-value'},s.a[i],group);add('text',{x:point.x,y:point.y+36,'text-anchor':'middle',class:'heap-index'},i,group)});
  if(!size)add('text',{x:width/2,y:48,'text-anchor':'middle',class:'heap-empty'},'Heap đã rỗng — mảng đã có thứ tự.');
  $('heap-sorted').replaceChildren(...s.a.slice(size).map((value,k)=>{const el=document.createElement('span');el.className='heap-chip';el.textContent=value;el.title=`A[${size+k}]`;return el}));
  if(!s.done.length)$('heap-sorted').textContent='Chưa có phần tử';
}
const $=id=>document.getElementById(id);let category='sorting',target=54,lastTypes={sorting:'bubble',searching:'linear'};let type='bubble',input=[42,18,67,9,54,31,82,23,60,12],steps=[],position=0,timer=null;
function pause(){clearTimeout(timer);timer=null;$('play').textContent=position===steps.length-1?'↺ Chạy lại':'▶ Chạy mô phỏng';$('state').textContent=position===steps.length-1?'Hoàn thành':position?'Tạm dừng':'Sẵn sàng'}
function render(){const s=steps[position],max=Math.max(...input);renderHeap(s);renderBST(s);$('chart').replaceChildren(...s.a.map((v,i)=>{const bar=document.createElement('div');bar.className='bar'+(s.pivot.includes(i)?' pivot':s.active.includes(i)?' active':s.done.includes(i)?' done':s.excluded?.includes(i)?' excluded':'');bar.style.height=`${Math.max(3,v/max*100)}%`;const value=document.createElement('b');value.textContent=v;const index=document.createElement('small');index.textContent=i;bar.append(value,index);bar.setAttribute('aria-label',`Vị trí ${i}: ${v}`);return bar}));$('comparisons').textContent=s.comparisons;$('writes').textContent=s.writes;$('step-count').textContent=`${position} / ${steps.length-1}`;$('timeline').value=position;$('prev').disabled=position===0;$('next').disabled=position===steps.length-1;document.querySelectorAll('.code-line').forEach(el=>el.classList.toggle('highlight',Number(el.dataset.sourceLine)===s.line))}
function setup(){pause();position=0;steps=category==='searching'?generateSearchSteps(input,type,target):generateSteps(input,type);const algo=algorithms[type];$('about-title').textContent=algo.name;$('about').textContent=algo.about;for(const k of ['time','space','stable'])$(k).textContent=algo[k];$('code').replaceChildren(...algo.code.flatMap((text,sourceLine)=>{const indent=text.match(/^\s*/)[0];return text.split(';').flatMap(part=>{const statement=part.trim();const conditional=statement.match(/^((?:if\b.*|else)):\s*(.+)$/);return conditional?[{text:indent+conditional[1],sourceLine},{text:indent+'  '+conditional[2],sourceLine}]:[{text:indent+statement,sourceLine}]})}).map(({text,sourceLine},i)=>{const el=document.createElement('div');el.className='code-line';el.dataset.sourceLine=sourceLine;const n=document.createElement('span');n.textContent=String(i+1).padStart(2,'0');el.append(n,document.createTextNode(text));return el}));$('timeline').max=steps.length-1;document.querySelectorAll('#algos button').forEach(b=>b.classList.toggle('selected',b.dataset.algo===type));updateCategoryUI();render();pause()}
function tick(){if(position<steps.length-1){position++;render()}if(position===steps.length-1){pause();return}timer=setTimeout(tick,650/Number($('speed').value))}
function play(){if(timer){pause();return}if(position===steps.length-1)position=0;$('play').textContent='Ⅱ Tạm dừng';$('state').textContent='Đang chạy';timer=setTimeout(tick,650/Number($('speed').value));render()}
function move(delta){pause();position=Math.max(0,Math.min(steps.length-1,position+delta));render();pause()}
const groups={sorting:['bubble','bubbleBasic','selection','insertion','merge','quick','quickHoare','heap'],searching:['linear','binary','bst']};
function buildMenu(){
 $('algos').replaceChildren(...groups[category].map(key=>{const b=document.createElement('button');b.textContent=algorithms[key].name;b.dataset.algo=key;b.onclick=()=>{type=key;lastTypes[category]=key;setup()};return b}));
 $('algos').setAttribute('aria-label',category==='sorting'?'Chọn thuật toán sắp xếp':'Chọn thuật toán tìm kiếm');
}
function updateCategoryUI(){
 const searching=category==='searching';
 $('search-controls').hidden=!searching;
 $('legend-neutral').textContent=searching?'Chưa xét':'Chưa xử lý';$('legend-pivot').textContent=searching?'Vị trí giữa':'Mốc / ghi';$('legend-done').textContent=searching?'Tìm thấy':'Đã sắp xếp';
 $('property-label').textContent=searching?'THỨ TỰ MẢNG':'ỔN ĐỊNH';
 document.querySelectorAll('[data-category]').forEach(b=>{const selected=b.dataset.category===category;b.classList.toggle('selected',selected);b.setAttribute('aria-pressed',selected)});
 document.querySelectorAll('#algos button').forEach(b=>b.setAttribute('aria-pressed',b.dataset.algo===type));
}
document.querySelectorAll('[data-category]').forEach(b=>b.onclick=()=>{category=b.dataset.category;type=lastTypes[category];buildMenu();setup()});
$('play').onclick=play;$('next').onclick=()=>move(1);$('prev').onclick=()=>move(-1);$('reset').onclick=()=>{pause();position=0;render();pause()};$('timeline').oninput=()=>{pause();position=Number($('timeline').value);render();pause()};$('speed').oninput=()=>{$('speed-value').textContent=$('speed').value+'×'};
$('apply').onclick=()=>{const raw=$('array').value.trim(),tokens=raw.split(/[\s,;]+/);if(!raw||tokens.length<2||tokens.length>40||tokens.some(x=>!/^\d+$/.test(x)||Number(x)<1||Number(x)>999)){$('error').textContent='Nhập 2–40 số nguyên từ 1 đến 999, cách nhau bằng dấu phẩy hoặc khoảng trắng.';return}if(category==='searching'&&!readTarget())return;input=tokens.map(Number);$('error').textContent='';setup()};
document.querySelectorAll('[data-preset]').forEach(b=>b.onclick=()=>{let a=Array.from({length:12},()=>Math.floor(Math.random()*90)+10);if(b.dataset.preset==='ascending')a.sort((x,y)=>x-y);if(b.dataset.preset==='descending')a.sort((x,y)=>y-x);if(b.dataset.preset==='duplicates')a=a.map(x=>[20,40,60,80][x%4]);if(category==='searching'&&!readTarget())return;input=a;$('array').value=a.join(', ');$('error').textContent='';setup()});
function readTarget(){const raw=$('target').value;if(!/^\d+$/.test(raw)||Number(raw)<1||Number(raw)>999){$('error').textContent='Giá trị cần tìm phải là số nguyên từ 1 đến 999.';return false}target=Number(raw);return true}
$('target').onchange=()=>{if(readTarget()){$('error').textContent='';setup()}};
document.addEventListener('keydown',e=>{if(['INPUT','TEXTAREA','BUTTON'].includes(e.target.tagName))return;if(e.code==='Space'){e.preventDefault();play()}if(e.key==='ArrowRight'){e.preventDefault();move(1)}if(e.key==='ArrowLeft'){e.preventDefault();move(-1)}});buildMenu();setup();

function renderBST(s){
 $('bst-view').hidden=type!=='bst';if(type!=='bst')return;
 const svg=$('bst-tree'),ns='http://www.w3.org/2000/svg',nodes=s.tree,points=[];let rank=0,maxDepth=0;
 function layout(i,depth){if(i===null)return;layout(nodes[i].left,depth+1);points[i]={x:42+rank++*64,y:38+depth*78};maxDepth=Math.max(maxDepth,depth);layout(nodes[i].right,depth+1)}
 layout(0,0);const width=Math.max(600,nodes.length*64+20),height=(maxDepth+1)*78+30;
 svg.replaceChildren();svg.setAttribute('viewBox',`0 0 ${width} ${height}`);svg.style.minWidth='0';svg.style.width='100%';svg.style.height='auto';svg.style.aspectRatio=width+' / '+height;svg.setAttribute('preserveAspectRatio','xMidYMid meet');
 function add(tag,attrs,text,parent=svg){const el=document.createElementNS(ns,tag);for(const [key,value]of Object.entries(attrs))el.setAttribute(key,value);if(text!==undefined)el.textContent=text;parent.append(el);return el}
 nodes.forEach((node,i)=>{for(const side of ['left','right']){const child=node[side];if(child===null)continue;const followed=s.path.includes(i)&&s.path.includes(child);add('line',{x1:points[i].x,y1:points[i].y,x2:points[child].x,y2:points[child].y,class:'heap-edge'+(followed?' highlighted':'')})}});
 nodes.forEach((node,i)=>{const p=points[i],state=s.done.includes(i)?' found':s.active.includes(i)?' active':s.path.includes(i)?' visited':'';const group=add('g',{class:'heap-node'+state,'aria-label':`A[${i}] = ${node.value}`});add('title',{},`A[${i}] = ${node.value}`,group);add('circle',{cx:p.x,cy:p.y,r:22},undefined,group);add('text',{x:p.x,y:p.y+5,'text-anchor':'middle',class:'heap-value'},node.value,group);add('text',{x:p.x,y:p.y+36,'text-anchor':'middle',class:'heap-index'},i,group)});
 $('bst-size').textContent=`${nodes.length} nút · ${maxDepth+1} tầng`;
 $('bst-path').textContent='Đường đi: '+(s.path.length?s.path.map(i=>`${nodes[i].value} [${i}]`).join(' → '):'Chưa bắt đầu');
}
