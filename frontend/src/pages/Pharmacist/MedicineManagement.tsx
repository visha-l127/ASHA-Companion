import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { pharmacyApi } from '../../utils/apiClient';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle, 
  CardFooter,
  Badge, 
  Button, 
  Input, 
  Select 
} from '../../components/ui';
import { PageHeader } from '../../components/PageHeader';
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  X, 
  Filter, 
  AlertTriangle, 
  Pill, 
  Tag, 
  CheckCircle2, 
  ShieldAlert
} from 'lucide-react';

export interface Medicine {
  id: string;
  code?: string;
  name: string;
  category: string;
  stock: number;
  minThreshold: number;
  unit: string;
  price: number;
  lastUpdated: string;
}

const medicineFormSchema = z.object({
  name: z.string().min(2, 'Drug name must be at least 2 characters'),
  category: z.string().min(1, 'Please select a drug category'),
  minThreshold: z.coerce.number().int().min(1, 'Minimum threshold must be at least 1'),
  unit: z.string().min(1, 'Please specify unit (e.g. Tablets, Vials)'),
  price: z.coerce.number().min(0.01, 'Price must be greater than 0'),
});

type MedicineFormValues = z.infer<typeof medicineFormSchema>;

const CATEGORY_OPTIONS = [
  { value: 'Analgesic', label: 'Analgesic' },
  { value: 'Supplements', label: 'Supplements' },
  { value: 'Vaccine', label: 'Vaccine' },
  { value: 'Antibiotic', label: 'Antibiotic' },
  { value: 'Dehydration', label: 'Dehydration' },
  { value: 'Other', label: 'Other' }
];

