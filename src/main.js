import gsap from 'gsap';

const page = document.querySelector('#page');
const world = document.querySelector('#world');
const hero = document.querySelector('#hero');
const header = document.querySelector('#site-header');
const hotspot = document.querySelector('#letter-hotspot');
const openButton = document.querySelector('#open-button');
const stage = document.querySelector('#invitation-stage');
const envelope = document.querySelector('#envelope');
const flap = document.querySelector('#envelope-flap');
const seal = document.querySelector('#envelope-sealed');
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
let ambientTweens = [];

function setAmbientPaused(paused) {
  ambientTweens.forEach((tween) => paused ? tween.pause() : tween.resume());
}

gsap.matchMedia().add('(prefers-reduced-motion: no-preference)', () => {
  const flowers = document.querySelectorAll('.bouquet');
  const glows = document.querySelectorAll('.light-glow');
  const stars = document.querySelectorAll('.star');
  const petals = document.querySelectorAll('.petal');

  ambientTweens = [
    gsap.to(flowers[0], { rotation: 1.6, transformOrigin: '50% 90%', duration: 3.8, ease: 'sine.inOut', repeat: -1, yoyo: true }),
    gsap.to(flowers[1], { rotation: -1.3, transformOrigin: '50% 90%', duration: 4.5, ease: 'sine.inOut', repeat: -1, yoyo: true }),
    gsap.to('.flame-shape', { rotation: 4, scaleY: 1.16, x: 1, transformOrigin: '50% 100%', duration: 0.55, ease: 'sine.inOut', repeat: -1, yoyo: true }),
    gsap.to('.flame-aura', { opacity: 0.68, scale: 1.14, duration: 1.2, ease: 'sine.inOut', repeat: -1, yoyo: true }),
    ...[...glows].map((glow, index) => gsap.to(glow, { opacity: 0.52 + index * 0.08, scale: 1.08, duration: 2.2 + index * 0.7, ease: 'sine.inOut', repeat: -1, yoyo: true })),
    ...[...stars].map((star, index) => gsap.to(star, { opacity: 0.95, scale: 1.3, duration: 1.5 + (index * 7 % 5) * 0.43, delay: index * 0.27, ease: 'sine.inOut', repeat: -1, yoyo: true })),
    ...[...petals].map((petal, index) => gsap.timeline({ delay: index * 0.9 })
      .fromTo(petal, { opacity: 0, y: -20, rotation: -25 }, { opacity: 0.85, duration: 1.1, ease: 'sine.out' })
      .to(petal, { x: index % 2 ? -85 : 75, y: () => world.clientHeight * (0.26 + index * 0.04), rotation: 130 + index * 48, duration: 7 + index, ease: 'none' }, 0)
      .to(petal, { opacity: 0, duration: 2.4, ease: 'sine.inOut' }, 5.3 + index * 0.7)),
  ];
  const onVisibility = () => setAmbientPaused(document.hidden || opening || opened);
  document.addEventListener('visibilitychange', onVisibility);
  return () => {
    document.removeEventListener('visibilitychange', onVisibility);
    ambientTweens.forEach((tween) => tween.kill());
    ambientTweens = [];
  };
});

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
  if (!document.hidden) setAmbientPaused(false);
  returnFocus.focus({ preventScroll: true });
}

function openInvitation(event) {
  if (opening || opened) return;
  opening = true;
  returnFocus = event.currentTarget === hotspot ? hotspot : openButton;
  closeMenu();
  page.classList.add('is-opening');
  setAmbientPaused(true);
  stage.setAttribute('aria-hidden', 'false');
  gsap.set(envelope, { xPercent: -50, yPercent: -43 });
  gsap.set(card, { xPercent: -50, yPercent: -40 });

  if (reduceMotion.matches) {
    gsap.set([world, hero, header], { autoAlpha: 0 });
    gsap.set(stage, { autoAlpha: 1 });
    gsap.set(envelope, { autoAlpha: 0 });
    gsap.set(seal, { autoAlpha: 0 });
    gsap.set(flap, { rotationX: -180 });
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
    .to(seal, { autoAlpha: 0, duration: 0.25, ease: 'power1.out' }, 1.37)
    .to(flap, { rotationX: -180, duration: 0.62, ease: 'power3.inOut' }, 1.67)
    .fromTo(card, { y: 100, autoAlpha: 0 }, { y: -30, autoAlpha: 1, duration: 0.75, ease: 'power3.inOut' }, 2.01)
    .to(envelope, { y: 110, duration: 0.75, ease: 'power3.inOut' }, 2.01)
    .to(envelope, { autoAlpha: 0, duration: 0.2, ease: 'power1.out' }, 2.51);
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
