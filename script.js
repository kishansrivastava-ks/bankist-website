'use strict';

// Modal window

const modal = document.querySelector('.modal');
const overlay = document.querySelector('.overlay');
const btnCloseModal = document.querySelector('.btn--close-modal');
const btnsOpenModal = document.querySelectorAll('.btn--show-modal'); //a  node list
const buttonScrollTo = document.querySelector('.btn--scroll-to'); //gives the DOM rectangle giving all details about the element
const section1 = document.querySelector('#section--1');

const tabs = document.querySelectorAll('.operations__tab');
const tabsContainer = document.querySelector('.operations__tab-container');
const tabsContent = document.querySelectorAll('.operations__content');

const nav = document.querySelector('.nav');

//OPEN MODAL FUNCTIONLALITY

const openModal = function (e) {
  e.preventDefault();
  modal.classList.remove('hidden');
  overlay.classList.remove('hidden');
};

const closeModal = function () {
  modal.classList.add('hidden');
  overlay.classList.add('hidden');
};

btnsOpenModal.forEach(btn => btn.addEventListener('click', openModal));

btnCloseModal.addEventListener('click', closeModal);
overlay.addEventListener('click', closeModal);

document.addEventListener('keydown', function (e) {
  if (e.key === 'Escape' && !modal.classList.contains('hidden')) {
    closeModal();
  }
});

// SCROLL BUTTON
buttonScrollTo.addEventListener('click',function(e){
  //NEW METHOD
  section1.scrollIntoView( { behavior : 'smooth' } );
});

//EVENT DELEGATION
//1. add event listener to common paretn element
//2 determine what element originated the event
// here a single event handler is attached at the parent element
document.querySelector('.nav__links').addEventListener('click',function(e){
  //Matching strategy
  if(e.target.classList.contains('nav__link')){
    e.preventDefault();
    const id = e.target.getAttribute('href'); // getting the section to which to scroll to
    document.querySelector(id).scrollIntoView({behavior:'smooth'});
  }
})

// BUILDING THE TABBED COMPONENT

tabsContainer.addEventListener('click',function(e){
  const clicked = e.target.closest('.operations__tab');
  // Guard clause
  if(!clicked) return; // if clicked ouside button and inside tabs container because 
  // if clicked here then the closest element will be null
  //removing active tabs from all
  tabs.forEach(t => t.classList.remove('operations__tab--active'));
  //implementing active tab
  clicked.classList.add('operations__tab--active');

  //Activating content are
  //remove active classes for all
  tabsContent.forEach(c => c.classList.remove('operations__content--active'));
  //activating active class
  document.querySelector(`.operations__content--${clicked.dataset.tab}`).classList.add('operations__content--active');

})

// MENU FADE ANIMATION
const handleHover = function(e){
  if(e.target.classList.contains('nav__link')){
    const link = e.target;
    const siblings = link.closest('.nav').querySelectorAll('.nav__link');
    const logo = link.closest('.nav').querySelector('img');
    siblings.forEach(el => {
      if(el !== link){
        el.style.opacity = this;
        logo.style.opacity = this;
      }
    })
  }
}

//passing an argument into handler
nav.addEventListener('mouseover',handleHover.bind(0.5)); 
nav.addEventListener('mouseout',handleHover.bind(1)); 
// bind returned the handleHover function where this = 0.5 (value)
// also the this points to the target by default


//STICKY NAVIGATION implementation using INTERSECTION OBSERVER API
// const obsCallBack = function(entries, observer){
//   // entries = array of threshold entries
//   entries.forEach(entry => {
//     console.log(entry);
//   })
// }
// const obsOptions = {
//   root: null,  //the element that the target is intersecting (null means viewport)
//   threshold: [0,0.2];
//   //%age of intersection at which the intersection observer  will be called
//   //when section1 shows 10% of its part in the viewport the callback function obsCallBack is called (moving both into the view and leaving the view)

// }
// const observer = new IntersectionObserver(obsCallBack, obsOptions);
// observer.observe(section1);

