'use client';

interface Tab {
  id: string;
  label: string;
  count?: number;
}

interface TabNavProps {
  activeTab: string;
  onTabChange: (tab: any) => void;
  tabs: Tab[];
}

export function TabNav({ activeTab, onTabChange, tabs }: TabNavProps) {
  return (
    <div className="flex border-b border-susu-gold/10">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`flex-1 py-3 px-4 text-sm font-medium transition-all duration-200 relative ${
            activeTab === tab.id
              ? 'text-susu-gold'
              : 'text-susu-cream/60 hover:text-susu-cream'
          }`}
        >
          <span className="flex items-center justify-center gap-2">
            {tab.label}
            {tab.count !== undefined && tab.count > 0 && (
              <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                activeTab === tab.id
                  ? 'bg-susu-gold/20'
                  : 'bg-white/10'
              }`}>
                {tab.count}
              </span>
            )}
          </span>
          
          {/* Active indicator */}
          {activeTab === tab.id && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-susu-gold" />
          )}
        </button>
      ))}
    </div>
  );
}
