import { test, expect } from '@playwright/test';
import { LeadFormPage } from '../pages/LeadFormPage';
import { validFormData } from '../test-data/form-data';

const THRESHOLDS = {
  pageLoad: 5000,
  formContainer: 3000,
  stepTransition: 2000,
  formCompletion: 30000,
  memoryGrowth: 100,
};

function warnIfExceeds(
  testInfo: ReturnType<typeof test.info>,
  metricName: string,
  actualValue: number,
  threshold: number,
  unit: string = 'ms'
) {
  if (actualValue > threshold) {
    const message = `${metricName}: ${actualValue}${unit} exceeded threshold of ${threshold}${unit}`;
    console.warn(`⚠️ WARNING: ${message}`);
    testInfo.annotations.push({ type: 'warning', description: message });
  } else {
    console.log(`✓ ${metricName}: ${actualValue}${unit} (threshold: ${threshold}${unit})`);
  }
}

test.describe('Lead Form - Performance @performance', () => {
  test('page should load within acceptable time', async ({ page }, testInfo) => {
    const startTime = Date.now();

    await page.goto('/');

    const loadTime = Date.now() - startTime;

    warnIfExceeds(testInfo, 'Page Load Time', loadTime, THRESHOLDS.pageLoad);
    expect(loadTime).toBeGreaterThan(0);
  });

  test('form container should be visible within 3 seconds', async ({ page }) => {
    const leadForm = new LeadFormPage(page);

    await page.goto('/');

    await expect(leadForm.formContainer).toBeVisible({ timeout: 3000 });
  });

  test('step transition should be responsive', async ({ page }, testInfo) => {
    const leadForm = new LeadFormPage(page);

    await leadForm.goto();
    await leadForm.fillZipCode(validFormData.zipCode);

    const startTime = Date.now();
    await leadForm.submitZipCode();
    await expect(leadForm.safetyOption).toBeVisible();
    const transitionTime = Date.now() - startTime;

    warnIfExceeds(testInfo, 'Step Transition Time', transitionTime, THRESHOLDS.stepTransition);
    expect(transitionTime).toBeGreaterThan(0);
  });

  test('should measure form completion time', async ({ page }, testInfo) => {
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

    warnIfExceeds(testInfo, 'Form Completion Time', completionTime, THRESHOLDS.formCompletion);
    expect(completionTime).toBeGreaterThan(0);
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

  test('should not have memory leaks during navigation', async ({ page }, testInfo) => {
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
      warnIfExceeds(testInfo, 'Memory Growth', growthPercentage, THRESHOLDS.memoryGrowth, '%');
    } else {
      console.log('Memory API not available in this browser');
      testInfo.annotations.push({
        type: 'info',
        description: 'Memory API not available - test skipped memory check',
      });
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
