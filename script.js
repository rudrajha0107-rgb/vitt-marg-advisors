/*=====================================================
VITT-MARG ADVISORS v4.0
Premium JavaScript
Author : Rudra Jha
======================================================*/

"use strict";

/*====================================
LOADER
====================================*/

window.addEventListener("load", () => {

const loader = document.getElementById("loader");

setTimeout(() => {

loader.style.opacity = "0";

loader.style.visibility = "hidden";

},1500);

});

/*====================================
BACK TO TOP
====================================*/

const backBtn = document.getElementById("backToTop");

window.addEventListener("scroll",()=>{

if(window.scrollY>500){

backBtn.style.opacity="1";

backBtn.style.visibility="visible";

}else{

backBtn.style.opacity="0";

backBtn.style.visibility="hidden";

}

});

backBtn.addEventListener("click",()=>{

window.scrollTo({

top:0,

behavior:"smooth"

});

});

/*====================================
SCROLL PROGRESS
====================================*/

const progress=document.getElementById("progressBar");

window.addEventListener("scroll",()=>{

const totalHeight=

document.documentElement.scrollHeight-window.innerHeight;

const progressHeight=

(window.pageYOffset/totalHeight)*100;

progress.style.width=progressHeight+"%";

});

/*====================================
FAQ ACCORDION
====================================*/

const faq=document.querySelectorAll(".faq-item");

faq.forEach(item=>{

const btn=item.querySelector(".faq-question");

btn.addEventListener("click",()=>{

faq.forEach(i=>{

if(i!==item){

i.querySelector(".faq-answer").style.display="none";

i.querySelector("i").className="fa-solid fa-plus";

}

});

const answer=item.querySelector(".faq-answer");

const icon=item.querySelector("i");

if(answer.style.display==="block"){

answer.style.display="none";

icon.className="fa-solid fa-plus";

}else{

answer.style.display="block";

icon.className="fa-solid fa-minus";

}

});

});

/*====================================
SCROLL REVEAL
====================================*/

const revealElements=document.querySelectorAll(

".service-card,.team-card,.why-card,.info-card,.testimonial-card,.counter-box,.step"

);

function reveal(){

const trigger=window.innerHeight-120;

revealElements.forEach(el=>{

const top=el.getBoundingClientRect().top;

if(top<trigger){

el.classList.add("active");

}

});

}

window.addEventListener("scroll",reveal);

reveal();

/*====================================
COUNTER
====================================*/

const counters=document.querySelectorAll(".counter");

let started=false;

function startCounter(){

if(started) return;

const section=document.querySelector(".counter-section");

if(!section) return;

const trigger=section.getBoundingClientRect().top;

if(trigger<window.innerHeight-100){

started=true;

counters.forEach(counter=>{

const target=parseInt(counter.innerText);

let count=0;

const speed=target/120;

const update=()=>{

count+=speed;

if(count<target){

counter.innerText=Math.floor(count)+"+";

requestAnimationFrame(update);

}else{

counter.innerText=target+"+";

}

};

update();

});

}

}

window.addEventListener("scroll",startCounter);

/*====================================
SMOOTH NAVIGATION
====================================*/

document.querySelectorAll('a[href^="#"]').forEach(anchor=>{

anchor.addEventListener("click",function(e){

e.preventDefault();

const target=document.querySelector(this.getAttribute("href"));

if(target){

target.scrollIntoView({

behavior:"smooth"

});

}

});

});

/*====================================
ACTIVE NAVBAR
====================================*/

const sections=document.querySelectorAll("section");

const navLinks=document.querySelectorAll(".nav-links a");

window.addEventListener("scroll",()=>{

let current="";

sections.forEach(sec=>{

const top=window.scrollY;

const offset=sec.offsetTop-120;

const height=sec.offsetHeight;

if(top>=offset && top<offset+height){

current=sec.getAttribute("id");

}

});

navLinks.forEach(link=>{

link.classList.remove("active");

if(link.getAttribute("href")==="#"+current){

link.classList.add("active");

}

});

});

/*====================================
STICKY NAVBAR
====================================*/

const header=document.querySelector(".header");

window.addEventListener("scroll",()=>{

if(window.scrollY>100){

header.style.background="rgba(7,17,31,.92)";

header.style.boxShadow="0 15px 40px rgba(0,0,0,.35)";

}else{

header.style.background="rgba(7,17,31,.55)";

header.style.boxShadow="none";

}

});/*=====================================================
VITT-MARG ADVISORS
SCRIPT.JS PART 2
======================================================*/

