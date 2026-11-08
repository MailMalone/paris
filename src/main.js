import '@fontsource/cormorant-garamond/latin-400.css';
import '@fontsource/cormorant-garamond/latin-400-italic.css';
import '@fontsource/cormorant-garamond/latin-500.css';
import '@fontsource/montserrat/latin-400.css';
import '@fontsource/montserrat/latin-500.css';
import '@fontsource/montserrat/latin-600.css';
import gsap from 'gsap';
import './style.css';

const page = document.querySelector('#page');
const world = document.querySelector('#world');
const hero = document.querySelector('#hero');
const header = document.querySelector('#site-header');
const hotspot = document.querySelector('#letter-hotspot');
const openButton = document.querySelector('#open-button');
const stage = document.querySelector('#invitation-stage');
const envelope = document.querySelector('#envelope');
const flap = document.querySelector('#envelope-flap');
const seal = document.querySelector('#envelope-seal');
const card = document.querySelector('#letter-card');
const closeButton = document.querySelector('#close-button');
const menuButton = document.querySelector('#menu-button');
const menu = document.querySelector('#site-menu');
const menuOpen = document.querySelector('#menu-open');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

let activeTimeline;
let opening = false;
let opened = false;
let returnFocus = openButton;

function closeMenu() {
  menu.hidden = true;
  menuButton.setAttribute('aria-expanded', 'false');
}

function resetScene() {
  gsap.set([world, hero, header], { clearProps: 'all' });
  gsap.set([stage, envelope, flap, seal, card], { clearProps: 'all' });
  stage.setAttribute('aria-hidden', 'true');
  page.classList.remove('is-opening', 'is-open');
  opening = false;
  opened = false;
  returnFocus.focus({ preventScroll: true });
}

function openInvitation(event) {
  if (opening || opened) return;
  opening = true;
  returnFocus = event.currentTarget === hotspot ? hotspot : openButton;
  closeMenu();
  page.classList.add('is-opening');
  stage.setAttribute('aria-hidden', 'false');
  gsap.set(envelope, { xPercent: -50, yPercent: -43 });
  gsap.set(card, { xPercent: -50, yPercent: -40 });

  if (reduceMotion.matches) {
    gsap.set([world, hero, header], { autoAlpha: 0 });
    gsap.set(stage, { autoAlpha: 1 });
    gsap.set(envelope, { y: 110 });
    gsap.set(flap, { rotationX: -180 });
    gsap.set(seal, { autoAlpha: 0 });
    gsap.set(card, { autoAlpha: 1, y: -30 });
    page.classList.add('is-open');
    opening = false;
    opened = true;
    closeButton.focus({ preventScroll: true });
    return;
  }

  const rect = hotspot.getBoundingClientRect();
  const worldRect = world.getBoundingClientRect();
  const letterX = rect.left + rect.width / 2;
  const letterY = rect.top + rect.height / 2;
  const originX = letterX - worldRect.left;
  const originY = letterY - worldRect.top;
  if (![letterX, letterY, originX, originY].every(Number.isFinite)) throw new Error('Invalid letter position');

  const centeredWorld = window.matchMedia('(min-width: 1101px)').matches;
  gsap.set(world, {
    xPercent: centeredWorld ? -50 : 0,
    yPercent: centeredWorld ? -50 : 0,
    transformOrigin: `${originX}px ${originY}px`,
  });
  activeTimeline = gsap.timeline({
    onComplete() {
      opening = false;
      opened = true;
      page.classList.add('is-open');
      closeButton.focus({ preventScroll: true });
    },
    onReverseComplete: resetScene,
  });

  activeTimeline
    .to([hero, header], { autoAlpha: 0, duration: 0.36, ease: 'power1.out' }, 0)
    .to(world, {
      x: window.innerWidth / 2 - letterX,
      y: window.innerHeight / 2 - letterY,
      scale: 3.1,
      duration: 1.05,
      ease: 'power3.inOut',
    }, 0)
    .to(world, { autoAlpha: 0, duration: 0.28, ease: 'power1.out' }, 0.86)
    .fromTo(stage, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.35, ease: 'power1.out' }, 0.76)
    .fromTo(envelope, { y: 90, scale: 0.88, autoAlpha: 0 }, { y: 0, scale: 1, autoAlpha: 1, duration: 0.5, ease: 'power1.out' }, 0.88)
    .to(seal, { autoAlpha: 0, scale: 0.75, duration: 0.22, ease: 'power1.out' }, 1.4)
    .to(flap, { rotationX: -180, duration: 0.62, ease: 'power3.inOut' }, 1.43)
    .fromTo(card, { y: 100, autoAlpha: 0 }, { y: -30, autoAlpha: 1, duration: 0.75, ease: 'power3.inOut' }, 1.77)
    .to(envelope, { y: 110, duration: 0.75, ease: 'power3.inOut' }, 1.77);
}

function closeInvitation() {
  if (opening || !opened) return;
  opened = false;
  page.classList.remove('is-open');
  if (reduceMotion.matches) {
    resetScene();
  } else {
    opening = true;
    activeTimeline.reverse();
  }
}

hotspot.addEventListener('click', openInvitation);
openButton.addEventListener('click', openInvitation);
menuOpen.addEventListener('click', openInvitation);
closeButton.addEventListener('click', closeInvitation);
menuButton.addEventListener('click', () => {
  menu.hidden = !menu.hidden;
  menuButton.setAttribute('aria-expanded', String(!menu.hidden));
});
document.addEventListener('keydown', (event) => {
  if (event.key === 'Tab' && opened) {
    event.preventDefault();
    closeButton.focus({ preventScroll: true });
    return;
  }
  if (event.key !== 'Escape') return;
  if (!menu.hidden) closeMenu();
  else closeInvitation();
});
