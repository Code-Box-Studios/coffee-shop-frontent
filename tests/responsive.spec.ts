import { expect, test } from '@playwright/test'

const viewports = [
  { width: 320, height: 568 },
  { width: 360, height: 800 },
  { width: 390, height: 844 },
  { width: 430, height: 932 },
  { width: 768, height: 1024 },
  { width: 1024, height: 768 },
  { width: 1280, height: 720 },
  { width: 1440, height: 900 },
  { width: 1920, height: 1080 },
  { width: 2560, height: 1440 },
  { width: 667, height: 375 },
  { width: 844, height: 390 },
]

for (const viewport of viewports) {
  test(`all chapters and menu actions fit ${viewport.width}x${viewport.height}`, async ({
    page,
  }) => {
    await page.setViewportSize(viewport)
    await page.goto('/')
    await expect(page.locator('#coffee-canvas')).toHaveAttribute('data-renderer', 'webgl')
    expect(
      await page.locator('.stage').evaluate((element) => element.clientHeight),
    ).toBeLessThanOrEqual(viewport.height)
    await expect(page.locator('.hero-caption')).toBeInViewport({ ratio: 1 })
    await expect(page.locator('.hero-bottom')).toBeInViewport({ ratio: 1 })

    for (const [progress, selector] of [
      [0.25, '.origin-content'],
      [0.45, '.roast-content'],
      [0.59, '.scene-pause h2'],
      [1, '.menu-head'],
    ] as const) {
      await page.evaluate((value) => {
        const journey = document.querySelector<HTMLElement>('.journey')!
        const top = journey.getBoundingClientRect().top + window.scrollY
        window.scrollTo({
          top: top + (journey.offsetHeight - innerHeight) * value,
          behavior: 'instant',
        })
      }, progress)
      await expect(page.locator(selector)).toBeInViewport({ ratio: 1 })
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
        true,
      )
    }

    const lastAction = page.locator('.product button').last()
    await expect(lastAction).toBeInViewport({ ratio: 1 })
    await lastAction.click({ timeout: 5000 })
    await expect(page.getByRole('dialog')).toBeVisible()
    await page.keyboard.press('Escape')
    await expect(page.getByRole('dialog')).not.toBeVisible()
    await expect(lastAction).toBeFocused()
    await expect(page.getByRole('button', { name: 'Previous menu item' })).toBeInViewport({
      ratio: 1,
    })
    await page.getByRole('button', { name: 'Previous menu item' }).click({ timeout: 5000 })
    await expect(page.locator('.menu-page')).not.toHaveText('03 / 03')
    await page.locator('.visit-link').click()
    await expect(page.locator('#hangout-title')).toBeInViewport({ ratio: 1 })
    await expect(page.locator('.hangout-bottom')).toBeInViewport({ ratio: 1 })
    const backToTop = page.getByRole('link', { name: 'Do it all again' })
    await backToTop.scrollIntoViewIfNeeded()
    await expect(backToTop).toBeInViewport({ ratio: 1 })
  })
}
