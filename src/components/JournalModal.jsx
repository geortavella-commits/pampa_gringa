import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

const JournalModal = ({ isOpen, onClose, onSuccess, noteToEdit, currentSocioId }) => {
  const [loading, setLoading] = useState(false);
  const [socios, setSocios] = useState([]);
  
  const [formData, setFormData] = useState({
    titulo: '',
    categoria: 'acuerdo',
    prioridad: 'media',
    contenido: '',
    socio_id: currentSocioId || '',
    fecha: new Date().toISOString().split('T')[0] // Nueva columna de fecha
  });

  useEffect(() => {
    if (isOpen) {
      fetchSocios();
      if (noteToEdit) {
        setFormData({
          titulo: noteToEdit.titulo || '',
          categoria: noteToEdit.categoria || 'acuerdo',
          prioridad: noteToEdit.prioridad || 'media',
          contenido: noteToEdit.contenido || '',
          socio_id: noteToEdit.socio_id || '',
          fecha: noteToEdit.fecha || new Date().toISOString().split('T')[0]
        });
      } else {
        setFormData({
          titulo: '',
          categoria: 'acuerdo',
          prioridad: 'media',
          contenido: '',
          socio_id: currentSocioId || '',
          fecha: new Date().toISOString().split('T')[0]
        });
      }
    }
  }, [isOpen, noteToEdit]);

  const fetchSocios = async () => {
    const { data } = await supabase.from('socios').select('*');
    if (data) setSocios(data);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      let error;
      if (noteToEdit) {
        const { error: updateError } = await supabase
          .from('notas')
          .update(formData)
          .eq('id', noteToEdit.id);
        error = updateError;
      } else {
        const { error: insertError } = await supabase
          .from('notas')
          .insert([formData]);
        error = insertError;
      }

      if (error) throw error;
      
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('Error procesando nota:', error);
      alert('Error al guardar la nota en el diario.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md transition-opacity" onClick={onClose}></div>

      <div className="relative bg-white dark:bg-slate-950 w-full max-w-2xl max-h-[90vh] flex flex-col rounded-3xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 animate-in fade-in slide-in-from-bottom-4 duration-300">
        <div className="p-6 md:p-8 lg:p-12 overflow-y-auto">
          <div className="flex justify-between items-center mb-10">
            <div>
              <h3 className="text-3xl font-headline font-black text-primary tracking-tighter">
                {noteToEdit ? 'Editar Reflexión' : 'Nueva Nota del Curador'}
              </h3>
              <p className="text-[10px] text-on-surface-variant uppercase tracking-[0.2em] font-bold mt-2 italic">Registro Editorial para la Posteridad</p>
            </div>
            <button onClick={onClose} className="w-12 h-12 flex items-center justify-center rounded-full hover:bg-slate-100 transition-colors text-slate-400">
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">Título de la Entrada</label>
                <input
                  required
                  type="text"
                  placeholder="Ej: Acuerdo de Sucesión 2026"
                  className="w-full bg-transparent border-b-2 border-slate-100 focus:border-primary px-0 py-4 text-2xl font-headline font-bold transition-all focus:ring-0 placeholder:opacity-30"
                  value={formData.titulo}
                  onChange={(e) => setFormData({...formData, titulo: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">Fecha de la Nota</label>
                <input
                  required
                  type="date"
                  className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary transition-all"
                  value={formData.fecha}
                  onChange={(e) => setFormData({...formData, fecha: e.target.value})}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">Categoría</label>
                <select
                  required
                  className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary appearance-none transition-all"
                  value={formData.categoria}
                  onChange={(e) => setFormData({...formData, categoria: e.target.value})}
                >
                  <option value="acuerdo">Acuerdo</option>
                  <option value="reflexion">Reflexión</option>
                  <option value="hito">Hito</option>
                  <option value="estrategia">Estrategia</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">Prioridad</label>
                <select
                  required
                  className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary appearance-none transition-all"
                  value={formData.prioridad}
                  onChange={(e) => setFormData({...formData, prioridad: e.target.value})}
                >
                  <option value="baja">Baja</option>
                  <option value="media">Media</option>
                  <option value="alta">Alta</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">Curador</label>
                <select
                  required
                  className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary appearance-none transition-all"
                  value={formData.socio_id}
                  onChange={(e) => setFormData({...formData, socio_id: e.target.value})}
                >
                  <option value="">Seleccionar...</option>
                  {socios.map(s => <option key={s.id} value={s.id}>{s.nombre}</option>)}
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">Contenido</label>
              <textarea
                required
                rows="6"
                placeholder="Escribe aquí las conclusiones, acuerdos o visiones estratégicas..."
                className="w-full bg-slate-50 border-none rounded-2xl p-6 text-sm font-body leading-relaxed focus:ring-2 focus:ring-primary transition-all resize-none"
                value={formData.contenido}
                onChange={(e) => setFormData({...formData, contenido: e.target.value})}
              ></textarea>
            </div>

            <div className="pt-6">
              <button
                disabled={loading}
                type="submit"
                className="w-full py-5 rounded-2xl bg-primary text-white font-headline font-black text-lg shadow-2xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center space-x-3"
              >
                {loading ? (
                  <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <span className="material-symbols-outlined">auto_stories</span>
                    <span>{noteToEdit ? 'Guardar Cambios' : 'Publicar en el Diario'}</span>
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

export default JournalModal;
