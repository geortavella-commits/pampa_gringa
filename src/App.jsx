import React, { useState } from 'react';
import Dashboard from './components/Dashboard';
import Operations from './components/Operations';
import Journal from './components/Journal';
import OperationModal from './components/OperationModal';
import JournalModal from './components/JournalModal';
import Configuration from './components/Configuration';
import SociosBalance from './components/SociosBalance';
import SocioSelector from './components/SocioSelector';

function App() {
  const [currentView, setCurrentView] = useState('dashboard');
  const [currentSocio, setCurrentSocio] = useState(() => {
    const saved = localStorage.getItem('currentSocio');
    return saved ? JSON.parse(saved) : null;
  });
  
  // Operaciones State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [operationToEdit, setOperationToEdit] = useState(null);
  
  // Journal State
  const [isJournalModalOpen, setIsJournalModalOpen] = useState(false);
  const [noteToEdit, setNoteToEdit] = useState(null);
  
  const [refreshKey, setRefreshKey] = useState(0);

  const handleSelectSocio = (socio) => {
    setCurrentSocio(socio);
    localStorage.setItem('currentSocio', JSON.stringify(socio));
  };

  const handleLogoutSocio = () => {
    setCurrentSocio(null);
    localStorage.removeItem('currentSocio');
  };

  const handleOpenModal = (operation = null) => {
    setOperationToEdit(operation);
    setIsModalOpen(true);
  };

  const handleOpenJournalModal = (note = null) => {
    setNoteToEdit(note);
    setIsJournalModalOpen(true);
  };

  const handleSuccess = () => {
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="flex min-h-screen">
      {/* SideNavBar */}
      <aside className="hidden md:flex flex-col h-screen w-64 border-r-0 bg-slate-50 dark:bg-slate-950 p-6 space-y-8 sticky top-0 flex-shrink-0 z-50">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 lacquered-gradient rounded-xl flex items-center justify-center text-white">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>account_balance</span>
          </div>
          <div>
            <h1 className="font-headline text-2xl font-black text-slate-900 dark:text-slate-50 leading-none">La Pampa Gringa</h1>
            <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold tracking-widest">Curador de Patrimonio</p>
          </div>
        </div>
        
        <button 
          onClick={() => handleOpenModal()}
          className="w-full bg-gradient-to-br from-primary to-primary-container text-on-primary py-3 rounded-xl flex items-center justify-center space-x-2 shadow-xl shadow-primary/10 active:scale-95 transition-all text-sm font-bold"
        >
          <span className="material-symbols-outlined text-sm">add</span>
          <span>Nueva Operación</span>
        </button>

        <nav className="flex-1 space-y-1">
          <button 
            onClick={() => setCurrentView('dashboard')}
            className={`w-full flex items-center space-x-3 px-4 py-3 transition-all rounded-lg font-body text-sm font-medium ${currentView === 'dashboard' ? 'bg-slate-200/50 dark:bg-slate-800/50 text-slate-900 dark:text-slate-50 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900'}`}
          >
            <span className="material-symbols-outlined" style={{ fontVariationSettings: currentView === 'dashboard' ? "'FILL' 1" : "'FILL' 0" }}>dashboard</span>
            <span>Panel General</span>
          </button>
          
          <button 
            onClick={() => setCurrentView('operations')}
            className={`w-full flex items-center space-x-3 px-4 py-3 transition-all rounded-lg font-body text-sm font-medium ${currentView === 'operations' ? 'bg-slate-200/50 dark:bg-slate-800/50 text-slate-900 dark:text-slate-50 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900'}`}
          >
            <span className="material-symbols-outlined" style={{ fontVariationSettings: currentView === 'operations' ? "'FILL' 1" : "'FILL' 0" }}>list_alt</span>
            <span>Operaciones</span>
          </button>

          <button 
            onClick={() => setCurrentView('socios')}
            className={`w-full flex items-center space-x-3 px-4 py-3 transition-all rounded-lg font-body text-sm font-medium ${currentView === 'socios' ? 'bg-slate-200/50 dark:bg-slate-800/50 text-slate-900 dark:text-slate-50 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900'}`}
          >
            <span className="material-symbols-outlined" style={{ fontVariationSettings: currentView === 'socios' ? "'FILL' 1" : "'FILL' 0" }}>group</span>
            <span>Balance por Socio</span>
          </button>

          <button 
            onClick={() => setCurrentView('journal')}
            className={`w-full flex items-center space-x-3 px-4 py-3 transition-all rounded-lg font-body text-sm font-medium ${currentView === 'journal' ? 'bg-slate-200/50 dark:bg-slate-800/50 text-slate-900 dark:text-slate-50 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900'}`}
          >
            <span className="material-symbols-outlined" style={{ fontVariationSettings: currentView === 'journal' ? "'FILL' 1" : "'FILL' 0" }}>menu_book</span>
            <span>Diario</span>
          </button>

          <button 
            onClick={() => setCurrentView('config')}
            className={`w-full flex items-center space-x-3 px-4 py-3 transition-all rounded-lg font-body text-sm font-medium ${currentView === 'config' ? 'bg-slate-200/50 dark:bg-slate-800/50 text-slate-900 dark:text-slate-50 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900'}`}
          >
            <span className="material-symbols-outlined" style={{ fontVariationSettings: currentView === 'config' ? "'FILL' 1" : "'FILL' 0" }}>settings</span>
            <span>Configuración</span>
          </button>
        </nav>

        <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-4">
          <div className="group relative">
            <div className="flex items-center gap-3 px-4 py-3 bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800">
              <img 
                className="w-10 h-10 rounded-full object-cover ring-2 ring-primary/20" 
                src={currentSocio?.avatar_url || `https://ui-avatars.com/api/?name=${currentSocio?.nombre}&background=random`} 
                alt="profile" 
              />
              <div className="overflow-hidden flex-1">
                <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{currentSocio?.nombre}</p>
                <p className="text-[10px] text-slate-500 truncate uppercase font-bold tracking-tighter">{currentSocio?.rol || 'Socio'}</p>
              </div>
              <button 
                onClick={handleLogoutSocio}
                className="opacity-0 group-hover:opacity-100 absolute inset-0 bg-primary/95 rounded-xl flex items-center justify-center text-white text-[10px] font-black uppercase tracking-widest transition-all"
              >
                Cambiar Socio
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-w-0 bg-surface flex flex-col h-screen overflow-hidden">
        {/* TopAppBar */}
        <header className="bg-slate-50/80 dark:bg-slate-950/80 backdrop-blur-xl flex justify-between items-center w-full px-8 py-4 sticky top-0 z-40 flex-shrink-0">
          <div className="flex items-center space-x-4">
            <h2 className="text-xl font-bold tracking-widest uppercase text-slate-900 dark:text-slate-50 font-headline">Libro Editorial</h2>
          </div>
          <div className="flex items-center space-x-6">
            <div className="relative hidden lg:block">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">search</span>
              <input className="bg-slate-100/50 dark:bg-slate-900/50 border-none rounded-full pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-primary w-64 transition-all" placeholder="Buscar entradas..." type="text" />
            </div>
            <div className="flex items-center space-x-4">
              <span className="material-symbols-outlined text-slate-500 hover:text-slate-900 cursor-pointer">notifications</span>
              <span className="material-symbols-outlined text-slate-500 hover:text-slate-900 cursor-pointer">settings</span>
            </div>
          </div>
        </header>

        {/* Dynamic Content */}
        <div className="flex-1 overflow-y-auto">
          {currentView === 'dashboard' && (
            <Dashboard 
              key={`dash-${refreshKey}`} 
              onOpenModal={handleOpenModal} 
            />
          )}
          {currentView === 'operations' && (
            <Operations 
              key={`ops-${refreshKey}`} 
              onOpenModal={handleOpenModal} 
            />
          )}
          {currentView === 'journal' && (
            <Journal 
              key={`journal-${refreshKey}`} 
              onOpenModal={handleOpenJournalModal} 
            />
          )}
          {currentView === 'config' && (
            <Configuration />
          )}
          {currentView === 'socios' && (
            <SociosBalance key={`socios-${refreshKey}`} />
          )}
        </div>
      </main>

      {/* Mobile Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-slate-50/90 backdrop-blur-md flex justify-around items-center py-4 px-6 z-50 border-t border-slate-200">
        <button onClick={() => setCurrentView('dashboard')} className={`flex flex-col items-center gap-1 ${currentView === 'dashboard' ? 'text-slate-900 border-b-2 border-slate-900' : 'text-slate-500'}`}>
          <span className="material-symbols-outlined">dashboard</span>
          <span className="text-[10px] font-bold uppercase font-headline">Inicio</span>
        </button>
        <button onClick={() => setCurrentView('operations')} className={`flex flex-col items-center gap-1 ${currentView === 'operations' ? 'text-slate-900 border-b-2 border-slate-900' : 'text-slate-500'}`}>
          <span className="material-symbols-outlined">list_alt</span>
          <span className="text-[10px] font-bold uppercase font-headline">Opers</span>
        </button>
        <button onClick={() => setCurrentView('journal')} className={`flex flex-col items-center gap-1 ${currentView === 'journal' ? 'text-slate-900 border-b-2 border-slate-900' : 'text-slate-500'}`}>
          <span className="material-symbols-outlined">menu_book</span>
          <span className="text-[10px] font-bold uppercase font-headline">Diario</span>
        </button>
        <button onClick={() => setCurrentView('socios')} className={`flex flex-col items-center gap-1 ${currentView === 'socios' ? 'text-slate-900 border-b-2 border-slate-900' : 'text-slate-500'}`}>
          <span className="material-symbols-outlined">group</span>
          <span className="text-[10px] font-bold uppercase font-headline">Socios</span>
        </button>
        <button onClick={() => setCurrentView('config')} className={`flex flex-col items-center gap-1 ${currentView === 'config' ? 'text-slate-900 border-b-2 border-slate-900' : 'text-slate-500'}`}>
          <span className="material-symbols-outlined">settings</span>
          <span className="text-[10px] font-bold uppercase font-headline">Config</span>
        </button>
      </nav>

      {/* Socio Selection Overlay */}
      {!currentSocio && <SocioSelector onSelect={handleSelectSocio} />}

      {/* Modals */}
      <OperationModal 
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setOperationToEdit(null); }}
        onSuccess={handleSuccess}
        operationToEdit={operationToEdit}
        currentSocioId={currentSocio?.id}
      />
      <JournalModal 
        isOpen={isJournalModalOpen}
        onClose={() => { setIsJournalModalOpen(false); setNoteToEdit(null); }}
        onSuccess={handleSuccess}
        noteToEdit={noteToEdit}
        currentSocioId={currentSocio?.id}
      />
    </div>
  );
}

export default App;
