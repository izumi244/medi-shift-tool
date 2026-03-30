import { test, expect } from '@playwright/test'

test.describe('Accessibility', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login')
  })

  test('login page has proper heading', async ({ page }) => {
    const heading = page.locator('h1')
    await expect(heading).toBeVisible()
    await expect(heading).toHaveText('シフト管理ツール')
  })

  test('form labels are present for inputs', async ({ page }) => {
    // Check that label texts exist for both fields
    await expect(page.getByText('ユーザーID', { exact: false })).toBeVisible()
    await expect(page.getByText('パスワード', { exact: false })).toBeVisible()
  })

  test('remember me checkbox has associated label', async ({ page }) => {
    const label = page.locator('label[for="remember_me"]')
    await expect(label).toBeVisible()
    await expect(label).toContainText('ログイン状態を保持')

    // Clicking the label should toggle the checkbox
    const checkbox = page.locator('#remember_me')
    await expect(checkbox).not.toBeChecked()
    await label.click()
    await expect(checkbox).toBeChecked()
  })

  test('submit button is not disabled by default', async ({ page }) => {
    const submitButton = page.locator('button[type="submit"]')
    await expect(submitButton).toBeEnabled()
  })

  test('page has descriptive subtitle', async ({ page }) => {
    await expect(page.getByText('ログインしてください')).toBeVisible()
  })
})
