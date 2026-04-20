import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

const Operations = ({ onOpenModal }) => {
  const [loading, setLoading] = useState(true);
  const [operaciones, setOperaciones] = useState([]);
  const [rubros, setRubros] = useState([]);
  const [socios, setSocios] = useState([]);
  
  // Desglose de flujos para métricas
  const [m, setM] = useState({
    cobrado: 0,
    a_cobrar: 0,
    pagado: 0,
    a_pagar: 0,
    proyectado: 0
  });
  
  // Filtros
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all'); 
  const [filterRubro, setFilterRubro] = useState('all');
  const [filterSocio, setFilterSocio] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    fetchData();
  }, [filterType, filterStatus, filterRubro, filterSocio, searchTerm]);

  const fetchInitialData = async () => {
    const { data: rubrosData } = await supabase.from('rubros').select('*');
    const { data: sociosData } = await supabase.from('socios').select('*');
    if (rubrosData) setRubros(rubrosData);
    if (sociosData) setSocios(sociosData);
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      // 1. OBTENER TOTALES DETALLADOS (Contextualizados por Socio/Rubro pero no por Tipo/Estado visual)
      let metricsQuery = supabase.from('operaciones').select('monto, tipo, estado, rubro_id, socio_id').eq('anulada', false);
      if (filterRubro !== 'all') metricsQuery = metricsQuery.eq('rubro_id', filterRubro);
      if (filterSocio !== 'all') metricsQuery = metricsQuery.eq('socio_id', filterSocio);
      
      const { data: mData } = await metricsQuery;
      
      if (mData) {
        const stats = mData.reduce((acc, op) => {
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
        
        setM({
          ...stats,
          proyectado: (stats.cobrado + stats.a_cobrar) - (stats.pagado + stats.a_pagar)
        });
      }

      // 2. OBTENER OPERACIONES PARA LA TABLA
      let query = supabase
        .from('operaciones')
        .select(`
          *,
          socios(nombre, avatar_url),
          rubros(nombre)
        `)
        .eq('anulada', false)
        .order('fecha', { ascending: false })
        .order('created_at', { ascending: false });

      if (filterType !== 'all') query = query.eq('tipo', filterType);
      if (filterStatus === 'pagado') query = query.eq('estado', 'pagado');
      else if (filterStatus === 'pendiente') query = query.neq('estado', 'pagado');

      if (filterRubro !== 'all') query = query.eq('rubro_id', filterRubro);
      if (filterSocio !== 'all') query = query.eq('socio_id', filterSocio);
      if (searchTerm) query = query.ilike('titulo', `%${searchTerm}%`);

      const { data, error } = await query;
      if (error) throw error;
      setOperaciones(data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAnular = async (id, titulo) => {
    if (!window.confirm(`¿Estás seguro de que deseas anular la operación "${titulo}"? Dejará de ser visible y no afectará a los balances.`)) return;
    
    try {
      const { error } = await supabase
        .from('operaciones')
        .update({ anulada: true })
        .eq('id', id);

      if (error) throw error;
      fetchData();
    } catch (error) {
      console.error('Error al anular:', error);
      alert('Error al intentar anular la operación.');
    }
  };

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(val);
  };

  return (
    <div className="p-4 md:p-8 lg:p-12 max-w-7xl mx-auto w-full space-y-12 overflow-y-auto pb-32">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <span className="text-secondary font-headline font-bold text-sm tracking-widest uppercase mb-2 block tracking-[0.3em]">Auditoría Patrimonial</span>
          <h3 className="text-4xl lg:text-5xl font-headline font-black text-primary tracking-tight">Caja & Agenda</h3>
        </div>
        <div className="flex gap-4">
          <button onClick={() => fetchData()} className="w-12 h-12 flex items-center justify-center bg-white dark:bg-slate-800 rounded-xl text-slate-400 hover:text-primary transition-all shadow-xl shadow-slate-200/50"><span className="material-symbols-outlined">sync</span></button>
          <button onClick={() => onOpenModal()} className="lacquered-gradient text-white px-8 py-4 rounded-xl font-headline font-bold flex items-center space-x-2 shadow-2xl active:scale-95 transition-all">
            <span className="material-symbols-outlined">add_circle</span>
            <span>Programar</span>
          </button>
        </div>
      </div>

      {/* Grid de Métricas Cuádruple */}
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white dark:bg-slate-900 p-5 md:p-6 rounded-2xl border-t-4 border-secondary shadow-lg">
            <div className="flex items-center space-x-2 mb-4 text-secondary/60">
              <span className="material-symbols-outlined text-sm">payments</span>
              <span className="text-[10px] font-black uppercase tracking-widest">Total Cobrado</span>
            </div>
            <h4 className="text-2xl font-headline font-black text-emerald-500">{formatCurrency(m.cobrado)}</h4>
          </div>
          
          <div className="bg-white dark:bg-slate-900 p-5 md:p-6 rounded-2xl border-t-4 border-amber-300 shadow-lg relative overflow-hidden">
            <div className="flex items-center space-x-2 mb-4 text-amber-500/60">
              <span className="material-symbols-outlined text-sm">schedule_send</span>
              <span className="text-[10px] font-black uppercase tracking-widest">A Cobrar</span>
            </div>
            <h4 className="text-2xl font-headline font-black text-amber-500">+{formatCurrency(m.a_cobrar)}</h4>
          </div>

          <div className="bg-white dark:bg-slate-900 p-5 md:p-6 rounded-2xl border-t-4 border-tertiary shadow-lg">
            <div className="flex items-center space-x-2 mb-4 text-tertiary/60">
              <span className="material-symbols-outlined text-sm">outbox</span>
              <span className="text-[10px] font-black uppercase tracking-widest">Total Pagado</span>
            </div>
            <h4 className="text-2xl font-headline font-black text-rose-500">{formatCurrency(m.pagado)}</h4>
          </div>

          <div className="bg-white dark:bg-slate-900 p-5 md:p-6 rounded-2xl border-t-4 border-amber-600 shadow-lg">
            <div className="flex items-center space-x-2 mb-4 text-amber-600/60">
              <span className="material-symbols-outlined text-sm">assignment_late</span>
              <span className="text-[10px] font-black uppercase tracking-widest">A Pagar</span>
            </div>
            <h4 className="text-2xl font-headline font-black text-amber-600">-{formatCurrency(m.a_pagar)}</h4>
          </div>
        </div>

        {/* Patrimonio Neto - El Gran Balance */}
        <div className="bg-primary dark:bg-slate-800 p-6 md:p-8 rounded-[2rem] shadow-2xl flex flex-col md:flex-row justify-between items-center relative overflow-hidden text-white group">
          <div className="relative z-10 text-center md:text-left">
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40 mb-2">Resultado neto Proyectado</p>
            <h2 className="text-5xl md:text-6xl font-headline font-black tracking-tighter">
              {formatCurrency(m.proyectado)}
            </h2>
          </div>
          <div className="mt-6 md:mt-0 relative z-10 bg-white/10 px-6 py-4 rounded-2xl backdrop-blur-md border border-white/10">
             <p className="text-[9px] font-black uppercase tracking-widest text-white/50 mb-1">Efectivo Real Disponible</p>
             <p className="text-2xl font-black text-secondary-fixed">{formatCurrency(m.cobrado - m.pagado)}</p>
          </div>
          <span className="absolute right-0 top-0 material-symbols-outlined text-9xl opacity-10 -rotate-12 translate-x-1/4 -translate-y-1/4 group-hover:rotate-0 transition-transform">account_balance_wallet</span>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 items-center">
        <div className="flex bg-slate-100 dark:bg-slate-800 rounded-xl p-1 shadow-inner border border-slate-200/50">
          {['all', 'pagado', 'pendiente'].map((st) => (
            <button key={st} onClick={() => setFilterStatus(st)} className={`px-6 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${filterStatus === st ? 'bg-primary text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}>
              {st === 'all' ? 'Ver Todo' : (st === 'pagado' ? 'Ejecutado' : 'Pendiente')}
            </button>
          ))}
        </div>
        <div className="flex-1 bg-white dark:bg-slate-900 rounded-xl border border-slate-100 p-2 flex items-center">
           <span className="material-symbols-outlined text-slate-300 ml-2">search</span>
           <input value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} type="text" placeholder="Filtrar por concepto..." className="bg-transparent border-none text-xs font-bold w-full focus:ring-0 placeholder:text-slate-300" />
        </div>
      </div>

      {/* Table - Redesignada para Claridad Absoluta */}
      <div className="bg-white dark:bg-slate-950 rounded-[2.5rem] overflow-hidden shadow-2xl border border-outline-variant/5">
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[800px]">
          <thead className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800">
            <tr>
              <th className="px-4 py-4 md:px-6 md:py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Fecha</th>
              <th className="px-4 py-4 md:px-6 md:py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 text-center">Estado</th>
              <th className="px-4 py-4 md:px-6 md:py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Concepto</th>
              <th className="px-4 py-4 md:px-6 md:py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 text-right">Monto</th>
              <th className="px-4 py-4 md:px-6 md:py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
            {operaciones.map((op) => (
              <tr key={op.id} onClick={() => onOpenModal(op)} className="group hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-all cursor-pointer">
                <td className="px-4 py-4 md:px-6 md:py-6">
                  <span className="text-sm font-headline font-black text-primary">{new Date(op.fecha).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })}</span>
                </td>
                <td className="px-4 py-4 md:px-6 md:py-6 text-center">
                  <div className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${op.estado === 'pagado' ? 'bg-secondary/10 text-secondary' : 'bg-amber-100/50 text-amber-700'}`}>
                    {op.estado === 'pagado' ? (op.tipo === 'ingreso' ? 'Cobrado' : 'Pagado') : 'Pendiente'}
                  </div>
                </td>
                <td className="px-4 py-4 md:px-6 md:py-6">
                  <p className="text-base font-headline font-extrabold text-slate-800 dark:text-slate-50 group-hover:text-primary transition-colors">{op.titulo}</p>
                  <p className="text-[10px] uppercase font-black text-slate-400 mt-1 tracking-tighter opacity-60">{op.rubros?.nombre}</p>
                </td>
                <td className="px-4 py-4 md:px-6 md:py-6 text-right">
                  <div className="flex items-center justify-end space-x-2">
                    <span className={`material-symbols-outlined text-xs ${op.tipo === 'ingreso' ? 'text-emerald-500' : 'text-rose-500'}`}>
                      {op.tipo === 'ingreso' ? 'expand_more' : 'expand_less'}
                    </span>
                    <span className={`text-lg font-headline font-black ${op.tipo === 'ingreso' ? 'text-emerald-500' : 'text-rose-500'}`}>
                      {formatCurrency(Math.abs(op.monto))}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-4 md:px-6 md:py-6 text-center">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAnular(op.id, op.titulo);
                    }}
                    className="w-10 h-10 flex items-center justify-center rounded-full text-slate-500 hover:bg-rose-50 hover:text-rose-600 transition-all"
                    title="Anular operación"
                  >
                    <span className="material-symbols-outlined text-xl">block</span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  </div>
  );
};

export default Operations;
