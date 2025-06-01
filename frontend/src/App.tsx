import { useState, useEffect } from 'react'
import './App.css'
import { UniversityType, SubjectType, FlowType, CurriculumType } from './types';
import { fetchUniversityData, fetchSubjects, fetchFlows, fetchCurriculum } from './api';

import { ScheduleComponent } from './components/ScheduleComponent.tsx';
import { DataComponent } from './components/DataComponent.tsx';

function App() {
  const [universityData, setUniversityData] = useState<UniversityType[]>([]);
  const [subjects, setSubjects] = useState<SubjectType[]>([]);
  const [flows, setFlows] = useState<FlowType[]>([]);
  const [curriculum, setCurriculum] = useState<CurriculumType[]>([]);

  const [activeTab, setActiveTab] = useState('Данные');

  useEffect(() => {
    const loadData = async () => {
      const universetyData = await fetchUniversityData();
      setUniversityData(universetyData);
      const subjectsData = await fetchSubjects();
      setSubjects(subjectsData);
      const flowsData = await fetchFlows();
      setFlows(flowsData);
      const curriculumData = await fetchCurriculum();
      setCurriculum(curriculumData);
    };

    loadData();
  }, []);

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
        {activeTab === 'Данные' &&
          <DataComponent
            universityData={universityData}
            setUniversityData={setUniversityData}
            subjects={subjects}
            setSubjects={setSubjects}
            flows={flows}
            setFlows={setFlows}
            CurriculumData={curriculum}
            setCurriculumData={setCurriculum}
          />
        }
        {activeTab === 'Расписание' &&
          <ScheduleComponent
            universityData={universityData}
            setUniversityData={setUniversityData}
            subjects={subjects}
            setSubjects={setSubjects}
            flows={flows}
            setFlows={setFlows}
            CurriculumData={curriculum}
            setCurriculumData={setCurriculum}
          />
        }
      </div>
    </div>
  );
}

export default App;