/*====================================
3D TILT CARDS
====================================*/

const cards = document.querySelectorAll(
".service-card,.team-card,.why-card,.info-card"
);

cards.forEach(card=>{

card.addEventListener("mousemove",(e)=>{

const rect = card.getBoundingClientRect();

const x = e.clientX - rect.left;

const y = e.clientY - rect.top;

const rotateY=((x/rect.width)-0.5)*18;

const rotateX=((y/rect.height)-0.5)*-18;

card.style.transform=
`perspective(1000px)
rotateX(${rotateX}deg)
rotateY(${rotateY}deg)
translateY(-8px)`;

});

card.addEventListener("mouseleave",()=>{

card.style.transform=
"perspective(1000px) rotateX(0) rotateY(0)";

});

});

/*====================================
MOUSE GLOW
====================================*/

const glow=document.createElement("div");

glow.className="mouse-glow";

document.body.appendChild(glow);

document.addEventListener("mousemove",(e)=>{

glow.style.left=e.clientX+"px";

glow.style.top=e.clientY+"px";

});

/*====================================
PARALLAX HERO
====================================*/

const hero=document.querySelector(".hero");

window.addEventListener("scroll",()=>{

const y=window.pageYOffset;

hero.style.transform=`translateY(${y*0.12}px)`;

});

/*====================================
FLOATING ICONS
====================================*/

document.querySelectorAll(".service-card i").forEach(icon=>{

setInterval(()=>{

icon.animate([

{

transform:"translateY(0px)"

},

{

transform:"translateY(-8px)"

},

{

transform:"translateY(0px)"

}

],{

duration:2500,

iterations:1

});

},3000);

});

/*====================================
BUTTON RIPPLE
====================================*/

const buttons=document.querySelectorAll(".btn-primary");

buttons.forEach(btn=>{

btn.addEventListener("click",(e)=>{

const ripple=document.createElement("span");

const rect=btn.getBoundingClientRect();

const size=Math.max(rect.width,rect.height);

ripple.style.width=size+"px";

ripple.style.height=size+"px";

ripple.style.left=e.clientX-rect.left-size/2+"px";

ripple.style.top=e.clientY-rect.top-size/2+"px";

ripple.classList.add("ripple");

btn.appendChild(ripple);

setTimeout(()=>{

ripple.remove();

},700);

});

});

/*====================================
TYPING EFFECT
====================================*/

const heading=document.querySelector(".hero h1");

if(heading){

const text=heading.innerText;

heading.innerHTML="";

let i=0;

function typing(){

if(i<text.length){

heading.innerHTML+=text.charAt(i);

i++;

setTimeout(typing,35);

}

}

typing();

}

/*====================================
NAVBAR HOVER EFFECT
====================================*/

document.querySelectorAll(".nav-links a").forEach(link=>{

link.addEventListener("mouseenter",()=>{

link.style.color="#38BDF8";

});

link.addEventListener("mouseleave",()=>{

link.style.color="";

});

});

/*====================================
AUTO YEAR
====================================*/

const year=document.getElementById("year");

if(year){

year.innerHTML=new Date().getFullYear();

}

/*====================================
CONTACT FORM
====================================*/

const form=document.querySelector(".contact-form");

if(form){

form.addEventListener("submit",(e)=>{

e.preventDefault();

alert(

"Thank you for contacting Vitt-Marg Advisors. We'll get back to you shortly."

);

form.reset();

});

}

/*====================================
PRELOADER FADE
====================================*/

window.addEventListener("load",()=>{

setTimeout(()=>{

const loader=document.getElementById("loader");

if(loader){

loader.style.opacity="0";

loader.style.pointerEvents="none";

}

},1800);

});

/*====================================
PAGE VISIBILITY
====================================*/

document.addEventListener("visibilitychange",()=>{

if(document.hidden){

document.title="Come Back | Vitt-Marg Advisors";

}else{

document.title="Vitt-Marg Advisors";

}

});

/*====================================
KEYBOARD SHORTCUT
====================================*/

document.addEventListener("keydown",(e)=>{

if(e.key==="Home"){

window.scrollTo({

top:0,

behavior:"smooth"

});

}

});

/*====================================
END OF PART 2
====================================*/
/*=====================================================
VITT-MARG ADVISORS
SCRIPT.JS PART 3
======================================================*/

