import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronRight, PencilLine } from 'lucide-react';
import useAuthStore from '../../store/useAuthStore';
import { hasPermission } from '../../utils/permissions';
import WorkspaceBrandModal from './WorkspaceBrandModal';

interface WorkspaceBrandMenuProps {
  isCollapsed: boolean;
  isMobile?: boolean;
}

const WorkspaceBrandMenu: React.FC<WorkspaceBrandMenuProps> = ({ isCollapsed, isMobile = false }) => {
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const user = useAuthStore((state) => state.user);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [menuCoords, setMenuCoords] = useState<{ top: number; left: number; width: number }>({
    top: 0,
    left: 0,
    width: 290,
  });

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

  const updateCoordinates = () => {
    if (!buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    const MENU_WIDTH = 290;
    const PADDING = 12;

    if (isCollapsed && !isMobile) {
      // Position to the right of the collapsed sidebar button
      const top = Math.max(PADDING, Math.min(rect.top, window.innerHeight - 200));
      const left = rect.right + 10;
      setMenuCoords({
        top,
        left,
        width: Math.min(MENU_WIDTH, window.innerWidth - left - PADDING),
      });
    } else {
      // Position directly below the trigger button
      const top = rect.bottom + 6;
      let left = rect.left;
      const width = Math.min(MENU_WIDTH, window.innerWidth - 2 * PADDING);

      // Keep within horizontal screen bounds
      if (left + width > window.innerWidth - PADDING) {
        left = window.innerWidth - width - PADDING;
      }
      left = Math.max(PADDING, left);

      setMenuCoords({ top, left, width });
    }
  };

  useLayoutEffect(() => {
    if (isMenuOpen) {
      updateCoordinates();
    }
  }, [isMenuOpen, isCollapsed, isMobile]);

  useEffect(() => {
    if (!isMenuOpen) return undefined;

    const handleScrollOrResize = () => {
      updateCoordinates();
    };

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        buttonRef.current?.contains(target) ||
        menuRef.current?.contains(target)
      ) {
        return;
      }
      setIsMenuOpen(false);
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('keydown', handleEscape);
    window.addEventListener('resize', handleScrollOrResize);
    window.addEventListener('scroll', handleScrollOrResize, true);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('keydown', handleEscape);
      window.removeEventListener('resize', handleScrollOrResize);
      window.removeEventListener('scroll', handleScrollOrResize, true);
    };
  }, [isMenuOpen, isCollapsed, isMobile]);

  const trigger = isCollapsed ? (
    workspaceLogo ? (
      <div className="h-9 w-9 overflow-hidden rounded-xl border border-gray-100 bg-white shadow-2xs">
        <img src={workspaceLogo} alt={workspaceName} className="h-full w-full object-contain p-1" />
      </div>
    ) : (
      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 text-xs font-black text-white shadow-2xs">
        {workspaceInitials}
      </div>
    )
  ) : (
    <div className="flex min-w-0 items-center gap-2.5">
      {workspaceLogo ? (
        <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-gray-100 bg-white shadow-2xs">
          <img src={workspaceLogo} alt={workspaceName} className="h-full w-full object-contain p-0.5" />
        </div>
      ) : (
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 text-xs font-black text-white shadow-2xs">
          {workspaceInitials}
        </div>
      )}
      <div className="min-w-0 text-left">
        <p className="truncate text-xs font-bold text-gray-900 leading-tight">{workspaceName}</p>
        <p className="truncate text-[9px] font-bold uppercase tracking-wider text-gray-400 mt-0.5">
          Company Workspace
        </p>
      </div>
    </div>
  );

  return (
    <>
      <div className={`relative ${isCollapsed ? '' : 'flex-1 min-w-0'}`}>
        <button
          ref={buttonRef}
          type="button"
          onClick={() => {
            setIsMenuOpen((current) => {
              const next = !current;
              if (next) updateCoordinates();
              return next;
            });
          }}
          aria-label="Open company workspace menu"
          aria-haspopup="menu"
          aria-expanded={isMenuOpen}
          className={`group flex w-full items-center transition-all duration-150 cursor-pointer ${
            isCollapsed
              ? 'justify-center rounded-xl p-1.5 hover:bg-gray-100/80'
              : 'justify-between gap-2 rounded-xl px-2.5 py-1.5 hover:bg-gray-100/80'
          }`}
        >
          {trigger}
          {!isCollapsed ? (
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-gray-400 transition-colors group-hover:text-gray-700">
              <ChevronRight
                size={14}
                className={`transition-transform duration-200 ${isMenuOpen ? 'rotate-90 text-emerald-600' : ''}`}
              />
            </div>
          ) : null}
        </button>

        {typeof document !== 'undefined' &&
          createPortal(
            <AnimatePresence>
              {isMenuOpen ? (
                <motion.div
                  ref={menuRef}
                  initial={{ opacity: 0, y: isCollapsed && !isMobile ? 0 : -6, x: isCollapsed && !isMobile ? -6 : 0, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, x: 0, scale: 1 }}
                  exit={{ opacity: 0, y: isCollapsed && !isMobile ? 0 : -6, x: isCollapsed && !isMobile ? -6 : 0, scale: 0.97 }}
                  transition={{ duration: 0.15, ease: 'easeOut' }}
                  style={{
                    position: 'fixed',
                    top: `${menuCoords.top}px`,
                    left: `${menuCoords.left}px`,
                    width: `${menuCoords.width}px`,
                  }}
                  className="z-[100] overflow-hidden rounded-2xl border border-gray-200/90 bg-white/95 p-1.5 shadow-[0_20px_50px_-15px_rgba(15,23,42,0.25)] backdrop-blur-md"
                  role="menu"
                  aria-label="Company workspace menu"
                >
                  {/* Workspace identity header */}
                  <div className="flex items-center gap-2.5 rounded-xl bg-gray-50/80 p-2.5 border border-gray-100">
                    {workspaceLogo ? (
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-gray-200 bg-white shadow-2xs">
                        <img src={workspaceLogo} alt={workspaceName} className="h-full w-full object-contain p-1" />
                      </div>
                    ) : (
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 text-xs font-black text-white shadow-2xs">
                        {workspaceInitials}
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <h4 className="truncate text-xs font-bold text-gray-950 leading-tight">{workspaceName}</h4>
                      <p className="truncate text-[10px] font-semibold text-gray-500 mt-0.5">Company Workspace</p>
                    </div>
                  </div>

                  {/* Actions list */}
                  <div className="mt-1 space-y-0.5">
                    <button
                      type="button"
                      role="menuitem"
                      onClick={() => {
                        setIsMenuOpen(false);
                        setIsModalOpen(true);
                      }}
                      disabled={!canEditWorkspace}
                      className="group flex w-full items-center gap-2.5 rounded-xl p-2 text-left transition-colors hover:bg-emerald-50/80 cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100 group-hover:bg-emerald-100/80 transition-colors">
                        <PencilLine size={13} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-gray-900 group-hover:text-emerald-950">Workspace Settings</p>
                        <p className="truncate text-[10px] font-medium text-gray-500">Manage workspace details</p>
                      </div>
                      <ChevronRight size={13} className="shrink-0 text-gray-300 group-hover:text-emerald-600 transition-colors" />
                    </button>
                  </div>

                  {!canEditWorkspace && (
                    <div className="mt-1 rounded-lg bg-amber-50 px-2.5 py-1.5 text-[10px] font-medium text-amber-700 border border-amber-100">
                      View only • Configuration restricted to admins
                    </div>
                  )}
                </motion.div>
              ) : null}
            </AnimatePresence>,
            document.body,
          )}
      </div>

      <WorkspaceBrandModal open={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
};

export default WorkspaceBrandMenu;
