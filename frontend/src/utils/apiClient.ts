export const API_BASE_URL = '';

// Helper to get stored JWT token
export const getAuthToken = (): string | null => {
  return sessionStorage.getItem('asha_ehr_token') || localStorage.getItem('asha_ehr_token');
};

// In-flight GET request map to prevent duplicate concurrent network requests
const inFlightGetRequests = new Map<string, Promise<any>>();

async function executeRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;
  
  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    if (response.status === 401) {
      // Clear stale tokens
      localStorage.removeItem('asha_ehr_token');
      sessionStorage.removeItem('asha_ehr_token');
      window.dispatchEvent(new Event('auth_logout'));
    }
    let errorMessage = `HTTP Error ${response.status}: ${response.statusText}`;
    try {
      const errorJson = await response.json();
      if (errorJson.message) {
        errorMessage = errorJson.message;
      }
    } catch {
      // Ignore JSON parse error on non-json body
    }
    throw new Error(errorMessage);
  }

  // Handle empty 204 or empty string body
  const text = await response.text();
  return (text ? JSON.parse(text) : {}) as T;
}

// Generic fetch wrapper with automatic JWT header, JSON error parsing, and in-flight GET deduplication
export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const method = (options.method || 'GET').toUpperCase();

  // Deduplicate identical in-flight GET requests
  if (method === 'GET') {
    const key = `${endpoint}`;
    if (inFlightGetRequests.has(key)) {
      return inFlightGetRequests.get(key) as Promise<T>;
    }
    const requestPromise = (async () => {
      try {
        return await executeRequest<T>(endpoint, options);
      } finally {
        inFlightGetRequests.delete(key);
      }
    })();
    inFlightGetRequests.set(key, requestPromise);
    return requestPromise;
  }

  return executeRequest<T>(endpoint, options);
}

