import React, { useState } from 'react';
import { UniversityType, SubjectType, FlowType, SyllabusType, GroupType } from '../types';

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

const daysOfWeek = ['Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'];
const pairs = [
  '1 пара [08:00 - 09:35]',
  '2 пара [09:50 - 11:25]',
  '3 пара [11:40 - 13:15]',
  '4 пара [13:45 - 15:20]',
  '5 пара [15:35 - 17:10]',
  '6 пара [17:25 - 19:00]',
  '7 пара [19:15 - 20:50]',
  '8 пара [21:05 - 22:35]'
];

type rowType = {
  day: string;
  pair: string;
}

export const ScheduleComponent = ({ universityData }: DataProps) => {
  const [activeUniversity, setActiveUniversity] = useState<string | null>(null);
  const [activeFaculty, setActiveFaculty] = useState<string | null>(null);
  const [activeDepartment, setActiveDepartment] = useState<string | null>(null);
  const [groups, setGroups] = useState<GroupType[]>([]);
  const [rows, setRows] = useState<rowType[]>([]);

  const handleTabClick = (university: string) => {
    setActiveUniversity(university);
    setActiveFaculty(null);
    setActiveDepartment(null);
  };
  const handleSecondTabClick = (faculty: string) => {
    setActiveFaculty(faculty);
    setActiveDepartment(null);
  };
  const handleThirdTabClick = (department: string) => {
    setActiveDepartment(department);
    let currentGroups = getGroupsForActiveDepartment(department);
    setGroups(currentGroups);
    setRows(daysOfWeek.flatMap(day => 
      pairs.map(pair => ({ day, pair }))
    ));
  };

  // Функция для получения групп по выбранной кафедре
  const getGroupsForActiveDepartment = (departmentName: string): GroupType[] => {
    if (!activeUniversity || !activeFaculty) return [];

    const university = universityData.find(u => u.name === activeUniversity);
    if (!university) return [];
    const faculty = university.faculties.find(f => f.name === activeFaculty);
    if (!faculty) return [];
    if (departmentName === 'all') {
      return faculty.departments.flatMap(department => 
        department.specialities.flatMap(spec => spec.groups)
      );
    }
    const department = faculty.departments.find(d => d.shortName === departmentName);
    if (!department) return [];

    return department.specialities.flatMap(spec => spec.groups);
  };

  return (
    <>
    <div>
      <div>
        {universityData.map((university) => (
          <button
            className={activeUniversity === university.name ? 'active' : ''}
            onClick={() => handleTabClick(university.name)}
          >
            {university.name}
          </button>
        ))}
      </div>
      <div>
        <div>
          {universityData.map((university) => (
            (university.name === activeUniversity) &&
            <React.Fragment key={university.id}>
              <div>
                {university.faculties.map((faculty) => (
                  <button
                    className={activeFaculty === faculty.name ? 'active' : ''}
                    onClick={() => handleSecondTabClick(faculty.name)}
                  >
                    {faculty.name}
                  </button>
                  ))}
              </div>
              {university.faculties.map((faculty) => (
                <div
                  style={{
                    visibility: activeFaculty === faculty.name ? 'visible' : 'hidden',
                    height: activeFaculty === faculty.name ? 'auto' : '0'
                  }}
                >
                  <div>
                    {university.faculties.map((faculty) => (
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
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
    {(activeDepartment) &&
      <table border={1} cellPadding="5" cellSpacing="0" style={{ marginTop: '15px' }}>
        <thead>
          <tr>
            <th></th>
            <th></th>
            {groups.map(group => (
              <th key={group.id}>
                {`${group.name} (${group.course})`}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map(row => (
            <tr key={`${row.day}-${row.pair}`}>
              {(row.pair === pairs[0]) &&
                <td rowSpan={pairs.length}>
                  {row.day}
                </td>
              }
              <td>{row.pair}</td>
              {groups.map(group => (
                <td key={group.id} />
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    }
    </>
  );
};