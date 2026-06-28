/* ==========================
VITT-MARG PREMIUM JS
========================== */

const navbar=document.querySelector(".navbar");

window.addEventListener("scroll",()=>{

if(window.scrollY>80){

navbar.classList.add("active");

}else{

navbar.classList.remove("active");

}

});


/*==========================
SCROLL REVEAL
==========================*/

const observer=new IntersectionObserver((entries)=>{

entries.forEach(entry=>{

if(entry.isIntersecting){

entry.target.classList.add("show");

}

})

},{threshold:.15});

document.querySelectorAll(".service-card,.team-card,.stat-card,.step,.test-card").forEach(el=>{

el.classList.add("hidden");

observer.observe(el);

});


/*==========================
COUNTER
==========================*/

const counters=document.querySelectorAll(".stat-card h2");

const speed=200;

counters.forEach(counter=>{

const update=()=>{

const target=+counter.innerText.replace("+","").replace("%","");

const count=+counter.getAttribute("data-count")||0;

const inc=target/speed;

if(count<target){

counter.setAttribute("data-count",Math.ceil(count+inc));

counter.innerText=Math.ceil(count+inc)+"+";

setTimeout(update,10);

}else{

counter.innerText=target+(counter.innerText.includes("%")?"%":"+");

}

}

update();

});


/*==========================
BACK TO TOP
==========================*/

const topBtn=document.createElement("button");

topBtn.innerHTML="↑";

topBtn.className="top-btn";

document.body.appendChild(topBtn);

window.addEventListener("scroll",()=>{

topBtn.style.display=window.scrollY>400?"flex":"none";

});

topBtn.onclick=()=>{

window.scrollTo({

top:0,

behavior:"smooth"

});

};


/*==========================
MOUSE GLOW
==========================*/

const glow=document.createElement("div");

glow.className="cursor-glow";

document.body.appendChild(glow);

document.addEventListener("mousemove",(e)=>{

glow.style.left=e.clientX+"px";

glow.style.top=e.clientY+"px";

});


/*==========================
BUTTON RIPPLE
==========================*/

document.querySelectorAll(".primary,.btn-nav").forEach(btn=>{

btn.addEventListener("click",function(e){

let ripple=document.createElement("span");

ripple.className="ripple";

this.appendChild(ripple);

let x=e.clientX-this.offsetLeft;

let y=e.clientY-this.offsetTop;

ripple.style.left=x+"px";

ripple.style.top=y+"px";

setTimeout(()=>{

ripple.remove();

},600);

});

});


/*==========================
TYPE EFFECT
==========================*/

const heading=document.querySelector(".left h4");

if(heading){

const txt=heading.innerText;

heading.innerText="";

let i=0;

function type(){

if(i<txt.length){

heading.innerHTML+=txt.charAt(i);

i++;

setTimeout(type,70);

}

}

type();

}
/*==========================
LOADER
==========================*/

window.addEventListener("load",()=>{

setTimeout(()=>{

loader.style.opacity="0";

loader.style.visibility="hidden";

},1200);

});


/*==========================
CUSTOM CURSOR
==========================*/

const c1=document.querySelector(".cursor");

const c2=document.querySelector(".cursor2");

document.addEventListener("mousemove",(e)=>{

c1.style.left=e.clientX+"px";

c1.style.top=e.clientY+"px";

c2.style.left=e.clientX-20+"px";

c2.style.top=e.clientY-20+"px";

});


/*==========================
MAGNET BUTTON
==========================*/

document.querySelectorAll(".primary,.btn-nav").forEach(btn=>{

btn.addEventListener("mousemove",(e)=>{

const rect=btn.getBoundingClientRect();

const x=e.clientX-rect.left-rect.width/2;

const y=e.clientY-rect.top-rect.height/2;

btn.style.transform=`translate(${x*.15}px,${y*.15}px)`;

});

btn.addEventListener("mouseleave",()=>{

btn.style.transform="translate(0,0)";

});

});
