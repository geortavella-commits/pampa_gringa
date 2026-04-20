import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

const Configuration = () => {
  const [loading, setLoading] = useState(true);
  const [socios, setSocios] = useState([]);
  const [rubros, setRubros] = useState([]);
  
  // Estados para edición/creación
  const [newSocio, setNewSocio] = useState('');
  const [newRubro, setNewRubro] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const { data: sData } = await supabase.from('socios').select('*').order('nombre');
    const { data: rData } = await supabase.from('rubros').select('*').order('nombre');
    if (sData) setSocios(sData);
    if (rData) setRubros(rData);
    setLoading(false);
  };

  const handleAdd = async (table, value, setter) => {
    if (!value.trim()) return;
    const { error } = await supabase.from(table).insert([{ nombre: value }]);
    if (!error) {
      setter('');
      fetchData();
    } else {
      alert("Error al añadir: " + error.message);
    }
  };

  const handleDelete = async (table, id) => {
    if (!confirm('¿Estás seguro? Si este ítem tiene operaciones asociadas no podrá borrarse por seguridad.')) return;
    const { error } = await supabase.from(table).delete().eq('id', id);
    if (error) {
      alert("No se puede eliminar: Probablemente existen registros vinculados a este ítem.");
    } else {
      fetchData();
    }
  };

  const startEdit = (id, val) => {
    setEditingId(id);
    setEditValue(val);
  };

  const handleUpdate = async (table) => {
    const { error } = await supabase.from(table).update({ nombre: editValue }).eq('id', editingId);
    if (!error) {
      setEditingId(null);
      fetchData();
    }
  };

  return (
    <div className="p-8 lg:p-12 max-w-7xl mx-auto w-full space-y-12 pb-32">
      <header>
        <span className="text-secondary font-headline font-bold text-sm tracking-widest uppercase mb-2 block tracking-[0.3em]">Sistema de Control</span>
        <h3 className="text-4xl lg:text-5xl font-headline font-black text-primary tracking-tight">Configuración</h3>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        
        {/* SECCIÓN SOCIOS */}
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b-2 border-primary/10 pb-4">
            <h4 className="text-xl font-headline font-black text-primary flex items-center gap-2">
               <span className="material-symbols-outlined">group</span>
               SOCIOS
            </h4>
            <span className="bg-slate-100 text-[10px] font-black px-3 py-1 rounded-full">{socios.length} TOTAL</span>
          </div>

          <div className="flex gap-2">
            <input 
              value={newSocio}
              onChange={(e) => setNewSocio(e.target.value)}
              placeholder="Nombre del nuevo socio..." 
              className="flex-1 bg-white dark:bg-slate-900 border-none rounded-xl px-6 py-4 text-sm font-bold shadow-sm focus:ring-2 focus:ring-primary"
            />
            <button 
              onClick={() => handleAdd('socios', newSocio, setNewSocio)}
              className="bg-primary text-white p-4 rounded-xl shadow-lg hover:scale-105 transition-all"
            >
              <span className="material-symbols-outlined">add</span>
            </button>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-3xl overflow-hidden shadow-xl border border-outline-variant/5">
            <ul className="divide-y divide-slate-50 dark:divide-slate-800">
              {socios.map(s => (
                <li key={s.id} className="p-6 flex items-center justify-between group">
                  {editingId === s.id ? (
                    <div className="flex-1 flex gap-2">
                      <input value={editValue} onChange={(e) => setEditValue(e.target.value)} className="flex-1 bg-slate-50 p-2 rounded-lg text-sm border border-primary" />
                      <button onClick={() => handleUpdate('socios')} className="text-secondary text-sm font-black">GUARDAR</button>
                    </div>
                  ) : (
                    <>
                      <span className="text-sm font-headline font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide">{s.nombre}</span>
                      <div className="flex gap-4 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => startEdit(s.id, s.nombre)} className="text-slate-400 hover:text-primary"><span className="material-symbols-outlined text-lg">edit</span></button>
                        <button onClick={() => handleDelete('socios', s.id)} className="text-slate-400 hover:text-tertiary"><span className="material-symbols-outlined text-lg">delete</span></button>
                      </div>
                    </>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* SECCIÓN RUBROS */}
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b-2 border-secondary/10 pb-4">
            <h4 className="text-xl font-headline font-black text-secondary flex items-center gap-2">
               <span className="material-symbols-outlined">category</span>
               RUBROS
            </h4>
            <span className="bg-slate-100 text-[10px] font-black px-3 py-1 rounded-full">{rubros.length} TOTAL</span>
          </div>

          <div className="flex gap-2">
            <input 
              value={newRubro}
              onChange={(e) => setNewRubro(e.target.value)}
              placeholder="Categoría de gasto/ingreso..." 
              className="flex-1 bg-white dark:bg-slate-900 border-none rounded-xl px-6 py-4 text-sm font-bold shadow-sm focus:ring-2 focus:ring-secondary"
            />
            <button 
              onClick={() => handleAdd('rubros', newRubro, setNewRubro)}
              className="bg-secondary text-white p-4 rounded-xl shadow-lg hover:scale-105 transition-all"
            >
              <span className="material-symbols-outlined">add</span>
            </button>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-3xl overflow-hidden shadow-xl border border-outline-variant/5">
            <ul className="divide-y divide-slate-50 dark:divide-slate-800">
              {rubros.map(r => (
                <li key={r.id} className="p-6 flex items-center justify-between group">
                  {editingId === r.id ? (
                    <div className="flex-1 flex gap-2">
                      <input value={editValue} onChange={(e) => setEditValue(e.target.value)} className="flex-1 bg-slate-50 p-2 rounded-lg text-sm border border-secondary" />
                      <button onClick={() => handleUpdate('rubros')} className="text-primary text-sm font-black">GUARDAR</button>
                    </div>
                  ) : (
                    <>
                      <span className="text-sm font-headline font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide">{r.nombre}</span>
                      <div className="flex gap-4 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => startEdit(r.id, r.nombre)} className="text-slate-400 hover:text-secondary"><span className="material-symbols-outlined text-lg">edit</span></button>
                        <button onClick={() => handleDelete('rubros', r.id)} className="text-slate-400 hover:text-tertiary"><span className="material-symbols-outlined text-lg">delete</span></button>
                      </div>
                    </>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Configuration;
