import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  Activity,
  CalendarCheck,
  Download,
  FileText,
  IndianRupee,
  PhoneCall,
  Briefcase,
} from 'lucide-react';

const tabs = [
  { to: '/reports/activity', label: 'Activity Reports', icon: Activity },
  { to: '/reports/summary', label: 'Summary Reports', icon: FileText },
  { to: '/reports/revenue', label: 'Revenue Reports', icon: IndianRupee },
  { to: '/reports/leads', label: 'Lead Reports', icon: Briefcase },
  { to: '/reports/followups', label: 'Followup Reports', icon: PhoneCall },
  { to: '/reports/attendance', label: 'Attendance Reports', icon: CalendarCheck },
  { to: '/reports/export', label: 'Export Center', icon: Download },
];

const ReportSubNav: React.FC = () => (
  <div className="print:hidden overflow-x-auto">
    <div className="flex min-w-max gap-2 rounded-2xl border border-gray-100 bg-white p-2 shadow-sm">
      {tabs.map(({ to, label, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) =>
            `flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-bold transition-all ${
              isActive
                ? 'bg-emerald-500 text-white shadow-md'
                : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
            }`
          }
        >
          <Icon size={14} />
          <span className="whitespace-nowrap">{label}</span>
        </NavLink>
      ))}
    </div>
  </div>
);

export default ReportSubNav;
