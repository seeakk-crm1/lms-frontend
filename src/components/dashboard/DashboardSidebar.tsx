import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    LayoutDashboard, Users, Settings, FileText, Calendar as CalendarIcon, Wallet,
    Briefcase, FileBarChart, Table2, Unplug, ChevronDown, Activity, ChevronRight, LogOut, LucideIcon, X
} from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/useAuthStore';
import { hasAnyPermission, hasPermission, canAccessPendingApproval } from '../../utils/permission.util';
import WorkspaceBrandMenu from './WorkspaceBrandMenu';

interface SubMenuItem {
    label: string;
    path: string;
    requiredPermissions?: string[];
}

interface SidebarItem {
    icon: LucideIcon;
    label: string;
    path?: string;
    subItems?: SubMenuItem[];
    requiredPermissions?: string[];
}

interface SidebarSection {
    title: string;
    items: SidebarItem[];
}

const sidebarMenus: SidebarSection[] = [
    {
        title: 'MAIN',
        items: [
            { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
            { icon: CalendarIcon, label: 'Attendance', path: '/attendance', requiredPermissions: ['view_attendance', 'mark_attendance'] }
        ]
    },
    {
        title: 'MANAGEMENT',
        items: [
            {
                icon: Users, label: 'Admin Management',
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
                icon: Wallet, label: 'Salary Management',
                subItems: [
                    { label: 'Salary Calculation', path: '/salary/calculation', requiredPermissions: ['SALARY_CALCULATION_VIEW', 'SALARY_CALCULATION_GENERATE'] },
                    { label: 'Approval Stages', path: '/salary/stages', requiredPermissions: ['SALARY_STAGES_VIEW', 'SALARY_STAGES_CREATE', 'SALARY_STAGES_EDIT'] },
                    { label: 'Pending Approvals', path: '/salary/approvals', requiredPermissions: ['SALARY_APPROVALS_VIEW', 'SALARY_APPROVALS_APPROVE'] }
                ]
            },
            {
                icon: Settings, label: 'Master Configuration',
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
                icon: Briefcase, label: 'Leads',
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
                icon: FileText, label: 'Reports', path: '/reports', requiredPermissions: ['REPORTS_VIEW', 'REPORTS_GENERATE']
            },
            { icon: Table2, label: 'Sheets', path: '/sheets', requiredPermissions: ['SHEETS_VIEW'] },
            { icon: FileBarChart, label: 'LOB Analysis', path: '/lob-analysis', requiredPermissions: ['LOB_ANALYSIS_VIEW'] }
        ]
    },
    {
        title: 'SYSTEM',
        items: [
            { icon: Unplug, label: 'Unlock Staff', path: '/unlock-staff', requiredPermissions: ['USERS_UNLOCK', 'USERS_EDIT', 'SYSTEM_CONFIG'] },
            {
                icon: Settings, label: 'Settings',
                subItems: [
                    { label: 'Meta Ads', path: '/admin/meta-ads', requiredPermissions: ['LEAD_SOURCES_VIEW', 'SYSTEM_CONFIG'] },
                    { label: 'Telephony', path: '/admin/telephony', requiredPermissions: ['SYSTEM_CONFIG'] },
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

    // In collapsed mode, only the truly active route icon should be colored. 
    // In expanded mode, we also color the currently open accordion.
    const selected = isActive || (!isCollapsed && isExpanded);

    const handleClick = () => {
        if (item.path) {
            navigate(item.path);
            setActiveMenu(null); // Close accordions when navigating directly
            onNavigate?.();
        } else if (hasSubItems) {
            setActiveMenu(isExpanded ? null : item.label);
            if (isCollapsed && toggleCollapsed) {
                toggleCollapsed(); // Automatically expand sidebar to show the sub-items!
            }
        }
    };

    return (
        <div className="mb-1">
            <button
                onClick={handleClick}
                className={`w-full flex items-center ${isCollapsed ? 'justify-center px-0 py-3' : 'justify-between px-3 py-2.5'
                    } rounded-xl transition-all duration-200 group ${selected
                        ? 'bg-emerald-50 text-emerald-600 font-semibold'
                        : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900 font-medium'
                    }`}
            >
                <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'}`}>
                    <item.icon size={20} className={`${selected ? 'text-emerald-500' : 'text-gray-400 group-hover:text-emerald-500'} transition-colors duration-200`} />
                    {!isCollapsed && (
                        <span className="text-sm tracking-wide">{item.label}</span>
                    )}
                </div>
                {!isCollapsed && hasSubItems && (
                    <ChevronDown size={14} className={`text-gray-400 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
                )}

                {selected && !isCollapsed && !hasSubItems && (
                    <motion.div layoutId="sidebar-active" className="absolute left-0 w-1 h-6 bg-emerald-500 rounded-r-full" />
                )}
            </button>

            {/* Submenu */}
            <AnimatePresence>
                {!isCollapsed && hasSubItems && isExpanded && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="pl-9 pr-2 py-1 space-y-1 overflow-hidden"
                    >
                        {item.subItems?.map((sub, idx) => {
                            const isSubActive = location.pathname === sub.path;
                            return (
                                <button
                                    key={idx}
                                    onClick={() => {
                                        navigate(sub.path);
                                        onNavigate?.();
                                    }}
                                    className={`w-full flex items-center justify-between px-3 py-2 text-xs rounded-lg transition-all ${isSubActive
                                            ? 'bg-emerald-500 text-white font-bold shadow-xs'
                                            : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100/80 font-medium'
                                        }`}
                                >
                                    <span>{sub.label}</span>
                                    {isSubActive && <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />}
                                </button>
                            );
                        })}
                    </motion.div>
                )}
            </AnimatePresence>
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
    const location = useLocation();
    const navigate = useNavigate();
    const logout = useAuthStore((state) => state.logout);
    const user = useAuthStore((state) => state.user);

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
                    if (item.subItems?.length) {
                        const visibleSubItems = item.subItems.filter(
                            (subItem) => {
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
            animate={{ width: isMobile ? 320 : isCollapsed ? 80 : 280 }}
            className={`h-screen bg-white border-r border-gray-200 flex flex-col relative z-20 shrink-0 select-none ${
                isMobile ? 'flex w-[85vw] max-w-[320px] shadow-2xl' : 'hidden md:flex'
            }`}
        >
            {/* Workspace Branding */}
            <div className={`relative h-20 flex items-center ${isCollapsed ? 'justify-center px-2' : 'px-4'} border-b border-gray-100 shrink-0`}>
                <WorkspaceBrandMenu isCollapsed={isCollapsed} isMobile={isMobile} />
                {isMobile && !isCollapsed && (
                    <button
                        type="button"
                        onClick={onNavigate ?? toggleCollapsed}
                        aria-label="Close navigation menu"
                        className="h-10 w-10 shrink-0 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                    >
                        <X size={20} />
                    </button>
                )}
            </div>

            {/* Menu Sections */}
            <div className="flex-1 overflow-y-auto py-6 px-4 custom-scrollbar">
                {visibleSections.map((section, idx) => (
                    <div key={idx} className="mb-6">
                        {!isCollapsed && (
                            <p className="px-3 text-[10px] font-bold tracking-widest text-gray-400 mb-2">{section.title}</p>
                        )}
                        {section.items.map((item, i) => {
                            const isItemActive =
                                location.pathname === item.path ||
                                (item.label === 'Dashboard' && location.pathname === '/dashboard') ||
                                (item.label === 'Reports' && location.pathname.startsWith('/reports'));

                            return (
                                <MenuItem
                                    key={i}
                                    item={item}
                                    isCollapsed={isCollapsed}
                                    isActive={isItemActive}
                                    activeMenu={activeMenu}
                                    setActiveMenu={setActiveMenu}
                                    toggleCollapsed={toggleCollapsed}
                                    onNavigate={onNavigate}
                                />
                            );
                        })}
                    </div>
                ))}
            </div>

            {/* Expand / Collapse Toggle button at bottom */}
            <div className="p-4 border-t border-gray-100 shrink-0 flex flex-col gap-3">
                <button
                    onClick={handleLogout}
                    title="Sign Out"
                    className={`flex items-center justify-center gap-2 w-full py-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg font-bold transition-colors ${isCollapsed ? 'px-0' : 'px-4'
                        }`}
                >
                    <LogOut size={18} />
                    {!isCollapsed && <span>Sign Out</span>}
                </button>
                {!isMobile && (
                    <div className="flex justify-center">
                        <button
                            onClick={toggleCollapsed}
                            className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-50 hover:bg-gray-100 text-gray-400 transition-colors"
                        >
                            <ChevronRight size={18} className={`transition-transform duration-300 ${!isCollapsed ? 'rotate-180' : ''}`} />
                        </button>
                    </div>
                )}
            </div>
        </motion.aside>
    );
};

export default DashboardSidebar;
