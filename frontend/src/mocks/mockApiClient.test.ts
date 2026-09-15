import { handleMockRequest } from './mockApiClient';

async function runTests() {
  console.log('=================================================================');
  console.log('TESTING MOCK API LAYER (VITE_DEMO_MODE=true)');
  console.log('=================================================================');

  let passed = 0;
  let total = 0;

  function assert(condition: boolean, testName: string, detail?: any) {
    total++;
    if (condition) {
      console.log(`[PASS] ${testName}`);
      passed++;
    } else {
      console.error(`[FAIL] ${testName}`, detail || '');
    }
  }

  // 1. Health Check
  const health: any = await handleMockRequest('/health');
  assert(health.status === 'UP' && health.service === 'demo-mode', 'Health check returns UP');

  // 2. Auth Logins for All 4 Roles
  const adminLogin: any = await handleMockRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username: 'admin', password: 'Admin@123' }),
  });
  assert(adminLogin.token && adminLogin.user.role === 'ADMIN', 'Admin login successful');

  const supLogin: any = await handleMockRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username: 'vedava', password: 'Vedava@123' }),
  });
  assert(supLogin.token && supLogin.user.role === 'PHC_SUPERVISOR', 'Supervisor login successful');

  const ashaLogin: any = await handleMockRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username: 'anita.devi', password: 'Asha@123' }),
  });
  assert(ashaLogin.token && ashaLogin.user.role === 'ASHA', 'ASHA login successful');

  const pharmLogin: any = await handleMockRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username: 'priya.sharma', password: 'Pharm@123' }),
  });
  assert(pharmLogin.token && pharmLogin.user.role === 'PHARMACIST', 'Pharmacist login successful');

  // Invalid login check
  let loginFailed = false;
  try {
    await handleMockRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username: 'admin', password: 'WrongPassword' }),
    });
  } catch {
    loginFailed = true;
  }
  assert(loginFailed, 'Invalid login rejected with error');

  // 3. Dashboard Summary & Risk Endpoints
  const summary: any = await handleMockRequest('/dashboard/summary');
  assert(
    summary.totalPatients > 0 &&
      summary.activePatients > 0 &&
      summary.highRiskPregnancies > 0 &&
      summary.immunizationsOverdue > 0,
    'Dashboard summary returns non-zero statistics'
  );

  const highRiskPregs: any = await handleMockRequest('/dashboard/maternal/high-risk');
  assert(
    Array.isArray(highRiskPregs) &&
      highRiskPregs.length > 0 &&
      highRiskPregs[0].riskFactors.includes('Anemia'),
    'High-risk pregnancy list returned correctly'
  );

  const overdueImms: any = await handleMockRequest('/dashboard/immunization/overdue');
  assert(
    Array.isArray(overdueImms) &&
      overdueImms.length > 0 &&
      overdueImms.some((i: any) => !i.administered),
    'Overdue immunization list returned'
  );

  // 4. Admin Dashboard Stats (Fictional Placeholders check)
  const adminStats: any = await handleMockRequest('/admin-dashboard-stats');
  assert(
    adminStats.districtIncharge === 'Dr. A. Sample (Demo District Officer)' &&
      adminStats.serverUrl === 'https://demo-health-portal.example.com/api/v1',
    'Admin stats use fictional non-real placeholders'
  );

  // 5. Patients CRUD & Soft-Delete Semantics
  const initialPatients: any = await handleMockRequest('/patients');
  const countBeforePatient = initialPatients.length;

  const newPatient: any = await handleMockRequest('/patients', {
    method: 'POST',
    body: JSON.stringify({
      name: 'Test Demo Patient',
      dateOfBirth: '2000-01-01',
      gender: 'Female',
      phone: '9999988888',
      village: 'Madukkarai',
    }),
  });
  assert(newPatient && newPatient.id && newPatient.active === true, 'Patient created with active=true');

  const afterCreatePatients: any = await handleMockRequest('/patients');
  assert(afterCreatePatients.length === countBeforePatient + 1, 'Patient list includes new patient');

  // Update patient
  const updatedPatient: any = await handleMockRequest(`/patients/${newPatient.id}`, {
    method: 'PUT',
    body: JSON.stringify({ phone: '9999977777' }),
  });
  assert(updatedPatient.phone === '9999977777', 'Patient updated successfully');

  // Soft Delete Patient
  await handleMockRequest(`/patients/${newPatient.id}`, { method: 'DELETE' });
  const afterDeletePatients: any = await handleMockRequest('/patients');
  assert(
    afterDeletePatients.length === countBeforePatient &&
      !afterDeletePatients.some((p: any) => p.id === newPatient.id),
    'Deleted patient excluded from active list (soft-delete)'
  );

  // 6. Priority Visits CRUD (README Demo Flow)
  const initialVisits: any = await handleMockRequest('/priority-visits');
  const countBeforeVisit = initialVisits.length;

  const newVisit: any = await handleMockRequest('/priority-visits', {
    method: 'POST',
    body: JSON.stringify({
      patientName: 'Sunita Devi',
      village: 'Madukkarai',
      ashaId: '3',
      ashaName: 'Anita Devi',
      condition: 'Emergency BP Followup',
      urgency: 'Critical',
      notes: 'Check BP and pulse',
    }),
  });
  assert(newVisit && newVisit.id && newVisit.status === 'Pending', 'Priority visit created');

  const updatedVisit: any = await handleMockRequest(`/priority-visits/${newVisit.id}`, {
    method: 'PUT',
    body: JSON.stringify({ status: 'Completed' }),
  });
  assert(updatedVisit.status === 'Completed', 'Priority visit status updated to Completed');

  await handleMockRequest(`/priority-visits/${newVisit.id}`, { method: 'DELETE' });
  const afterDeleteVisits: any = await handleMockRequest('/priority-visits');
  assert(afterDeleteVisits.length === countBeforeVisit, 'Priority visit removed (hard delete)');

  // 7. Immunization Protection Semantics
  // Administered record rejection for administered=false
  let unadministerFalseFailed = false;
  try {
    await handleMockRequest('/immunizations/1', {
      method: 'PUT',
      body: JSON.stringify({ administered: false }),
    });
  } catch (err: any) {
    unadministerFalseFailed = err.status === 409 || err.message.includes('Cannot un-administer');
  }
  assert(unadministerFalseFailed, 'Administered immunization rejects administered=false with 409');

  // Administered record rejection for administered=null
  let unadministerNullFailed = false;
  try {
    await handleMockRequest('/immunizations/1', {
      method: 'PUT',
      body: JSON.stringify({ administered: null }),
    });
  } catch (err: any) {
    unadministerNullFailed = err.status === 409 || err.message.includes('Cannot un-administer');
  }
  assert(unadministerNullFailed, 'Administered immunization rejects administered=null with 409');

  // Administered record delete rejection
  let deleteAdministeredFailed = false;
  try {
    await handleMockRequest('/immunizations/1', { method: 'DELETE' });
  } catch (err: any) {
    deleteAdministeredFailed = err.status === 409 || err.message.includes('Cannot delete');
  }
  assert(deleteAdministeredFailed, 'Administered immunization rejects DELETE with 409');

  // Non-administered record delete allowed
  const beforeNonAdmin = (await handleMockRequest<any[]>('/immunizations/upcoming')).length;
  await handleMockRequest('/immunizations/3', { method: 'DELETE' });
  const afterNonAdmin = (await handleMockRequest<any[]>('/immunizations/upcoming')).length;
  assert(afterNonAdmin === beforeNonAdmin - 1, 'Non-administered immunization record can be deleted');

  // 8. Soft Delete Semantics for Households, Pregnancies, ANC Visits, Nutrition, Medicine Issues
  // Household Soft Delete & HouseholdResponseDTO field-for-field check
  const initialHhs: any = await handleMockRequest('/households');
  assert(initialHhs.length > 0 && typeof initialHhs[0].toilet === 'boolean', 'Household toilet is boolean per HouseholdResponseDTO');
  assert('householdNumber' in initialHhs[0] && 'headName' in initialHhs[0] && 'village' in initialHhs[0], 'Household has all DTO fields');

  const testHh: any = await handleMockRequest('/households', {
    method: 'POST',
    body: JSON.stringify({ householdNumber: 'HH-TEST-01', headName: 'Test Head', village: 'Madukkarai', toilet: true }),
  });
  assert(testHh.toilet === true, 'Household created with boolean toilet=true');
  await handleMockRequest(`/households/${testHh.id}`, { method: 'DELETE' });
  const afterHhs: any = await handleMockRequest('/households');
  assert(!afterHhs.some((h: any) => h.id === testHh.id), 'Household soft-deleted and filtered from active list');

  // Pregnancy Soft Delete
  const testPreg: any = await handleMockRequest('/pregnancies', {
    method: 'POST',
    body: JSON.stringify({ patientId: 1, lastMenstrualPeriod: '2026-03-01', gravida: 2, para: 1 }),
  });
  assert(testPreg.active === true, 'Pregnancy created with active=true');
  await handleMockRequest(`/pregnancies/${testPreg.id}`, { method: 'DELETE' });
  const afterPregs: any = await handleMockRequest('/pregnancies');
  assert(!afterPregs.some((p: any) => p.id === testPreg.id), 'Pregnancy soft-deleted and filtered from active list');

  // Nutrition Soft Delete
  const testNut: any = await handleMockRequest('/nutrition-records', {
    method: 'POST',
    body: JSON.stringify({ patientId: 2, weightKg: 9.0, heightCm: 78.0, muacCm: 12.0, ageMonths: 15 }),
  });
  assert(testNut.active === 1, 'Nutrition record created with active=1');
  await handleMockRequest(`/nutrition-records/${testNut.id}`, { method: 'DELETE' });
  const afterNuts: any = await handleMockRequest('/nutrition-records');
  assert(!afterNuts.some((n: any) => n.id === testNut.id), 'Nutrition record soft-deleted and filtered from active list');

  // Medicine Issue Soft Delete
  const testMedIssue: any = await handleMockRequest('/medicine-issues', {
    method: 'POST',
    body: JSON.stringify({ patientId: 1, medicineName: 'IFA', quantity: 30 }),
  });
  assert(testMedIssue.active === 1, 'Medicine issue record created with active=1');
  await handleMockRequest(`/medicine-issues/${testMedIssue.id}`, { method: 'DELETE' });
  const afterIssues: any = await handleMockRequest('/medicine-issues');
  assert(!afterIssues.some((m: any) => m.id === testMedIssue.id), 'Medicine issue soft-deleted and filtered from active list');

  // 10. AI Prioritized Visits Endpoints
  const aiVisits: any = await handleMockRequest('/ai/visits/prioritized');
  assert(
    Array.isArray(aiVisits) &&
      aiVisits.length >= 2 &&
      aiVisits.some((v: any) => v.patientName === 'Sunita Devi' && v.priorityLevel === 'CRITICAL') &&
      aiVisits.some((v: any) => v.patientName === 'Aarav Kumar' && v.priorityLevel === 'HIGH'),
    'AI prioritized visits returns valid array with seeded high-risk patients'
  );

  console.log('=================================================================');
  console.log(`TEST EXECUTION SUMMARY: ${passed} / ${total} PASSED`);
  console.log('=================================================================');

  if (passed !== total) {
    process.exit(1);
  }
}

runTests().catch((e) => {
  console.error('Fatal error running tests:', e);
  process.exit(1);
});
