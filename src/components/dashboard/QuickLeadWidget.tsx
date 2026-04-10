import React, { useState, FormEvent, ChangeEvent } from 'react';
import { motion } from 'framer-motion';
import { UserPlus, Phone, AlignLeft, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { useCreateLeadMutation } from '../../hooks/useLeads';

const QuickLeadWidget: React.FC = () => {
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const navigate = useNavigate();
    const createLeadMutation = useCreateLeadMutation();

    const handleSave = async (e: FormEvent) => {
        e.preventDefault();

        const trimmedName = name.trim();
        const trimmedPhone = phone.trim();

        if (!trimmedName || !trimmedPhone) {
            toast.error('Please fill in both fields');
            return;
        }

        if (trimmedPhone.length < 7) {
            toast.error('Please enter a valid phone number');
            return;
        }

        try {
            const response = await createLeadMutation.mutateAsync({
                payload: {
                    name: trimmedName,
                    phone: trimmedPhone,
                },
            });
            setName('');
            setPhone('');
            navigate('/leads', {
                state: {
                    quickLeadCreatedId: response?.data?.id || null,
                },
            });
        } catch {
            // Toast feedback is handled by the shared lead mutation hook.
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.3 }}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col h-full hover:shadow-[0_10px_30px_-15px_rgba(16,185,129,0.15)] transition-shadow duration-300"
        >
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-50">
                <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-500">
                    <UserPlus size={16} />
                </div>
                <div>
                    <h3 className="text-base font-bold text-gray-900 leading-tight">Quick Add</h3>
                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Fast Lead Entry</p>
                </div>
            </div>

            <form onSubmit={handleSave} className="flex flex-col gap-4 flex-1">
                <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-300 group-focus-within:text-emerald-500 transition-colors">
                        <AlignLeft size={16} />
                    </div>
                    <input
                        type="text"
                        value={name}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
                        placeholder="Full Name"
                        disabled={createLeadMutation.isPending}
                        className="w-full pl-10 pr-4 py-2 bg-gray-50/50 border border-gray-200 rounded-xl text-sm font-bold placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 hover:border-gray-300 transition-all"
                    />
                </div>

                <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-300 group-focus-within:text-emerald-500 transition-colors">
                        <Phone size={16} />
                    </div>
                    <input
                        type="tel"
                        value={phone}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => setPhone(e.target.value)}
                        placeholder="Phone Number"
                        disabled={createLeadMutation.isPending}
                        className="w-full pl-10 pr-4 py-2 bg-gray-50/50 border border-gray-200 rounded-xl text-sm font-bold placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 hover:border-gray-300 transition-all font-mono"
                    />
                </div>

                <div className="mt-auto pt-4">
                    <button
                        type="submit"
                        disabled={createLeadMutation.isPending}
                        className="flex w-full items-center justify-center gap-2 bg-gray-900 py-2.5 text-center text-sm font-bold text-white shadow-sm transition-all active:scale-95 disabled:cursor-not-allowed disabled:opacity-70 hover:bg-black rounded-xl"
                    >
                        {createLeadMutation.isPending ? (
                            <>
                                <Loader2 size={16} className="animate-spin" />
                                Saving Lead...
                            </>
                        ) : (
                            'Save Lead'
                        )}
                    </button>
                </div>
            </form>
        </motion.div>
    );
};

export default QuickLeadWidget;
