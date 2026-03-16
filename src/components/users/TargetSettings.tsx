import React, { useState } from 'react';
import { useFormContext, Controller } from 'react-hook-form';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Wallet, Info } from 'lucide-react';
import { useTargetTypesQuery } from '../../hooks/useUsersQuery';

interface MonthConfig {
  name: string;
  color: string;
  text: string;
  border: string;
}

const MONTHS: MonthConfig[] = [
  { name: 'January', color: 'bg-blue-50', text: 'text-blue-500', border: 'border-blue-100' },
  { name: 'February', color: 'bg-purple-50', text: 'text-purple-500', border: 'border-purple-100' },
  { name: 'March', color: 'bg-pink-50', text: 'text-pink-500', border: 'border-pink-100' },
  { name: 'April', color: 'bg-emerald-50', text: 'text-emerald-500', border: 'border-emerald-100' },
  { name: 'May', color: 'bg-blue-50', text: 'text-blue-500', border: 'border-blue-100' },
  { name: 'June', color: 'bg-purple-50', text: 'text-purple-500', border: 'border-purple-100' },
  { name: 'July', color: 'bg-pink-50', text: 'text-pink-500', border: 'border-pink-100' },
  { name: 'August', color: 'bg-emerald-50', text: 'text-emerald-500', border: 'border-emerald-100' },
  { name: 'September', color: 'bg-blue-50', text: 'text-blue-500', border: 'border-blue-100' },
  { name: 'October', color: 'bg-purple-50', text: 'text-purple-500', border: 'border-purple-100' },
  { name: 'November', color: 'bg-pink-50', text: 'text-pink-500', border: 'border-pink-100' },
  { name: 'December', color: 'bg-emerald-50', text: 'text-emerald-500', border: 'border-emerald-100' },
];

interface TargetCalendarProps {
    value: string;
    onChange: (v: string) => void;
    label?: string;
}

