const FILTER_TABS = ['all', 'general', 'cardiology', 'dermatology', 'pediatrics', 'orthopedic']

function tabLabel(tab) {
  if (tab === 'all') return 'All'
  return tab.charAt(0).toUpperCase() + tab.slice(1)
}

export default function DoctorFilters({ activeTab, onTabChange }) {
  return (
    <div className="flex flex-wrap gap-6 border-b border-slate-200">
      {FILTER_TABS.map((tab) => (
        <button
          key={tab}
          type="button"
          onClick={() => onTabChange(tab)}
          className={`pb-3 text-sm transition-colors ${
            activeTab === tab
              ? 'border-b-2 border-blue-600 font-medium text-blue-600'
              : 'border-b-2 border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          {tabLabel(tab)}
        </button>
      ))}
    </div>
  )
}
