import { test, expect } from '@playwright/test'

test.describe('Navigation', () => {
  test('unauthenticated users accessing root are redirected to login', async ({ page }) => {
    await page.goto('/')
    // The app should redirect unauthenticated users to the login page
    await expect(page).toHaveURL(/\/login/, { timeout: 10_000 })
  })

  test('change-password page loads', async ({ page }) => {
    await page.goto('/change-password')
    // Should either show the change password page or redirect to login
    await expect(page).toHaveURL(/\/(change-password|login)/, { timeout: 10_000 })
  })

  test('login page is accessible at /login', async ({ page }) => {
    const response = await page.goto('/login')
    expect(response?.status()).toBe(200)
  })
})
