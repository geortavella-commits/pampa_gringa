import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

const sanitizeFilename = (name) =>
  name.replace(/[^a-zA-Z0-9.\-_() áéíóúÁÉÍÓÚüÜñÑ]/g, '_').replace(/\s+/g, ' ').trim();

const DocumentosModal = ({ isOpen, onClose, onSuccess, documentoToEdit, currentSocioId }) => {
  const [loading, setLoading] = useState(false);
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [categoria, setCategoria] = useState('factura');
  const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0]);
  const [file, setFile] = useState(null);

  useEffect(() => {
    if (isOpen) {
      if (documentoToEdit) {
        setNombre(documentoToEdit.nombre || '');
        setDescripcion(documentoToEdit.descripcion || '');
        setCategoria(documentoToEdit.categoria || 'factura');
        setFecha(documentoToEdit.fecha || new Date().toISOString().split('T')[0]);
        setFile(null);
      } else {
        setNombre('');
        setDescripcion('');
        setCategoria('factura');
        setFecha(new Date().toISOString().split('T')[0]);
        setFile(null);
      }
    }
  }, [isOpen, documentoToEdit]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (documentoToEdit) {
        if (file) {
          const { error: removeError } = await supabase.storage
            .from('documentos')
            .remove([documentoToEdit.storage_path]);
          if (removeError) throw removeError;

          const storagePath = `${categoria}/${Date.now()}-${sanitizeFilename(file.name)}`;
          const { error: uploadError } = await supabase.storage
            .from('documentos')
            .upload(storagePath, file);
          if (uploadError) throw uploadError;

          const { error: updateError } = await supabase
            .from('documentos')
            .update({
              nombre,
              descripcion,
              categoria,
              fecha,
              storage_path: storagePath,
              storage_name: file.name,
              mime_type: file.type,
              size_bytes: file.size,
              socio_id: currentSocioId
            })
            .eq('id', documentoToEdit.id);
          if (updateError) throw updateError;
        } else {
          const { error: updateError } = await supabase
            .from('documentos')
            .update({
              nombre,
              descripcion,
              categoria,
              fecha
            })
            .eq('id', documentoToEdit.id);
          if (updateError) throw updateError;
        }
      } else {
        if (!file) throw new Error('Debe seleccionar un archivo');

        const storagePath = `${categoria}/${Date.now()}-${sanitizeFilename(file.name)}`;
        const { error: uploadError } = await supabase.storage
          .from('documentos')
          .upload(storagePath, file);
        if (uploadError) throw uploadError;

        const { error: insertError } = await supabase
          .from('documentos')
          .insert([{
            nombre,
            descripcion,
            categoria,
            fecha,
            storage_path: storagePath,
            storage_name: file.name,
            mime_type: file.type,
            size_bytes: file.size,
            socio_id: currentSocioId
          }]);
        if (insertError) throw insertError;
      }

      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('DocumentosModal error:', error);
      const msg = error?.message || error?.error_description || JSON.stringify(error);
      alert(`Error al guardar el documento:\n${msg}`);
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
                {documentoToEdit ? 'Editar Documento' : 'Subir Documento'}
              </h3>
              <p className="text-[10px] text-on-surface-variant uppercase tracking-[0.2em] font-bold mt-2 italic">Archivo de Patrimonio Familiar</p>
            </div>
            <button onClick={onClose} className="w-12 h-12 flex items-center justify-center rounded-full hover:bg-slate-100 transition-colors text-slate-400">
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">Nombre del Documento</label>
                <input
                  required
                  type="text"
                  placeholder="Ej: Escritura de Campo"
                  className="w-full bg-transparent border-b-2 border-slate-100 focus:border-primary px-0 py-4 text-2xl font-headline font-bold transition-all focus:ring-0 placeholder:opacity-30"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">Fecha del Documento</label>
                <input
                  required
                  type="date"
                  className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary transition-all"
                  value={fecha}
                  onChange={(e) => setFecha(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">Categoría</label>
              <select
                required
                className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary appearance-none transition-all"
                value={categoria}
                onChange={(e) => setCategoria(e.target.value)}
              >
                <option value="factura">Factura</option>
                <option value="contrato">Contrato</option>
                <option value="escritura">Escritura</option>
                <option value="impuesto">Impuesto</option>
                <option value="seguro">Seguro</option>
                <option value="otro">Otro</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">Descripción</label>
              <textarea
                rows="4"
                placeholder="Escribe detalles adicionales sobre el documento..."
                className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-2xl p-6 text-sm font-body leading-relaxed focus:ring-2 focus:ring-primary transition-all resize-none"
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
              ></textarea>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">Archivo</label>
              <div className="relative border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl p-6 flex flex-col items-center justify-center bg-slate-50/50 hover:bg-slate-50 transition-all cursor-pointer">
                <input
                  type="file"
                  required={!documentoToEdit}
                  accept=".pdf,.jpg,.jpeg,.png,.webp,.doc,.docx,.xls,.xlsx"
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  onChange={(e) => setFile(e.target.files[0])}
                />
                <span className="material-symbols-outlined text-4xl text-slate-400 mb-2">upload_file</span>
                <p className="text-sm font-medium text-slate-750 dark:text-slate-250 text-center">
                  {file ? file.name : documentoToEdit ? 'Dejar vacío para mantener el archivo actual' : 'Seleccionar archivo'}
                </p>
                <p className="text-xs text-slate-400 mt-1">PDF, JPG, PNG, WEBP, DOC, DOCX, XLS, XLSX</p>
              </div>
            </div>

            <div className="flex gap-4 pt-6">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-4 rounded-xl border border-outline-variant/30 text-on-surface-variant font-headline font-bold text-sm hover:bg-slate-50 active:scale-95 transition-all text-center"
              >
                Cancelar
              </button>
              <button
                disabled={loading}
                type="submit"
                className="flex-1 py-4 rounded-xl bg-primary text-white font-headline font-bold text-sm shadow-xl shadow-primary/10 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center space-x-2"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <span>{documentoToEdit ? 'Guardar Cambios' : 'Subir'}</span>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default DocumentosModal;
