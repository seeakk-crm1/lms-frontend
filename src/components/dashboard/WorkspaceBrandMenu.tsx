import React, { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Building2, ChevronRight, PencilLine, Sparkles } from 'lucide-react';
import useAuthStore from '../../store/useAuthStore';
import { hasPermission } from '../../utils/permissions';
import WorkspaceBrandModal from './WorkspaceBrandModal';

interface WorkspaceBrandMenuProps {
  isCollapsed: boolean;
  isMobile?: boolean;
}

const WorkspaceBrandMenu: React.FC<WorkspaceBrandMenuProps> = ({ isCollapsed, isMobile = false }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const user = useAuthStore((state) => state.user);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const workspaceName = user?.workspace?.companyName?.trim() || 'Workspace';
  const workspaceLogo = user?.workspace?.logoUrl || null;
  const canEditWorkspace = hasPermission(user, 'SYSTEM_CONFIG');

  const workspaceInitials = useMemo(
    () =>
      workspaceName
        .split(/\s+/)
        .filter(Boolean)
        .map((part) => part[0])
        .join('')
        .slice(0, 2)
        .toUpperCase() || 'WS',
    [workspaceName],
  );

  useEffect(() => {
    if (!isMenuOpen) return undefined;

    const handleClickOutside = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('keydown', handleEscape);
    };
  }, [isMenuOpen]);

  const trigger = isCollapsed ? (
    workspaceLogo ? (
      <div className="h-10 w-10 overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
        <img src={workspaceLogo} alt={workspaceName} className="h-full w-full object-contain p-1" />
      </div>
    ) : (
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 text-xs font-black text-white shadow-sm">
        {workspaceInitials}
      </div>
    )
  ) : (
    <div className="flex min-w-0 items-center gap-3">
      {workspaceLogo ? (
        <div className="flex h-11 w-14 items-center justify-center overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
          <img src={workspaceLogo} alt={workspaceName} className="h-full w-full object-contain" />
        </div>
      ) : (
        <div className="flex h-11 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 text-sm font-black text-white shadow-sm">
          {workspaceInitials}
        </div>
      )}
      <div className="min-w-0 text-left">
        <p className="truncate text-sm font-black text-gray-900">{workspaceName}</p>
        <p className="truncate text-[10px] font-bold uppercase tracking-wider text-gray-400">
          Company Workspace
        </p>
      </div>
    </div>
  );

  return (
    <>
      <div ref={containerRef} className={`relative ${isCollapsed ? '' : 'flex-1'}`}>
        <button
          type="button"
          onClick={() => setIsMenuOpen((current) => !current)}
          aria-label="Open company branding menu"
          aria-haspopup="menu"
          aria-expanded={isMenuOpen}
          className={`group flex w-full items-center transition-all duration-200 ${
            isCollapsed
              ? 'justify-center rounded-2xl p-2 hover:bg-gray-50'
              : 'justify-between gap-3 rounded-2xl px-3 py-2 hover:bg-gray-50'
          }`}
        >
          {trigger}
          {!isCollapsed ? (
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-gray-300 transition-colors group-hover:bg-white group-hover:text-gray-500">
              <ChevronRight size={18} className={`transition-transform duration-200 ${isMenuOpen ? 'rotate-90' : ''}`} />
            </div>
          ) : null}
        </button>

        <AnimatePresence>
          {isMenuOpen ? (
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.96 }}
              transition={{ type: 'spring', stiffness: 340, damping: 28, mass: 0.8 }}
              className={`z-[85] overflow-hidden rounded-[28px] border border-gray-100 bg-white/95 shadow-[0_30px_80px_-35px_rgba(15,23,42,0.35)] backdrop-blur-xl ${
                isCollapsed
                  ? 'absolute left-[calc(100%+12px)] top-0 w-[320px]'
                  : `absolute ${isMobile ? 'left-0 right-0 top-[calc(100%+10px)]' : 'left-0 right-0 top-[calc(100%+10px)]'}`
              }`}
              role="menu"
              aria-label="Company branding menu"
            >
              <div className="border-b border-gray-100 bg-gradient-to-br from-emerald-50 via-white to-white px-5 py-5">
                <div className="flex items-start gap-4">
                  {workspaceLogo ? (
                    <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
                      <img src={workspaceLogo} alt={workspaceName} className="h-full w-full object-contain p-2" />
                    </div>
                  ) : (
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 text-lg font-black text-white shadow-lg shadow-emerald-500/20">
                      {workspaceInitials}
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] font-black uppercase tracking-[0.24em] text-emerald-500">
                      Workspace brand
                    </p>
                    <h3 className="mt-1 truncate text-lg font-black text-gray-900">{workspaceName}</h3>
                    <p className="mt-1 text-sm font-medium text-gray-500">Company Workspace</p>
                    <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-emerald-100 bg-white/90 px-3 py-1 text-[11px] font-black uppercase tracking-wider text-emerald-700">
                      <Sparkles size={12} />
                      Live branding
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-2 px-3 py-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsMenuOpen(false);
                    setIsModalOpen(true);
                  }}
                  disabled={!canEditWorkspace}
                  className="flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left transition-all hover:bg-emerald-50/60 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                    <PencilLine size={17} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-black text-gray-900">Edit company branding</p>
                    <p className="mt-1 text-sm font-medium text-gray-500">
                      Update company name and workspace logo from one place.
                    </p>
                  </div>
                  <ChevronRight size={16} className="shrink-0 text-gray-300" />
                </button>

                {!canEditWorkspace ? (
                  <div className="rounded-2xl border border-amber-100 bg-amber-50 px-4 py-3 text-sm font-medium leading-6 text-amber-700">
                    You can view workspace branding here, but only users with company configuration access can edit it.
                  </div>
                ) : (
                  <div className="rounded-2xl border border-gray-100 bg-gray-50/70 px-4 py-3 text-sm font-medium leading-6 text-gray-500">
                    The company logo shown here is the same branding used in the workspace sidebar.
                  </div>
                )}
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>

      <WorkspaceBrandModal open={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
};

export default WorkspaceBrandMenu;
