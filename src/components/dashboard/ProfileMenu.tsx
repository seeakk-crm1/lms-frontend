import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronRight, LogOut, Settings2, ShieldCheck, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/useAuthStore';
import { getPrimaryRoleName } from '../../utils/permissions';
import UserProfileModal from './UserProfileModal';
import { getImageUrl } from '../../utils/getImageUrl';

type UserProfileTab = 'profile' | 'security';

const ProfileMenu: React.FC = () => {
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const { user, logout } = useAuthStore();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<UserProfileTab>('profile');
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const displayName =
    typeof user?.name === 'string' && user.name.trim()
      ? user.name.trim()
      : typeof user?.email === 'string' && user.email.trim()
        ? user.email.trim()
        : 'User';
  const displayRole = getPrimaryRoleName(user);
  const initials = displayName
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

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

  const openProfileModal = (tab: UserProfileTab) => {
    setActiveTab(tab);
    setIsMenuOpen(false);
    setIsProfileModalOpen(true);
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      setIsMenuOpen(false);
      navigate('/login', { replace: true });
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <>
      <div ref={containerRef} className="relative">
        <button
          type="button"
          onClick={() => setIsMenuOpen((current) => !current)}
          aria-label="Open profile menu"
          aria-haspopup="menu"
          aria-expanded={isMenuOpen}
          className={`group flex items-center gap-3 rounded-full pl-2 pr-1.5 sm:pl-4 sm:pr-2 focus:outline-none transition-all duration-200 ${
            isMenuOpen ? 'bg-emerald-50/90 shadow-sm ring-1 ring-emerald-100' : 'hover:bg-gray-50'
          }`}
        >
          <div className="hidden min-w-0 sm:flex flex-col items-end">
            <span
              className={`text-sm font-bold leading-tight transition-colors ${
                isMenuOpen ? 'text-emerald-700' : 'text-gray-900 group-hover:text-emerald-600'
              }`}
            >
              {displayName}
            </span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
              {displayRole}
            </span>
          </div>
          <div className="relative">
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 text-xs font-bold text-white shadow-md shadow-emerald-500/20 ring-2 ring-white transition-all sm:h-10 sm:w-10 sm:text-base overflow-hidden ${
                isMenuOpen ? 'scale-[1.02] ring-emerald-100 shadow-lg shadow-emerald-500/20' : 'group-hover:ring-emerald-100'
              }`}
            >
              {user?.profileImageUrl ? (
                <img src={getImageUrl(user.profileImageUrl)} alt={displayName} className="w-full h-full object-cover" />
              ) : (
                displayName.charAt(0).toUpperCase()
              )}
            </div>
            <div className="absolute bottom-0 right-[-2px] h-2.5 w-2.5 rounded-full border-2 border-white bg-green-500 sm:right-0 sm:h-3 sm:w-3" />
          </div>
        </button>

        <AnimatePresence>
          {isMenuOpen ? (
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.96 }}
              transition={{ type: 'spring', stiffness: 340, damping: 28, mass: 0.8 }}
              className="absolute right-0 top-[calc(100%+12px)] z-[80] w-[360px] max-w-[calc(100vw-2rem)] overflow-hidden rounded-[28px] border border-gray-100 bg-white/95 shadow-[0_30px_80px_-35px_rgba(15,23,42,0.35)] backdrop-blur-xl"
              role="menu"
              aria-label="Profile menu"
            >
              <div className="border-b border-gray-100 bg-gradient-to-br from-emerald-50 via-white to-white px-5 py-5">
                <div className="flex items-start gap-4">
                  <div className="relative mt-0.5">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 text-lg font-black text-white shadow-lg shadow-emerald-500/20 overflow-hidden">
                      {user?.profileImageUrl ? (
                        <img src={getImageUrl(user.profileImageUrl)} alt={displayName} className="w-full h-full object-cover" />
                      ) : (
                        initials
                      )}
                    </div>
                    <div className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full border-2 border-white bg-white text-emerald-500 shadow-sm">
                      <Sparkles size={10} />
                    </div>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] font-black uppercase tracking-[0.24em] text-emerald-500">
                      Account
                    </p>
                    <h3 className="mt-1 truncate text-lg font-black text-gray-900">{displayName}</h3>
                    <p className="truncate text-sm font-medium text-gray-500">{user?.email || 'No email available'}</p>
                    <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-emerald-100 bg-white/90 px-3 py-1 text-[11px] font-black uppercase tracking-wider text-emerald-700">
                      <ShieldCheck size={12} />
                      {displayRole}
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-2 px-3 py-3">
                <button
                  type="button"
                  onClick={() => openProfileModal('profile')}
                  className="flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left transition-all hover:bg-emerald-50/60"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                    <Settings2 size={17} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-black text-gray-900">Profile settings</p>
                    <p className="mt-1 text-sm font-medium text-gray-500">Update your name, username, and phone details.</p>
                  </div>
                  <ChevronRight size={16} className="shrink-0 text-gray-300" />
                </button>

                <button
                  type="button"
                  onClick={() => openProfileModal('security')}
                  className="flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left transition-all hover:bg-violet-50/60"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-violet-50 text-violet-600">
                    <ShieldCheck size={17} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-black text-gray-900">Security</p>
                    <p className="mt-1 text-sm font-medium text-gray-500">Change your password and review account protection.</p>
                  </div>
                  <ChevronRight size={16} className="shrink-0 text-gray-300" />
                </button>
              </div>

              <div className="border-t border-gray-100 px-4 py-4">
                <button
                  type="button"
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm font-black text-rose-600 transition-all hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <LogOut size={16} />
                  {isLoggingOut ? 'Signing out...' : 'Sign out'}
                </button>
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>

      <UserProfileModal
        open={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        initialTab={activeTab}
      />
    </>
  );
};

export default ProfileMenu;
