import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    LayoutDashboard, Users, UserCog, Settings, FileText, Calendar as CalendarIcon,
    Briefcase, FileBarChart, Unplug, MapPin, ChevronDown, Activity, ChevronRight, LogOut, LucideIcon
} from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/useAuthStore';

interface SubMenuItem {
    label: string;
    path: string;
}

interface SidebarItem {
    icon: LucideIcon;
    label: string;
    path?: string;
    subItems?: SubMenuItem[];
}

interface SidebarSection {
    title: string;
    items: SidebarItem[];
}

const sidebarMenus: SidebarSection[] = [
    {
        title: 'MAIN',
        items: [
            { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' }
        ]
    },
    {
        title: 'MANAGEMENT',
        items: [
            {
                icon: Users, label: 'Admin Management',
                subItems: [
                    { label: 'Users', path: '/admin/users' },
                    { label: 'Roles', path: '/admin/roles' },
                    { label: 'Departments', path: '/admin/departments' },
                    { label: 'Organization Chart', path: '/admin/organisation-chart' },
                    { label: 'Roster Sheet', path: '/admin/roster' }
                ]
            },
            {
                icon: Settings, label: 'Master Configuration',
                subItems: [
                    { label: 'Lead Sources', path: '/admin/lead-source' },
                    { label: 'Lead Stages', path: '/admin/lead-stages' },
                    { label: 'Stage Rules', path: '/admin/stage-rules' },
                    { label: 'Target Cycles', path: '/admin/target-cycles' },
                    { label: 'Lead Dynamic Forms', path: '/admin/lead-dynamics' },
                    { label: 'Office Locations', path: '/admin/offices' },
                    { label: 'Lead Life Cycle', path: '/admin/lead-life-cycles' },
                    { label: 'Calendar', path: '/calendar' },
                    { label: 'Holiday List', path: '#' },
                    { label: 'Report Types', path: '#' },
                    { label: 'LOB Reasons', path: '#' }
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
                    { label: 'All Leads', path: '/leads' },
                    { label: 'Closed Leads', path: '/leads/closed' },
                    { label: 'Bulk Assign', path: '/leads/bulk-assign' },
                    { label: 'Pending Approval', path: '#' },
                    { label: "Today's Follow-ups", path: '/calendar/today' }
                ]
            },
            { icon: FileText, label: 'Reports', path: '/reports' },
            { icon: FileBarChart, label: 'LOB Analysis', path: '/lob-analysis' }
        ]
    },
    {
        title: 'SYSTEM',
        items: [
            { icon: UserCog, label: 'Settings', path: '/settings' },
            { icon: Unplug, label: 'Unlock Staff', path: '/unlock-staff' },
            { icon: MapPin, label: 'Locations', path: '/locations' }
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
}

const MenuItem: React.FC<MenuItemProps> = ({ item, isCollapsed, isActive, setActiveMenu, activeMenu, toggleCollapsed }) => {
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
                        className="overflow-hidden"
                    >
                        <div className="flex flex-col gap-1 mt-1 pl-10 pr-3">
                            {item.subItems!.map((sub, idx) => (
                                <Link 
                                    key={idx} 
                                    to={sub.path} 
                                    className={`flex items-center gap-2 text-xs font-medium py-2 transition-colors ${location.pathname === sub.path ? 'text-emerald-600' : 'text-gray-500 hover:text-emerald-600'}`}
                                >
                                    <div className={`w-1 h-1 rounded-full ${location.pathname === sub.path ? 'bg-emerald-500' : 'bg-gray-300'}`}></div>
                                    {sub.label}
                                </Link>
                            ))}
                        </div>
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
}

const DashboardSidebar: React.FC<DashboardSidebarProps> = ({ isCollapsed, toggleCollapsed, isMobile = false }) => {
    const [activeMenu, setActiveMenu] = useState<string | null>('Dashboard');
    const location = useLocation();
    const navigate = useNavigate();
    const logout = useAuthStore((state) => state.logout);

    const handleLogout = () => {
        logout();
        navigate('/login', { replace: true });
    };

    return (
        <motion.aside
            initial={false}
            animate={{ width: isCollapsed ? 80 : 280 }}
            className={`h-screen bg-white border-r border-gray-200 flex flex-col relative z-20 shrink-0 select-none ${isMobile ? 'flex w-full' : 'hidden md:flex'}`}
        >
            {/* Logo Area */}
            <div className={`h-20 flex items-center ${isCollapsed ? 'justify-center' : 'px-6'} border-b border-gray-100 shrink-0`}>
                {isCollapsed ? (
                    <div className="w-8 h-8 rounded-xl bg-emerald-500 flex items-center justify-center">
                        <span className="text-white font-black text-lg">S</span>
                    </div>
                ) : (
                    <div className="flex items-center justify-start w-full h-full pointer-events-none select-none">
                        <img src="/logo.png" alt="Seeakk" className="w-[180px] h-auto object-contain object-left origin-left hover:scale-105 transition-transform" />
                    </div>
                )}
            </div>

            {/* Menu Sections */}
            <div className="flex-1 overflow-y-auto py-6 px-4 custom-scrollbar">
                {sidebarMenus.map((section, idx) => (
                    <div key={idx} className="mb-6">
                        {!isCollapsed && (
                            <p className="px-3 text-[10px] font-bold tracking-widest text-gray-400 mb-2">{section.title}</p>
                        )}
                        {section.items.map((item, i) => (
                            <MenuItem
                                key={i}
                                item={item}
                                isCollapsed={isCollapsed}
                                isActive={location.pathname === item.path || (item.label === 'Dashboard' && location.pathname === '/dashboard')}
                                activeMenu={activeMenu}
                                setActiveMenu={setActiveMenu}
                                toggleCollapsed={toggleCollapsed}
                            />
                        ))}
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
                <div className="flex justify-center">
                    <button
                        onClick={toggleCollapsed}
                        className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-50 hover:bg-gray-100 text-gray-400 transition-colors"
                    >
                        <ChevronRight size={18} className={`transition-transform duration-300 ${!isCollapsed ? 'rotate-180' : ''}`} />
                    </button>
                </div>
            </div>
        </motion.aside>
    );
};

export default DashboardSidebar;
