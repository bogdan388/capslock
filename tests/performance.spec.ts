import { test, expect } from '@playwright/test';
import { LeadFormPage } from '../pages/LeadFormPage';
import { validFormData } from '../test-data/form-data';

test.describe('Lead Form - Performance @performance', () => {
  test('page should load within acceptable time', async ({ page }) => {
    const startTime = Date.now();

    await page.goto('/');

    const loadTime = Date.now() - startTime;

    expect(loadTime).toBeLessThan(5000);
  });

  test('form container should be visible within 3 seconds', async ({ page }) => {
    const leadForm = new LeadFormPage(page);

    await page.goto('/');

    await expect(leadForm.formContainer).toBeVisible({ timeout: 3000 });
  });

  test('step transition should be responsive', async ({ page }) => {
    const leadForm = new LeadFormPage(page);

    await leadForm.goto();
    await leadForm.fillZipCode(validFormData.zipCode);

    const startTime = Date.now();
    await leadForm.submitZipCode();
    await expect(leadForm.safetyOption).toBeVisible();
    const transitionTime = Date.now() - startTime;

    expect(transitionTime).toBeLessThan(2000);
  });

  test('should measure form completion time', async ({ page }) => {
    const leadForm = new LeadFormPage(page);

    const startTime = Date.now();

    await leadForm.goto();
    await leadForm.fillZipCode(validFormData.zipCode);
    await leadForm.submitZipCode();
    await leadForm.selectInterest('Safety');
    await leadForm.submitInterest();
    await leadForm.selectPropertyType('Owned House / Condo');
    await leadForm.submitPropertyType();
    await leadForm.fillName(validFormData.name);
    await leadForm.fillEmail(validFormData.email);
    await leadForm.submitNameAndEmail();
    await expect(leadForm.phoneInput).toBeVisible();

    const completionTime = Date.now() - startTime;

    expect(completionTime).toBeLessThan(30000);
  });

  test('should collect Web Vitals metrics', async ({ page }) => {
    await page.goto('/');

    const metrics = await page.evaluate(() => {
      return new Promise((resolve) => {
        const results: Record<string, number> = {};

        new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.entryType === 'largest-contentful-paint') {
              results['LCP'] = entry.startTime;
            }
          }
        }).observe({ entryTypes: ['largest-contentful-paint'] });

        new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.entryType === 'first-input') {
              const fidEntry = entry as PerformanceEventTiming;
              results['FID'] = fidEntry.processingStart - fidEntry.startTime;
            }
          }
        }).observe({ entryTypes: ['first-input'] });

        setTimeout(() => {
          const navigation = performance.getEntriesByType(
            'navigation'
          )[0] as PerformanceNavigationTiming;
          if (navigation) {
            results['TTFB'] = navigation.responseStart - navigation.requestStart;
            results['DOMContentLoaded'] =
              navigation.domContentLoadedEventEnd - navigation.startTime;
            results['Load'] = navigation.loadEventEnd - navigation.startTime;
          }
          resolve(results);
        }, 3000);
      });
    });

    console.log('Performance Metrics:', metrics);

    expect(metrics).toBeDefined();
  });

  test('should handle rapid form interactions', async ({ page }) => {
    const leadForm = new LeadFormPage(page);

    await leadForm.goto();

    for (let i = 0; i < 5; i++) {
      await leadForm.zipCodeInput.fill('');
      await leadForm.fillZipCode(validFormData.zipCode);
    }

    await leadForm.submitZipCode();

    await expect(leadForm.safetyOption).toBeVisible();
  });

  test('should not have memory leaks during navigation', async ({ page }) => {
    const leadForm = new LeadFormPage(page);

    const initialMemory = await page.evaluate(() => {
      if ('memory' in performance) {
        return (performance as any).memory.usedJSHeapSize;
      }
      return 0;
    });

    for (let i = 0; i < 3; i++) {
      await leadForm.goto();
      await leadForm.fillZipCode(validFormData.zipCode);
      await leadForm.submitZipCode();
      await expect(leadForm.safetyOption).toBeVisible();
    }

    const finalMemory = await page.evaluate(() => {
      if ('memory' in performance) {
        return (performance as any).memory.usedJSHeapSize;
      }
      return 0;
    });

    if (initialMemory > 0 && finalMemory > 0) {
      const memoryGrowth = finalMemory - initialMemory;
      const growthPercentage = (memoryGrowth / initialMemory) * 100;
      expect(growthPercentage).toBeLessThan(100);
    }
  });

  test('should measure network request count', async ({ page }) => {
    let requestCount = 0;

    page.on('request', () => {
      requestCount++;
    });

    const leadForm = new LeadFormPage(page);
    await leadForm.goto();

    console.log(`Total network requests: ${requestCount}`);

    expect(requestCount).toBeGreaterThan(0);
  });
});
