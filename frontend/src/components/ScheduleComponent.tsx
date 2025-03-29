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
  const [activeUniversity, setActiveUniversity] = useState<UniversityType | null>(null);
  const [activeFaculty, setActiveFaculty] = useState<string | null>(null);
  const [activeDepartment, setActiveDepartment] = useState<string | null>(null);

  const handleTabClick = (university: UniversityType) => {
    setActiveUniversity(university);
  };
  const handleSecondTabClick = (faculty: string) => {
    setActiveFaculty(faculty);
  };
  const handleThirdTabClick = (department: string) => {
    setActiveDepartment(department);
  };

  return (
    <div className="tabs-container">
      <div>
        {universityData.map((university) => (
          <button
            className={activeUniversity?.name === university.name ? 'active' : ''}
            onClick={() => handleTabClick(university)}
          >
            {university.name}
          </button>
        ))}
      </div>
      <div>
        <div className="tabs-container">
          <div>
            {activeUniversity?.faculties.map((faculty) => (
              <button
                className={activeFaculty === faculty.name ? 'active' : ''}
                onClick={() => handleSecondTabClick(faculty.name)}
              >
                {faculty.name}
              </button>
              ))}
          </div>
          {activeUniversity?.faculties.map((faculty) => (
            <div
              style={{
                visibility: activeFaculty === faculty.name ? 'visible' : 'hidden',
                height: activeFaculty === faculty.name ? 'auto' : '0'
              }}
            >
              <div>
                {activeUniversity?.faculties.map((faculty) => (
                  (activeFaculty === faculty.name) ? (
                    <React.Fragment key={faculty.id}>
                      <button
                        className={activeDepartment === 'all' ? 'active' : ''}
                        onClick={() => handleThirdTabClick('all')}
                      >
                        Все
                      </button>
                      {faculty.departments.map((department) => (
                        <button
                          className={activeDepartment === department.shortName ? 'active' : ''}
                          onClick={() => handleThirdTabClick(department.shortName)}
                        >
                          {department.shortName}
                        </button>
                      ))}
                    </React.Fragment>
                  ) : null
                  ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};