export default function MedicineManagement() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingMedicine, setEditingMedicine] = useState<Medicine | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  // Search and Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedStockStatus, setSelectedStockStatus] = useState('All'); 

  // Delete confirmation state
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<any>({
    resolver: zodResolver(medicineFormSchema),
    defaultValues: {
      name: '',
      category: 'Analgesic',
      minThreshold: 100,
      unit: 'Tablets',
      price: 1.5,
    }
  });

  useEffect(() => {
    refreshMedicines();
    
    if (searchParams.get('action') === 'new') {
      handleOpenNewForm();
    }
  }, []);

  const refreshMedicines = async () => {
    try {
      setErrorMessage(null);
      const dbMeds = await pharmacyApi.getMedicines();
      const dbBatches = await pharmacyApi.getBatches();
      
      const mapped = dbMeds.map((m: any) => {
        const medBatches = dbBatches.filter((b: any) => String(b.medicineId) === String(m.id) && b.status !== 'Expired');
        const totalStock = medBatches.reduce((acc, curr) => acc + (curr.quantity || 0), 0);
        return {
          id: String(m.id),
          code: m.code || `MED-${m.id}`,
          name: m.name,
          category: m.category || 'Other',
          stock: totalStock,
          minThreshold: m.reorderLevel || 100,
          unit: m.unit || 'Tablets',
          price: 1.5,
          lastUpdated: 'Just now'
        };
      });
      setMedicines(mapped);
    } catch (e: any) {
      console.error(e);
      setErrorMessage(e.message || "Failed to sync medicines catalog with backend.");
    }
  };

  const handleOpenNewForm = () => {
    setEditingMedicine(null);
    reset({
      name: '',
      category: 'Analgesic',
      minThreshold: 100,
      unit: 'Tablets',
      price: 1.5,
    });
    setIsFormOpen(true);
  };

  const handleOpenEditForm = (med: Medicine) => {
    setEditingMedicine(med);
    reset({
      name: med.name,
      category: med.category,
      minThreshold: med.minThreshold,
      unit: med.unit,
      price: med.price,
    });
    setIsFormOpen(true);
  };

  const onSubmitForm = async (data: MedicineFormValues) => {
    try {
      setErrorMessage(null);
      const drugCode = editingMedicine?.code || `DRUG-${data.name.substring(0, 4).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`;
      if (editingMedicine) {
        await pharmacyApi.updateMedicine(editingMedicine.id, {
          name: data.name,
          code: drugCode,
          category: data.category,
          unit: data.unit,
          reorderLevel: data.minThreshold,
        });
      } else {
        await pharmacyApi.createMedicine({
          name: data.name,
          code: drugCode,
          category: data.category,
          unit: data.unit,
          reorderLevel: data.minThreshold,
        });
      }
      setIsFormOpen(false);
      refreshMedicines();
    } catch (e: any) {
      console.error(e);
      setErrorMessage(e.message || "Failed to save medicine catalog record on backend.");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      setErrorMessage(null);
      await pharmacyApi.deleteMedicine(id);
      setConfirmDeleteId(null);
      refreshMedicines();
    } catch (e: any) {
      console.error(e);
      setErrorMessage(e.message || "Failed to delete medicine from backend.");
    }
  };

  // KPI Calculations
  const totalItems = medicines.length;
  const totalStockUnits = medicines.reduce((acc, m) => acc + m.stock, 0);
  const lowStockItems = medicines.filter(m => m.stock < m.minThreshold && m.stock > 0);
  const stockoutItems = medicines.filter(m => m.stock === 0);
  const totalValue = medicines.reduce((acc, m) => acc + (m.stock * m.price), 0);

  // Filter medicines based on search and selected options
  const filteredMedicines = medicines.filter(med => {
    const matchesSearch = med.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          med.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          med.category.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategory === 'All' || med.category === selectedCategory;
    
    let matchesStock = true;
    if (selectedStockStatus === 'Low Stock') {
      matchesStock = med.stock < med.minThreshold && med.stock > 0;
    } else if (selectedStockStatus === 'Stockout') {
      matchesStock = med.stock === 0;
    } else if (selectedStockStatus === 'Sufficient') {
      matchesStock = med.stock >= med.minThreshold;
    }

    return matchesSearch && matchesCategory && matchesStock;
  });

  return (
    <div className="space-y-6 pb-8">
      {/* Page Title & Action */}
      <PageHeader
        title="Medicine Master Catalog"
        description="Configure primary sub-center therapeutics, dosage units, unit pricing, and minimum safety stock replenishment triggers."
        breadcrumbs={[
          { label: 'Dashboard', to: '/pharmacist/dashboard' },
          { label: 'Medicine Catalog' }
        ]}
        action={{
          label: 'Register New Medicine',
          icon: Plus,
          onClick: handleOpenNewForm
        }}
      />

      {errorMessage && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs font-bold flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-600" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Catalog KPI Metrics Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="hover:border-teal-200 transition-all">
          <CardContent className="p-4 flex items-center space-x-3.5">
            <div className="p-3 bg-teal-50 text-teal-600 rounded-2xl shrink-0">
              <Pill className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Catalog Items</p>
              <h4 className="text-xl font-black text-slate-800">{totalItems}</h4>
              <p className="text-[10px] text-teal-600 font-bold mt-0.5">{totalStockUnits.toLocaleString()} total units in stock</p>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:border-emerald-200 transition-all">
          <CardContent className="p-4 flex items-center space-x-3.5">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl shrink-0">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Sufficient Stock</p>
              <h4 className="text-xl font-black text-slate-800">{medicines.filter(m => m.stock >= m.minThreshold).length}</h4>
              <p className="text-[10px] text-emerald-600 font-bold mt-0.5">Above minimum safety threshold</p>
            </div>
          </CardContent>
        </Card>

        <Card className={`hover:border-amber-200 transition-all ${lowStockItems.length > 0 ? 'bg-amber-50/20' : ''}`}>
          <CardContent className="p-4 flex items-center space-x-3.5">
            <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl shrink-0">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Low Stock Warnings</p>
              <h4 className={`text-xl font-black ${lowStockItems.length > 0 ? 'text-amber-600' : 'text-slate-800'}`}>
                {lowStockItems.length}
              </h4>
              <p className="text-[10px] text-amber-700 font-bold mt-0.5">Below safety thresholds</p>
            </div>
          </CardContent>
        </Card>

        <Card className={`hover:border-rose-200 transition-all ${stockoutItems.length > 0 ? 'bg-rose-50/20' : ''}`}>
          <CardContent className="p-4 flex items-center space-x-3.5">
            <div className="p-3 bg-rose-50 text-rose-600 rounded-2xl shrink-0">
              <ShieldAlert className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Stockouts (Zero)</p>
              <h4 className={`text-xl font-black ${stockoutItems.length > 0 ? 'text-rose-600' : 'text-slate-800'}`}>
                {stockoutItems.length}
              </h4>
              <p className="text-[10px] text-rose-600 font-bold mt-0.5">Est. Total Valuation: ₹{totalValue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Multi-Filter Station */}
      <Card className="border-slate-100 shadow-sm bg-slate-50/40">
        <CardContent className="p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search by drug name, medicine ID, category..."
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/10 focus:border-teal-600 placeholder:text-slate-400"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex flex-wrap gap-3 w-full md:w-auto">
            {/* Category Filter */}
            <div className="flex items-center space-x-2 bg-white px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold">
              <Filter className="h-3.5 w-3.5 text-slate-400" />
              <select
                className="bg-transparent border-none text-slate-700 focus:outline-none cursor-pointer"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="All">All Categories</option>
                {CATEGORY_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            {/* Stock Status Filter */}
            <div className="flex items-center space-x-2 bg-white px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold">
              <AlertTriangle className="h-3.5 w-3.5 text-slate-400" />
              <select
                className="bg-transparent border-none text-slate-700 focus:outline-none cursor-pointer"
                value={selectedStockStatus}
                onChange={(e) => setSelectedStockStatus(e.target.value)}
              >
                <option value="All">All Stock Levels</option>
                <option value="Sufficient">Sufficient Inventory</option>
                <option value="Low Stock">Low Stock Warning</option>
                <option value="Stockout">Out of Stock (Zero)</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Table Card */}
      <Card className="border-slate-100 shadow-sm">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/70 text-slate-500 font-bold uppercase tracking-wider">
                  <th className="p-4">Drug Specification</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Stock on Hand</th>
                  <th className="p-4">Safety Meter</th>
                  <th className="p-4">Unit Price</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredMedicines.map((med) => {
                  const isOut = med.stock === 0;
                  const isLow = med.stock < med.minThreshold && !isOut;
                  const ratio = Math.min(100, Math.round((med.stock / med.minThreshold) * 100));

                  return (
                    <tr key={med.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center space-x-3">
                          <div className={`p-2.5 rounded-xl ${
                             isOut ? 'bg-rose-50 text-rose-600' : isLow ? 'bg-amber-50 text-amber-600' : 'bg-teal-50 text-teal-600'
                          }`}>
                            <Pill className="h-4 w-4" />
                          </div>
                          <div>
                            <span className="font-extrabold text-slate-800 text-sm block">{med.name}</span>
                            <span className="text-[10px] text-slate-400 font-mono">ID: {med.id} | Code: {med.code}</span>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="inline-flex items-center text-slate-700 font-semibold bg-slate-50 border border-slate-200 px-2.5 py-0.5 rounded-lg text-[10px]">
                          <Tag className="h-2.5 w-2.5 mr-1 text-slate-400" />
                          {med.category}
                        </span>
                      </td>
                      <td className="p-4 font-extrabold text-slate-800 text-sm">
                        {med.stock.toLocaleString()} <span className="text-[10px] text-slate-400 font-semibold">{med.unit}</span>
                      </td>
                      <td className="p-4 min-w-[120px]">
                        <div className="flex items-center space-x-2">
                          <div className="w-16 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                            <div 
                              className={`h-1.5 rounded-full ${
                                isOut ? 'bg-rose-500' : isLow ? 'bg-amber-500' : 'bg-teal-500'
                              }`} 
                              style={{ width: `${ratio}%` }}
                            />
                          </div>
                          <span className="font-bold text-[10px] text-slate-500">{ratio}%</span>
                        </div>
                      </td>
                      <td className="p-4 font-bold text-slate-800 text-sm">
                        ₹{med.price.toFixed(2)}
                      </td>
                      <td className="p-4">
                        {isOut ? (
                          <Badge variant="danger" className="text-[9px] font-bold uppercase py-0.5">Stockout</Badge>
                        ) : isLow ? (
                          <Badge variant="warning" className="text-[9px] font-bold uppercase py-0.5">Low Stock</Badge>
                        ) : (
                          <Badge variant="success" className="text-[9px] font-bold uppercase py-0.5">Sufficient</Badge>
                        )}
                      </td>
                      <td className="p-4 text-center">
                        {confirmDeleteId === med.id ? (
                          <div className="flex items-center justify-center space-x-2 animate-in fade-in duration-100">
                            <span className="text-[9px] font-bold text-rose-600 mr-1">Confirm?</span>
                            <Button 
                              type="button" 
                              variant="danger" 
                              size="xs" 
                              onClick={() => handleDelete(med.id)}
                            >
                              Yes
                            </Button>
                            <Button 
                              type="button" 
                              variant="outline" 
                              size="xs" 
                              onClick={() => setConfirmDeleteId(null)}
                            >
                              No
                            </Button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-center space-x-1.5">
                            <Button 
                              type="button" 
                              variant="outline" 
                              size="xs" 
                              className="h-7 w-7 p-0 flex items-center justify-center text-slate-500 hover:text-teal-600 hover:border-teal-200"
                              onClick={() => handleOpenEditForm(med)}
                            >
                              <Edit2 className="h-3.5 w-3.5" />
                            </Button>
                            <Button 
                              type="button" 
                              variant="ghost" 
                              size="xs" 
                              className="h-7 w-7 p-0 flex items-center justify-center text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                              onClick={() => setConfirmDeleteId(med.id)}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}

                {filteredMedicines.length === 0 && (
                  <tr>
                    <td colSpan={7} className="text-center py-10">
                      <ShieldAlert className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                      <h4 className="font-extrabold text-slate-800 text-sm">No medicines catalog items found</h4>
                      <p className="text-xs text-slate-400 max-w-xs mx-auto mt-1">
                        Try modifying your query keyword search or filter criteria options.
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Register New Medicine / Edit Dialog Form Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs" onClick={() => setIsFormOpen(false)} />
          <Card className="relative z-10 w-full max-w-md shadow-xl animate-in fade-in zoom-in-95 duration-150 bg-white">
            <CardHeader className="flex flex-row items-center justify-between py-4 border-b border-slate-100">
              <div>
                <CardTitle>{editingMedicine ? 'Edit Drug Specification' : 'Register New Drug'}</CardTitle>
                <CardDescription>
                  Update catalog metadata, strength formats, and safety replenishment limits.
                </CardDescription>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 w-8 p-0 rounded-full text-slate-400 hover:text-slate-600 bg-slate-50 hover:bg-slate-100"
                onClick={() => setIsFormOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>
            <form onSubmit={handleSubmit(onSubmitForm)}>
              <CardContent className="space-y-4 pt-4">
                {/* Drug Name */}
                <Input
                  label="Generic/Brand Name"
                  placeholder="e.g. Paracetamol 500mg"
                  error={errors.name?.message}
                  {...register('name')}
                />

                <div className="grid grid-cols-2 gap-4">
                  {/* Category Selection */}
                  <Select
                    label="Therapeutic Category"
                    options={CATEGORY_OPTIONS}
                    error={errors.category?.message}
                    {...register('category')}
                  />

                  {/* Dosage Unit */}
                  <Input
                    label="Dispensing Unit"
                    placeholder="e.g. Tablets, Vials, Doses"
                    error={errors.unit?.message}
                    {...register('unit')}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Price */}
                  <Input
                    label="Unit Price (INR)"
                    type="number"
                    step="0.01"
                    placeholder="e.g. 1.50"
                    error={errors.price?.message}
                    {...register('price')}
                  />

                  {/* Min Threshold */}
                  <Input
                    label="Safety Reorder Level"
                    type="number"
                    placeholder="e.g. 300"
                    error={errors.minThreshold?.message}
                    {...register('minThreshold')}
                  />
                </div>
              </CardContent>
              <CardFooter className="py-4 bg-slate-50 flex justify-end space-x-2 border-t border-slate-100">
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setIsFormOpen(false)}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  variant="primary" 
                  size="sm"
                >
                  {editingMedicine ? 'Save Changes' : 'Register Drug'}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
