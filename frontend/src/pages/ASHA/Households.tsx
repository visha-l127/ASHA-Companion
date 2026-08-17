import React, { useState, useEffect } from 'react';
import { 
  getHouseholds, 
  addHousehold, 
  updateHousehold, 
  deleteHousehold, 
  Household, 
  isOfflineModeEnabled 
} from './localAshaHelper';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Badge, Button } from '../../components/ui';
import { PageHeader } from '../../components/PageHeader';
import { 
  Home, 
  Plus, 
  Search, 
  Filter, 
  Trash2, 
  Edit, 
  AlertTriangle, 
  CheckCircle, 
  Users, 
  Droplet, 
  Sparkles,
  Wifi,
  WifiOff,
  Building,
  HelpCircle,
  X
} from 'lucide-react';

export default function HouseholdsPage() {
  const [households, setHouseholds] = useState<Household[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [villageFilter, setVillageFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [toiletFilter, setToiletFilter] = useState('all');

  // Form states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [householdNumber, setHouseholdNumber] = useState('');
  const [headName, setHeadName] = useState('');
  const [village, setVillage] = useState('Madukkarai');
  const [membersCount, setMembersCount] = useState(4);
  const [category, setCategory] = useState<'APL' | 'BPL' | 'AAY'>('BPL');
  const [waterSource, setWaterSource] = useState<'piped' | 'handpump' | 'well'>('handpump');
  const [toilet, setToilet] = useState(true);

  // General feedback
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  // Load Households
  const loadData = async () => {
    try {
      const h = await getHouseholds();
      setHouseholds(h);
    } catch (e) {
      console.error('Error loading households:', e);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filter
  const filteredHouseholds = households.filter((h) => {
    const matchesSearch = 
      h.headName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      h.householdNumber.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesVillage = villageFilter === 'all' || h.village === villageFilter;
    const matchesCategory = categoryFilter === 'all' || h.category === categoryFilter;
    const matchesToilet = 
      toiletFilter === 'all' || 
      (toiletFilter === 'yes' && h.toilet) || 
      (toiletFilter === 'no' && !h.toilet);

    return matchesSearch && matchesVillage && matchesCategory && matchesToilet;
  });

  // Calculate frontend alerts
  const noToiletCount = households.filter(h => !h.toilet).length;
  const highDensityCount = households.filter(h => h.membersCount > 6).length;

  const handleOpenAdd = () => {
    setEditingId(null);
    setHouseholdNumber(`HH-MDK-${Math.floor(100 + Math.random() * 900)}`);
    setHeadName('');
    setVillage('Madukkarai');
    setMembersCount(4);
    setCategory('BPL');
    setWaterSource('handpump');
    setToilet(true);
    setFormError(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (hh: Household) => {
    setEditingId(hh.id);
    setHouseholdNumber(hh.householdNumber);
    setHeadName(hh.headName);
    setVillage(hh.village);
    setMembersCount(hh.membersCount);
    setCategory(hh.category);
    setWaterSource(hh.waterSource);
    setToilet(hh.toilet);
    setFormError(null);
    setIsFormOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!headName.trim() || !householdNumber.trim()) {
      setFormError('Please enter Head of Household name and Household Number.');
      return;
    }

    try {
      if (editingId) {
        await updateHousehold(editingId, {
          householdNumber,
          headName,
          village,
          membersCount: Number(membersCount),
          category,
          waterSource,
          toilet
        });
        setSuccessMsg('Household updated successfully!');
      } else {
        await addHousehold({
          householdNumber,
          headName,
          village,
          membersCount: Number(membersCount),
          category,
          waterSource,
          toilet
        });
        setSuccessMsg('New household registered successfully!');
      }

      setIsFormOpen(false);
      await loadData();
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err) {
      console.error(err);
      setFormError('Failed to save household.');
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this household? This will remove all associated statistics.')) {
      try {
        await deleteHousehold(id);
        await loadData();
        setSuccessMsg('Household deleted.');
        setTimeout(() => setSuccessMsg(null), 3000);
      } catch (err) {
        console.error(err);
        setSuccessMsg('Failed to delete household.');
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Welcome Panel */}
      <PageHeader
        title="Household Registry"
        description="Conduct village censuses, register primary houses, and log basic sanitation indices."
        breadcrumbs={[
          { label: 'Dashboard', to: '/asha/dashboard' },
          { label: 'Households' }
        ]}
        action={{
          label: 'Add Household',
          icon: Plus,
          onClick: handleOpenAdd
        }}
      />

      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-100 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-2.5 animate-in fade-in duration-200">
          <CheckCircle className="w-4.5 h-4.5 text-emerald-600" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Sanitation & Density Alerts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {noToiletCount > 0 && (
          <div className="p-4 bg-rose-50 border border-rose-100 rounded-xl flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-rose-500 mt-0.5 shrink-0" />
            <div>
              <h4 className="text-xs font-bold text-rose-800 uppercase tracking-wide">Sanitation Alert: No Private Toilet</h4>
              <p className="text-[11px] text-rose-600 font-medium mt-0.5 leading-relaxed">
                {noToiletCount} household(s) currently lack private sanitation toilets. Prioritize for counseling and Swachh Bharat community assistance list.
              </p>
            </div>
          </div>
        )}
        {highDensityCount > 0 && (
          <div className="p-4 bg-amber-50 border border-amber-100 rounded-xl flex items-start gap-3">
            <Users className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
            <div>
              <h4 className="text-xs font-bold text-amber-800 uppercase tracking-wide">High Density Risk Household</h4>
              <p className="text-[11px] text-amber-600 font-medium mt-0.5 leading-relaxed">
                {highDensityCount} household(s) report more than 6 cohabitating members. Monitor for air-borne transmission and hygiene hazards.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Query Filters */}
      <Card>
        <CardContent className="p-4 flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400 pointer-events-none" />
            <input 
              type="text"
              placeholder="Search by head of household name or household number..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs transition-all focus:outline-none focus:ring-2 focus:ring-teal-500/10 focus:border-teal-600 focus:bg-white text-slate-800"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {/* Village selector */}
            <div className="flex items-center gap-1.5 border border-slate-200 rounded-xl px-3 py-1 bg-slate-50/50">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Village:</span>
              <select
                value={villageFilter}
                onChange={(e) => setVillageFilter(e.target.value)}
                className="text-xs font-bold text-slate-700 bg-transparent border-none focus:outline-none cursor-pointer"
              >
                <option value="all">All Villages</option>
                <option value="Madukkarai">Madukkarai</option>
                <option value="Thondamuthur">Thondamuthur</option>
                <option value="Sulur">Sulur</option>
                <option value="Karamadai">Karamadai</option>
              </select>
            </div>

            {/* Category selector */}
            <div className="flex items-center gap-1.5 border border-slate-200 rounded-xl px-3 py-1 bg-slate-50/50">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Card:</span>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="text-xs font-bold text-slate-700 bg-transparent border-none focus:outline-none cursor-pointer"
              >
                <option value="all">All Cards</option>
                <option value="APL">APL</option>
                <option value="BPL">BPL</option>
                <option value="AAY">AAY (Antyodaya)</option>
              </select>
            </div>

            {/* Toilet filter */}
            <div className="flex items-center gap-1.5 border border-slate-200 rounded-xl px-3 py-1 bg-slate-50/50">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Toilet:</span>
              <select
                value={toiletFilter}
                onChange={(e) => setToiletFilter(e.target.value)}
                className="text-xs font-bold text-slate-700 bg-transparent border-none focus:outline-none cursor-pointer"
              >
                <option value="all">All Households</option>
                <option value="yes">With Toilet</option>
                <option value="no">Without Toilet</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Household Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredHouseholds.map((hh) => (
          <Card key={hh.id} className="relative overflow-hidden border border-slate-100 hover:shadow-md transition-shadow">
            <CardHeader className="bg-slate-50/50 pb-3 flex flex-row items-start justify-between">
              <div>
                <Badge variant={hh.status === 'synced' ? 'success' : 'warning'} className="mb-1">
                  {hh.status === 'synced' ? 'Synced' : 'Pending Sync'}
                </Badge>
                <CardTitle className="text-sm font-bold text-slate-800">{hh.headName}</CardTitle>
                <CardDescription className="text-[11px] font-mono mt-0.5">{hh.householdNumber}</CardDescription>
              </div>
              <div className="flex gap-1.5">
                <button 
                  onClick={() => handleOpenEdit(hh)}
                  className="p-1.5 text-slate-500 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors cursor-pointer"
                  title="Edit Household"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => handleDelete(hh.id)}
                  className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                  title="Delete Household"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </CardHeader>
            <CardContent className="pt-4 space-y-3.5 bg-white text-xs">
              <div className="grid grid-cols-2 gap-2 text-slate-600 font-medium">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase block">Village</span>
                  <span className="text-slate-800 font-bold">{hh.village}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase block">Ration Category</span>
                  <Badge variant="neutral" className="font-bold text-xs mt-0.5">{hh.category}</Badge>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase block">Family Members</span>
                  <span className="text-slate-800 font-bold flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    {hh.membersCount} Members
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase block">Water Source</span>
                  <span className="text-slate-800 font-bold capitalize flex items-center gap-1">
                    <Droplet className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                    {hh.waterSource}
                  </span>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-between items-center text-[10px] text-slate-400">
                <span className="font-bold uppercase flex items-center gap-1">
                  Toilet: 
                  {hh.toilet ? (
                    <span className="text-emerald-600 font-extrabold flex items-center gap-0.5">
                      <CheckCircle className="w-3.5 h-3.5 shrink-0" /> Yes
                    </span>
                  ) : (
                    <span className="text-rose-600 font-extrabold flex items-center gap-0.5">
                      <AlertTriangle className="w-3.5 h-3.5 shrink-0" /> No
                    </span>
                  )}
                </span>
                <span>Updated: {hh.lastUpdated}</span>
              </div>
            </CardContent>
          </Card>
        ))}

        {filteredHouseholds.length === 0 && (
          <div className="col-span-full py-16 bg-white border border-dashed border-slate-200 rounded-2xl text-center text-slate-400">
            <Home className="w-12 h-12 mx-auto text-slate-200 mb-2" />
            <p className="text-xs font-bold">No households registered matching search or filters.</p>
          </div>
        )}
      </div>

      {/* HOUSEHOLD ADD/EDIT DIALOG */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs" onClick={() => setIsFormOpen(false)} />
          
          <div className="relative bg-white rounded-2xl shadow-xl border border-slate-100 max-w-lg w-full overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
              <h3 className="font-bold text-slate-800">{editingId ? 'Edit Household Profile' : 'Register New Household'}</h3>
              <button onClick={() => setIsFormOpen(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {formError && (
                <p className="p-3 bg-rose-50 text-rose-700 rounded-lg text-xs font-bold flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" /> {formError}
                </p>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Household Number</label>
                  <input 
                    type="text" 
                    value={householdNumber} 
                    onChange={(e) => setHouseholdNumber(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500/10 focus:border-teal-600 bg-white"
                    required
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Head of Family</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Ramesh Patel"
                    value={headName} 
                    onChange={(e) => setHeadName(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500/10 focus:border-teal-600 bg-white"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Registered Village</label>
                  <select
                    value={village}
                    onChange={(e) => setVillage(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500/10 focus:border-teal-600 bg-white"
                  >
                    <option value="Madukkarai">Madukkarai</option>
                    <option value="Thondamuthur">Thondamuthur</option>
                    <option value="Sulur">Sulur</option>
                    <option value="Karamadai">Karamadai</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Members Count</label>
                  <input 
                    type="number" 
                    min={1} 
                    max={25}
                    value={membersCount} 
                    onChange={(e) => setMembersCount(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500/10 focus:border-teal-600 bg-white"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Ration Category Card</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500/10 focus:border-teal-600 bg-white"
                  >
                    <option value="APL">APL (Above Poverty Line)</option>
                    <option value="BPL">BPL (Below Poverty Line)</option>
                    <option value="AAY">AAY (Antyodaya Anna Yojana)</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Drinking Water Source</label>
                  <select
                    value={waterSource}
                    onChange={(e) => setWaterSource(e.target.value as any)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500/10 focus:border-teal-600 bg-white"
                  >
                    <option value="piped">Piped Water supply</option>
                    <option value="handpump">Public Handpump</option>
                    <option value="well">Open Well</option>
                  </select>
                </div>
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-3 border border-slate-100 rounded-xl p-3 bg-slate-50/50 cursor-pointer select-none">
                  <input 
                    type="checkbox" 
                    checked={toilet}
                    onChange={(e) => setToilet(e.target.checked)}
                    className="h-4.5 w-4.5 text-teal-600 rounded cursor-pointer"
                  />
                  <div>
                    <span className="text-xs font-bold text-slate-700 block">Has Private Sanitary Toilet</span>
                    <span className="text-[10px] text-slate-400 font-medium">Household has access to a working clean latrine.</span>
                  </div>
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary">
                  {editingId ? 'Save Changes' : 'Register Household'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
