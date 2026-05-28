import { test, expect } from '@playwright/test'

test.describe('quanzhi-calc', () => {
  test('page loads without console errors', async ({ page }) => {
    const errors = []
    page.on('console', msg => {
      if (msg.type() === 'error') errors.push(msg.text())
    })
    page.on('pageerror', err => errors.push(err.message))

    await page.goto('/quanzhi-calc/')
    await page.waitForLoadState('networkidle')
    expect(errors).toEqual([])
  })

  test('major selection works', async ({ page }) => {
    await page.goto('/quanzhi-calc/')
    await page.waitForLoadState('networkidle')

    const cards = page.locator('.major-card')
    await expect(cards.first()).toBeVisible()
  })
})