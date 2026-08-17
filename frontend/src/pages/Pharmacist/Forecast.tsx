import React, { useState, useEffect } from 'react';
import { getDemandForecasts, DemandForecast, getMedicines } from './localPharmacistHelper';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle, 
  Badge, 
  Button 
} from '../../components/ui';
import { PageHeader } from '../../components/PageHeader';
import { 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  AlertTriangle, 
  Sparkles, 
  CheckCircle, 
  ShoppingBag, 
  RefreshCw,
  BarChart3,
  ShieldCheck,
  Info,
  Boxes,
  CalendarDays
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Legend 
} from 'recharts';

export default function ForecastPage() {
  const [forecasts, setForecasts] = useState<DemandForecast[]>([]);
  const [isRegenerating, setIsRegenerating] = useState(false);

  useEffect(() => {
    refreshData();
  }, []);

  const refreshData = async () => {
    try {
      const fcs = await getDemandForecasts();
      setForecasts(fcs);
    } catch (err) {
      console.error("Failed to refresh forecasts:", err);
    }
  };

  const handleRecalculate = async () => {
    setIsRegenerating(true);
    await refreshData();
    setIsRegenerating(false);
  };

  // KPI Calculations strictly from existing data
  const totalReorderUnits = forecasts.reduce((acc, f) => acc + f.recommendedOrderQty, 0);
  const itemsNeedingReorder = forecasts.filter(f => f.recommendedOrderQty > 0).length;
  const stockoutRiskCount = forecasts.filter(f => f.currentStock < f.forecastedDemandNextMonth).length;

  // Prepare chart data comparing Stock vs Forecast
  const chartData = forecasts.map(f => ({
    name: f.medicineName.split(' ')[0], // short name
    fullName: f.medicineName,
    'Current Stock': f.currentStock,
    'Forecasted Demand': f.forecastedDemandNextMonth,
  }));

  return (
    <div className="space-y-6 pb-8">
      {/* Page Header */}
      <PageHeader
        title="Demand Forecast"
        description="Estimated demand based on available historical data."
        breadcrumbs={[
          { label: 'Pharmacy Analytics', to: '/pharmacist/dashboard' },
          { label: 'Demand Forecast' }
        ]}
        action={{
          label: isRegenerating ? 'Recalculating...' : 'Refresh Forecast',
          icon: RefreshCw,
          onClick: handleRecalculate
        }}
      />

      {/* Explicit Disclaimer Banner */}
      <div className="p-4 rounded-2xl bg-slate-900 text-white border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-teal-500/20 text-teal-300 rounded-xl shrink-0 mt-0.5 border border-teal-500/30">
            <Info className="h-5 w-5" />
          </div>
          <div className="space-y-1">
            <h4 className="text-xs font-black uppercase tracking-wider text-teal-300">
              Inventory Demand Estimation
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed max-w-3xl">
              Forecasts are estimates based on available historical data for inventory planning purposes. They are not guaranteed outcomes and do not constitute clinical or medical advice.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 font-mono text-[11px] text-teal-400 bg-teal-950/60 border border-teal-800/60 px-3 py-1.5 rounded-xl shrink-0">
          <ShieldCheck className="h-4 w-4 text-teal-400" />
          <span>Historical Estimation Engine</span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Order Units */}
        <Card className="hover:border-teal-200 transition-all">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Suggested Order Quantity</p>
              <h3 className="text-2xl font-black text-slate-800">{totalReorderUnits.toLocaleString()} units</h3>
              <p className="text-[10px] text-teal-700 font-semibold">Calculated buffer stock replenishment</p>
            </div>
            <div className="p-3 bg-teal-50 text-teal-600 rounded-2xl">
              <ShoppingBag className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>

        {/* Items Needing Reorder */}
        <Card className={`hover:border-amber-200 transition-all ${itemsNeedingReorder > 0 ? 'bg-amber-50/20 border-amber-200' : ''}`}>
          <CardContent className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Replenishment Needed</p>
              <h3 className={`text-2xl font-black ${itemsNeedingReorder > 0 ? 'text-amber-700' : 'text-slate-800'}`}>
                {itemsNeedingReorder} <span className="text-xs font-normal text-slate-500">Items</span>
              </h3>
              <p className="text-[10px] text-amber-700 font-semibold">Below recommended min buffer</p>
            </div>
            <div className={`p-3 rounded-2xl ${itemsNeedingReorder > 0 ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-500'}`}>
              <AlertTriangle className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>

        {/* Stockout Risk Count */}
        <Card className={`hover:border-rose-200 transition-all ${stockoutRiskCount > 0 ? 'bg-rose-50/20 border-rose-200' : ''}`}>
          <CardContent className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Stockout Risk (30 Days)</p>
              <h3 className={`text-2xl font-black ${stockoutRiskCount > 0 ? 'text-rose-700' : 'text-slate-800'}`}>
                {stockoutRiskCount} <span className="text-xs font-normal text-slate-500">Items</span>
              </h3>
              <p className="text-[10px] text-rose-700 font-semibold">Demand exceeds current stock</p>
            </div>
            <div className={`p-3 rounded-2xl ${stockoutRiskCount > 0 ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-500'}`}>
              <TrendingUp className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Dual Bar Chart */}
      <Card className="border-slate-100 shadow-sm">
        <CardHeader>
          <CardTitle className="text-sm font-bold flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-teal-600" />
            Forecasted Monthly Demand vs. Current Stock on Hand
          </CardTitle>
          <CardDescription className="text-xs">
            Compare current shelf stock against estimated consumption requirements for the next 30 days.
          </CardDescription>
        </CardHeader>
        <CardContent className="h-80">
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 11, fontWeight: 600 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)' }} 
                  labelClassName="font-extrabold text-slate-700 text-xs"
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Bar dataKey="Current Stock" fill="#94a3b8" radius={[4, 4, 0, 0]} barSize={26} />
                <Bar dataKey="Forecasted Demand" fill="#0d9488" radius={[4, 4, 0, 0]} barSize={26} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-xs text-slate-400">
              Not enough transaction history for forecasting.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Forecast Table */}
      <Card className="border-slate-100 shadow-sm">
        <CardHeader>
          <CardTitle className="text-sm font-bold flex items-center gap-2">
            <Boxes className="h-4 w-4 text-slate-600" />
            Demand Forecast & Replenishment Status Table
          </CardTitle>
          <CardDescription className="text-xs">
            Review medicine stock levels, estimated runout dates, and suggested procurement quantities.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/70 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                  <th className="p-4">Medicine Name</th>
                  <th className="p-4">Current Stock</th>
                  <th className="p-4">Forecast Demand</th>
                  <th className="p-4">Seasonal Vector</th>
                  <th className="p-4">Forecast Status</th>
                  <th className="p-4">Est. Run-Out Date</th>
                  <th className="p-4 text-right">Suggested Procurement</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {forecasts.map((f) => {
                  const isRunout = f.currentStock < f.forecastedDemandNextMonth;
                  const isLow = f.currentStock < f.forecastedDemandNextMonth * 1.2;

                  let statusBadge = (
                    <Badge variant="success" className="text-[10px] font-bold">
                      ✓ Stock Sufficient
                    </Badge>
                  );

                  if (f.currentStock === 0 || isRunout) {
                    statusBadge = (
                      <Badge variant="danger" className="text-[10px] font-bold">
                        🔴 High Replenishment Need
                      </Badge>
                    );
                  } else if (isLow) {
                    statusBadge = (
                      <Badge variant="warning" className="text-[10px] font-bold">
                        ⚠ May Need Replenishment
                      </Badge>
                    );
                  }

                  let trendColor = 'text-slate-600 bg-slate-100 border-slate-200';
                  let TrendIcon = Minus;
                  if (f.seasonalTrend === 'Rising') {
                    trendColor = 'text-amber-800 bg-amber-50 border-amber-200';
                    TrendIcon = TrendingUp;
                  } else if (f.seasonalTrend === 'Declining') {
                    trendColor = 'text-teal-800 bg-teal-50 border-teal-200';
                    TrendIcon = TrendingDown;
                  }

                  return (
                    <tr key={f.medicineId} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-4 font-extrabold text-slate-800 text-sm">
                        {f.medicineName}
                      </td>
                      <td className="p-4 font-bold text-slate-700">
                        {f.currentStock.toLocaleString()} units
                      </td>
                      <td className="p-4 font-extrabold text-teal-800 text-sm">
                        {f.forecastedDemandNextMonth.toLocaleString()} units
                      </td>
                      <td className="p-4">
                        <span className={`inline-flex items-center font-bold px-2 py-0.5 rounded-md text-[10px] uppercase border ${trendColor}`}>
                          <TrendIcon className="h-3 w-3 mr-1" />
                          {f.seasonalTrend}
                        </span>
                      </td>
                      <td className="p-4">
                        {statusBadge}
                      </td>
                      <td className="p-4 font-medium text-slate-600">
                        {f.estimatedOutDate !== 'Safe' ? (
                          <span className="font-extrabold text-rose-700">Runout: {f.estimatedOutDate}</span>
                        ) : (
                          <span className="font-semibold text-emerald-700">Safe (&gt;30 Days)</span>
                        )}
                      </td>
                      <td className="p-4 text-right">
                        {f.recommendedOrderQty > 0 ? (
                          <span className="font-black text-rose-700 bg-rose-50 border border-rose-200 px-2.5 py-1 rounded-lg text-xs inline-block">
                            +{f.recommendedOrderQty.toLocaleString()} units
                          </span>
                        ) : (
                          <span className="text-slate-400 font-semibold bg-slate-50 border border-slate-200 px-2 py-0.5 rounded-lg text-[10px] inline-block">
                            Sufficient Balance
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}

                {forecasts.length === 0 && (
                  <tr>
                    <td colSpan={7} className="text-center py-12 text-slate-400">
                      Not enough transaction history for forecasting.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
