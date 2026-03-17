import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const StageRulesPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-10">
      <div className="max-w-4xl mx-auto bg-white rounded-3xl border border-gray-100 shadow-sm p-6 md:p-10">
        <button
          onClick={() => navigate('/admin/lead-stages')}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-100 text-gray-700 text-sm font-bold hover:bg-gray-200 transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Lead Stages
        </button>

        <h1 className="mt-6 text-2xl md:text-3xl font-black text-gray-900">Stage Rules</h1>
        <p className="mt-2 text-sm text-gray-500">Rule management screen is reserved for dedicated workflow configuration.</p>
      </div>
    </div>
  );
};

export default StageRulesPage;

