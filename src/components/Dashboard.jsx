import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

const Dashboard = ({ onOpenOperationModal, onOpenJournalModal }) => {
  const [loading, setLoading] = useState(true);
  const [balance, setBalance] = useState({ cobrado: 0, a_cobrar: 0, pagado: 0, a_pagar: 0, proyectado: 0, real: 0 });
  const [sociosSummary, setSociosSummary] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [reportActivity, setReportActivity] = useState([]); 
  const [pendingAgenda, setPendingAgenda] = useState([]);
  
  const [dateRange, setDateRange] = useState('month');
  const [customDates, setCustomDates] = useState({
    from: new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split('T')[0],
    to: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    fetchData();
  }, [dateRange, customDates]);

  const fetchData = async () => {
    setLoading(true);
    try {
      let fromDate, toDate;
      if (dateRange === 'custom') {
        fromDate = customDates.from;
        toDate = customDates.to;
      } else {
        let start = new Date();
        if (dateRange === 'month') start.setMonth(start.getMonth() - 1);
        else if (dateRange === 'quarter') start.setMonth(start.getMonth() - 3);
        else if (dateRange === 'year') start.setFullYear(start.getFullYear() - 1);
        else start = new Date('2000-01-01');
        fromDate = start.toISOString().split('T')[0];
        toDate = new Date().toISOString().split('T')[0];
      }

      let opsQuery = supabase.from('operaciones').select('*, rubros(nombre), socios(nombre)').eq('anulada', false);
      if (dateRange !== 'all') opsQuery = opsQuery.gte('fecha', fromDate).lte('fecha', toDate);
      const { data: allOps } = await opsQuery.order('fecha', { ascending: false });

      let notesQuery = supabase.from('notas').select('*, socios(nombre)');
      if (dateRange !== 'all') notesQuery = notesQuery.gte('fecha', fromDate).lte('fecha', toDate);
      const { data: allNotes } = await notesQuery.order('fecha', { ascending: false });

      if (allOps) {
        const stats = allOps.reduce((acc, op) => {
          const val = parseFloat(op.monto);
          if (op.tipo === 'ingreso') {
            if (op.estado === 'pagado') acc.cobrado += val;
            else acc.a_cobrar += val;
          } else {
            if (op.estado === 'pagado') acc.pagado += val;
            else acc.a_pagar += val;
          }
          return acc;
        }, { cobrado: 0, a_cobrar: 0, pagado: 0, a_pagar: 0 });

        setBalance({
          ...stats,
          real: stats.cobrado - stats.pagado,
          proyectado: (stats.cobrado + stats.a_cobrar) - (stats.pagado + stats.a_pagar)
        });

        const socioMap = {};
        allOps.forEach(op => {
          const sId = op.socio_id || 'unassigned';
          const sName = op.socios?.nombre || 'Sin Asignar';
          if (!socioMap[sId]) {
            socioMap[sId] = { nombre: sName, cobrado: 0, a_cobrar: 0, pagado: 0, a_pagar: 0 };
          }
          const val = parseFloat(op.monto);
          if (op.tipo === 'ingreso') {
            if (op.estado === 'pagado') socioMap[sId].cobrado += val;
            else socioMap[sId].a_cobrar += val;
          } else {
            if (op.estado === 'pagado') socioMap[sId].pagado += val;
            else socioMap[sId].a_pagar += val;
          }
        });
        setSociosSummary(Object.values(socioMap).map(s => ({
          ...s,
          real: s.cobrado - s.pagado,
          proyectado: (s.cobrado + s.a_cobrar) - (s.pagado + s.a_pagar)
        })));

        const rubroMap = {};
        allOps.forEach(op => {
          if (op.tipo === 'egreso') {
            const rName = op.rubros?.nombre || 'General';
            rubroMap[rName] = (rubroMap[rName] || 0) + parseFloat(op.monto);
          }
        });
        setChartData(Object.entries(rubroMap).map(([name, value]) => ({ name, value: Math.abs(value) })));
      }

      const merged = [
        ...(allOps || []).map(o => ({ ...o, type: 'op' })),
        ...(allNotes || []).map(n => ({ ...n, type: 'note' }))
      ].sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

      setReportActivity(merged);
      const { data: agenda } = await supabase.from('operaciones').select('*, rubros(nombre)').eq('anulada', false).neq('estado', 'pagado').order('fecha', { ascending: true }).limit(5);
      setPendingAgenda(agenda || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const COLORS = ['#10b981', '#3b82f6', '#ef4444', '#f59e0b', '#8b5cf6', '#ec4899'];
  const formatCurrency = (val) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(val);

  return (
    <div className="h-full overflow-y-auto p-4 md:p-8 lg:p-12 max-w-7xl mx-auto w-full space-y-12 pb-32 print:p-0 print:overflow-visible print:h-auto print:bg-white print:text-black">
      
      <style>
        {`
          @media print {
            html, body, #root, [class*="overflow-y-auto"], [class*="h-full"], [class*="h-screen"] { 
              height: auto !important; 
              overflow: visible !important; 
              overflow-y: visible !important;
              position: static !important;
            }
            .sidebar, nav, header { display: none !important; }
            .no-print { display: none !important; }
            * { -webkit-print-color-adjust: exact !important; font-family: sans-serif !important; }
            @page { margin: 1cm; size: A4; }
            .print-grid { display: grid !important; grid-template-columns: 1fr 1fr !important; gap: 10px !important; }
            .print-full { width: 100% !important; margin-bottom: 20px !important; }
            .print-break-avoid { break-inside: avoid !important; }
          }
        `}
      </style>

      {/* Header UI */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 no-print">
        <div>
          <span className="text-secondary font-headline font-bold text-sm tracking-widest uppercase mb-2 block tracking-[0.3em]">Auditoría Temporal</span>
          <h3 className="text-5xl font-headline font-black text-primary tracking-tighter italic">Panel General</h3>
        </div>
        
        <div className="flex flex-col items-start md:items-end gap-3 w-full md:w-auto mt-4 md:mt-0 overflow-hidden">
          <div className="flex flex-wrap md:flex-nowrap gap-1 bg-slate-100 dark:bg-slate-900 rounded-2xl p-1 shadow-inner border border-slate-200/50 w-full md:w-auto">
            {['month', 'quarter', 'year', 'all', 'custom'].map((r) => (
              <button key={r} onClick={() => setDateRange(r)} className={`px-3 md:px-4 py-2 text-[9px] md:text-[10px] font-black uppercase tracking-widest rounded-xl transition-all flex-1 md:flex-initial text-center ${dateRange === r ? 'bg-primary text-white shadow-lg' : 'text-slate-500 hover:text-slate-700'}`}>
                {r === 'month' ? 'Mes' : r === 'quarter' ? 'Cuat.' : r === 'year' ? 'Año' : r === 'all' ? 'Todo' : 'Calendario'}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-3">
            {dateRange === 'custom' && (
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full md:w-auto">
                <input type="date" value={customDates.from} onChange={(e) => setCustomDates({...customDates, from: e.target.value})} className="bg-white dark:bg-slate-800 border-none rounded-xl px-3 py-1.5 text-xs font-bold shadow-sm w-full sm:w-auto" />
                <input type="date" value={customDates.to} onChange={(e) => setCustomDates({...customDates, to: e.target.value})} className="bg-white dark:bg-slate-800 border-none rounded-xl px-3 py-1.5 text-xs font-bold shadow-sm w-full sm:w-auto" />
              </div>
            )}
            <button onClick={() => window.print()} className="bg-secondary text-primary px-4 md:px-6 py-2 rounded-xl text-[9px] md:text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg w-full md:w-auto">
              <span className="material-symbols-outlined text-sm">picture_as_pdf</span>
              Exportar Informe
            </button>
          </div>
        </div>
      </div>

      {/* Título Oficial Informe (Solo PDF) */}
      <div className="hidden print:block mb-8 border-b-4 border-black pb-4 print-full text-left">
        <h1 className="text-4xl font-black uppercase italic tracking-tighter">La Pampa Gringa • Informe Ejecutivo</h1>
        <p className="font-bold text-slate-500 uppercase text-[10px] tracking-widest">
          Periodo: {new Date(customDates.from).toLocaleDateString('es-AR')} AL {new Date(customDates.to).toLocaleDateString('es-AR')}
        </p>
      </div>

      {/* MÉTRICAS */}
      <section className="grid grid-cols-1 md:grid-cols-4 gap-6 print:grid-cols-2 print:gap-4 print-full">
        <div className="bg-white p-4 md:p-5 rounded-3xl border border-emerald-500 flex flex-col justify-center">
          <span className="text-slate-400 font-label text-[10px] font-black uppercase tracking-widest block mb-1">Total Cobrado</span>
          <h4 className="text-2xl print:text-xl font-black font-headline text-emerald-500 overflow-hidden">{formatCurrency(balance.cobrado)}</h4>
        </div>
        <div className="bg-white p-4 md:p-5 rounded-3xl border border-amber-300 flex flex-col justify-center">
          <span className="text-slate-400 font-label text-[10px] font-black uppercase tracking-widest block mb-1">A Cobrar</span>
          <h4 className="text-2xl print:text-xl font-black font-headline text-amber-500 overflow-hidden">+{formatCurrency(balance.a_cobrar)}</h4>
        </div>
        <div className="bg-white p-4 md:p-5 rounded-3xl border border-rose-500 flex flex-col justify-center">
          <span className="text-slate-400 font-label text-[10px] font-black uppercase tracking-widest block mb-1">Total Pagado</span>
          <h4 className="text-2xl print:text-xl font-black font-headline text-rose-500 overflow-hidden">{formatCurrency(balance.pagado)}</h4>
        </div>
        <div className="bg-white p-4 md:p-5 rounded-3xl border border-amber-600 flex flex-col justify-center">
          <span className="text-slate-400 font-label text-[10px] font-black uppercase tracking-widest block mb-1">A Pagar</span>
          <h4 className="text-2xl print:text-xl font-black font-headline text-amber-900 overflow-hidden">-{formatCurrency(balance.a_pagar)}</h4>
        </div>
      </section>

      {/* Banner Patrimonio */}
      <div className="bg-slate-900 p-6 md:p-8 rounded-[2.5rem] flex flex-col md:flex-row justify-between items-center text-white print:bg-black print:rounded-3xl print-full print-break-avoid gap-6 md:gap-0">
        <div>
          <p className="text-[10px] font-black uppercase text-white/40 mb-1">Resultado neto Proyectado</p>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-headline font-black tracking-tighter truncate max-w-full">{formatCurrency(balance.proyectado)}</h2>
        </div>
        <div className="bg-white/10 px-6 py-4 rounded-2xl border border-white/10 text-center">
            <p className="text-[10px] font-black uppercase mb-1">Efectivo Real</p>
            <p className="text-2xl font-black text-emerald-400">{formatCurrency(balance.real)}</p>
        </div>
      </div>

      {/* BALANCE POR SOCIO */}
      <section className="space-y-6 print-full print-break-avoid">
        <h4 className="text-xl font-black uppercase tracking-widest border-l-4 border-primary pl-4">Estado por Socio</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sociosSummary.map((socio, idx) => (
            <div key={idx} className="bg-white dark:bg-slate-900 p-5 md:p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col justify-between transition-all hover:shadow-md">
              <div className="mb-4">
                <p className="text-lg font-black text-primary uppercase tracking-tighter mb-1">{socio.nombre}</p>
                <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-800 p-2 rounded-xl mt-2">
                  <span className="text-[8px] font-black uppercase text-slate-400">Efectivo Real</span>
                  <span className={`text-sm font-black ${socio.real >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>{formatCurrency(socio.real)}</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 mt-auto">
                <div className="text-left">
                  <p className="text-[7px] font-black uppercase text-slate-400">Por Cobrar</p>
                  <p className="text-[10px] font-black text-amber-500">+{formatCurrency(socio.a_cobrar)}</p>
                </div>
                <div className="text-right">
                  <p className="text-[7px] font-black uppercase text-slate-400">Por Pagar</p>
                  <p className="text-[10px] font-black text-rose-500">-{formatCurrency(socio.a_pagar)}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* HISTORIAL DETALLADO */}
      <section className="bg-white p-6 md:p-10 rounded-[2.5rem] border border-slate-100 shadow-2xl print:shadow-none print:p-0 print:border-none print-full">
        <h4 className="text-xl font-black uppercase tracking-widest mb-10 border-l-4 border-black pl-4">Auditoría de Movimientos</h4>
        <div className="w-full overflow-x-auto">
          <table className="w-full text-left border-collapse table-fixed min-w-[800px]">
            <thead>
              <tr className="border-b-2 border-black">
                <th className="py-3 px-1 text-[9px] font-black uppercase tracking-widest w-20">Fecha</th>
                <th className="py-3 px-1 text-[9px] font-black uppercase tracking-widest w-32">Actividad</th>
                <th className="py-3 px-1 text-[9px] font-black uppercase tracking-widest">Detalle</th>
                <th className="py-3 px-1 text-[9px] font-black uppercase tracking-widest text-right w-24">Monto</th>
                <th className="py-3 px-4 text-[9px] font-black uppercase tracking-widest text-center w-28">Estado</th>
              </tr>
            </thead>
            <tbody>
              {reportActivity.map((item) => (
                <tr key={`${item.type}-${item.id}`} className={`border-b border-slate-50 print-break-avoid ${item.type === 'note' ? 'bg-slate-50' : ''}`}>
                  <td className="py-3 px-1 text-[9px] font-bold text-slate-400">{new Date(item.fecha).toLocaleDateString('es-AR')}</td>
                  <td className="py-3 px-1 text-xs font-black uppercase truncate">{item.titulo}</td>
                  <td className="py-3 px-1 text-xs text-slate-600">
                    <div className="truncate max-w-full">
                      {item.type === 'note' ? item.contenido : item.rubros?.nombre}
                    </div>
                  </td>
                  <td className={`py-3 px-1 text-xs font-black text-right ${item.type === 'note' ? 'text-slate-100' : (item.tipo === 'ingreso' ? 'text-emerald-500' : 'text-rose-500')}`}>
                    {item.type === 'op' ? (item.tipo === 'ingreso' ? '+' : '-') + formatCurrency(item.monto) : '---'}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className={`px-3 py-1.5 rounded-full text-[8px] font-black uppercase border block leading-tight ${item.type === 'note' ? 'border-slate-200 text-slate-400 bg-slate-50' : (item.estado === 'pagado' ? 'border-emerald-200 text-emerald-600 bg-emerald-50' : 'border-amber-200 text-amber-600 bg-amber-50')}`}>
                      {item.type === 'op' ? item.estado : 'Nota'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Gráfico y Pendientes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 print:grid-cols-2">
        <div className="bg-white p-6 md:p-8 rounded-[2.5rem] border border-slate-100 print:break-inside-avoid shadow-sm text-center">
          <h4 className="text-lg font-black mb-6 uppercase tracking-widest">Desglose Egreso</h4>
          <div className="h-[200px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={chartData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={5} dataKey="value" stroke="none">
                  {chartData.map((entry, index) => <Cell key={`c-${index}`} fill={COLORS[index % COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        <div className="bg-slate-900 text-white p-6 md:p-8 rounded-[2.5rem] print:bg-black print-break-avoid">
           <h4 className="text-lg font-black mb-6 uppercase tracking-widest text-center">Compromisos</h4>
           <div className="space-y-3">
              {pendingAgenda.map(p => (
                <div key={p.id} className={`border-l-4 pl-3 py-1 ${p.tipo === 'ingreso' ? 'border-emerald-400' : 'border-amber-400'}`}>
                  <div className="flex justify-between items-start mb-1">
                    <p className={`text-[9px] font-black uppercase tracking-widest ${p.tipo === 'ingreso' ? 'text-emerald-400' : 'text-amber-300'}`}>
                      {p.tipo === 'ingreso' ? 'Por Cobrar' : 'Por Pagar'} • {p.rubros?.nombre}
                    </p>
                  </div>
                  <p className="text-xs font-black uppercase">{p.titulo}</p>
                  <p className="text-xl font-black">{formatCurrency(p.monto)}</p>
                </div>
              ))}
           </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
