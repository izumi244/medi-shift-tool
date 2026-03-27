import { test, expect } from '@playwright/test'

test.describe('Login page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login')
  })

  test('login page loads successfully', async ({ page }) => {
    await expect(page).toHaveURL('/login')
    await expect(page.locator('h1')).toBeVisible()
  })

  test('login form has required fields', async ({ page }) => {
    // User ID input
    const userIdInput = page.locator('input[type="text"]')
    await expect(userIdInput).toBeVisible()
    await expect(userIdInput).toHaveAttribute('placeholder', '例: emp001')

    // Password input
    const passwordInput = page.locator('input[type="password"]')
    await expect(passwordInput).toBeVisible()

    // Submit button
    const submitButton = page.locator('button[type="submit"]')
    await expect(submitButton).toBeVisible()
    await expect(submitButton).toHaveText('ログイン')
  })

  test('empty form submission shows validation errors', async ({ page }) => {
    // Click submit without filling in any fields
    await page.locator('button[type="submit"]').click()

    // Should show validation error messages
    await expect(page.getByText('ユーザーIDを入力してください')).toBeVisible()
    await expect(page.getByText('パスワードを入力してください')).toBeVisible()
  })

  test('partial form submission shows specific error', async ({ page }) => {
    // Fill only user ID, leave password empty
    await page.locator('input[type="text"]').fill('testuser')
    await page.locator('button[type="submit"]').click()

    // Should show password error but not user ID error
    await expect(page.getByText('ユーザーIDを入力してください')).not.toBeVisible()
    await expect(page.getByText('パスワードを入力してください')).toBeVisible()
  })

  test('remember me checkbox is present and functional', async ({ page }) => {
    const checkbox = page.locator('#remember_me')
    await expect(checkbox).toBeVisible()
    await expect(checkbox).not.toBeChecked()

    await checkbox.check()
    await expect(checkbox).toBeChecked()
  })

  test('password visibility toggle works', async ({ page }) => {
    const passwordInput = page.locator('input[placeholder="パスワードを入力"]')
    await expect(passwordInput).toHaveAttribute('type', 'password')

    // Click the toggle button (the button inside the password field container)
    await page.locator('input[placeholder="パスワードを入力"]').locator('..').locator('button').click()
    await expect(passwordInput).toHaveAttribute('type', 'text')
  })
})
