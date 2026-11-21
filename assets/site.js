/* Shared behaviour for fatimebarbara.vision pages: scroll reveal, 3D tilt, moving lights, video overlay */
(function(){
  var d=document, root=d.documentElement; root.classList.add('js');
  var calm=window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  if(!(window.CSS && CSS.supports && CSS.supports('animation-timeline: view()')) && 'IntersectionObserver' in window){
    var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target);}});},{rootMargin:'0px 0px -8% 0px'});
    d.querySelectorAll('.reveal').forEach(function(el){el.classList.add('reveal-io');io.observe(el);});
  }
  if(!calm && window.matchMedia && matchMedia('(hover: hover) and (pointer: fine)').matches){
    d.querySelectorAll('[data-tilt]').forEach(function(el){
      var max=el.classList.contains('card3d')?9:3;
      el.addEventListener('pointermove',function(e){
        var r=el.getBoundingClientRect(), x=(e.clientX-r.left)/r.width-.5, y=(e.clientY-r.top)/r.height-.5;
        el.classList.add('tilting'); el.style.setProperty('--mx',((x+.5)*100).toFixed(1)+'%'); el.style.setProperty('--my',((y+.5)*100).toFixed(1)+'%');
        el.style.transform='perspective(1100px) rotateX('+(-y*max).toFixed(2)+'deg) rotateY('+(x*max).toFixed(2)+'deg) translateY(-8px)';
      });
      el.addEventListener('pointerleave',function(){el.classList.remove('tilting');el.style.transform='';});
    });
  }
  d.querySelectorAll('canvas.lights').forEach(function(c){
    if(!c.getContext) return;
    var ctx=c.getContext('2d'), sec=c.parentNode, W=0,H=0,dpr=1, pts=[], run=false, raf=0, mx=0,my=0;
    var cols=['227,194,122','227,194,122','248,245,238','241,219,166'];
    function size(){
      dpr=Math.min(window.devicePixelRatio||1,2); W=sec.clientWidth; H=sec.clientHeight;
      c.width=W*dpr; c.height=H*dpr; ctx.setTransform(dpr,0,0,dpr,0,0);
      var n=Math.round(Math.min(460,W*H/2600)); pts=[];
      for(var i=0;i<n;i++){ var z=Math.random(); pts.push({x:Math.random()*W,y:Math.random()*H,z:z,r:.5+z*1.7,
        vx:(.05+z*.22)*(Math.random()<.5?-1:1)*.5-.06, vy:-(.03+z*.12), p:Math.random()*6.28, s:.4+Math.random()*1.1, c:cols[i%4]}); }
      draw(0);
    }
    function draw(t){
      ctx.clearRect(0,0,W,H);
      for(var i=0;i<pts.length;i++){ var q=pts[i];
        if(run){ q.x+=q.vx; q.y+=q.vy; if(q.x<-6)q.x=W+6; if(q.x>W+6)q.x=-6; if(q.y<-6)q.y=H+6; }
        var a=.3+.7*(.5+.5*Math.sin(q.p+t*.001*q.s)), x=q.x+mx*q.z*18, y=q.y+my*q.z*12;
        ctx.beginPath(); ctx.arc(x,y,q.r,0,6.283); ctx.fillStyle='rgba('+q.c+','+(a*(.45+q.z*.55)).toFixed(3)+')'; ctx.fill();
        if(q.z>.86){ ctx.beginPath(); ctx.arc(x,y,q.r*3.2,0,6.283); ctx.fillStyle='rgba('+q.c+','+(a*.1).toFixed(3)+')'; ctx.fill(); }
      }
    }
    function loop(t){ draw(t); if(run) raf=requestAnimationFrame(loop); }
    function start(){ if(run||calm) return; run=true; raf=requestAnimationFrame(loop); }
    function stop(){ run=false; cancelAnimationFrame(raf); }
    size(); window.addEventListener('resize',size);
    if('IntersectionObserver' in window){ new IntersectionObserver(function(es){ es[0].isIntersecting?start():stop(); }).observe(sec); } else start();
    sec.addEventListener('pointermove',function(e){ var r=sec.getBoundingClientRect(); mx=(e.clientX-r.left)/r.width-.5; my=(e.clientY-r.top)/r.height-.5; });
  });
  var fb=d.querySelectorAll('[data-filter]');
  fb.forEach(function(b){ b.addEventListener('click',function(){
    var g=b.getAttribute('data-filter');
    fb.forEach(function(x){x.setAttribute('aria-pressed',x===b?'true':'false');});
    d.querySelectorAll('[data-group]').forEach(function(a){ a.hidden=!(g==='all'||a.getAttribute('data-group')===g); });
  }); });
  var modal=d.getElementById('modal');
  if(modal){
    var box=d.getElementById('modal-box'), closeBtn=d.getElementById('modal-close'), last=null;
    var show=function(el,cls,btn){ last=btn; box.className='modal-box'+(cls?' '+cls:''); box.appendChild(el); modal.classList.add('open'); d.body.style.overflow='hidden'; closeBtn.focus(); };
    var open=function(btn){ var f=d.createElement('iframe'); f.src=btn.getAttribute('data-modal'); f.title=btn.getAttribute('data-title')||'Video';
      f.allow='autoplay; fullscreen; picture-in-picture'; f.allowFullscreen=true; show(f,'',btn); };
    var zoom=function(btn){ var im=d.createElement('img'); im.src=btn.getAttribute('data-zoom'); im.alt=btn.getAttribute('aria-label')||'Painting'; show(im,'img',btn); };
    var close=function(){ var f=box.querySelector('iframe,img'); if(f) box.removeChild(f); modal.classList.remove('open'); d.body.style.overflow=''; if(last) last.focus(); };
    d.querySelectorAll('[data-modal]').forEach(function(b){b.addEventListener('click',function(){open(b);});});
    d.querySelectorAll('[data-zoom]').forEach(function(b){b.addEventListener('click',function(){zoom(b);});});
    closeBtn.addEventListener('click',close);
    modal.addEventListener('click',function(e){if(e.target===modal) close();});
    d.addEventListener('keydown',function(e){if(e.key==='Escape' && modal.classList.contains('open')) close();});
  }
})();
