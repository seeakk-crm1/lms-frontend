import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    LayoutDashboard, Users, Settings, FileText, Calendar as CalendarIcon, Wallet,
    Briefcase, FileBarChart, Table2, Unplug, ChevronDown, Activity, ChevronRight, LogOut, LucideIcon, X,
    PanelLeftClose, PanelLeftOpen
} from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/useAuthStore';
import useWorkspaceStore from '../../store/useWorkspaceStore';
import { hasAnyPermission, hasPermission, canAccessPendingApproval } from '../../utils/permission.util';
import WorkspaceBrandMenu from './WorkspaceBrandMenu';

interface SubMenuItem {
    label: string;
    path: string;
    requiredPermissions?: string[];
    moduleKey?: string;
}

interface SidebarItem {
    icon: LucideIcon;
    label: string;
    path?: string;
    subItems?: SubMenuItem[];
    requiredPermissions?: string[];
    moduleKey?: string;
}

interface SidebarSection {
    title: string;
    items: SidebarItem[];
}

const sidebarMenus: SidebarSection[] = [
    {
        title: 'MAIN',
        items: [
            { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard', moduleKey: 'DASHBOARD' },
            { icon: CalendarIcon, label: 'Attendance', path: '/attendance', requiredPermissions: ['view_attendance', 'mark_attendance'], moduleKey: 'ATTENDANCE' }
        ]
    },
    {
        title: 'MANAGEMENT',
        items: [
            {
                icon: Users, label: 'Admin Management', moduleKey: 'ADMIN_MANAGEMENT',
                subItems: [
                    { label: 'Users', path: '/admin/users', requiredPermissions: ['USERS_VIEW', 'ASSIGNED_USERS_VIEW'] },
                    { label: 'Roles', path: '/admin/roles', requiredPermissions: ['ROLES_VIEW'] },
                    { label: 'Departments', path: '/admin/departments', requiredPermissions: ['DEPARTMENTS_VIEW'] },
                    { label: 'Organization Chart', path: '/admin/organisation-chart', requiredPermissions: ['USERS_VIEW', 'ASSIGNED_USERS_VIEW', 'DEPARTMENTS_VIEW'] },
                    { label: 'Roster Sheet', path: '/admin/roster', requiredPermissions: ['USERS_VIEW', 'ASSIGNED_USERS_VIEW', 'SYSTEM_CONFIG'] },
                    {
                        label: 'Location Tracker',
                        path: '/location-tracker',
                        requiredPermissions: [
                            'LOCATION_TRACKING_VIEW_LIVE',
                            'LOCATION_TRACKING_VIEW_HISTORY',
                            'LOCATION_TRACKING_REPLAY',
                            'LOCATION_TRACKING_VIEW_ALL',
                            'LOCATION_TRACKING_VIEW_ASSIGNED',
                            'SYSTEM_CONFIG'
                        ]
                    },
                    { label: 'Offices', path: '/admin/offices', requiredPermissions: ['SYSTEM_CONFIG'] }
                ]
            },
            {
                icon: Wallet, label: 'Salary Management', moduleKey: 'SALARY_MANAGEMENT',
                subItems: [
                    { label: 'Salary Calculation', path: '/salary/calculation', requiredPermissions: ['SALARY_CALCULATION_VIEW', 'SALARY_CALCULATION_GENERATE'] },
                    { label: 'Approval Stages', path: '/salary/stages', requiredPermissions: ['SALARY_STAGES_VIEW', 'SALARY_STAGES_CREATE', 'SALARY_STAGES_EDIT'] },
                    { label: 'Pending Approvals', path: '/salary/approvals', requiredPermissions: ['SALARY_APPROVALS_VIEW', 'SALARY_APPROVALS_APPROVE'] }
                ]
            },
            {
                icon: Settings, label: 'Master Configuration', moduleKey: 'MASTER_CONFIGURATION',
                subItems: [
                    { label: 'Lead Sources', path: '/admin/lead-source', requiredPermissions: ['LEAD_SOURCES_VIEW', 'SYSTEM_CONFIG'] },
                    { label: 'Products', path: '/admin/products', requiredPermissions: ['PRODUCTS_VIEW', 'SYSTEM_CONFIG'] },
                    { label: 'Lead Stages', path: '/admin/lead-stages', requiredPermissions: ['LEAD_STAGES_VIEW', 'SYSTEM_CONFIG'] },
                    { label: 'Stage Rules', path: '/admin/stage-rules', requiredPermissions: ['LEAD_STAGE_RULES_VIEW', 'SYSTEM_CONFIG'] },
                    { label: 'Target Cycles', path: '/admin/target-cycles', requiredPermissions: ['TARGET_CYCLES_VIEW', 'SYSTEM_CONFIG'] },
                    { label: 'Lead Dynamic Forms', path: '/admin/lead-dynamics', requiredPermissions: ['LEAD_DYNAMICS_VIEW', 'SYSTEM_CONFIG'] },
                    { label: 'Lead Life Cycle', path: '/admin/lead-life-cycles', requiredPermissions: ['SYSTEM_CONFIG'] },
                    { label: 'Calendar', path: '/calendar', requiredPermissions: ['LEADS_VIEW_ALL', 'LEADS_VIEW_OWN', 'LEADS_VIEW_TEAM', 'SYSTEM_CONFIG'] },
                    { label: 'Holiday List', path: '/admin/holidays', requiredPermissions: ['SYSTEM_CONFIG'] },
                    { label: 'LOB Reasons', path: '/admin/lob-reasons', requiredPermissions: ['LOB_REASONS_VIEW', 'LOB_REASONS_CREATE', 'Create LOB Reasons', 'SYSTEM_CONFIG'] },
                    { label: 'Follow-Up Extension Reasons', path: '/admin/followup-extension-reasons', requiredPermissions: ['view_followup_extension_reasons', 'SYSTEM_CONFIG'] }
                ]
            }
        ]
    },
    {
        title: 'LEADS & REPORTS',
        items: [
            {
                icon: Briefcase, label: 'Leads', moduleKey: 'LEADS',
                subItems: [
                    { label: 'All Leads', path: '/leads', requiredPermissions: ['LEADS_VIEW_ALL', 'LEADS_VIEW_OWN', 'LEADS_VIEW_TEAM', 'LEADS_CREATE'] },
                    { label: 'Closed Leads', path: '/leads/closed', requiredPermissions: ['LEADS_CLOSE', 'LEADS_REOPEN', 'LEADS_VIEW_ALL', 'LEADS_VIEW_OWN', 'LEADS_VIEW_TEAM'] },
                    { label: 'Bulk Assign', path: '/leads/bulk-assign', requiredPermissions: ['LEADS_BULK_ASSIGN', 'LEADS_ASSIGN'] },
                    { label: 'Pending Approval', path: '/leads/pending-approval', requiredPermissions: ['LEAD_APPROVAL_VIEW'] },
                    {
                      label: 'Follow-Up Settings',
                      path: '/leads/settings',
                      requiredPermissions: ['manage_followup_settings', 'view_followup_capacity', 'bulk_extend_followups'],
                    },
                ]
            },
            {
                icon: FileText, label: 'Reports', path: '/reports', requiredPermissions: ['REPORTS_VIEW', 'REPORTS_GENERATE'], moduleKey: 'REPORTS'
            },
            { icon: Table2, label: 'Sheets', path: '/sheets', requiredPermissions: ['SHEETS_VIEW'], moduleKey: 'SHEETS' },
            { icon: FileBarChart, label: 'LOB Analysis', path: '/lob-analysis', requiredPermissions: ['LOB_ANALYSIS_VIEW'], moduleKey: 'LOB_ANALYSIS' }
        ]
    },
    {
        title: 'SYSTEM',
        items: [
            { icon: Unplug, label: 'Unlock Staff', path: '/unlock-staff', requiredPermissions: ['USERS_UNLOCK', 'USERS_EDIT', 'SYSTEM_CONFIG'], moduleKey: 'UNLOCK_STAFF' },
            {
                icon: Settings, label: 'Settings',
                subItems: [
                    { label: 'Meta Ads', path: '/admin/meta-ads', requiredPermissions: ['LEAD_SOURCES_VIEW', 'SYSTEM_CONFIG'], moduleKey: 'META_ADS' },
                    { label: 'Telephony', path: '/admin/telephony', requiredPermissions: ['SYSTEM_CONFIG'], moduleKey: 'TELEPHONY' },
                    { label: 'WhatsApp Templates', path: '/settings/whatsapp-templates', requiredPermissions: ['WHATSAPP_TEMPLATES_VIEW', 'SYSTEM_CONFIG', 'manage_followup_settings', 'LEADS_VIEW_ALL', 'LEADS_VIEW_OWN', 'LEADS_VIEW_TEAM'], moduleKey: 'WHATSAPP_TEMPLATES' },
                    { label: 'Automations', path: '/settings/automations', requiredPermissions: ['AUTOMATION_VIEW', 'SYSTEM_CONFIG'], moduleKey: 'AUTOMATIONS' },
                ]
            }
        ]
    }
];

interface MenuItemProps {
    item: SidebarItem;
    isCollapsed: boolean;
    isActive: boolean;
    setActiveMenu: (label: string | null) => void;
    activeMenu: string | null;
    toggleCollapsed?: () => void;
    onNavigate?: () => void;
}

const MenuItem: React.FC<MenuItemProps> = ({ item, isCollapsed, isActive, setActiveMenu, activeMenu, toggleCollapsed, onNavigate }) => {
    const isExpanded = activeMenu === item.label;
    const hasSubItems = item.subItems && item.subItems.length > 0;
    const navigate = useNavigate();
    const location = useLocation();
    const buttonRef = useRef<HTMLButtonElement>(null);
    const [isHovered, setIsHovered] = useState(false);
    const [flyoutCoords, setFlyoutCoords] = useState<{ top: number; left: number }>({ top: 0, left: 0 });
    const hoverTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const selected = isActive || (!isCollapsed && isExpanded);

    const updateCoords = useCallback(() => {
        if (!buttonRef.current) return;
        const rect = buttonRef.current.getBoundingClientRect();
        const estHeight = hasSubItems ? (item.subItems?.length || 1) * 38 + 56 : 36;
        const maxTop = window.innerHeight - estHeight - 16;
        const top = Math.max(12, Math.min(rect.top - 4, maxTop));
        setFlyoutCoords({ top, left: rect.right + 8 });
    }, [hasSubItems, item.subItems]);

    const handleMouseEnter = () => {
        if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
        if (isCollapsed) {
            updateCoords();
            setIsHovered(true);
        }
    };

    const handleMouseLeave = () => {
        if (isCollapsed) {
            hoverTimeoutRef.current = setTimeout(() => {
                setIsHovered(false);
            }, 180);
        }
    };

    const handleFlyoutMouseEnter = () => {
        if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    };

    const handleFlyoutMouseLeave = () => {
        setIsHovered(false);
    };

    useEffect(() => {
        return () => {
            if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
        };
    }, []);

    const handleClick = () => {
        if (item.path) {
            navigate(item.path);
            setActiveMenu(null);
            setIsHovered(false);
            onNavigate?.();
        } else if (hasSubItems) {
            if (isCollapsed) {
                // If collapsed, clicking toggles the flyout popover
                updateCoords();
                setIsHovered((prev) => !prev);
            } else {
                setActiveMenu(isExpanded ? null : item.label);
            }
        }
    };

    return (
        <div className="mb-0.5 relative" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
            <button
                ref={buttonRef}
                type="button"
                onClick={handleClick}
                onFocus={handleMouseEnter}
                onBlur={handleMouseLeave}
                aria-label={item.label}
                aria-expanded={hasSubItems ? (isCollapsed ? isHovered : isExpanded) : undefined}
                className={`w-full flex items-center ${
                    isCollapsed ? 'justify-center h-10 w-10 mx-auto px-0' : 'justify-between px-3 py-2'
                } rounded-xl transition-all duration-150 group outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 relative ${
                    selected
                        ? 'bg-emerald-50 text-emerald-700 font-bold'
                        : 'text-gray-600 hover:bg-gray-100/80 hover:text-gray-900 font-medium'
                }`}
            >
                <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-2.5 min-w-0'}`}>
                    <item.icon
                        size={19}
                        className={`${
                            selected ? 'text-emerald-600' : 'text-gray-400 group-hover:text-gray-700'
                        } shrink-0 transition-colors`}
                    />
                    {!isCollapsed && (
                        <span className="text-xs font-semibold tracking-wide truncate">{item.label}</span>
                    )}
                </div>

                {!isCollapsed && hasSubItems && (
                    <ChevronDown
                        size={14}
                        className={`text-gray-400 transition-transform duration-200 shrink-0 ${
                            isExpanded ? 'rotate-180 text-emerald-600' : ''
                        }`}
                    />
                )}

                {/* Active indicator bar */}
                {selected && (
                    <span
                        className={`absolute left-0 top-1.5 bottom-1.5 w-1 bg-emerald-500 rounded-r-full ${
                            isCollapsed ? '-left-1' : ''
                        }`}
                    />
                )}
            </button>

            {/* Expanded Accordion Submenu */}
            <AnimatePresence>
                {!isCollapsed && hasSubItems && isExpanded && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.18, ease: 'easeInOut' }}
                        className="pl-8 pr-1 py-1 space-y-0.5 overflow-hidden"
                    >
                        {item.subItems?.map((sub, idx) => {
                            const isSubActive =
                                location.pathname === sub.path ||
                                (sub.path === '/settings/automations' && location.pathname.startsWith('/settings/automations')) ||
                                (sub.path === '/admin/meta-ads' && location.pathname === '/settings/meta-ads') ||
                                (sub.path === '/admin/telephony' && location.pathname === '/settings/telephony');
                            return (
                                <button
                                    key={idx}
                                    type="button"
                                    onClick={() => {
                                        navigate(sub.path);
                                        onNavigate?.();
                                    }}
                                    className={`w-full flex items-center justify-between px-2.5 py-1.5 text-xs rounded-lg transition-all text-left ${
                                        isSubActive
                                            ? 'bg-emerald-500 text-white font-bold shadow-xs'
                                            : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100/70 font-medium'
                                    }`}
                                >
                                    <span className="truncate">{sub.label}</span>
                                    {isSubActive && <div className="w-1.5 h-1.5 rounded-full bg-white shrink-0 ml-1.5 animate-pulse" />}
                                </button>
                            );
                        })}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Collapsed State: Tooltip or Flyout Portal */}
            {isCollapsed && isHovered && typeof document !== 'undefined' && createPortal(
                hasSubItems ? (
                    <div
                        style={{ top: `${flyoutCoords.top}px`, left: `${flyoutCoords.left}px` }}
                        onMouseEnter={handleFlyoutMouseEnter}
                        onMouseLeave={handleFlyoutMouseLeave}
                        className="fixed z-[100] w-56 rounded-2xl bg-white border border-gray-200/90 shadow-[0_16px_38px_-6px_rgba(15,23,42,0.18)] p-1.5 animate-in fade-in zoom-in-95 duration-150"
                        role="menu"
                        aria-label={item.label}
                    >
                        {/* Invisible bridge to prevent mouse leave gap */}
                        <div className="absolute -left-3 top-0 bottom-0 w-3" />

                        <div className="px-3 py-2 border-b border-gray-100 bg-gray-50/60 rounded-t-xl mb-1 flex items-center justify-between">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500">{item.label}</span>
                            <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-md">
                                {item.subItems?.length} items
                            </span>
                        </div>
                        <div className="space-y-0.5 max-h-[70vh] overflow-y-auto custom-scrollbar">
                            {item.subItems?.map((sub, idx) => {
                                const isSubActive =
                                    location.pathname === sub.path ||
                                    (sub.path === '/settings/automations' && location.pathname.startsWith('/settings/automations')) ||
                                    (sub.path === '/admin/meta-ads' && location.pathname === '/settings/meta-ads') ||
                                    (sub.path === '/admin/telephony' && location.pathname === '/settings/telephony');
                                return (
                                    <button
                                        key={idx}
                                        type="button"
                                        role="menuitem"
                                        onClick={() => {
                                            navigate(sub.path);
                                            setIsHovered(false);
                                            onNavigate?.();
                                        }}
                                        className={`w-full flex items-center justify-between px-3 py-2 text-xs rounded-xl transition-colors text-left ${
                                            isSubActive
                                                ? 'bg-emerald-500 text-white font-bold shadow-xs'
                                                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100 font-medium'
                                        }`}
                                    >
                                        <span className="truncate">{sub.label}</span>
                                        {isSubActive && <div className="w-1.5 h-1.5 rounded-full bg-white shrink-0 ml-1.5 animate-pulse" />}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                ) : (
                    <div
                        style={{ top: `${flyoutCoords.top + 6}px`, left: `${flyoutCoords.left}px` }}
                        className="fixed z-[100] px-2.5 py-1 text-xs font-semibold text-white bg-gray-900 rounded-lg shadow-lg pointer-events-none whitespace-nowrap animate-in fade-in zoom-in-95 duration-100"
                    >
                        {item.label}
                    </div>
                ),
                document.body
            )}
        </div>
    );
};

interface DashboardSidebarProps {
    isCollapsed: boolean;
    toggleCollapsed: () => void;
    isMobile?: boolean;
    onNavigate?: () => void;
}

export const DashboardSidebar: React.FC<DashboardSidebarProps> = ({ isCollapsed, toggleCollapsed, isMobile = false, onNavigate }) => {
    const [activeMenu, setActiveMenu] = useState<string | null>('Dashboard');
    const [profileMenuOpen, setProfileMenuOpen] = useState(false);
    const profileRef = useRef<HTMLDivElement>(null);
    const location = useLocation();
    const navigate = useNavigate();
    const logout = useAuthStore((state) => state.logout);
    const user = useAuthStore((state) => state.user);
    const hasModule = useWorkspaceStore((state) => state.hasModule);

    React.useEffect(() => {
        for (const section of sidebarMenus) {
            for (const item of section.items) {
                if (item.subItems?.some((sub) => sub.path === location.pathname || (sub.path === '/settings/automations' && location.pathname.startsWith('/settings/automations')) || (sub.path === '/admin/meta-ads' && location.pathname === '/settings/meta-ads') || (sub.path === '/admin/telephony' && location.pathname === '/settings/telephony'))) {
                    setActiveMenu(item.label);
                    return;
                }
            }
        }
    }, [location.pathname]);

    const handleLogout = () => {
        logout();
        navigate('/login');
        onNavigate?.();
    };

    const visibleSections = sidebarMenus
        .map((section) => ({
            ...section,
            items: section.items
                .map((item) => {
                    // Check top-level item module entitlement
                    if (item.moduleKey && !hasModule(item.moduleKey)) {
                        return null;
                    }

                    if (item.subItems?.length) {
                        const visibleSubItems = item.subItems.filter(
                            (subItem) => {
                                // Check sub-item module entitlement
                                if (subItem.moduleKey && !hasModule(subItem.moduleKey)) {
                                    return false;
                                }

                                if (subItem.path === '/leads/pending-approval') {
                                    return canAccessPendingApproval(user?.permissions || []);
                                }
                                return !subItem.requiredPermissions ||
                                    hasAnyPermission(user?.permissions || [], subItem.requiredPermissions);
                            }
                        );

                        if (visibleSubItems.length === 0) return null;

                        return {
                            ...item,
                            subItems: visibleSubItems,
                        };
                    }

                    if (item.requiredPermissions && !hasAnyPermission(user?.permissions || [], item.requiredPermissions)) {
                        return null;
                    }

                    return item;
                })
                .filter(Boolean) as SidebarItem[],
        }))
        .filter((section) => section.items.length > 0);

    return (
        <motion.aside
            id={isMobile ? 'mobile-dashboard-sidebar' : undefined}
            initial={false}
            animate={{ width: isMobile ? 300 : isCollapsed ? 68 : 256 }}
            transition={{ duration: 0.18, ease: 'easeInOut' }}
            className={`h-screen bg-white border-r border-gray-200/90 flex flex-col relative z-20 shrink-0 select-none overflow-hidden ${
                isMobile ? 'flex w-[85vw] max-w-[300px] shadow-2xl' : 'hidden md:flex'
            }`}
        >
            {/* Workspace Branding & Sidebar Toggle */}
            <div className={`relative h-14 sm:h-16 flex items-center ${isCollapsed ? 'justify-center px-1' : 'justify-between px-3.5'} border-b border-gray-100 shrink-0`}>
                <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'min-w-0 flex-1'}`}>
                    <WorkspaceBrandMenu isCollapsed={isCollapsed} isMobile={isMobile} />
                </div>

                {!isMobile && !isCollapsed && (
                    <button
                        type="button"
                        onClick={toggleCollapsed}
                        title="Collapse sidebar (⌘B)"
                        aria-label="Collapse sidebar"
                        className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors shrink-0 ml-1 cursor-pointer"
                    >
                        <PanelLeftClose size={17} />
                    </button>
                )}

                {!isMobile && isCollapsed && (
                    <button
                        type="button"
                        onClick={toggleCollapsed}
                        title="Expand sidebar (⌘B)"
                        aria-label="Expand sidebar"
                        className="p-1 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors shrink-0 ml-0.5 cursor-pointer"
                    >
                        <PanelLeftOpen size={16} />
                    </button>
                )}

                {isMobile && !isCollapsed && (
                    <button
                        type="button"
                        onClick={onNavigate ?? toggleCollapsed}
                        aria-label="Close navigation menu"
                        className="ml-auto p-2 text-gray-500 hover:text-gray-900 rounded-lg shrink-0 cursor-pointer"
                    >
                        <X size={18} />
                    </button>
                )}
            </div>

            {/* Menu Items */}
            <div className={`flex-1 overflow-y-auto py-3 ${isCollapsed ? 'px-1.5' : 'px-2.5'} space-y-4 custom-scrollbar`}>
                {visibleSections.map((section, idx) => (
                    <div key={idx}>
                        {!isCollapsed ? (
                            <h3 className="px-2.5 text-[10px] font-bold text-gray-400 tracking-wider mb-1.5 uppercase truncate">
                                {section.title}
                            </h3>
                        ) : (
                            <div className="h-px bg-gray-100 my-2 mx-2" />
                        )}
                        <div className="space-y-0.5">
                            {section.items.map((item, itemIdx) => {
                                const isItemActive =
                                    item.path === location.pathname ||
                                    Boolean(item.subItems?.some((sub) => sub.path === location.pathname || (sub.path === '/settings/automations' && location.pathname.startsWith('/settings/automations')) || (sub.path === '/admin/meta-ads' && location.pathname === '/settings/meta-ads') || (sub.path === '/admin/telephony' && location.pathname === '/settings/telephony')));
                                return (
                                    <MenuItem
                                        key={itemIdx}
                                        item={item}
                                        isCollapsed={isCollapsed}
                                        isActive={isItemActive}
                                        setActiveMenu={setActiveMenu}
                                        activeMenu={activeMenu}
                                        toggleCollapsed={toggleCollapsed}
                                        onNavigate={onNavigate}
                                    />
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>

            {/* User Footer Profile & Actions */}
            <div className={`border-t border-gray-100 bg-gray-50/60 ${isCollapsed ? 'p-1.5' : 'p-2.5'}`} ref={profileRef}>
                <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} p-1.5 rounded-xl bg-white border border-gray-200/70 shadow-2xs`}>
                    <div
                        className={`flex items-center ${isCollapsed ? 'justify-center cursor-pointer' : 'gap-2.5 min-w-0'}`}
                        onClick={() => {
                            if (isCollapsed) setProfileMenuOpen((prev) => !prev);
                        }}
                        title={isCollapsed ? `${user?.name || 'User'} (${user?.role || 'Member'}) - Click for options` : undefined}
                    >
                        <div className="w-8 h-8 rounded-lg bg-emerald-100 border border-emerald-200 text-emerald-800 flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
                            {user?.name?.[0]?.toUpperCase() || 'U'}
                        </div>
                        {!isCollapsed && (
                            <div className="flex flex-col min-w-0 pr-1">
                                <span className="text-xs font-bold text-gray-800 truncate">{user?.name || 'User'}</span>
                                <span className="text-[10px] text-gray-400 truncate capitalize">
                                    {typeof user?.role === 'string' ? user.role : user?.role?.name || 'Member'}
                                </span>
                            </div>
                        )}
                    </div>

                    {!isCollapsed && (
                        <button
                            onClick={handleLogout}
                            title="Sign Out"
                            aria-label="Sign Out"
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors shrink-0 cursor-pointer"
                        >
                            <LogOut size={15} />
                        </button>
                    )}
                </div>

                {/* Collapsed Profile Flyout Portal */}
                {isCollapsed && profileMenuOpen && typeof document !== 'undefined' && createPortal(
                    <div
                        className="fixed bottom-4 left-[76px] z-[100] w-56 rounded-2xl bg-white border border-gray-200 shadow-xl p-2 animate-in fade-in zoom-in-95 duration-150"
                        onMouseLeave={() => setProfileMenuOpen(false)}
                    >
                        <div className="px-3 py-2 border-b border-gray-100 mb-1.5">
                            <p className="text-xs font-bold text-gray-900 truncate">{user?.name || 'User'}</p>
                            <p className="text-[10px] text-gray-500 truncate capitalize">{typeof user?.role === 'string' ? user.role : user?.role?.name || 'Member'}</p>
                        </div>
                        <button
                            type="button"
                            onClick={() => {
                                setProfileMenuOpen(false);
                                handleLogout();
                            }}
                            className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-lg transition-colors text-left cursor-pointer"
                        >
                            <LogOut size={14} />
                            <span>Sign Out</span>
                        </button>
                    </div>,
                    document.body
                )}
            </div>
        </motion.aside>
    );
};

export default DashboardSidebar;
