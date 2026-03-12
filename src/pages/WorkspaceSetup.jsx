import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import useAuthStore from '../store/useAuthStore';
import api from '../services/api';

import WorkspaceSidebar from '../components/WorkspaceSidebar';
import WorkspaceForm from '../components/WorkspaceForm';

const WorkspaceSetup = () => {
    const { user, updateUser } = useAuthStore();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(false);
    const [metaLists, setMetaLists] = useState({ timeZones: [], languages: [], currencies: [] });

    const [formData, setFormData] = useState({
        companyName: '',
        employeeCount: '',
        timeZone: '',
        language: '',
        currencyLocale: '',
        loadSampleData: true
    });

    useEffect(() => {
        const fetchMeta = async () => {
            try {
                const response = await api.get('/workspace/config-meta');
                const { lists, defaults } = response.data;

                setMetaLists(lists);

                setFormData(prev => ({
                    ...prev,
                    timeZone: defaults.timeZone || 'UTC',
                    language: defaults.language || 'en-US',
                    currencyLocale: defaults.currencyLocale || 'USD'
                }));
            } catch (err) {
                console.error("Failed to load workspace configuration metadata", err);
                toast.error("Failed to load global configurations.");
            }
        };

        fetchMeta();
    }, []);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.companyName.trim() || !formData.employeeCount) {
            toast.error("Company Name and Employee Count are required.", {
                icon: '🏢',
            });
            return;
        }

        setLoading(true);
        const toastId = toast.loading('Configuring your workspace...');
        try {
            const response = await api.post('/workspace/setup', formData);
            // Update global state without needing to relogin
            updateUser({
                isOnboarded: true,
                workspaceId: response.data.workspace?.id || response.data.workspace?._id,
                role: response.data.user?.role || null,
            });
            toast.success("Workspace perfectly configured!", { id: toastId });
            navigate('/dashboard', { replace: true });
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to configure workspace", { id: toastId });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#f8fafc] flex flex-col items-center justify-center p-4 relative overflow-hidden font-sans">

            {/* Top Right User Badge */}
            <div className="absolute top-6 right-6 lg:top-8 lg:right-10 bg-white rounded-full pl-2 pr-4 py-1.5 shadow-sm border border-gray-100 flex items-center gap-3 hidden sm:flex">
                <div className="relative">
                    <div className="w-8 h-8 rounded-full bg-emerald-100 border border-emerald-500 flex items-center justify-center text-emerald-600 font-bold overflow-hidden">
                        {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full"></div>
                </div>
                <div className="flex flex-col">
                    <span className="text-xs font-bold text-gray-900 leading-none mb-1">{user?.name || 'User Profile'}</span>
                    <span className="text-[10px] text-gray-500 leading-none">{user?.email || 'admin@company.com'}</span>
                </div>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="w-full max-w-[1000px] bg-white rounded-[24px] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] border border-gray-100 flex flex-col md:flex-row overflow-hidden relative z-10"
            >
                <WorkspaceSidebar user={user} />
                <WorkspaceForm
                    formData={formData}
                    handleChange={handleChange}
                    handleSubmit={handleSubmit}
                    loading={loading}
                    lists={metaLists}
                />
            </motion.div>

            {/* Footer Links */}
            <div className="mt-8 text-xs font-bold font-mono text-gray-400 flex gap-4 uppercase tracking-wider relative z-10">
                <a href="#" className="hover:text-gray-600 transition-colors">Terms of Service</a>
                <a href="#" className="hover:text-gray-600 transition-colors">Privacy Policy</a>
                <a href="#" className="hover:text-gray-600 transition-colors">Help Center</a>
            </div>

            {/* Tailwind Wave Animation Class Injection */}
            <style dangerouslySetInnerHTML={{
                __html: `
                @keyframes wave {
                    0% { transform: rotate( 0.0deg) }
                    10% { transform: rotate(14.0deg) }  
                    20% { transform: rotate(-8.0deg) }
                    30% { transform: rotate(14.0deg) }
                    40% { transform: rotate(-4.0deg) }
                    50% { transform: rotate(10.0deg) }
                    60% { transform: rotate( 0.0deg) }  
                    100% { transform: rotate( 0.0deg) }
                }
                .animate-wave {
                    animation: wave 2.5s infinite;
                    transform-origin: 70% 70%;
                }
            `}} />
        </div>
    );
};

export default WorkspaceSetup;
