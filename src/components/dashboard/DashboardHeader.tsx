import React from 'react';
import { Search, Menu, Plus, X, PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/useAuthStore';
import { hasPermission } from '../../utils/permissions';
import NotificationBell from './NotificationBell';
import ProfileMenu from './ProfileMenu';
import BrandLogo from '../BrandLogo';

interface DashboardHeaderProps {
    isMobileMenuOpen: boolean;
    onToggleMobileMenu: () => void;
    isSidebarCollapsed?: boolean;
    onToggleSidebar?: () => void;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({
    isMobileMenuOpen,
    onToggleMobileMenu,
    isSidebarCollapsed = false,
    onToggleSidebar,
}) => {
    const { user } = useAuthStore();
    const navigate = useNavigate();
    const canCreateLead = hasPermission(user, 'LEADS_CREATE');
    const workspaceName = user?.workspace?.companyName?.trim() || 'Workspace';
    const workspaceLogo = user?.workspace?.logoUrl || null;

    const handleAddLead = () => {
        navigate('/leads', { state: { openCreateLead: true } });
    };

    return (
        <header className="h-14 sm:h-16 bg-white border-b border-gray-200/80 flex items-center justify-between px-3 sm:px-5 shrink-0 relative z-30 w-full transition-colors duration-200">
            {/* Left Section: Sidebar Toggle, Mobile Menu & Search */}
            <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                {/* Desktop Sidebar Toggle */}
                {onToggleSidebar && (
                    <button
                        type="button"
                        onClick={onToggleSidebar}
                        title={isSidebarCollapsed ? "Expand sidebar (⌘B)" : "Collapse sidebar (⌘B)"}
                        aria-label={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                        className="hidden md:flex items-center justify-center h-9 w-9 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer shrink-0"
                    >
                        {isSidebarCollapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
                    </button>
                )}

                {/* Mobile Hamburger (hidden on large screens) */}
                <button
                    type="button"
                    onClick={onToggleMobileMenu}
                    aria-label={isMobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
                    aria-expanded={isMobileMenuOpen}
                    aria-controls="mobile-dashboard-sidebar"
                    className="md:hidden p-2 text-gray-500 hover:bg-gray-50 rounded-lg transition-colors shrink-0"
                >
                    {isMobileMenuOpen ? (
                        <X size={20} className="sm:w-5 sm:h-5" />
                    ) : (
                        <Menu size={20} className="sm:w-5 sm:h-5" />
                    )}
                </button>

                {/* Mobile Logo */}
                <div className="md:hidden flex items-center shrink-0 py-1">
                    {workspaceLogo ? (
                        <div className="flex h-8 w-10 items-center justify-center overflow-hidden rounded-xl border border-gray-100 bg-white shadow-xs pointer-events-none select-none">
                            <img
                                src={workspaceLogo}
                                alt={workspaceName}
                                className="h-full w-full object-contain p-1"
                            />
                        </div>
                    ) : (
                        <BrandLogo
                            alt={workspaceName}
                            width={82}
                            height={26}
                            className="pointer-events-none select-none"
                            imgClassName="object-left"
                        />
                    )}
                </div>

                {/* Global Search */}
                <div className="hidden sm:flex relative max-w-sm lg:max-w-md w-full group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search size={15} className="text-gray-400 group-focus-within:text-emerald-500 transition-colors" />
                    </div>
                    <input
                        type="search"
                        className="block w-full h-9 pl-9 pr-14 bg-gray-50/70 border border-gray-200/90 rounded-lg text-xs sm:text-sm font-medium text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white hover:border-gray-300 transition-all shadow-xs"
                        placeholder="Search leads, users, configurations..."
                    />
                    <div className="absolute inset-y-0 right-0 pr-2.5 flex items-center pointer-events-none">
                        <kbd className="hidden lg:inline-flex items-center gap-0.5 text-[10px] font-bold text-gray-400 bg-white border border-gray-200 px-1.5 py-0.5 rounded shadow-xs">
                            <span className="text-xs">⌘</span>K
                        </kbd>
                    </div>
                </div>
            </div>

            {/* Right Section: Actions & Profile */}
            <div className="flex items-center gap-2 sm:gap-3 shrink-0 ml-2 sm:ml-4">
                {/* Quick Add Button */}
                {canCreateLead && (
                    <button
                        type="button"
                        onClick={handleAddLead}
                        className="hidden md:inline-flex items-center gap-1.5 h-9 bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 rounded-lg text-xs font-bold shadow-xs transition-all active:scale-95 cursor-pointer"
                    >
                        <Plus size={15} strokeWidth={2.5} />
                        <span>Add Lead</span>
                    </button>
                )}

                {/* Quick Add - Mobile icon only */}
                {canCreateLead && (
                    <button
                        type="button"
                        onClick={handleAddLead}
                        className="md:hidden w-8 h-8 flex items-center justify-center bg-emerald-600 text-white rounded-lg shadow-sm active:scale-95 transition-all"
                        aria-label="Add Lead"
                    >
                        <Plus size={17} strokeWidth={2.5} />
                    </button>
                )}

                <div className="w-px h-6 bg-gray-200 mx-0.5 hidden sm:block" />

                <NotificationBell />

                <ProfileMenu />
            </div>
        </header>
    );
};

export default DashboardHeader;
