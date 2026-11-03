import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  Activity,
  CalendarCheck,
  FileText,
  IndianRupee,
  PhoneCall,
  Briefcase,
} from 'lucide-react';

const tabs = [
  { to: '/reports/activity', label: 'Activity Reports', icon: Activity },
  { to: '/reports/summary', label: 'Summary Reports', icon: FileText },
  { to: '/reports/call-performance', label: 'Call Performance', icon: PhoneCall },
  { to: '/reports/revenue', label: 'Revenue Reports', icon: IndianRupee },
  { to: '/reports/leads', label: 'Lead Reports', icon: Briefcase },
  { to: '/reports/followups', label: 'Followup Reports', icon: PhoneCall },
  { to: '/reports/attendance', label: 'Attendance Reports', icon: CalendarCheck },
];

const ReportSubNav: React.FC = () => (
  <div className="print:hidden border-b border-gray-200/80 overflow-x-auto scrollbar-none">
    <nav className="flex items-center gap-1 sm:gap-2 min-w-max -mb-px" aria-label="Reports navigation">
      {tabs.map(({ to, label, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) =>
            `group inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold border-b-2 transition-all whitespace-nowrap cursor-pointer ${
              isActive
                ? 'border-emerald-600 text-emerald-700 font-bold'
                : 'border-transparent text-gray-500 hover:text-gray-900 hover:border-gray-300'
            }`
          }
        >
          {({ isActive }) => (
            <>
              <Icon
                size={14}
                className={`transition-colors shrink-0 ${
                  isActive ? 'text-emerald-600' : 'text-gray-400 group-hover:text-gray-600'
                }`}
              />
              <span>{label}</span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  </div>
);

export default ReportSubNav;
