import React, { useEffect, useState } from 'react';
import { Navbar, PageView } from './components/layout/Navbar';
import { DashboardPage } from './pages/DashboardPage';
import { NewIncidentPage } from './pages/NewIncidentPage';
import { IncidentAnalysisPage } from './pages/IncidentAnalysisPage';
import { IncidentHistoryPage } from './pages/IncidentHistoryPage';
import { MemoryPage } from './pages/MemoryPage';
import { RunbooksPage } from './pages/RunbooksPage';
import { Runbook } from './types/incident';
import { api } from './services/api';

export const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<PageView>('dashboard');
  const [activeIncidentId, setActiveIncidentId] = useState<string>('INC-001');
  const [selectedRunbookId, setSelectedRunbookId] = useState<string | undefined>(undefined);
  const [memorySource, setMemorySource] = useState<'Demo Memory' | 'Hindsight Memory'>('Demo Memory');

  useEffect(() => {
    // Fetch initial memory source label from backend
    api.getMetrics().then((m) => {
      if (m?.memorySource) {
        setMemorySource(m.memorySource);
      }
    }).catch(() => {
      // Default to Demo Memory
    });
  }, []);

  const handleNavigate = (view: PageView, params?: { incidentId?: string; runbookId?: string }) => {
    if (params?.incidentId) {
      setActiveIncidentId(params.incidentId);
    }
    if (params?.runbookId) {
      setSelectedRunbookId(params.runbookId);
    }
    setCurrentView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenRunbookModal = (runbook: Runbook) => {
    setSelectedRunbookId(runbook.id);
    setCurrentView('runbooks');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Navigation */}
      <Navbar
        currentView={currentView}
        onNavigate={(view) => handleNavigate(view)}
        memorySource={memorySource}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentView === 'dashboard' && <DashboardPage onNavigate={handleNavigate} />}
        {currentView === 'new-incident' && <NewIncidentPage onNavigate={handleNavigate} />}
        {currentView === 'analysis' && (
          <IncidentAnalysisPage
            incidentId={activeIncidentId}
            onNavigate={handleNavigate}
            onOpenRunbookModal={handleOpenRunbookModal}
          />
        )}
        {currentView === 'history' && <IncidentHistoryPage onNavigate={handleNavigate} />}
        {currentView === 'memory' && <MemoryPage />}
        {currentView === 'runbooks' && <RunbooksPage selectedRunbookId={selectedRunbookId} />}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-slate-900 py-6 mt-12 text-xs text-slate-400 font-mono">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-200">INCIDENTMIND</span>
            <span>·</span>
            <span>Remember every incident. Resolve the next one faster.</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sky-400">Memory Provider: {memorySource}</span>
            <span>·</span>
            <span className="text-purple-400">AI Incident Response Intelligence</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
