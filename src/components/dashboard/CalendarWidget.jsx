import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, Video, Phone } from 'lucide-react';
import useDashboardStore from '../../store/useDashboardStore';

const CalendarWidget = () => {
    const { meetings, isLoading } = useDashboardStore();

    if (isLoading) {
        return (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col h-full">
                <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-50">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gray-100 animate-pulse"></div>
                        <div>
                            <div className="w-20 h-4 bg-gray-100 rounded mb-1 animate-pulse"></div>
                            <div className="w-16 h-3 bg-gray-50 rounded animate-pulse"></div>
                        </div>
                    </div>
                </div>
                <div className="flex flex-col gap-4 flex-1">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="flex gap-4">
                            <div className="w-3 h-full flex flex-col items-center">
                                <div className="w-2 h-2 rounded-full bg-gray-200 mt-1.5 animate-pulse"></div>
                                <div className="w-px h-full bg-gray-100 my-1"></div>
                            </div>
                            <div className="flex-1 pb-4">
                                <div className="w-3/4 h-4 bg-gray-100 rounded mb-2 animate-pulse"></div>
                                <div className="w-1/2 h-3 bg-gray-50 rounded animate-pulse"></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.4 }}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col h-full hover:shadow-[0_10px_30px_-15px_rgba(16,185,129,0.15)] transition-shadow duration-300"
        >
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-50">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-500">
                        <Calendar size={16} />
                    </div>
                    <div>
                        <h3 className="text-base font-bold text-gray-900 leading-tight">Schedule</h3>
                        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Today, Oct 24</p>
                    </div>
                </div>
            </div>

            <div className="flex flex-col gap-4 flex-1">
                {meetings.map((meeting, i) => (
                    <div key={meeting.id} className="flex gap-4 group">
                        <div className="flex flex-col items-center">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 ring-4 ring-emerald-50 mt-1.5 group-hover:scale-125 group-hover:ring-emerald-100 transition-all"></div>
                            {i !== meetings.length - 1 && <div className="w-px h-full bg-gray-100 my-1 group-hover:bg-emerald-100 transition-colors"></div>}
                        </div>
                        <div className="flex-1 pb-4">
                            <p className="text-sm font-bold text-gray-900 group-hover:text-emerald-600 transition-colors">{meeting.title}</p>
                            <div className="flex items-center gap-2 mt-1.5 text-[11px] font-bold text-gray-400">
                                <Clock size={12} />
                                <span>{meeting.time}</span>
                                <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                                {meeting.type === 'video' ? <Video size={12} className="text-emerald-500" /> : <Phone size={12} className="text-emerald-500" />}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-2 text-center pt-2">
                <button className="text-xs font-bold text-gray-400 hover:text-gray-900 transition-colors uppercase tracking-widest">
                    View Full Calendar →
                </button>
            </div>
        </motion.div>
    );
};

export default CalendarWidget;
