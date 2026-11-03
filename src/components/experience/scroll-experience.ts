import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import type { ExperienceContent } from '@/lib/types'
import { createCoffeeScene } from './coffee-scene'
import { clampProgress, getChapter, getMenuIndex, scrollDestination } from './scroll-state'

gsap.registerPlugin(ScrollTrigger)

/** Mount one scoped timeline; cleanup never touches another page's ScrollTriggers. */
export function createScrollExperience(root: HTMLElement, content: ExperienceContent): () => void {
  const abort = new AbortController()
  const { signal } = abort
  const select = <T extends Element = HTMLElement>(selector: string): T => {
    const element = root.querySelector<T>(selector)
    if (!element) throw new Error(`Missing experience element: ${selector}`)
    return element
  }
  const journey = select('.journey')
  const stage = select('.stage')
  const canvas = select<HTMLCanvasElement>('#coffee-canvas')
  const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
  const scenes = [...root.querySelectorAll<HTMLElement>('.scene')]
  const chapterButtons = [...root.querySelectorAll<HTMLButtonElement>('.chapter-nav button')]
  const menuTrack = select('.menu-track')
  const coffee = createCoffeeScene({
    root,
    canvas,
    stage,
    brandName: content.settings.brandName,
    tagline: content.hero.kicker,
    signal,
  })
  const state = coffee.state
  let sceneProgress = 0
  let timeline: gsap.core.Timeline | null = null
  let activeChapter = -1
  let disposed = false
  function setChapter(progress: number): void {
    const chapter = getChapter(progress)
    if (chapter === activeChapter) return
    activeChapter = chapter
    root.dataset.chapter = String(chapter)
    chapterButtons.forEach((button, index) => {
      if (index === chapter) button.setAttribute('aria-current', 'step')
      else button.removeAttribute('aria-current')
    })
  }
  const media = gsap.matchMedia()
  media.add(
    {
      mobile: '(max-width: 700px)',
      desktop: '(min-width: 701px)',
      reduce: '(prefers-reduced-motion: reduce)',
    },
    (context) => {
      const conditions = context.conditions as {
        mobile: boolean
        desktop: boolean
        reduce: boolean
      }
      const mobile = conditions.mobile
      Object.assign(state, {
        x: mobile ? 0.08 : 0.8,
        y: mobile ? 0.18 : -0.1,
        z: 0,
        scale: mobile ? 0.93 : 1.2,
        rx: 0.1,
        ry: -0.45,
        rz: -0.2,
        cameraY: mobile ? 4.4 : 3.8,
        cameraZ: mobile ? 10.2 : 8.5,
        spread: mobile ? 0.75 : 0.85,
        orbit: 0,
        beans: mobile ? 0.65 : 0.8,
        steam: 0.7,
        saucerGap: 0,
      })
      if (conditions.reduce) {
        root.classList.remove('experience-ready')
        scenes.forEach((element) => element.removeAttribute('inert'))
        gsap.set(root, { '--nav-color': '#f4eddf' })
        select('#brew-temperature').textContent = String(content.roast.temperature)
        select('#brew-time').textContent = String(content.roast.extractionTime)
        coffee.stop()
        coffee.resize()
        return
      }
      root.classList.add('experience-ready')
      gsap.set(scenes.slice(1), { autoAlpha: 0 })
      gsap.set('.scene-hero', { autoAlpha: 1 })
      gsap.set('.coffee-iris', { clipPath: 'circle(0% at 50% 50%)' })
      gsap.set(stage, { backgroundColor: '#a6452f' })
      gsap.set(root, { '--nav-color': '#f4eddf' })
      gsap.set(menuTrack, { x: 0 })
      timeline = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: journey,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 0.65,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            sceneProgress = self.progress
            root.style.setProperty('--journey-progress', String(self.progress))
          },
        },
        onUpdate: () => {
          const progress = timeline?.progress() ?? 0
          sceneProgress = progress
          setChapter(progress)
          coffee.setVisible(progress < 0.72)
          coffee.setProgress(progress)
          gsap.set('.journey-progress > span', { scaleX: progress })
          const brew = clampProgress((progress - 0.36) / 0.16)
          select('#brew-temperature').textContent = String(
            Math.round(content.roast.temperature * brew),
          )
          select('#brew-time').textContent = String(Math.round(content.roast.extractionTime * brew))
          const index = getMenuIndex(progress, content.menu.length)
          select('.menu-page').textContent =
            `${String(content.menu.length ? index + 1 : 0).padStart(2, '0')} / ${String(content.menu.length).padStart(2, '0')}`
        },
      })
      // One continuous, reversible timeline controls the model, camera, type, colors, and menu.
      timeline
        .to(state, { ry: -0.1, orbit: 0.25, duration: 0.7 }, 0)
        .to('.hero-word-one', { xPercent: -105, rotation: -9, duration: 1.1 }, 0.7)
        .to('.hero-word-two', { xPercent: 110, rotation: 8, duration: 1.1 }, 0.7)
        .to('.hero-circle', { scale: 2.5, rotation: 75, autoAlpha: 0, duration: 1.1 }, 0.7)
        .to(
          '.hero-kicker, .hero-caption, .hero-stamp, .hero-bottom',
          { autoAlpha: 0, y: -30, duration: 0.5 },
          0.9,
        )
        .to(stage, { backgroundColor: '#e8dfcd', duration: 0.9 }, 1.1)
        .to(root, { '--nav-color': '#352b22', duration: 0.8 }, 1.1)
        .to(
          state,
          {
            x: mobile ? 0 : -1.8,
            y: mobile ? 1.55 : 0.1,
            scale: mobile ? 0.82 : 1.15,
            rx: -0.03,
            ry: 1.7,
            rz: 0.13,
            spread: mobile ? 0.9 : 1.25,
            orbit: 1.5,
            beans: 0.95,
            cameraY: mobile ? 4.1 : 3.4,
            duration: 1.15,
          },
          1.0,
        )
        .to('.scene-hero', { autoAlpha: 0, duration: 0.01 }, 1.85)
        .fromTo('.scene-origin', { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.3 }, 1.65)
        .fromTo(
          '.origin-content > *',
          { y: 90, autoAlpha: 0 },
          { y: 0, autoAlpha: 1, stagger: 0.12, duration: 0.65 },
          1.7,
        )
        .fromTo('.chapter-ghost', { xPercent: 28 }, { xPercent: -8, duration: 1.9 }, 1.6)
        .to(state, { ry: 3.2, orbit: 3.6, spread: mobile ? 1.1 : 1.6, duration: 1.4 }, 2.1)
        .to('.origin-content', { y: -95, autoAlpha: 0, duration: 0.55 }, 3.0)
        .to('.scene-origin', { autoAlpha: 0, duration: 0.45 }, 3.15)
        .to(stage, { backgroundColor: '#25211d', duration: 0.75 }, 3.1)
        .to(root, { '--nav-color': '#f4eddf', duration: 0.65 }, 3.1)
        .to(
          state,
          {
            x: mobile ? 0.62 : 1.9,
            y: mobile ? -0.05 : 0.05,
            scale: mobile ? 0.92 : 1.28,
            ry: 5.9,
            rz: -0.13,
            rx: 0.15,
            spread: 2.1,
            orbit: 5.5,
            beans: 0.95,
            saucerGap: -0.65,
            steam: 1.2,
            duration: 1.2,
          },
          3.15,
        )
        .fromTo('.scene-roast', { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.35 }, 3.45)
        .fromTo(
          '.roast-line',
          { xPercent: -110, rotation: 5 },
          { xPercent: 0, rotation: 0, stagger: 0.15, duration: 0.65 },
          3.45,
        )
        .fromTo(
          '.roast-caption, .brew-metrics',
          { y: 45, autoAlpha: 0 },
          { y: 0, autoAlpha: 1, duration: 0.7 },
          3.65,
        )
        .to(state, { ry: 7.0, orbit: 7.5, spread: 2.6, duration: 1.0 }, 4.3)
        .to('.roast-line', { xPercent: -120, stagger: 0.08, duration: 0.65 }, 4.95)
        .to('.scene-roast', { autoAlpha: 0, duration: 0.5 }, 5.1)
        .to(
          state,
          {
            x: 0,
            y: mobile ? 0.35 : 0.05,
            scale: mobile ? 1.5 : 2.0,
            rx: 0,
            ry: 6.25,
            rz: 0,
            cameraY: mobile ? 8.8 : 8,
            cameraZ: 1.7,
            beans: 0,
            spread: 4,
            orbit: 10,
            saucerGap: -1.4,
            steam: 0.25,
            duration: 1.15,
          },
          5.0,
        )
        .fromTo('.scene-pause', { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.7 }, 5.45)
        .fromTo(
          '.scene-pause h2 > span',
          { y: -65, letterSpacing: '0.02em' },
          { y: 0, letterSpacing: '-0.04em', duration: 0.9 },
          5.45,
        )
        .fromTo('.scene-pause h2 > em', { y: 80 }, { y: 0, duration: 1 }, 5.45)
        .to(state, { scale: mobile ? 2.1 : 2.7, ry: 6.8, duration: 0.9 }, 6.0)
        .to('.scene-pause', { autoAlpha: 0, scale: 1.2, duration: 0.5 }, 6.4)
        .to('.coffee-iris', { clipPath: 'circle(75% at 50% 50%)', duration: 0.85 }, 6.4)
        .to(root, { '--nav-color': '#352b22', duration: 0.6 }, 6.55)
        .to('#coffee-canvas, .model-fallback, .cup-shadow', { autoAlpha: 0, duration: 0.5 }, 6.55)
        .fromTo('.scene-menu', { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.45 }, 6.95)
        .fromTo('.menu-head', { y: 65 }, { y: 0, duration: 0.55 }, 6.95)
        .fromTo(
          menuTrack,
          { x: 0, y: 70, rotation: 3 },
          { y: 0, rotation: 0, duration: 0.55 },
          6.95,
        )
        .to(
          menuTrack,
          { x: () => -Math.max(0, menuTrack.scrollWidth - stage.clientWidth), duration: 2.45 },
          7.55,
        )
        .to({}, { duration: 0.15 }, 9.85)
      gsap.fromTo(
        '.hangout-photo',
        { scale: 1.22, yPercent: -8 },
        {
          scale: 1,
          yPercent: 0,
          ease: 'none',
          scrollTrigger: {
            trigger: '.hangout',
            start: 'top bottom',
            end: 'bottom bottom',
            scrub: 0.7,
          },
        },
      )
      gsap.fromTo(
        '.hangout h2 > span',
        { xPercent: -35 },
        {
          xPercent: 0,
          ease: 'none',
          scrollTrigger: { trigger: '.hangout', start: 'top bottom', end: 'top top', scrub: 0.6 },
        },
      )
      gsap.fromTo(
        '.hangout h2 > em',
        { xPercent: 35 },
        {
          xPercent: 0,
          ease: 'none',
          scrollTrigger: { trigger: '.hangout', start: 'top bottom', end: 'top top', scrub: 0.6 },
        },
      )
      ScrollTrigger.create({
        trigger: '.hangout',
        start: 'top 10%',
        end: 'bottom 10%',
        onEnter: () => gsap.to(root, { '--nav-color': '#f4eddf', duration: 0.3 }),
        onLeaveBack: () => gsap.to(root, { '--nav-color': '#352b22', duration: 0.3 }),
        onLeave: () => gsap.to(root, { '--nav-color': '#a6452f', duration: 0.3 }),
        onEnterBack: () => gsap.to(root, { '--nav-color': '#f4eddf', duration: 0.3 }),
      })
      coffee.start()
      coffee.resize()
      return () => {
        timeline = null
        activeChapter = -1
      }
    },
    root,
  )

  function jumpTo(progress: number): void {
    const top = journey.getBoundingClientRect().top + window.scrollY
    window.scrollTo({
      top: scrollDestination(top, journey.offsetHeight, innerHeight, progress),
      behavior: 'smooth',
    })
  }
  root.querySelectorAll<HTMLElement>('[data-jump]').forEach((element) =>
    element.addEventListener(
      'click',
      (event) => {
        const target = Number(element.dataset.jump)
        if (!Number.isFinite(target)) return
        if (motionQuery.matches) {
          if (element.tagName === 'BUTTON') scenes[getChapter(target)]?.scrollIntoView()
          return
        }
        event.preventDefault()
        jumpTo(target)
      },
      { signal },
    ),
  )
  root.querySelectorAll<HTMLButtonElement>('[data-menu-step]').forEach((button) =>
    button.addEventListener(
      'click',
      () => {
        if (content.menu.length <= 1) return
        const index = Math.min(
          content.menu.length - 1,
          Math.max(
            0,
            getMenuIndex(sceneProgress, content.menu.length) + Number(button.dataset.menuStep),
          ),
        )
        if (motionQuery.matches) {
          root
            .querySelectorAll('.product')
            [index]?.scrollIntoView({ behavior: 'auto', block: 'center' })
          return
        }
        jumpTo(0.755 + (index / (content.menu.length - 1)) * 0.245)
      },
      { signal },
    ),
  )
  // Keyboard focus on an offscreen product also advances the actual scroll timeline.
  root.addEventListener(
    'focusin',
    (event) => {
      if (motionQuery.matches || !(event.target instanceof HTMLElement)) return
      const product = event.target.closest<HTMLElement>('.product')
      if (!product || content.menu.length <= 1) return
      stage.scrollLeft = 0
      const rect = event.target.getBoundingClientRect()
      if (rect.left >= 0 && rect.right <= innerWidth) return
      const index = [...root.querySelectorAll('.product')].indexOf(product)
      const top = journey.getBoundingClientRect().top + scrollY
      const progress = 0.755 + (index / (content.menu.length - 1)) * 0.245
      window.scrollTo({
        top: scrollDestination(top, journey.offsetHeight, innerHeight, progress),
        behavior: 'instant',
      })
    },
    { signal },
  )
  window.addEventListener('load', () => ScrollTrigger.refresh(), { signal })
  const observer = new ResizeObserver(() => {
    if (!disposed) ScrollTrigger.refresh()
  })
  observer.observe(menuTrack)
  void document.fonts.ready.then(() => {
    if (!disposed) ScrollTrigger.refresh()
  })
  return () => {
    if (disposed) return
    disposed = true
    abort.abort()
    observer.disconnect()
    media.revert()
    coffee.destroy()
    root.classList.remove('experience-ready')
    delete root.dataset.chapter
    root.style.removeProperty('--nav-color')
    root.style.removeProperty('--journey-progress')
  }
}