/*====================================
CUSTOM CURSOR
====================================*/

const cursor = document.querySelector(".cursor");

if(cursor){

document.addEventListener("mousemove",(e)=>{

cursor.style.left=e.clientX+"px";
cursor.style.top=e.clientY+"px";

});

document.querySelectorAll("a,button,.service-card,.team-card").forEach(item=>{

item.addEventListener("mouseenter",()=>{

cursor.style.transform="translate(-50%,-50%) scale(2)";
cursor.style.background="rgba(56,189,248,.25)";

});

item.addEventListener("mouseleave",()=>{

cursor.style.transform="translate(-50%,-50%) scale(1)";
cursor.style.background="transparent";

});

});

}

/*====================================
INTERSECTION OBSERVER
====================================*/

const observer=new IntersectionObserver(entries=>{

entries.forEach(entry=>{

if(entry.isIntersecting){

entry.target.classList.add("active");

}

});

},{
threshold:.15
});

document.querySelectorAll(".reveal").forEach(el=>{

observer.observe(el);

});

/*====================================
NUMBER COUNT FORMAT
====================================*/

document.querySelectorAll(".counter").forEach(counter=>{

counter.innerHTML=counter.innerHTML.replace(",", "");

});

/*====================================
PARALLAX BACKGROUND
====================================*/

window.addEventListener("mousemove",(e)=>{

const x=(window.innerWidth/2-e.clientX)/80;

const y=(window.innerHeight/2-e.clientY)/80;

const aurora=document.querySelector(".aurora");

if(aurora){

aurora.style.transform=`translate(${x}px,${y}px)`;

}

});

/*====================================
AUTO HIGHLIGHT CURRENT SECTION
====================================*/

const menuItems=document.querySelectorAll(".nav-links a");

window.addEventListener("scroll",()=>{

let current="";

document.querySelectorAll("section").forEach(sec=>{

const top=window.scrollY;
const offset=sec.offsetTop-180;

if(top>=offset){

current=sec.id;

}

});

menuItems.forEach(link=>{

link.classList.remove("current");

if(link.getAttribute("href")==="#"+current){

link.classList.add("current");

}

});

});

/*====================================
SCROLL TO REVEAL HEADER
====================================*/

let lastScroll=0;

window.addEventListener("scroll",()=>{

const currentScroll=window.pageYOffset;

if(currentScroll>lastScroll && currentScroll>200){

header.style.top="-100px";

}else{

header.style.top="0";

}

lastScroll=currentScroll;

});

/*====================================
LAZY IMAGE LOADING
====================================*/

const lazyImages=document.querySelectorAll("img");

const lazyObserver=new IntersectionObserver((entries,observer)=>{

entries.forEach(entry=>{

if(entry.isIntersecting){

const img=entry.target;

img.src=img.dataset.src || img.src;

observer.unobserve(img);

}

});

});

lazyImages.forEach(img=>{

lazyObserver.observe(img);

});

/*====================================
COPYRIGHT YEAR
====================================*/

const footer=document.querySelector(".footer-bottom p");

if(footer){

footer.innerHTML=footer.innerHTML.replace("2026",new Date().getFullYear());

}

/*====================================
DISABLE RIGHT CLICK (OPTIONAL)
====================================*/

// Uncomment if required
/*
document.addEventListener("contextmenu",(e)=>{
e.preventDefault();
});
*/

/*====================================
PRELOAD ANIMATION
====================================*/

window.addEventListener("load",()=>{

document.body.classList.add("loaded");

});

/*====================================
CONSOLE BRANDING
====================================*/

console.log(
"%cVitt-Marg Advisors",
"font-size:24px;font-weight:bold;color:#38BDF8;"
);

console.log(
"%cPremium CA Website",
"font-size:14px;color:#FBBF24;"
);

/*====================================
PERFORMANCE
====================================*/

window.addEventListener("resize",()=>{

clearTimeout(window.resizedFinished);

window.resizedFinished=setTimeout(()=>{

console.log("Layout Updated");

},300);

});

/*====================================
SMOOTH FADE ON PAGE LOAD
====================================*/

window.addEventListener("DOMContentLoaded",()=>{

document.body.style.opacity="0";

setTimeout(()=>{

document.body.style.transition="opacity .8s ease";

document.body.style.opacity="1";

},100);

});

/*====================================
END
====================================*/

console.log("Vitt-Marg Advisors Loaded Successfully.");
