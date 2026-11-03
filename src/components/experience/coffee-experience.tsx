'use client'

import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'
import type { ExperienceContent, MenuProduct } from '@/lib/types'
import { MenuDialog } from './menu-dialog'

const chapters = [
  { progress: 0, label: 'Slow Down' },
  { progress: 0.22, label: 'Our coffee origin' },
  { progress: 0.41, label: 'The brewing ritual' },
  { progress: 0.58, label: 'Your moment' },
  { progress: 0.75, label: 'The menu' },
]

export function CoffeeExperience({ content }: { content: ExperienceContent }) {
  const root = useRef<HTMLDivElement>(null)
  const trigger = useRef<HTMLButtonElement | null>(null)
  const [selected, setSelected] = useState<MenuProduct | null>(null)
  const { settings, hero, origin, roast, pause, menuHeading, visit, menu } = content
  useEffect(() => {
    let disposed = false
    let destroy: (() => void) | undefined
    void import('./scroll-experience')
      .then(({ createScrollExperience }) => {
        if (!disposed && root.current) destroy = createScrollExperience(root.current, content)
      })
      .catch((error) => {
        if (!disposed)
          console.error(
            'The motion experience could not start. The content remains available.',
            error,
          )
      })
    return () => {
      disposed = true
      destroy?.()
    }
  }, [content])

  const price = (value: number) =>
    new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: settings.currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(value)

  return (
    <div ref={root} className="coffee-experience" data-chapter="0">
      <a href="#main" className="skip-link">
        Skip to experience
      </a>
      <header className="nav">
        <a className="logo" href="#main" data-jump="0" aria-label={`${settings.brandName} home`}>
          <span aria-hidden="true">✳</span> {settings.brandName}
        </a>
        <span className="nav-center">
          SPECIALTY COFFEE.
          <br />
          EVERYDAY MAGIC.
        </span>
        <nav aria-label="Main navigation">
          <a href="#origin" data-jump="0.22">
            The obsession
          </a>
          <a href="#menu" data-jump="0.75">
            The good stuff
          </a>
          <a className="visit-link" href="#visit">
            Find your pause <span aria-hidden="true">↗</span>
          </a>
        </nav>
      </header>
      <main id="main">
        <div className="journey" aria-label="The coffee journey">
          <div className="stage">
            <div className="stage-grid" aria-hidden="true" />
            <div className="cup-shadow" aria-hidden="true" />
            <div className="model-fallback" aria-hidden="true">
              <Image
                src="/images/latte.jpg"
                alt=""
                fill
                sizes="(max-width: 700px) 60vw, 38vw"
                priority
              />
            </div>
            <canvas
              id="coffee-canvas"
              aria-label={`A ceramic ${settings.brandName} cup with latte art, surrounded by floating coffee beans`}
              role="img"
            />
            <section className="scene scene-hero" aria-labelledby="hero-title">
              <div className="hero-kicker eyebrow">
                <span className="small-star" aria-hidden="true">
                  ✳
                </span>{' '}
                {hero.kicker}
              </div>
              <h1 id="hero-title">
                <span className="hero-word hero-word-one">{hero.firstWord}</span>
                <span className="hero-word hero-word-two">{hero.secondWord}</span>
              </h1>
              <div className="hero-circle" aria-hidden="true" />
              <p className="hero-caption whitespace-pre-line">{hero.caption}</p>
              <div className="hero-stamp" aria-hidden="true">
                <svg viewBox="0 0 120 120">
                  <defs>
                    <path id="stamp" d="M60,60 m-43,0 a43,43 0 1,1 86,0 a43,43 0 1,1 -86,0" />
                  </defs>
                  <text>
                    <textPath href="#stamp" textLength="264">
                      {hero.badge}
                    </textPath>
                  </text>
                </svg>
                <span>✳</span>
              </div>
              <div className="hero-bottom">
                <span className="eyebrow">SCROLL. THERE’S A WHOLE WORLD IN THIS CUP.</span>
                <span className="scroll-arrow" aria-hidden="true">
                  ↓
                </span>
                <span className="eyebrow">SMALL BATCH. BIG FEELING.</span>
              </div>
            </section>
            <section className="scene scene-origin" id="origin" aria-labelledby="origin-title">
              <span className="chapter-ghost" aria-hidden="true">
                ORIGIN
              </span>
              <div className="origin-content">
                <span className="eyebrow">{origin.label}</span>
                <h2 id="origin-title">
                  {origin.title}
                  <br />
                  <em>{origin.emphasis}</em>
                  <br />
                  {origin.closing}
                </h2>
                <p>{origin.body}</p>
                <span className="origin-footnote">{origin.footnote}</span>
              </div>
              <div className="origin-coordinate eyebrow">
                FROM SOMEWHERE SPECIAL.
                <br />
                TO YOUR EVERYDAY.
              </div>
            </section>
            <section className="scene scene-roast" id="roast" aria-labelledby="roast-title">
              <div className="roast-content">
                <span className="eyebrow">{roast.label}</span>
                <h2 id="roast-title">
                  <span className="roast-line">{roast.firstWord}</span>
                  <span className="roast-line">{roast.secondWord}</span>
                  <span className="roast-line roast-serif">{roast.thirdWord}</span>
                </h2>
              </div>
              <div className="roast-caption">
                <span className="small-star" aria-hidden="true">
                  ✳
                </span>
                <p className="whitespace-pre-line">{roast.caption}</p>
              </div>
              <div
                className="brew-metrics"
                role="img"
                aria-label={`${roast.temperature} degrees Celsius, ${roast.extractionTime} seconds`}
              >
                <div aria-hidden="true">
                  <span className="metric-value">
                    <span id="brew-temperature">{roast.temperature}</span>
                    <small>°</small>
                  </span>
                  <span className="eyebrow">THE SWEET SPOT</span>
                </div>
                <div aria-hidden="true">
                  <span className="metric-value">
                    <span id="brew-time">{roast.extractionTime}</span>
                    <small>s</small>
                  </span>
                  <span className="eyebrow">WORTH THE WAIT</span>
                </div>
                <span className="metrics-aside">
                  A CUP OF CARE.
                  <br />
                  NOT A SINGLE SHORTCUT.
                </span>
              </div>
            </section>
            <section className="scene scene-pause" aria-labelledby="pause-title">
              <span className="eyebrow pause-kicker">{pause.label}</span>
              <h2 id="pause-title">
                <span>{pause.title}</span>
                <em>{pause.emphasis}</em>
              </h2>
              <p className="whitespace-pre-line">{pause.body}</p>
            </section>
            <div className="coffee-iris" aria-hidden="true" />
            <section className="scene scene-menu" id="menu" aria-labelledby="menu-title">
              <div className="menu-head">
                <div>
                  <span className="eyebrow">{menuHeading.label}</span>
                  <h2 id="menu-title">
                    {menuHeading.title} <em>{menuHeading.emphasis}</em>
                  </h2>
                </div>
                <span className="menu-direction eyebrow">
                  A LITTLE MORE SCROLL.
                  <br />A NEW FAVORITE. <span aria-hidden="true">→</span>
                </span>
              </div>
              <div className="menu-track">
                {menu.map((product, index) => (
                  <article className="product" key={product.id}>
                    <div className="product-image">
                      <Image
                        src={product.image.src}
                        alt={product.image.alt}
                        width={product.image.width}
                        height={product.image.height}
                        sizes="(max-width: 700px) 86vw, 35vw"
                      />
                      <span className="product-image-note">{product.imageCaption}</span>
                    </div>
                    <div className="product-copy">
                      <span className="product-index">
                        {String(index + 1).padStart(2, '0')} / {product.eyebrow}
                      </span>
                      <h3>
                        {product.title}
                        <br />
                        <em>{product.emphasis}</em>
                      </h3>
                      <p className="whitespace-pre-line">{product.description}</p>
                      <div className="flavor">
                        {product.flavorNotes.map((note, i) => (
                          <span key={`${i}-${note}`}>{note}</span>
                        ))}
                      </div>
                      <div className="product-bottom">
                        <span>{price(product.price)}</span>
                        <button
                          type="button"
                          data-drink={product.slug}
                          aria-label={`View ${product.title} ${product.emphasis} details`}
                          onClick={(event) => {
                            trigger.current = event.currentTarget
                            setSelected(product)
                          }}
                        >
                          {product.actionLabel} <span aria-hidden="true">↗</span>
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
                {menu.length === 0 && (
                  <div className="empty-menu">
                    <span aria-hidden="true">✳</span>
                    <p>Fresh favorites are on their way.</p>
                    <a href="#visit">Stay a little while ↗</a>
                  </div>
                )}
              </div>
              <div className="menu-bottom eyebrow">
                <span>{menuHeading.footer}</span>
                <div className="menu-controls">
                  <button
                    type="button"
                    data-menu-step="-1"
                    aria-label="Previous menu item"
                    disabled={menu.length < 2}
                  >
                    ←
                  </button>
                  <span className="menu-page">
                    {menu.length ? '01' : '00'} / {String(menu.length).padStart(2, '0')}
                  </span>
                  <button
                    type="button"
                    data-menu-step="1"
                    aria-label="Next menu item"
                    disabled={menu.length < 2}
                  >
                    →
                  </button>
                </div>
                <span>OAT MILK? ALWAYS.</span>
              </div>
            </section>
            <aside className="chapter-nav" aria-label="Journey chapters">
              {chapters.map((chapter, index) => (
                <button
                  key={chapter.label}
                  type="button"
                  data-jump={chapter.progress}
                  aria-label={`Go to ${chapter.label}`}
                  aria-current={index === 0 ? 'step' : undefined}
                >
                  <span />
                </button>
              ))}
            </aside>
            <div className="journey-progress" aria-hidden="true">
              <span />
            </div>
          </div>
        </div>
        <section className="hangout" id="visit" aria-labelledby="hangout-title">
          <div className="hangout-sticky">
            <Image
              className="hangout-photo"
              src={visit.image.src}
              alt={visit.image.alt}
              width={visit.image.width}
              height={visit.image.height}
              sizes="100vw"
            />
            <div className="hangout-shade" />
            <div className="hangout-kicker eyebrow">{visit.label}</div>
            <h2 id="hangout-title">
              <span>{visit.title}</span>
              <em>{visit.emphasis}</em>
            </h2>
            <div className="hangout-bottom">
              <p className="whitespace-pre-line">{visit.body}</p>
              {settings.contactEmail ? (
                <a
                  className="hangout-round"
                  href={`mailto:${settings.contactEmail}`}
                  aria-label="Email the coffee shop"
                >
                  ↗
                </a>
              ) : (
                <span className="hangout-round" aria-hidden="true">
                  ↗
                </span>
              )}
              <div className="visit-details">
                <p>{settings.locationLabel}</p>
                {settings.address && (
                  <address className="whitespace-pre-line not-italic">{settings.address}</address>
                )}
                {settings.hours.map((hour, index) => (
                  <p key={index}>
                    {hour.days} · {hour.time}
                  </p>
                ))}
              </div>
            </div>
          </div>
        </section>
        <footer className="end">
          <div className="end-top">
            <span className="eyebrow">SMALL CUP. WHOLE LOT OF SOUL.</span>
            <a href="#main" data-jump="0">
              Do it all again <span aria-hidden="true">↗</span>
            </a>
          </div>
          <div className="end-wordmark" aria-label={settings.brandName}>
            {settings.brandName.replace(/\.$/, '')}
            <span aria-hidden="true">✳</span>
          </div>
          <div className="end-bottom eyebrow">
            <span>
              © {new Date().getFullYear()} {settings.brandName.toUpperCase()} COFFEE
            </span>
            <span>GOOD COFFEE. GOOD PEOPLE. GOOD DAYS.</span>
            <span>{hero.kicker}</span>
          </div>
        </footer>
      </main>
      <MenuDialog
        product={selected}
        currency={settings.currency}
        trigger={trigger.current}
        onDismiss={() => setSelected(null)}
      />
    </div>
  )
}
