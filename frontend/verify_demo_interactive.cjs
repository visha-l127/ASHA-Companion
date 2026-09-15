const { chromium } = require('playwright');

async function runInteractiveVerification() {
  console.log('======================================================================');
  console.log('STARTING PLAYWRIGHT DEMO MODE INTERACTIVE VERIFICATION');
  console.log('Target: http://localhost:4173/ASHA-Companion/');
  console.log('======================================================================\n');

  const browser = await chromium.launch({
    channel: 'msedge',
    headless: true,
  });

  const context = await browser.newContext();
  const page = await context.newPage();

  // Accept any confirmation dialogs automatically
  page.on('dialog', async (dialog) => {
    console.log(`  [Dialog] ${dialog.type().toUpperCase()}: "${dialog.message()}" -> Accepting`);
    await dialog.accept();
  });

  const BASE_URL = 'http://localhost:4173/ASHA-Companion';

  try {
    // ------------------------------------------------------------------
    // Step A: Confirm Demo Mode Banner on Root Page
    // ------------------------------------------------------------------
    console.log('----------------------------------------------------------------------');
    console.log('STEP A: Verifying Demo Mode Banner on Root Page');
    console.log('----------------------------------------------------------------------');
    await page.goto(BASE_URL + '/');
    await page.waitForTimeout(500);

    const banner = page.locator('text=Demo Mode — Sample Data, No Live Backend');
    const bannerVisible = await banner.isVisible();
    if (!bannerVisible) throw new Error('Demo Mode banner is not visible on root page!');
    console.log('  [PASS] Banner "Demo Mode — Sample Data, No Live Backend" is present in DOM');

    // ------------------------------------------------------------------
    // Step B: Admin Quick-Login & Dashboard Stats Rendering
    // ------------------------------------------------------------------
    console.log('\n----------------------------------------------------------------------');
    console.log('STEP B: Verifying Admin Quick-Login & Dashboard Stats');
    console.log('----------------------------------------------------------------------');
    await page.goto(BASE_URL + '/login');
    await page.waitForLoadState('networkidle');

    // Click Admin Quick Login Pill
    const adminPill = page.locator('button:has-text("Admin")').first();
    await adminPill.click();

    // Wait for Admin Dashboard navigation
    await page.waitForURL('**/admin/dashboard');
    console.log('  [PASS] Navigated to /admin/dashboard');

    // Assert dashboard stats are rendered in DOM
    const adminHeading = page.locator('h1:has-text("Admin Dashboard")');
    await adminHeading.waitFor({ state: 'visible', timeout: 5000 });
    console.log('  [PASS] "Admin Dashboard" heading rendered');

    const phcCard = page.locator('text=Total PHCs');
    await phcCard.waitFor({ state: 'visible', timeout: 5000 });
    console.log('  [PASS] "Total PHCs" metric card rendered');

    const inchargeText = page.locator('text=Dr. A. Sample (Demo District Officer)');
    await inchargeText.waitFor({ state: 'visible', timeout: 5000 });
    console.log('  [PASS] Fictional incharge placeholder "Dr. A. Sample (Demo District Officer)" rendered');

    // ------------------------------------------------------------------
    // Step C: ASHA Login -> Patients List -> Create Patient -> Soft Delete
    // ------------------------------------------------------------------
    console.log('\n----------------------------------------------------------------------');
    console.log('STEP C: Verifying ASHA Login -> Patients CRUD & Soft-Delete');
    console.log('----------------------------------------------------------------------');
    await page.goto(BASE_URL + '/login');
    await page.waitForLoadState('networkidle');

    // Click ASHA Quick Login Pill
    const ashaPill = page.locator('button:has-text("ASHA")').first();
    await ashaPill.click();
    await page.waitForURL('**/asha/dashboard');
    console.log('  [PASS] Logged in as ASHA (anita.devi), navigated to /asha/dashboard');

    // Navigate to Patients
    await page.goto(BASE_URL + '/asha/patients');
    await page.waitForLoadState('networkidle');
    console.log('  [PASS] Navigated to /asha/patients');

    // Open Register Patient Modal
    const registerBtn = page.locator('#btn-register-patient');
    await registerBtn.waitFor({ state: 'visible', timeout: 5000 });
    await registerBtn.click();

    // Fill form
    const formModal = page.locator('h3:has-text("Register New Patient")');
    await formModal.waitFor({ state: 'visible', timeout: 5000 });

    const newPatientName = 'Geeta Sharma';
    await page.selectOption('select[required]', { index: 1 });
    await page.fill('input[placeholder="e.g. Sunita Devi"]', newPatientName);
    await page.fill('input[placeholder="e.g. Wife, Son, Self"]', 'Self');
    await page.fill('input[placeholder="+91 99000 00000"]', '9876543210');

    // Submit form
    await page.click('button[type="submit"]:has-text("Register Patient")');
    await page.waitForTimeout(1000);

    // Confirm patient appears in the list
    const patientRow = page.locator(`tr:has-text("${newPatientName}")`).first();
    await patientRow.waitFor({ state: 'visible', timeout: 5000 });
    console.log(`  [PASS] Created patient "${newPatientName}" is visible in list`);

    // Click Delete Patient button on the row
    const deleteBtn = patientRow.locator('button[title="Delete Patient"]').first();
    await deleteBtn.click();
    await page.waitForTimeout(1000);

    // Confirm patient is excluded from active list (soft delete)
    const afterDeleteCount = await page.locator(`tr:has-text("${newPatientName}")`).count();
    if (afterDeleteCount !== 0) throw new Error(`Soft-deleted patient "${newPatientName}" is still visible!`);
    console.log(`  [PASS] Patient "${newPatientName}" soft-deleted and excluded from active list without errors`);

    // ------------------------------------------------------------------
    // Step D: Supervisor Login -> Priority Visits -> Create -> Complete -> Delete
    // ------------------------------------------------------------------
    console.log('\n----------------------------------------------------------------------');
    console.log('STEP D: Verifying Supervisor Priority Visits (Create -> Toggle -> Delete)');
    console.log('----------------------------------------------------------------------');
    await page.goto(BASE_URL + '/login');
    await page.waitForLoadState('networkidle');

    // Click Supervisor Quick Login Pill
    const supervisorPill = page.locator('button:has-text("Supervisor")').first();
    await supervisorPill.click();
    await page.waitForURL('**/supervisor/dashboard');
    console.log('  [PASS] Logged in as Supervisor (vedava), navigated to /supervisor/dashboard');

    // Navigate to Priority Visits
    await page.goto(BASE_URL + '/supervisor/priority-visits');
    await page.waitForLoadState('networkidle');
    console.log('  [PASS] Navigated to /supervisor/priority-visits');

    // Open Delegation Form
    const delegateBtn = page.locator('button:has-text("Delegate Priority Visit")').first();
    await delegateBtn.click();
    await page.waitForTimeout(500);

    const testPvName = 'Kavitha Devi';
    await page.fill('input[placeholder="e.g. Meera Bai"]', testPvName);
    await page.fill('input[placeholder="e.g. Gestational Hypertension 156/98 checkup"]', 'High Fever Checkup');
    await page.fill('textarea[placeholder="Provide actionable directions (e.g. counseling steps, medicine verification)..."]', 'Urgent home visit required');

    // Submit delegation
    await page.click('button[type="submit"]:has-text("Issue Visit Delegation")');
    await page.waitForTimeout(1000);

    // Confirm it appears in the UI with status Pending
    const pvCard = page.locator('[data-testid="priority-visit-card"]').filter({ hasText: testPvName }).first();
    await pvCard.waitFor({ state: 'visible', timeout: 5000 });
    const pendingBadge = pvCard.locator('span:has-text("Pending")').first();
    await pendingBadge.waitFor({ state: 'visible', timeout: 3000 });
    console.log(`  [PASS] Priority visit for "${testPvName}" created with status Pending`);

    // Toggle status to Completed
    const completeBtn = pvCard.locator('button:has-text("Mark as Completed / Visited")').first();
    await completeBtn.click();
    await page.waitForTimeout(1000);

    // Confirm status changed to Completed
    const completedCard = page.locator('[data-testid="priority-visit-card"]').filter({ hasText: testPvName }).first();
    const completedBadge = completedCard.locator('span:has-text("Completed")').first();
    await completedBadge.waitFor({ state: 'visible', timeout: 5000 });
    console.log(`  [PASS] Priority visit for "${testPvName}" toggled to Completed`);

    // Delete the visit
    const deletePvBtn = completedCard.locator('button:has-text("Delete")').first();
    await deletePvBtn.click();
    await page.waitForTimeout(1000);

    // Confirm removed from UI
    const pvCountAfter = await page.locator('[data-testid="priority-visit-card"]').filter({ hasText: testPvName }).count();
    if (pvCountAfter !== 0) throw new Error(`Deleted priority visit "${testPvName}" is still present in DOM!`);
    console.log(`  [PASS] Priority visit for "${testPvName}" deleted and removed from UI`);

    // ------------------------------------------------------------------
    // Step E: High-Risk Maternal View (Sunita Devi & Risk Factors)
    // ------------------------------------------------------------------
    console.log('\n----------------------------------------------------------------------');
    console.log('STEP E: Verifying High-Risk Maternal View (Sunita Devi)');
    console.log('----------------------------------------------------------------------');
    // Re-login as ASHA for ASHA workspaces
    await page.goto(BASE_URL + '/login');
    await page.waitForLoadState('networkidle');
    await page.locator('button:has-text("ASHA")').first().click();
    await page.waitForURL('**/asha/dashboard');

    await page.goto(BASE_URL + '/asha/maternal');
    await page.waitForLoadState('networkidle');
    console.log('  [PASS] Navigated to /asha/maternal');

    // Confirm Sunita Devi is visible
    const sunitaName = page.locator('h3:has-text("Sunita Devi")').first();
    await sunitaName.waitFor({ state: 'visible', timeout: 5000 });
    console.log('  [PASS] Seeded patient "Sunita Devi" is visible');

    // Confirm High Risk Badge
    const highRiskBadge = page.locator('div:has(h3:has-text("Sunita Devi")) span:has-text("High Risk")').first();
    await highRiskBadge.waitFor({ state: 'visible', timeout: 5000 });
    console.log('  [PASS] "🔴 High Risk" badge is rendered for Sunita Devi');

    // Confirm Risk Factors Text (Severe Anemia & High Gravida)
    const riskFactor1 = page.locator('text=Severe Anemia (Hb 6.8)').first();
    await riskFactor1.waitFor({ state: 'visible', timeout: 5000 });
    console.log('  [PASS] Risk factor text "Severe Anemia (Hb 6.8)" is visible');

    const riskFactor2 = page.locator('text=High Gravida (>= 5)').first();
    await riskFactor2.waitFor({ state: 'visible', timeout: 5000 });
    console.log('  [PASS] Risk factor text "High Gravida (>= 5)" is visible');

    // ------------------------------------------------------------------
    // Step F: Attempt to Un-Administer Administered Immunization (409 Rejection Surface)
    // ------------------------------------------------------------------
    console.log('\n----------------------------------------------------------------------');
    console.log('STEP F: Verifying Immunization Un-administer Protection Rejection');
    console.log('----------------------------------------------------------------------');
    await page.goto(BASE_URL + '/asha/immunization');
    await page.waitForLoadState('networkidle');
    console.log('  [PASS] Navigated to /asha/immunization');

    // Wait for Aarav Kumar's vaccination history
    const childName = page.locator('h2:has-text("Aarav Kumar")').first();
    await childName.waitFor({ state: 'visible', timeout: 5000 });
    console.log('  [PASS] Selected child profile "Aarav Kumar" is active');

    // Find the BCG vaccination entry and click Edit
    const bcgEntry = page.locator('div:has(h4:has-text("BCG"))').first();
    await bcgEntry.waitFor({ state: 'visible', timeout: 5000 });
    const editBcgBtn = bcgEntry.locator('button[title="Edit Entry"]').first();
    await editBcgBtn.click();
    await page.waitForTimeout(500);

    // Form Modal open - Step 1: Click Next
    await page.click('button:has-text("Next: Administration")');
    await page.waitForTimeout(300);

    // Step 2: Uncheck "Dose Administered"
    const administeredCheckbox = page.locator('#checkbox-administered');
    await administeredCheckbox.waitFor({ state: 'visible', timeout: 3000 });
    await administeredCheckbox.uncheck();
    console.log('  [PASS] Unchecked "Dose Administered" checkbox to attempt un-administering');

    // Click Next: Review
    await page.click('button:has-text("Next: Review")');
    await page.waitForTimeout(300);

    // Step 3: Click Save Changes (submit)
    await page.click('button[type="submit"]:has-text("Save Changes")');
    await page.waitForTimeout(1000);

    // Assert that the rejection error is surfaced in the DOM
    const errorBanner = page.locator('text=Cannot un-administer an immunization record that has already been administered.');
    await errorBanner.waitFor({ state: 'visible', timeout: 5000 });
    console.log('  [PASS] Mock layer rejection surfaced to user: "Cannot un-administer an immunization record that has already been administered."');

    // ------------------------------------------------------------------
    // Step G: Refresh Page & Confirm Data Resets to Initial Seed State
    // ------------------------------------------------------------------
    console.log('\n----------------------------------------------------------------------');
    console.log('STEP G: Verifying In-Memory State Reset Upon Page Refresh');
    console.log('----------------------------------------------------------------------');
    await page.reload();
    await page.waitForLoadState('networkidle');
    console.log('  [PASS] Reloaded the browser page');

    // Navigate to Patients
    await page.goto(BASE_URL + '/asha/patients');
    await page.waitForLoadState('networkidle');

    // Confirm that the patient created in step C (Geeta Sharma) is definitely absent
    const geetaCount = await page.locator(`text="${newPatientName}"`).count();
    if (geetaCount !== 0) throw new Error(`Patient "${newPatientName}" is still present after reload!`);
    console.log(`  [PASS] Patient "${newPatientName}" created during session is completely reset`);

    // Confirm seeded patients are present
    const sunitaExists = await page.locator('text="Sunita Devi"').first().isVisible();
    const aaravExists = await page.locator('text="Aarav Kumar"').first().isVisible();
    if (!sunitaExists || !aaravExists) throw new Error('Original seed patients not found after reload!');
    console.log('  [PASS] Original seed patients (Sunita Devi, Aarav Kumar) are preserved in reset state');

    console.log('\n======================================================================');
    console.log('ALL PLAYWRIGHT DEMO MODE INTERACTIVE VERIFICATION TESTS PASSED (7/7)!');
    console.log('======================================================================');
  } catch (err) {
    console.error('\n[PLAYWRIGHT TEST FAILURE]:', err);
    process.exitCode = 1;
  } finally {
    await browser.close();
  }
}

runInteractiveVerification();
