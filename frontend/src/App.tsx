import { useState, useEffect, useMemo } from 'react'
import './App.css'
import {
  UniversityType, SubjectType, FlowType, CurriculumType, GroupType,
  ScheduleData, ClassroomType
} from './types';
import {
  fetchUniversityData, fetchSubjects, fetchFlows, fetchCurriculum, fetchSchedule
} from './api';

import { ScheduleComponent } from './components/ScheduleComponent.tsx';
import { DataComponent } from './components/DataComponent.tsx';

function App() {
  const [universityData, setUniversityData] = useState<UniversityType[]>([]);
  const [subjects, setSubjects] = useState<SubjectType[]>([]);
  const [flows, setFlows] = useState<FlowType[]>([]);
  const [curriculum, setCurriculum] = useState<CurriculumType[]>([]);
  const [schedule, setSchedule] = useState<ScheduleData>({data: {}});

  // Для вкладки "Расписание"
  const [activeUniversity, setActiveUniversity] = useState<string | null>(null);
  const [activeFaculty, setActiveFaculty] = useState<string | null>(null);
  const [activeDepartment, setActiveDepartment] = useState<string | null>(null);
  const [groupsForSchedule, setGroupsForSchedule] = useState<GroupType[]>([]);
  const [currentWeek, setCurrentWeek] = useState<number>(1);

  const allClassrooms = useMemo<ClassroomType[]>(() => {
    const getAllGroups = (data: UniversityType[]): ClassroomType[] => {
      let facultiesClassrooms = data.flatMap(university =>
        university.faculties.flatMap(faculty => faculty.classrooms)
      );
      let departmentsClassrooms = data.flatMap(university =>
        university.faculties.flatMap(faculty => 
          faculty.departments.flatMap(department => department.classrooms)
        )
      );
      return facultiesClassrooms.concat(departmentsClassrooms);
    };
    return Array.from(new Set(getAllGroups(universityData)));
  }, [universityData]);

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
      const scheduleData = await fetchSchedule();
      setSchedule(scheduleData);
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
            activeUniversity={activeUniversity}
            setActiveUniversity={setActiveUniversity}
            activeFaculty={activeFaculty}
            setActiveFaculty={setActiveFaculty}
            activeDepartment={activeDepartment}
            setActiveDepartment={setActiveDepartment}
            groups={groupsForSchedule}
            setGroups={setGroupsForSchedule}
            currentWeek={currentWeek}
            setCurrentWeek={setCurrentWeek}
            schedule={schedule}
            setSchedule={setSchedule}
            allClassrooms={allClassrooms}
          />
        }
      </div>
    </div>
  );
}

export default App;
