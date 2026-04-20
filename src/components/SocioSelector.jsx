import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

const SocioSelector = ({ onSelect }) => {
  const [socios, setSocios] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSocios = async () => {
      const { data } = await supabase.from('socios').select('*').order('nombre');
      if (data) setSocios(data);
      setLoading(false);
    };
    fetchSocios();
  }, []);

  if (loading) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-950 p-6">
      <div className="max-w-4xl w-full text-center space-y-12 animate-in fade-in zoom-in duration-500">
        <div>
          <span className="text-secondary font-headline font-bold text-sm tracking-[0.4em] uppercase mb-4 block">Bienvenido a The Ledger</span>
          <h2 className="text-4xl md:text-6xl font-headline font-black text-white tracking-tighter">¿Quién eres hoy?</h2>
          <p className="text-slate-400 mt-4 text-lg">Selecciona tu perfil para personalizar tu sesión.</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {socios.map((socio) => (
            <button
              key={socio.id}
              onClick={() => onSelect(socio)}
              className="group relative bg-slate-900 border border-slate-800 p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] transition-all hover:bg-primary hover:border-primary hover:-translate-y-2 hover:shadow-2xl hover:shadow-primary/20"
            >
              <div className="w-16 h-16 md:w-20 md:h-20 mx-auto mb-6 rounded-full overflow-hidden ring-4 ring-slate-800 group-hover:ring-white/20">
                <img 
                  src={socio.avatar_url || `https://ui-avatars.com/api/?name=${socio.nombre}&background=random`} 
                  alt={socio.nombre}
                  className="w-full h-full object-cover"
                />
              </div>
              <p className="text-white font-headline font-black text-xl group-hover:scale-110 transition-transform">{socio.nombre}</p>
              <p className="text-slate-500 text-[10px] uppercase font-black tracking-widest mt-2 group-hover:text-white/60">{socio.rol || 'Socio'}</p>
            </button>
          ))}
        </div>
        
        <p className="text-slate-600 text-xs uppercase font-black tracking-[0.2em] pt-8 italic">Gestión de Patrimonio Familiar • v2026</p>
      </div>
    </div>
  );
};

export default SocioSelector;
