import { randomBytes, randomUUID } from 'node:crypto'
import { expect, test, type Page } from '@playwright/test'

async function scrollJourney(page: Page, progress: number, chapter: number) {
  await page.evaluate((value) => {
    const journey = document.querySelector<HTMLElement>('.journey')!
    const top = journey.getBoundingClientRect().top + window.scrollY
    window.scrollTo({
      top: top + (journey.offsetHeight - innerHeight) * value,
      behavior: 'instant',
    })
  }, progress)
  await expect(page.locator('.coffee-experience')).toHaveAttribute('data-chapter', String(chapter))
}

test('the 3D journey advances, reverses, and reaches every menu item', async ({ page }) => {
  const errors: string[] = []
  page.on('pageerror', (error) => errors.push(error.message))
  await page.goto('/')
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  await expect(page.locator('#coffee-canvas')).toHaveAttribute('data-renderer', 'webgl')
  for (const [progress, chapter] of [
    [0.25, 1],
    [0.45, 2],
    [0.59, 3],
    [0.75, 4],
    [1, 4],
    [0.25, 1],
    [0, 0],
  ]) {
    await scrollJourney(page, progress, chapter)
  }
  await scrollJourney(page, 1, 4)
  const lastButton = page.locator('.product button').last()
  await expect(lastButton).toBeInViewport({ ratio: 1 })
  await lastButton.click()
  await expect(page.getByRole('dialog')).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(page.getByRole('dialog')).not.toBeVisible()
  await expect(lastButton).toBeFocused()
  expect(errors).toEqual([])
})

test('mobile retains the full scroll story without horizontal overflow', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/')
  await expect(page.locator('#coffee-canvas')).toHaveAttribute('data-renderer', 'webgl')
  for (const [progress, chapter] of [
    [0.25, 1],
    [0.45, 2],
    [0.59, 3],
    [1, 4],
    [0, 0],
  ]) {
    await scrollJourney(page, progress, chapter)
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  }
  await page.setViewportSize({ width: 320, height: 780 })
  await scrollJourney(page, 1, 4)
  await expect(page.locator('.product button').last()).toBeInViewport({ ratio: 1 })
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
})

test('brewing temperature and time are exposed to assistive technology', async ({ page }) => {
  await page.goto('/')
  await expect(page.locator('#coffee-canvas')).toHaveAttribute('data-renderer', 'webgl')
  await scrollJourney(page, 0.45, 2)
  await expect(page.getByRole('img', { name: /degrees Celsius.*seconds/ })).toBeVisible()
})

test('a visible menu action preserves scroll position when details close', async ({ page }) => {
  await page.goto('/')
  await expect(page.locator('#coffee-canvas')).toHaveAttribute('data-renderer', 'webgl')
  await scrollJourney(page, 0.81, 4)
  const action = page.locator('.product button').first()
  await expect(action).toBeInViewport({ ratio: 1 })
  const before = await page.evaluate(() => window.scrollY)
  await action.click()
  await expect(page.getByRole('dialog')).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(action).toBeFocused()
  expect(Math.abs((await page.evaluate(() => window.scrollY)) - before)).toBeLessThan(2)
  const lastAction = page.locator('.product button').last()
  await lastAction.focus()
  await expect(lastAction).toBeInViewport({ ratio: 1 })
})

test('reduced motion exposes ordinary readable sections and usable product details', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/')
  await expect(page.locator('.coffee-experience')).not.toHaveClass(/experience-ready/)
  for (const scene of await page.locator('.scene').all()) await expect(scene).toBeVisible()
  expect(
    await page.locator('.menu-track').evaluate((element) => getComputedStyle(element).transform),
  ).toBe('none')
  await page.locator('.product button').first().click()
  await expect(page.getByRole('dialog')).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(page.getByRole('dialog')).not.toBeVisible()
})

test('administration opens and public clients cannot modify website content', async ({
  request,
  page,
}) => {
  await page.goto('/admin')
  await expect(page.getByRole('textbox', { name: /email/i })).toBeVisible()
  const result = await request.post('/api/globals/homepage', {
    data: { hero: { firstWord: 'HACKED' } },
  })
  expect([401, 403]).toContain(result.status())
})

test('an authenticated CMS edit appears on the real page and is restored afterward', async ({
  page,
  request,
}) => {
  const { getPayload } = await import('payload')
  const { default: config } = await import('../src/payload.config')
  const payload = await getPayload({ config })
  const original = await payload.findGlobal({ slug: 'homepage' })
  const email = `e2e-${randomUUID()}@example.test`
  const password = randomBytes(24).toString('hex')
  const user = await payload.create({
    collection: 'users',
    data: { name: 'Temporary browser test', email, password },
  })
  try {
    const login = await request.post('/api/users/login', { data: { email, password } })
    const loginResult = (await login.json()) as { token?: string; errors?: { message?: string }[] }
    expect(login.status(), loginResult.errors?.map((error) => error.message).join('; ')).toBe(200)
    const token = loginResult.token
    expect(typeof token).toBe('string')
    const updated = await request.post('/api/globals/homepage', {
      headers: { Authorization: `JWT ${token}` },
      data: { hero: { ...original.hero, firstWord: 'BREW' } },
    })
    expect(updated.ok()).toBe(true)
    await page.goto('/')
    await expect(page.getByRole('heading', { level: 1 })).toContainText('BREW')
  } finally {
    await payload.updateGlobal({ slug: 'homepage', data: { hero: original.hero } })
    await payload.delete({ collection: 'users', id: user.id })
    await payload.destroy()
  }
})