// ----------------- Auth API -----------------
export const authApi = {
  login: async (credentials: { username: string; password: string }) => {
    return apiRequest<{
      token: string;
      user: {
        id: number;
        name: string;
        username: string;
        role: string;
        phcId?: string;
      };
    }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  },

  register: async (data: {
    name: string;
    username: string;
    password: string;
    phone?: string;
    phcId?: string;
  }) => {
    return apiRequest<any>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  changePassword: async (data: { newPassword: string; oldPassword?: string }) => {
    return apiRequest<{ message: string }>('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  getProfile: async () => {
    return apiRequest<any>('/users/profile');
  },

  checkHealth: async () => {
    return apiRequest<{ status: string; service: string }>('/health');
  },
};

// ----------------- Dashboard & Reports API -----------------
export const dashboardApi = {
  getSummary: async () => {
    return apiRequest<any>('/dashboard/summary');
  },
  getOverview: async () => {
    return apiRequest<any>('/dashboard/overview');
  },
  getDashboardAlerts: async () => {
    return apiRequest<any[]>('/dashboard/alerts');
  },
  getHighRiskPregnancies: async () => {
    return apiRequest<any[]>('/dashboard/maternal/high-risk');
  },
  getOverdueImmunizations: async () => {
    return apiRequest<any[]>('/dashboard/immunization/overdue');
  },
  getHighRiskNutrition: async () => {
    return apiRequest<any[]>('/dashboard/nutrition/high-risk');
  },
  getLowStockMedicines: async () => {
    return apiRequest<any[]>('/dashboard/medicines/low-stock');
  },
  getPatientReport: async () => {
    return apiRequest<any>('/reports/patients');
  },
  getMaternalReport: async () => {
    return apiRequest<any>('/reports/maternal');
  },
  getImmunizationReport: async () => {
    return apiRequest<any>('/reports/immunization');
  },
  getNutritionReport: async () => {
    return apiRequest<any>('/reports/nutrition');
  },
  getMedicineReport: async () => {
    return apiRequest<any>('/reports/medicines');
  },
};

// ----------------- Patients API -----------------
export const patientApi = {
  getAll: async () => {
    return apiRequest<any[]>('/patients');
  },
  getById: async (id: number | string) => {
    return apiRequest<any>(`/patients/${id}`);
  },
  create: async (patient: {
    name: string;
    dateOfBirth: string;
    gender: string;
    phone?: string;
    address?: string;
    village?: string;
    emergencyContact?: string;
  }) => {
    return apiRequest<any>('/patients', {
      method: 'POST',
      body: JSON.stringify(patient),
      headers: {
        'Content-Type': 'application/json',
      },
    });
  },
  update: async (id: number | string, patient: {
    name?: string;
    dateOfBirth?: string;
    gender?: string;
    phone?: string;
    address?: string;
    village?: string;
    emergencyContact?: string;
  }) => {
    return apiRequest<any>(`/patients/${id}`, {
      method: 'PUT',
      body: JSON.stringify(patient),
    });
  },
  delete: async (id: number | string) => {
    return apiRequest<void>(`/patients/${id}`, {
      method: 'DELETE',
    });
  },
};

// ----------------- Maternal & Pregnancy API -----------------
export const maternalApi = {
  getAllPregnancies: async () => {
    return apiRequest<any[]>('/pregnancies');
  },
  getPregnancyById: async (id: number | string) => {
    return apiRequest<any>(`/pregnancies/${id}`);
  },
  createPregnancy: async (pregnancy: {
    patientId: number;
    lastMenstrualPeriod: string;
    gravida: number;
    para: number;
    bloodGroup?: string;
    pregnancyStatus?: string;
  }) => {
    return apiRequest<any>('/pregnancies', {
      method: 'POST',
      body: JSON.stringify(pregnancy),
    });
  },
  updatePregnancy: async (id: number | string, pregnancy: {
    patientId?: number;
    lastMenstrualPeriod?: string;
    gravida?: number;
    para?: number;
    bloodGroup?: string;
    pregnancyStatus?: string;
  }) => {
    return apiRequest<any>(`/pregnancies/${id}`, {
      method: 'PUT',
      body: JSON.stringify(pregnancy),
    });
  },
  deletePregnancy: async (id: number | string) => {
    return apiRequest<void>(`/pregnancies/${id}`, {
      method: 'DELETE',
    });
  },
  recordVisit: async (
    pregnancyId: number | string,
    visit: {
      visitDate: string;
      weight?: number;
      systolicBp?: number;
      diastolicBp?: number;
      hemoglobin?: number;
      fetalHeartRate?: number;
      dangerSigns?: string;
      symptoms?: string;
      clinicalNotes?: string;
      nextVisitDate?: string;
    }
  ) => {
    return apiRequest<any>(`/pregnancies/${pregnancyId}/visits`, {
      method: 'POST',
      body: JSON.stringify(visit),
    });
  },
};

// ----------------- Immunization API -----------------
export const immunizationApi = {
  getVaccines: async () => {
    return apiRequest<any[]>('/vaccines');
  },
  getPatientImmunizations: async (patientId: number | string) => {
    return apiRequest<any[]>(`/immunizations/patient/${patientId}`);
  },
  recordImmunization: async (record: {
    patientId: number;
    vaccineId: number;
    doseNumber: number;
    administeredDate?: string;
    administered: boolean;
    batchNumber?: string;
    notes?: string;
  }) => {
    return apiRequest<any>('/immunizations', {
      method: 'POST',
      body: JSON.stringify(record),
    });
  },
  updateImmunization: async (id: number | string, record: any) => {
    return apiRequest<any>(`/immunizations/${id}`, {
      method: 'PUT',
      body: JSON.stringify(record),
    });
  },
  deleteImmunization: async (id: number | string) => {
    return apiRequest<void>(`/immunizations/${id}`, {
      method: 'DELETE',
    });
  },
  getUpcoming: async () => {
    return apiRequest<any[]>('/immunizations/upcoming');
  },
  getOverdue: async () => {
    return apiRequest<any[]>('/immunizations/overdue');
  },
};

// ----------------- Child Nutrition API -----------------
export const nutritionApi = {
  getAll: async () => {
    return apiRequest<any[]>('/nutrition-records');
  },
  getById: async (id: number | string) => {
    return apiRequest<any>(`/nutrition-records/${id}`);
  },
  getPatientRecords: async (patientId: number | string) => {
    return apiRequest<any[]>(`/nutrition-records/patient/${patientId}`);
  },
  createRecord: async (record: {
    patientId: number;
    measurementDate: string;
    weightKg: number;
    heightCm: number;
    muacCm?: number;
    ageMonths: number;
    feedingType?: string;
    notes?: string;
  }) => {
    return apiRequest<any>('/nutrition-records', {
      method: 'POST',
      body: JSON.stringify(record),
    });
  },
  updateRecord: async (id: number | string, record: {
    patientId?: number;
    measurementDate?: string;
    weightKg?: number;
    heightCm?: number;
    muacCm?: number;
    ageMonths?: number;
    feedingType?: string;
    notes?: string;
  }) => {
    return apiRequest<any>(`/nutrition-records/${id}`, {
      method: 'PUT',
      body: JSON.stringify(record),
    });
  },
  deleteRecord: async (id: number | string) => {
    return apiRequest<void>(`/nutrition-records/${id}`, {
      method: 'DELETE',
    });
  },
};

// ----------------- Pharmacy & Medicine Inventory API -----------------
export const pharmacyApi = {
  getMedicines: async () => {
    return apiRequest<any[]>('/medicines');
  },
  createMedicine: async (med: {
    name: string;
    code: string;
    genericName?: string;
    category?: string;
    dosageForm?: string;
    strength?: string;
    unit?: string;
    reorderLevel: number;
  }) => {
    return apiRequest<any>('/medicines', {
      method: 'POST',
      body: JSON.stringify(med),
    });
  },
  updateMedicine: async (id: number | string, med: {
    name: string;
    code: string;
    genericName?: string;
    category?: string;
    dosageForm?: string;
    strength?: string;
    unit?: string;
    reorderLevel: number;
  }) => {
    return apiRequest<any>(`/medicines/${id}`, {
      method: 'PUT',
      body: JSON.stringify(med),
    });
  },
  deleteMedicine: async (id: number | string) => {
    return apiRequest<void>(`/medicines/${id}`, {
      method: 'DELETE',
    });
  },
  getBatches: async () => {
    return apiRequest<any[]>('/medicine-batches');
  },
  receiveBatch: async (batch: {
    medicineId: number;
    batchNumber: string;
    quantity: number;
    expiryDate: string;
    manufacturingDate?: string;
    unit?: string;
    phcId?: string;
  }) => {
    return apiRequest<any>('/medicine-batches', {
      method: 'POST',
      body: JSON.stringify(batch),
    });
  },
  dispenseStock: async (dispense: {
    batchId: number;
    quantity: number;
    patientId?: number;
    reason?: string;
    reference?: string;
  }) => {
    return apiRequest<any>('/medicine-transactions/dispense', {
      method: 'POST',
      body: JSON.stringify(dispense),
    });
  },
  getLowStock: async () => {
    return apiRequest<any[]>('/medicine-stock/low-stock');
  },
  getExpiringSoon: async () => {
    return apiRequest<any[]>('/medicine-stock/expiring-soon');
  },
};

// ----------------- PHC & Users Management API -----------------
export const adminApi = {
  getPHCs: async () => {
    return apiRequest<any[]>('/phcs');
  },
  createPHC: async (phc: {
    name: string;
    code: string;
    district: string;
    block: string;
  }) => {
    return apiRequest<any>('/phcs', {
      method: 'POST',
      body: JSON.stringify(phc),
    });
  },
  updatePHC: async (id: number | string, phc: {
    name: string;
    code: string;
    district: string;
    block?: string;
  }) => {
    return apiRequest<any>(`/phcs/${id}`, {
      method: 'PUT',
      body: JSON.stringify({
        ...phc,
        block: phc.block || phc.district
      }),
    });
  },
  deletePHC: async (id: number | string) => {
    return apiRequest<void>(`/phcs/${id}`, {
      method: 'DELETE',
    });
  },
  getUsers: async () => {
    return apiRequest<any[]>('/users');
  },
  createUser: async (user: {
    name: string;
    username: string;
    password: string;
    role: string;
    phcId: string;
    phone?: string;
  }) => {
    return apiRequest<any>('/users', {
      method: 'POST',
      body: JSON.stringify(user),
    });
  },
  updateUser: async (id: number | string, user: {
    name?: string;
    phcId?: string;
    phone?: string;
    location?: string;
    status?: string;
  }) => {
    return apiRequest<any>(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(user),
    });
  },
  deleteUser: async (id: number | string) => {
    return apiRequest<void>(`/users/${id}`, {
      method: 'DELETE',
    });
  },
  
  // Custom Roles & Permissions
  getRolesPermissions: async () => {
    return apiRequest<any[]>('/roles');
  },
  createRolePermission: async (role: {
    role: string;
    description: string;
    permissions: string[];
  }) => {
    return apiRequest<any>('/roles', {
      method: 'POST',
      body: JSON.stringify(role),
    });
  },
  updateRolePermission: async (id: number | string, role: {
    role: string;
    description: string;
    permissions: string[];
  }) => {
    return apiRequest<any>(`/roles/${id}`, {
      method: 'PUT',
      body: JSON.stringify(role),
    });
  },
  deleteRolePermission: async (id: number | string) => {
    return apiRequest<void>(`/roles/${id}`, {
      method: 'DELETE',
    });
  },

  // System Settings
  getSystemSettings: async () => {
    return apiRequest<any>('/settings');
  },
  saveSystemSettings: async (settings: {
    offlineTtl: number;
    maxDbSize: number;
    compressionRatio: string;
    biometricLock: boolean;
    districtIncharge: string;
    backupSchedule: string;
    serverUrl: string;
  }) => {
    return apiRequest<any>('/settings', {
      method: 'PUT',
      body: JSON.stringify(settings),
    });
  },

  // Audit Logs
  getAuditLogs: async () => {
    return apiRequest<any[]>('/audit-logs');
  },
  purgeAuditLogs: async () => {
    return apiRequest<void>('/audit-logs', {
      method: 'DELETE',
    });
  },

  // Admin Dashboard Statistics
  getAdminDashboardStats: async () => {
    return apiRequest<any>('/admin-dashboard-stats');
  },
};

// ----------------- AI Decision Support API -----------------
export const aiApi = {
  getMaternalAIRisk: async (pregnancyId: number | string) => {
    return apiRequest<any>(`/ai/maternal/${pregnancyId}/risk`);
  },
  getImmunizationAIRisk: async (patientId: number | string) => {
    return apiRequest<any>(`/ai/immunization/${patientId}/risk`);
  },
  getNutritionAIRisk: async (patientId: number | string) => {
    return apiRequest<any>(`/ai/nutrition/${patientId}/risk`);
  },
  getMedicineDemandForecast: async (medicineCode: string) => {
    return apiRequest<any>(`/ai/medicine/${medicineCode}/forecast`);
  },
  getMedicineExpiryRisk: async (medicineCode: string) => {
    return apiRequest<any>(`/ai/medicine/${medicineCode}/expiry-risk`);
  },
  getPatientAIOverview: async (patientId: number | string) => {
    return apiRequest<any>(`/ai/patient/${patientId}/overview`);
  },
  getAIDashboardSummary: async () => {
    return apiRequest<any>('/ai/dashboard/summary');
  },
  getPrioritizedVisits: async () => {
    return apiRequest<any[]>('/ai/visits/prioritized');
  },
};

// ----------------- Priority Visits API -----------------
export const priorityVisitApi = {
  getAll: async () => {
    return apiRequest<any[]>('/priority-visits');
  },
  getById: async (id: number | string) => {
    return apiRequest<any>(`/priority-visits/${id}`);
  },
  create: async (visit: {
    patientName: string;
    village: string;
    ashaId: string;
    ashaName: string;
    condition: string;
    urgency: string;
    notes: string;
  }) => {
    return apiRequest<any>('/priority-visits', {
      method: 'POST',
      body: JSON.stringify(visit),
    });
  },
  update: async (id: number | string, visit: Partial<{
    patientName: string;
    village: string;
    ashaId: string;
    ashaName: string;
    condition: string;
    urgency: string;
    status: string;
    notes: string;
  }>) => {
    return apiRequest<any>(`/priority-visits/${id}`, {
      method: 'PUT',
      body: JSON.stringify(visit),
    });
  },
  delete: async (id: number | string) => {
    return apiRequest<any>(`/priority-visits/${id}`, {
      method: 'DELETE',
    });
  },
};

// ----------------- EHR Records API -----------------
export const ehrRecordApi = {
  getAll: async () => {
    return apiRequest<any[]>('/ehr-records');
  },
  create: async (record: any) => {
    return apiRequest<any>('/ehr-records', {
      method: 'POST',
      body: JSON.stringify(record),
    });
  },
  update: async (recordId: string, updateData: any) => {
    return apiRequest<any>(`/ehr-records/${recordId}`, {
      method: 'PUT',
      body: JSON.stringify(updateData),
    });
  },
};

// ----------------- Households API -----------------
export const householdApi = {
  getAll: async () => {
    return apiRequest<any[]>('/households');
  },
  getById: async (id: number | string) => {
    return apiRequest<any>(`/households/${id}`);
  },
  create: async (hh: {
    householdNumber: string;
    headName: string;
    village: string;
    membersCount: number;
    category: string;
    waterSource: string;
    toilet: boolean;
  }) => {
    return apiRequest<any>('/households', {
      method: 'POST',
      body: JSON.stringify(hh),
    });
  },
  update: async (id: number | string, hh: {
    householdNumber: string;
    headName: string;
    village: string;
    membersCount: number;
    category: string;
    waterSource: string;
    toilet: boolean;
  }) => {
    return apiRequest<any>(`/households/${id}`, {
      method: 'PUT',
      body: JSON.stringify(hh),
    });
  },
  delete: async (id: number | string) => {
    return apiRequest<void>(`/households/${id}`, {
      method: 'DELETE',
    });
  },
};

// ----------------- Medicine Issues API -----------------
export const medicineIssueApi = {
  getAll: async () => {
    return apiRequest<any[]>('/medicine-issues');
  },
  getByPatientId: async (patientId: number | string) => {
    return apiRequest<any[]>(`/medicine-issues/patient/${patientId}`);
  },
  create: async (record: {
    patientId: number;
    patientName: string;
    medicineName: string;
    quantity: number;
    dosageInstructions: string;
    issueDate: string;
  }) => {
    return apiRequest<any>('/medicine-issues', {
      method: 'POST',
      body: JSON.stringify(record),
    });
  },
  update: async (id: number | string, record: {
    patientId: number;
    patientName: string;
    medicineName: string;
    quantity: number;
    dosageInstructions: string;
    issueDate: string;
  }) => {
    return apiRequest<any>(`/medicine-issues/${id}`, {
      method: 'PUT',
      body: JSON.stringify(record),
    });
  },
  delete: async (id: number | string) => {
    return apiRequest<void>(`/medicine-issues/${id}`, {
      method: 'DELETE',
    });
  },
};

// ----------------- Antenatal Visits API -----------------
export const visitApi = {
  getAll: async () => {
    return apiRequest<any[]>('/antenatal-visits');
  },
  getById: async (id: number | string) => {
    return apiRequest<any>(`/antenatal-visits/${id}`);
  },
  getByPregnancyId: async (pregnancyId: number | string) => {
    return apiRequest<any[]>(`/pregnancies/${pregnancyId}/visits`);
  },
  create: async (pregnancyId: number | string, visit: any) => {
    return apiRequest<any>(`/pregnancies/${pregnancyId}/visits`, {
      method: 'POST',
      body: JSON.stringify(visit),
    });
  },
  update: async (id: number | string, visit: any) => {
    return apiRequest<any>(`/antenatal-visits/${id}`, {
      method: 'PUT',
      body: JSON.stringify(visit),
    });
  },
  delete: async (id: number | string) => {
    return apiRequest<void>(`/antenatal-visits/${id}`, {
      method: 'DELETE',
    });
  },
};
