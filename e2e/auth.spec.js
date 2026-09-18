import { test, expect } from '@playwright/test';

test('home page loads with the GO GREEN brand', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByText('GO GREEN').first()).toBeVisible();
});

test('login page shows the form', async ({ page }) => {
  await page.goto('/login');
  await expect(page.getByText('Welcome back')).toBeVisible();
  await expect(page.getByLabel('Email address')).toBeVisible();
});

test('signup page shows the new fields (name, mobile, province)', async ({ page }) => {
  await page.goto('/register');
  await expect(page.getByText('Create your account')).toBeVisible();
  await expect(page.getByLabel('Full name')).toBeVisible();
  await expect(page.getByLabel('Mobile number')).toBeVisible();
  await expect(page.getByLabel('Province')).toBeVisible();
});

test('shop page loads', async ({ page }) => {
  await page.goto('/Page-Shop');
  await expect(page.getByText('Find your perfect plant')).toBeVisible();
});