const TargetCalendar: React.FC<TargetCalendarProps> = ({ value, onChange, label = 'Start Date' }) => {
  const [viewDate, setViewDate] = useState(new Date(value || new Date()));
  
  const days = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
  
  const currentMonth = viewDate.getMonth();
  const currentYear = viewDate.getFullYear();
  
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  
  // Adjust for Monday start (0=Sun to 1=Mon)
  const emptyDays = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;

  const nextMonth = () => setViewDate(new Date(currentYear, currentMonth + 1, 1));
  const prevMonth = () => setViewDate(new Date(currentYear, currentMonth - 1, 1));

  const isSelected = (day: number) => {
    if (!value) return false;
    const d = new Date(value);
    return d.getDate() === day && d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  };

  const handleDateClick = (day: number) => {
    const d = new Date(currentYear, currentMonth, day);
    onChange(d.toISOString().split('T')[0]);
  };

  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  return (
    <div className="bg-white border border-gray-100 rounded-3xl p-4 sm:p-6 shadow-sm h-full">
      <div className="flex items-center justify-between mb-6">
        <div>
           <h4 className="text-sm font-black text-gray-900 leading-none">{monthNames[currentMonth]}</h4>
           <p className="text-[10px] text-gray-400 font-bold mt-1 uppercase tracking-tighter">{currentYear} • Selection: {label}</p>
        </div>
        <div className="flex gap-2">
           <button type="button" onClick={prevMonth} className="p-1.5 hover:bg-gray-100 rounded-xl text-gray-400 Transition-all active:scale-95"><ChevronLeft className="w-4 h-4" /></button>
           <button type="button" onClick={nextMonth} className="p-1.5 hover:bg-gray-100 rounded-xl text-gray-400 Transition-all active:scale-95"><ChevronRight className="w-4 h-4" /></button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-y-2 text-center">
        {days.map(day => (
          <span key={day} className="text-[9px] font-black text-gray-300 uppercase tracking-widest mb-2">{day}</span>
        ))}
        
        {Array.from({ length: emptyDays }).map((_, i) => (
          <div key={`empty-${i}`} />
        ))}

        {Array.from({ length: daysInMonth }).map((_, i) => {
          const date = i + 1;
          const selected = isSelected(date);
          
          // Show green dots for Sundays as per original design
          const dayOfWeek = new Date(currentYear, currentMonth, date).getDay();
          const isSunday = dayOfWeek === 0;

          return (
            <div key={date} className="relative flex items-center justify-center min-h-[36px]">
              {isSunday && (
                <div className="absolute w-7 h-7 rounded-full bg-emerald-50/80 border border-emerald-100/50" />
              )}
              <button
                type="button"
                onClick={() => handleDateClick(date)}
                className={`relative w-8 h-8 flex items-center justify-center rounded-full text-xs font-bold transition-all hover:scale-110 active:scale-90
                  ${selected ? 'bg-[#724e4d] text-white shadow-lg shadow-gray-200' : isSunday ? 'text-emerald-600' : 'text-gray-600 hover:bg-gray-50'}
                `}
              >
                {date}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const TargetSettings: React.FC = () => {
  const { register, control } = useFormContext();
  const { data: typesData } = useTargetTypesQuery();
  const targetTypes = typesData?.types || [];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Top Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-8 px-1 sm:px-2">
        <div className="space-y-2">
          <label className="text-[10px] sm:text-xs font-black text-gray-500 uppercase tracking-widest flex items-center gap-2">
             Type of Target <span className="text-red-500">*</span>
          </label>
          <select
            {...register('targetTypeId')}
            className="w-full px-4 sm:px-5 py-3 sm:py-3.5 bg-gray-50/50 border border-gray-100 rounded-2xl focus:bg-white focus:border-emerald-500 ring-emerald-500/10 focus:ring-4 outline-none transition-all text-xs sm:text-sm font-medium appearance-none shadow-sm"
          >
            <option value="">Select Target Type</option>
            {targetTypes.map((type: any) => (
              <option key={type.id} value={type.id}>{type.name}</option>
            ))}
            <option value="individual">Individual Target</option>
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] sm:text-xs font-black text-gray-500 uppercase tracking-widest flex items-center gap-2">
             Target Cycle <span className="text-red-500">*</span>
          </label>
          <select
            {...register('cycle')}
            className="w-full px-4 sm:px-5 py-3 sm:py-3.5 bg-gray-50/50 border border-gray-100 rounded-2xl focus:bg-white focus:border-emerald-500 ring-emerald-500/10 focus:ring-4 outline-none transition-all text-xs sm:text-sm font-medium appearance-none shadow-sm"
          >
            <option value="MONTHLY">Monthly</option>
            <option value="QUARTERLY">Quarterly</option>
            <option value="YEARLY">Yearly</option>
            <option value="CUSTOM">Custom</option>
          </select>
        </div>
      </div>

      <div className="flex items-center gap-4 px-1 sm:px-2">
        <h3 className="text-lg sm:text-xl font-black text-gray-900 tracking-tight">Targets</h3>
        <div className="h-px flex-1 bg-gray-100" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Month List */}
        <div className="lg:col-span-7 space-y-4">
          <div className="max-h-[300px] lg:max-h-[500px] overflow-y-auto pr-2 sm:pr-4 custom-scrollbar space-y-2">
            {MONTHS.map((month, idx) => (
              <motion.div
                key={month.name}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                className={`flex items-center justify-between p-2 sm:p-3 rounded-2xl border ${month.border} ${month.color} transition-all hover:scale-[1.01]`}
              >
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className={`p-1.5 sm:p-2 rounded-xl bg-white shadow-sm ${month.text}`}>
                    <Wallet className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </div>
                  <span className={`text-xs sm:text-sm font-black ${month.text}`}>{month.name}</span>
                </div>
                
                <div className="relative group">
                   <input
                    type="number"
                    placeholder="Targets"
                    className="w-24 sm:w-32 bg-white/60 border-none rounded-xl px-3 sm:px-4 py-1.5 sm:py-2 text-right text-xs sm:text-sm font-bold text-gray-700 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all placeholder:text-gray-300 shadow-sm"
                   />
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Calendar Column */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <div className="space-y-4">
             <Controller
                name="startDate"
                control={control}
                render={({ field }) => (
                    <TargetCalendar value={field.value} onChange={field.onChange} label="Start Date" />
                )}
             />

             <div className="p-5 bg-emerald-50/30 rounded-3xl border border-emerald-100/30">
               <div className="flex gap-3">
                  <Info className="w-5 h-5 text-emerald-500 shrink-0" />
                  <div>
                    <p className="text-xs font-bold text-emerald-700 mb-1 uppercase tracking-wider">Evaluation Policy</p>
                    <p className="text-[11px] text-emerald-600 leading-relaxed font-medium"> 
                        Automatic check every cycle end. 3 misses lead to a <span className="font-extrabold underline">compliance lock</span>.
                    </p>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TargetSettings;
