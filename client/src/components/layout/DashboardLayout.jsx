import { Outlet } from '@tanstack/react-router';
import { useState } from 'react';
import DashboardSidebar from '../dashboard/DashboardSidebar';
import DashboardTopbar from '../dashboard/DashboardTopbar';

export default function DashboardLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="relative overflow-x-hidden">
      <div className="mb-4 flex xl:hidden">
        <button
          type="button"
          onClick={() => setIsSidebarOpen(true)}
          className="app-button app-button-secondary w-full"
        >
          Open navigation
        </button>
      </div>

      {isSidebarOpen && (
        <div className="fixed inset-0 z-40 bg-slate-950/70 xl:hidden" onClick={() => setIsSidebarOpen(false)} />
      )}

      <div className="grid gap-6 xl:grid-cols-[256px_minmax(0,1fr)]">
        <div className={`fixed inset-y-0 left-0 z-50 w-64 max-w-[85vw] transform p-4 transition-all duration-200 xl:static xl:w-auto xl:max-w-none xl:translate-x-0 xl:p-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full xl:translate-x-0'}`}>
          <div className="h-full xl:sticky xl:top-6 xl:h-auto xl:self-start">
            <div className="mb-4 flex justify-end xl:hidden">
              <button type="button" onClick={() => setIsSidebarOpen(false)} className="app-button app-button-secondary w-full">
                Close navigation
              </button>
            </div>
            <DashboardSidebar />
          </div>
        </div>

        <div className="min-w-0 space-y-6">
          <DashboardTopbar />
          <section className="min-w-0 overflow-x-hidden">
            <Outlet />
          </section>
        </div>
      </div>
    </div>
  );
}
