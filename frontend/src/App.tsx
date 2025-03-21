import { useState } from 'react'
import './App.css'

import { ScheduleComponent } from './components/ScheduleComponent.tsx';
import { DataComponent } from './components/DataComponent.tsx';

function App() {
  const [activeTab, setActiveTab] = useState('Данные');

  const handleTabClick = (tab: string) => {
    setActiveTab(tab);
  };

  return (
    <div className="tabs-container">
      <div className="tabs">
        <button
          className={activeTab === 'Данные' ? 'active' : ''}
          onClick={() => handleTabClick('Данные')}
          style={{ borderTopLeftRadius: 10, marginLeft: 5 }}
        >
          Данные
        </button>
        <button
          className={activeTab === 'Расписание' ? 'active' : ''}
          onClick={() => handleTabClick('Расписание')}
          style={{ borderTopRightRadius: 10 }}
        >
          Расписание
        </button>
      </div>
      <div className="tab-content">
        {activeTab === 'Данные' && <DataComponent />}
        {activeTab === 'Расписание' && <ScheduleComponent />}
      </div>
    </div>
  );
}

export default App;
