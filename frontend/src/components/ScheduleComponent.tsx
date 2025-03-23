import React, { useState } from 'react';
import { UniversityType, SubjectType, FlowType, SyllabusType } from '../types';

export interface DataProps {
  universityData: UniversityType[];
  setUniversityData: React.Dispatch<React.SetStateAction<UniversityType[]>>;
  subjects: SubjectType[];
  setSubjects: React.Dispatch<React.SetStateAction<SubjectType[]>>;
  flows: FlowType[];
  setFlows: React.Dispatch<React.SetStateAction<FlowType[]>>;
  syllabusData: SyllabusType[];
  setSyllabusData: React.Dispatch<React.SetStateAction<SyllabusType[]>>;
}

export const ScheduleComponent = ({ universityData }: DataProps) => {
  const [activeTab, setActiveTab] = useState('');

  const handleTabClick = (tab: string) => {
    setActiveTab(tab);
  };

  return (
    <div className="tabs-container">
      <div>
        {universityData.map((university) => (
          <button
            className={activeTab === university.name ? 'active' : ''}
            onClick={() => handleTabClick(university.name)}
          >
            {university.name}
          </button>
        ))}
      </div>
      <div>
        {universityData.map((university) => (
          <div style={{ visibility: activeTab === university.name ? 'visible' : 'hidden', height: activeTab === university.name ? 'auto' : '0' }}>
            {university.name}
          </div>
        ))}
      </div>
    </div>
  );
};