const header = document.querySelector('.header');
const navHeight = nav.getBoundingClientRect().height;
const stickyNav = function(entries){
  const [entry] = entries; //getting the first element
  if(!entry.isIntersecting){
    nav.classList.add('sticky');
  }
  else{
    nav.classList.remove('sticky');
  }
}
const headerObserver = new IntersectionObserver(stickyNav,{
  root: null,
  threshold: 0,
  rootMargin: `-${navHeight}px` //adds a border to the target element (here header) so that the nav bar appears when the space between the header top and the top viewport is equal to the navbar height
});
headerObserver.observe(header);

//REVEALING EACH SECTION AS WE APPROACH IT
const allSections = document.querySelectorAll('.section');
const revealSection = function(entries, observer){
  const [entry] = entries;
  if(!entry.isIntersecting) return; //to also include the section 1 becasue its intersection initially
  entry.target.classList.remove('section--hidden');
  observer.unobserve(entry.target); //so that the sections are observed only once when they are initially observed 
}
const sectionObserver = new IntersectionObserver(revealSection, {
  root: null,
  threshold: 0.15
});

allSections.forEach(function(section){
  sectionObserver.observe(section);
  section.classList.add('section--hidden');
})

//LAZY LOADING IMAGES
const imgTargets = document.querySelectorAll('img[data-src]'); //selecting all images which have the attribute of data-src
const loadImg = function(entries, observer){
  const [entry] = entries;
  if(!entry.isIntersecting) return;
  //Replace src with data-src
  entry.target.src = entry.target.dataset.src; //dataset stores all the dataset attributes

  entry.target.addEventListener('load', function(){
    entry.target.classList.remove('lazy-img');
  });
  
  //after js loads the image it releases the load event,
  //  so if we just remove the lazy-img class before the above block then everything would happen very fast and we would not see the images loading
  // so the lazy-img class is removed after the load event 

  observer.unobserve(entry.target);
}
const imgObserver = new IntersectionObserver(loadImg, {
  root: null,
  threshold:0,
  rootMargin: '-200px'
});

imgTargets.forEach(img => imgObserver.observe(img));

//BUILDING THE SLIDER COMPONENT
const slider = function() {
const slides = document.querySelectorAll('.slide');
const btnLeft = document.querySelector('.slider__btn--left');
const btnRight = document.querySelector('.slider__btn--right');

let curSlide = 0;
let maxSlide = slides.length; //length of nodelist
const slider = document.querySelector('.slider');

const dotContainer = document.querySelector('.dots');

//FUNCTIONS
const createDots = function(){
  slides.forEach(function ( _ , i) {
    dotContainer.insertAdjacentHTML(
      'beforeend',
      `<button class="dots__dot" data-slide="${i}"></button>`);
  });
};

const activateDot = function(slide){
  //remove active class from all dots
  document.querySelectorAll('.dots__dot').forEach(dot => dot.classList.remove('dots__dot--active'));

  document.querySelector(`.dots__dot[data-slide="${slide}"]`).classList.add('dots__dot--active');
}

const goToSlide = function(slide){
  slides.forEach((s,i) => s.style.transform = `translateX(${100 * (i-curSlide)}%)`);
}

const nextSlide =  function(){
  if(curSlide === maxSlide - 1){
    curSlide = 0;
  }
  else{
    curSlide++;
  }
  goToSlide(curSlide);
  activateDot(curSlide);
}

const prevSlide = function(){
  if(curSlide === 0){
    curSlide = maxSlide - 1;
  }
  else{
    curSlide--;
  }
  goToSlide(curSlide);
  activateDot(curSlide);
}

const init = function(){
  goToSlide(0);
  createDots();
  activateDot(0);
}

init();

//EVENT HANDLERS
//going to next slide
btnRight.addEventListener('click',nextSlide);
btnLeft.addEventListener('click', prevSlide);

document.addEventListener('keydown',function(e){
  console.log(e);
  if(e.key === 'ArrowLeft') prevSlide();
  else nextSlide();
})

dotContainer.addEventListener('click', function (e) {
  if (e.target.classList.contains('dots__dot')) {
    const { slide } = e.target.dataset;
    goToSlide(slide);
    activateDot(slide);
  }
});
};
slider();