import { useState } from 'react';
import './Tabs.css';

export default function Tabs({ tabs, defaultTab, className = '' }) {
  const [active, setActive] = useState(defaultTab || tabs[0]?.key);
  const activeTab = tabs.find((t) => t.key === active);

  return (
    <div className={`tabs ${className}`}>
      <div className="tabs-header">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            className={`tab-btn ${active === tab.key ? 'tab-active' : ''}`}
            onClick={() => setActive(tab.key)}
          >
            {tab.icon && <span className="material-symbols-rounded tab-icon">{tab.icon}</span>}
            {tab.label}
            {tab.count !== undefined && <span className="tab-count">{tab.count}</span>}
          </button>
        ))}
      </div>
      <div className="tabs-content">
        {activeTab?.content}
      </div>
    </div>
  );
}
