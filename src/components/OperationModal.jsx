import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

const OperationModal = ({ isOpen, onClose, onSuccess, operationToEdit, currentSocioId }) => {
  const [loading, setLoading] = useState(false);
  const [rubros, setRubros] = useState([]);
  const [socios, setSocios] = useState([]);
  
  const [formData, setFormData] = useState({
    titulo: '',
    tipo: 'egreso',
    monto: '',
    rubro_id: '',
    socio_id: currentSocioId || '',
    fecha: new Date().toISOString().split('T')[0],
    descripcion: '',
    estado: 'pendiente'
  });

  useEffect(() => {
    if (isOpen) {
      fetchInitialData();
      if (operationToEdit) {
        setFormData({
          titulo: operationToEdit.titulo || '',
          tipo: operationToEdit.tipo || 'egreso',
          monto: operationToEdit.monto || '',
          rubro_id: operationToEdit.rubro_id || '',
          socio_id: operationToEdit.socio_id || '',
          fecha: operationToEdit.fecha || new Date().toISOString().split('T')[0],
          descripcion: operationToEdit.descripcion || '',
          estado: operationToEdit.estado || 'pendiente'
        });
      } else {
        setFormData({
          titulo: '',
          tipo: 'egreso',
          monto: '',
          rubro_id: '',
          socio_id: currentSocioId || '',
          fecha: new Date().toISOString().split('T')[0],
          descripcion: '',
          estado: 'pendiente'
        });
      }
    }
  }, [isOpen, operationToEdit]);

  const fetchInitialData = async () => {
    const { data: rubrosData } = await supabase.from('rubros').select('*');
    const { data: sociosData } = await supabase.from('socios').select('*');
    if (rubrosData) setRubros(rubrosData);
    if (sociosData) setSocios(sociosData);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const payload = {
        ...formData,
        monto: parseFloat(formData.monto)
      };

      let error;
      if (operationToEdit) {
        const { error: updateError } = await supabase
          .from('operaciones')
          .update(payload)
          .eq('id', operationToEdit.id);
        error = updateError;
      } else {
        const { error: insertError } = await supabase
          .from('operaciones')
          .insert([payload]);
        error = insertError;
      }

      if (error) throw error;
      
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('Error procesando operación:', error);
      alert('Error en la comunicación con el Libro Mayor.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" onClick={onClose}></div>

      <div className="relative bg-white dark:bg-slate-950 w-full max-w-lg max-h-[90vh] flex flex-col rounded-2xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in duration-200">
        <div className={`h-2 w-full flex-shrink-0 ${formData.tipo === 'ingreso' ? 'bg-secondary' : 'bg-tertiary'}`}></div>
        
        <div className="p-6 md:p-8 overflow-y-auto">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h3 className="text-2xl font-headline font-extrabold text-primary dark:text-white tracking-tight">
                {operationToEdit ? 'Editar Registro' : (formData.tipo === 'ingreso' ? 'Registrar Cobro' : 'Registrar Gasto')}
              </h3>
              <p className="text-xs text-on-surface-variant uppercase tracking-widest font-bold mt-1">Sincronización con Libro Mayor</p>
            </div>
            <button onClick={onClose} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-400 font-bold">
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex bg-slate-100 dark:bg-slate-900 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setFormData({...formData, tipo: 'egreso', estado: 'pendiente'})}
                className={`flex-1 py-3 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${formData.tipo === 'egreso' ? 'bg-white dark:bg-slate-800 text-tertiary shadow-sm' : 'text-slate-400'}`}
              >
                Gasto
              </button>
              <button
                type="button"
                onClick={() => setFormData({...formData, tipo: 'ingreso', estado: 'pendiente'})}
                className={`flex-1 py-3 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${formData.tipo === 'ingreso' ? 'bg-white dark:bg-slate-800 text-secondary shadow-sm' : 'text-slate-400'}`}
              >
                Ingreso
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">Concepto</label>
                <input
                  required
                  type="text"
                  placeholder="Ej: Mantenimiento Madrid"
                  className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary transition-all"
                  value={formData.titulo}
                  onChange={(e) => setFormData({...formData, titulo: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">Monto (€)</label>
                <input
                  required
                  type="number"
                  step="0.01"
                  className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary transition-all font-bold"
                  value={formData.monto}
                  onChange={(e) => setFormData({...formData, monto: e.target.value})}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">Fecha</label>
                <input
                  type="date"
                  className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary transition-all"
                  value={formData.fecha}
                  onChange={(e) => setFormData({...formData, fecha: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">Estado</label>
                <select
                  required
                  className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary appearance-none transition-all font-bold"
                  value={formData.estado}
                  onChange={(e) => setFormData({...formData, estado: e.target.value})}
                >
                  <option value="pendiente">⏳ Pendiente</option>
                  <option value="pagado">
                    {formData.tipo === 'ingreso' ? '✅ Cobrado' : '✅ Pagado'}
                  </option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">Rubro</label>
                <select
                  required
                  className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary appearance-none transition-all"
                  value={formData.rubro_id}
                  onChange={(e) => setFormData({...formData, rubro_id: e.target.value})}
                >
                  <option value="">Seleccionar...</option>
                  {rubros.map(r => <option key={r.id} value={r.id}>{r.nombre}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">Autor</label>
                <select
                  required
                  className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary appearance-none transition-all"
                  value={formData.socio_id}
                  onChange={(e) => setFormData({...formData, socio_id: e.target.value})}
                >
                  <option value="">Seleccionar...</option>
                  {socios.map(s => <option key={s.id} value={s.id}>{s.nombre}</option>)}
                </select>
              </div>
            </div>

            <div className="pt-4">
              <button
                disabled={loading}
                type="submit"
                className={`w-full py-4 rounded-xl font-headline font-bold text-white shadow-xl transition-all active:scale-95 flex items-center justify-center space-x-2 ${formData.tipo === 'ingreso' ? 'bg-secondary' : 'bg-primary'}`}
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <span className="material-symbols-outlined">{operationToEdit ? 'edit_note' : 'save'}</span>
                    <span>{operationToEdit ? 'Actualizar Ficha' : 'Guardar en Libro Mayor'}</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default OperationModal;
