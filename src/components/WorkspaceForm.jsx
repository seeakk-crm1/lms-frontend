import React, { useMemo } from 'react';
import { Building2, Users, Globe2, Languages, Coins, CheckCircle2, ChevronRight, Loader2, Sparkles } from 'lucide-react';
import SearchableSelect from './SearchableSelect';

const InputWrapper = ({ label, icon: Icon, children }) => (
    <div className="mb-5">
        <label className="flex items-center gap-1.5 text-sm font-bold text-gray-700 mb-2">
            {Icon && <Icon size={16} className="text-gray-400" />}
            {label}
        </label>
        {children}
    </div>
);

const WorkspaceForm = ({ formData, handleChange, handleSubmit, loading, lists }) => {

    const timeZones = lists?.timeZones || [];
    const languages = lists?.languages || [];
    const currencies = lists?.currencies || [];

    const timeZoneOptions = timeZones.map(tz => ({ value: tz, label: tz.replace(/_/g, ' ') }));
    const languageOptions = languages.map(lng => ({ value: lng.code, label: lng.label }));
    const currencyOptions = currencies.map(cur => ({ value: cur.code, label: cur.label }));

    return (
        <div className="md:w-[58%] p-8 sm:p-12 pl-8 sm:pl-14 flex flex-col justify-center bg-white relative">

            {/* Mobile Logo (Visible only on small screens) */}
            <div className="md:hidden relative h-10 w-32 mb-6 overflow-hidden">
                <img src="/logo.png" alt="Seeakk" className="absolute top-1/2 left-0 -translate-y-1/2 h-24 w-auto object-contain object-left" />
            </div>

            <h1 className="text-2xl font-black text-gray-900 mb-2">Configure Your Workspace</h1>
            <p className="text-gray-500 text-sm mb-8 font-medium">Tailor your Seeakk experience by providing a few details about your team.</p>

            <form onSubmit={handleSubmit} className="w-full max-w-[460px]">
                <InputWrapper label="Company Name" icon={Building2}>
                    <input
                        type="text"
                        name="companyName"
                        value={formData.companyName}
                        onChange={handleChange}
                        placeholder="e.g. Acme Corporation"
                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 text-gray-900 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all placeholder:text-gray-400 font-medium"
                        required
                    />
                </InputWrapper>

                <InputWrapper label="Employee Count" icon={Users}>
                    <select
                        name="employeeCount"
                        value={formData.employeeCount}
                        onChange={handleChange}
                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 text-gray-900 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none transition-all appearance-none font-medium"
                        required
                    >
                        <option value="" disabled>How many people are in your team?</option>
                        <option value="1-10">1 - 10 employees</option>
                        <option value="11-50">11 - 50 employees</option>
                        <option value="51-200">51 - 200 employees</option>
                        <option value="201-500">201 - 500 employees</option>
                        <option value="500+">500+ employees</option>
                    </select>
                </InputWrapper>

                <InputWrapper label="Time Zone (IANA)" icon={Globe2}>
                    <SearchableSelect
                        name="timeZone"
                        options={timeZoneOptions}
                        value={formData.timeZone}
                        onChange={handleChange}
                        placeholder="Search for a time zone..."
                    />
                </InputWrapper>

                <div className="flex flex-col sm:flex-row gap-4 mb-2">
                    <div className="flex-1 min-w-0">
                        <InputWrapper label="Language (ISO-639)" icon={Languages}>
                            <SearchableSelect
                                name="language"
                                options={languageOptions}
                                value={formData.language}
                                onChange={handleChange}
                                placeholder="Search language..."
                            />
                        </InputWrapper>
                    </div>
                    <div className="flex-1 min-w-0">
                        <InputWrapper label="Currency (ISO-4217)" icon={Coins}>
                            <SearchableSelect
                                name="currencyLocale"
                                options={currencyOptions}
                                value={formData.currencyLocale}
                                onChange={handleChange}
                                placeholder="Search currency..."
                            />
                        </InputWrapper>
                    </div>
                </div>

                {/* Special Checkbox inside a bordered box */}
                <div className="mt-8 border-2 border-emerald-100 rounded-xl p-1 relative flex items-center bg-white shadow-sm overflow-hidden">
                    <label className="flex items-center gap-3 py-3 px-4 flex-1 cursor-pointer group">
                        <div className="relative flex items-center">
                            <input
                                type="checkbox"
                                name="loadSampleData"
                                checked={formData.loadSampleData}
                                onChange={handleChange}
                                className="w-5 h-5 appearance-none rounded border-2 border-emerald-500 checked:bg-emerald-500 checked:border-emerald-500 transition-colors cursor-pointer"
                            />
                            <CheckCircle2 className={`absolute pointer-events-none w-4 h-4 text-white left-0.5 opacity-0 ${formData.loadSampleData ? 'opacity-100' : ''}`} />
                        </div>
                        <span className="text-sm font-bold text-gray-700 group-hover:text-emerald-700 transition-colors">Load sample data for exploration</span>
                    </label>

                    <button
                        type="submit"
                        disabled={loading}
                        className="bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-300 text-white font-bold py-3.5 px-6 rounded-lg text-sm transition-colors flex items-center gap-2 relative shadow-lg shadow-emerald-500/20"
                    >
                        {loading ? <Loader2 size={16} className="animate-spin" /> : 'Get Started'}
                        {!loading && <ChevronRight size={16} />}

                        {/* Decorator icon hanging off edge from screenshot */}
                        <div className="absolute -right-3 -top-3 w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-white border-2 border-white shadow-sm rotate-12">
                            <Sparkles size={14} />
                        </div>
                    </button>
                </div>

            </form>
        </div>
    );
};

export default WorkspaceForm;
