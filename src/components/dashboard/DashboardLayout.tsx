import React, { useState, ReactNode, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import DashboardSidebar from '../dashboard/DashboardSidebar';
import DashboardHeader from '../dashboard/DashboardHeader';

interface DashboardLayoutProps {
    children: ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const closeMobileMenu = useCallback(() => setMobileMenuOpen(false), []);
    const toggleMobileMenu = useCallback(() => {
        setMobileMenuOpen((prev) => !prev);
    }, []);

    useEffect(() => {
        if (!mobileMenuOpen) {
            return;
        }

        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                closeMobileMenu();
            }
        };

        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        window.addEventListener('keydown', handleEscape);

        return () => {
            document.body.style.overflow = previousOverflow;
            window.removeEventListener('keydown', handleEscape);
        };
    }, [mobileMenuOpen, closeMobileMenu]);

    return (
        <div className="h-screen w-full bg-gray-50 flex overflow-hidden font-sans text-gray-900 selection:bg-emerald-200 selection:text-emerald-900">
            {/* Desktop Sidebar */}
            <DashboardSidebar
                isCollapsed={isSidebarCollapsed}
                toggleCollapsed={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            />

            {/* Mobile Sidebar Overlay */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-40 md:hidden"
                            onClick={closeMobileMenu}
                        />
                        <motion.div
                            initial={{ x: '-100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '-100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="fixed inset-y-0 left-0 z-50 md:hidden"
                        >
                            <DashboardSidebar
                                isMobile={true}
                                isCollapsed={false}
                                toggleCollapsed={closeMobileMenu}
                                onNavigate={closeMobileMenu}
                            />
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col h-full overflow-hidden relative">
                <DashboardHeader isMobileMenuOpen={mobileMenuOpen} onToggleMobileMenu={toggleMobileMenu} />
                {children}
            </main>
        </div>
    );
};

export default DashboardLayout;
