import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

const SociosBalance = () => {
  const [loading, setLoading] = useState(true);
  const [sociosData, setSociosData] = useState([]);
  const [dateRange, setDateRange] = useState('month');
  const [customDates, setCustomDates] = useState({
    from: new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split('T')[0],
    to: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    fetchSociosBalance();
  }, [dateRange, customDates]);

  const fetchSociosBalance = async () => {
    setLoading(true);
    try {
      // Calcular fechas para el query
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

      // 1. Obtener todos los socios
      const { data: socios, error: sociosError } = await supabase
        .from('socios')
        .select('*')
        .order('nombre');

      if (sociosError) throw sociosError;

      // 2. Obtener todas las operaciones filtradas por fecha
      let opsQuery = supabase.from('operaciones').select('*').eq('anulada', false);
      if (dateRange !== 'all') {
        opsQuery = opsQuery.gte('fecha', fromDate).lte('fecha', toDate);
      }
      const { data: operations, error: opsError } = await opsQuery;

      if (opsError) throw opsError;

      // 3. Procesar balances por socio
      const balances = socios.map(socio => {
        const socioOps = operations.filter(op => op.socio_id === socio.id);
        
        const stats = socioOps.reduce((acc, op) => {
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

        return {
          id: socio.id,
          nombre: socio.nombre,
          rol: socio.rol,
          ...stats,
          real: stats.cobrado - stats.pagado,
          proyectado: (stats.cobrado + stats.a_cobrar) - (stats.pagado + stats.a_pagar)
        };
      });

      setSociosData(balances);
    } catch (err) {
      console.error('Error fetching socios balance:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (val) => new Intl.NumberFormat('es-AR', { 
    style: 'currency', 
    currency: 'ARS' 
  }).format(val);

  if (loading) {
    return (
      <div className="p-12 flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 lg:p-12 max-w-7xl mx-auto w-full space-y-12 pb-32">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 no-print">
        <div>
          <span className="text-secondary font-headline font-bold text-sm tracking-widest uppercase mb-2 block tracking-[0.3em]">Auditoría por Socio</span>
          <h3 className="text-5xl font-headline font-black text-primary tracking-tighter italic">Balance de Socios</h3>
        </div>

        <div className="flex flex-col items-start md:items-end gap-3 w-full md:w-auto mt-4 md:mt-0 overflow-hidden">
          <div className="flex flex-wrap md:flex-nowrap gap-1 bg-slate-100 dark:bg-slate-900 rounded-2xl p-1 shadow-inner border border-slate-200/50 w-full md:w-auto">
            {['month', 'quarter', 'year', 'all', 'custom'].map((r) => (
              <button key={r} onClick={() => setDateRange(r)} className={`px-3 md:px-4 py-2 text-[9px] md:text-[10px] font-black uppercase tracking-widest rounded-xl transition-all flex-1 md:flex-initial text-center ${dateRange === r ? 'bg-primary text-white shadow-lg' : 'text-slate-500 hover:text-slate-700'}`}>
                {r === 'month' ? 'Mes' : r === 'quarter' ? 'Cuat.' : r === 'year' ? 'Año' : r === 'all' ? 'Todo' : 'Calendario'}
              </button>
            ))}
          </div>
          {dateRange === 'custom' && (
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full md:w-auto">
              <input type="date" value={customDates.from} onChange={(e) => setCustomDates({...customDates, from: e.target.value})} className="bg-white dark:bg-slate-800 border-none rounded-xl px-3 py-1.5 text-xs font-bold shadow-sm w-full sm:w-auto" />
              <input type="date" value={customDates.to} onChange={(e) => setCustomDates({...customDates, to: e.target.value})} className="bg-white dark:bg-slate-800 border-none rounded-xl px-3 py-1.5 text-xs font-bold shadow-sm w-full sm:w-auto" />
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {sociosData.map(socio => (
          <div key={socio.id} className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-xl overflow-hidden flex flex-col transition-all hover:shadow-2xl">
            {/* Header del Socio */}
            <div className="p-6 lg:p-8 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
              <h4 className="text-2xl font-black uppercase tracking-tighter mb-1 text-primary">{socio.nombre}</h4>
              <p className="text-[10px] uppercase font-black tracking-widest text-slate-400">{socio.rol || 'Socio'}</p>
            </div>

            {/* Métricas Principales */}
            <div className="p-6 lg:p-8 space-y-6 flex-1">
              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="bg-emerald-50 dark:bg-emerald-950/30 p-3 lg:p-4 rounded-2xl border border-emerald-100 dark:border-emerald-900/50">
                  <p className="text-[8px] font-black uppercase text-emerald-500 mb-1 tracking-widest">Cobrado</p>
                  <p className="text-sm font-black text-emerald-600">{formatCurrency(socio.cobrado)}</p>
                </div>
                <div className="bg-amber-50 dark:bg-amber-950/30 p-3 lg:p-4 rounded-2xl border border-amber-100 dark:border-amber-900/50">
                  <p className="text-[8px] font-black uppercase text-amber-600 mb-1 tracking-widest">A Cobrar</p>
                  <p className="text-sm font-black text-amber-700">{formatCurrency(socio.a_cobrar)}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="bg-rose-50 dark:bg-rose-950/30 p-3 lg:p-4 rounded-2xl border border-rose-100 dark:border-rose-900/50">
                  <p className="text-[8px] font-black uppercase text-rose-500 mb-1 tracking-widest">Pagado</p>
                  <p className="text-sm font-black text-rose-600">{formatCurrency(socio.pagado)}</p>
                </div>
                <div className="bg-orange-50 dark:bg-orange-950/30 p-3 lg:p-4 rounded-2xl border border-orange-100 dark:border-orange-900/50">
                  <p className="text-[8px] font-black uppercase text-orange-600 mb-1 tracking-widest">A Pagar</p>
                  <p className="text-sm font-black text-orange-700">{formatCurrency(socio.a_pagar)}</p>
                </div>
              </div>

              <div className="pt-6 border-t border-slate-100 dark:border-slate-800 space-y-4">
                <div className="flex justify-between items-center">
                  <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Resultado Proyectado</p>
                  <p className={`text-lg font-black ${socio.proyectado >= 0 ? 'text-primary' : 'text-rose-600'}`}>
                    {formatCurrency(socio.proyectado)}
                  </p>
                </div>
                
                <div className="bg-slate-900 dark:bg-black p-5 rounded-2xl flex justify-between items-center shadow-lg">
                  <div className="text-left">
                    <p className="text-[8px] font-black uppercase text-white/50 tracking-widest mb-0.5">Efectivo Real</p>
                    <p className="text-[7px] font-bold text-white/30 uppercase tracking-tighter">(Cobrado - Pagado)</p>
                  </div>
                  <p className={`text-xl font-black ${socio.real >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {formatCurrency(socio.real)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}

        {sociosData.length === 0 && (
          <div className="col-span-full py-20 text-center">
            <p className="text-slate-400 font-bold uppercase tracking-widest">No se encontraron socios</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SociosBalance;
