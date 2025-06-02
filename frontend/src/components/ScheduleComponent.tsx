import React, { useState } from 'react';
import {
  UniversityType, SubjectType, FlowType, CurriculumType, GroupType,
  ScheduleData, DayNumber, PairNumber, WeekNumber, ClassroomType, LessonType
} from '../types';
import { addScheduleLesson } from '../api';


export interface DataProps {
  universityData: UniversityType[];
  setUniversityData: React.Dispatch<React.SetStateAction<UniversityType[]>>;
  subjects: SubjectType[];
  setSubjects: React.Dispatch<React.SetStateAction<SubjectType[]>>;
  flows: FlowType[];
  setFlows: React.Dispatch<React.SetStateAction<FlowType[]>>;
  CurriculumData: CurriculumType[];
  setCurriculumData: React.Dispatch<React.SetStateAction<CurriculumType[]>>;
  activeUniversity: string | null;
  setActiveUniversity: React.Dispatch<React.SetStateAction<string | null>>;
  activeFaculty: string | null;
  setActiveFaculty: React.Dispatch<React.SetStateAction<string | null>>;
  activeDepartment: string | null;
  setActiveDepartment: React.Dispatch<React.SetStateAction<string | null>>;
  groups: GroupType[];  // Текущие группы для выбранной кафедры
  setGroups: React.Dispatch<React.SetStateAction<GroupType[]>>;
  currentWeek: number;
  setCurrentWeek: React.Dispatch<React.SetStateAction<number>>;
  schedule: ScheduleData;
  setSchedule: React.Dispatch<React.SetStateAction<ScheduleData>>;
  allClassrooms: ClassroomType[];
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

export const ScheduleComponent = ({
  universityData, activeUniversity, setActiveUniversity, activeFaculty,
  setActiveFaculty, activeDepartment, setActiveDepartment, groups, setGroups,
  currentWeek, setCurrentWeek, schedule, setSchedule, allClassrooms, CurriculumData
}: DataProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentDay, setCurrentDay] = useState(1);
  const [currentPair, setCurrentPair] = useState(1);
  const [selectedClassroom, setSelectedClassroom] = useState(0);
  const [selectedType, setSelectedType] = useState<LessonType>("лабораторное");
  const [selectedCurriculum, setSelectedCurriculum] = useState(0);
  const [selectedGroup, setSelectedGroup] = useState("");

  const rows: rowType[] = daysOfWeek.flatMap(day => 
    pairs.map(pair => ({ day, pair }))
  );

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
    const department = faculty.departments.find(d => d.short_name === departmentName);
    if (!department) return [];

    return department.specialities.flatMap(spec => spec.groups);
  };

  const handleAddSchedule = async () => {
    await addScheduleLesson(
      currentWeek,
      currentDay,
      currentPair,
      selectedClassroom,
      selectedCurriculum,
      selectedType
    );
    setSchedule(prev => ({
      data: {
        ...prev.data,
        [currentWeek]: {
          ...prev.data[currentWeek as WeekNumber],
          [currentDay]: {
            ...prev.data[currentWeek as WeekNumber]?.[currentDay as DayNumber],
            [currentPair]: {
              ...prev.data[currentWeek as WeekNumber]?.[currentDay as DayNumber]?.[currentPair as PairNumber],
              [selectedGroup]: {
                lesson_type: selectedType,
                subject: CurriculumData.find(u => u.id === selectedCurriculum)?.subject,
                teachers: "Иванова Т.П.",
                classroom: allClassrooms.find(u => u.id === selectedClassroom)?.number
              }
            }
          }
        }
      }
    }));
    setIsModalOpen(false);
  };

  return (
    <>
    <div>
      <div style={{ position: 'absolute', right: '15px' }}>
        <button
          className={currentWeek === 1 ? 'active' : ''}
          onClick={() => setCurrentWeek(1)}
          style={{ marginRight: 5 }}
        >
          1 неделя
        </button>
        <button
          className={currentWeek === 2 ? 'active' : ''}
          onClick={() => setCurrentWeek(2)}
        >
          2 неделя
        </button>
      </div>
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
                              className={activeDepartment === department.short_name ? 'active' : ''}
                              onClick={() => handleThirdTabClick(department.short_name)}
                            >
                              {department.short_name}
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
              {groups.map(group => {
                const dayNumber = (daysOfWeek.indexOf(row.day) + 1) as DayNumber;
                const pairNumber = (pairs.indexOf(row.pair) + 1) as PairNumber;
                const cellData = schedule.data?.[currentWeek as WeekNumber]?.[dayNumber]?.[pairNumber]?.[group.name];
                
                return (
                  <td key={group.id} style={{ textAlign: 'center', verticalAlign: 'middle' }}>
                    {cellData ? (
                      <div>
                        <div><strong>{cellData.subject}</strong></div>
                        <div>{cellData.teachers}</div>
                        <div>{cellData.lesson_type}</div>
                        <div>{cellData.classroom}</div>
                      </div>
                    ) : (
                      <button onClick={
                        () => {
                          setIsModalOpen(true);
                          setCurrentDay(dayNumber);
                          setCurrentPair(pairNumber);
                          setSelectedGroup(group.name);
                        }
                      }>+</button>
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    }
    {isModalOpen && (
      <div className="modal">
        <div className="form-group">
          <label htmlFor="week">Неделя:</label>
          <input
              id="week"
              type="text"
              value={currentWeek}
              style={{
                padding: '8px',
                width: '300px',
                marginRight: '8px',
                border: '1px solid #ccc'
              }}
              className="form-control"
              disabled
          />
        </div>
        <div className="form-group">
          <label htmlFor="day">День:</label>
          <input
              id="day"
              type="text"
              value={daysOfWeek[currentDay-1]}
              style={{
                padding: '8px',
                width: '300px',
                marginRight: '8px',
                border: '1px solid #ccc'
              }}
              className="form-control"
              disabled
          />
        </div>
        <div className="form-group">
          <label htmlFor="pair">Пара:</label>
          <input
              id="pair"
              type="text"
              value={pairs[currentPair-1]}
              style={{
                padding: '8px',
                width: '300px',
                marginRight: '8px',
                border: '1px solid #ccc'
              }}
              className="form-control"
              disabled
          />
        </div>
        <div className="form-group">
          <label htmlFor="classroom">Аудитория:</label>
          <select
              id="classroom"
              value={selectedClassroom}
              className="styled-select"
              onChange={(e) => setSelectedClassroom(parseInt(e.target.value))}
          >
            <option value="0">Выберите аудиторию</option>
            {allClassrooms.map(classroom => (
              <option key={classroom.id} value={classroom.id}>
                {classroom.number}
              </option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="classroom">Занятие:</label>
          <select
              id="classroom"
              value={selectedCurriculum}
              className="styled-select"
              onChange={(e) => setSelectedCurriculum(parseInt(e.target.value))}
          >
            <option value="0">Выберите занятие</option>
            {CurriculumData.filter(u => u.groups.includes(selectedGroup)).map(curriculum => (
              <option key={curriculum.id} value={curriculum.id}>
                {curriculum.subject} {curriculum.primary_teacher} {curriculum.secondary_teacher}
              </option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="classroom">Тип занятия:</label>
          <select
              id="classroom"
              value={selectedType}
              className="styled-select"
              onChange={(e) => setSelectedType(e.target.value as LessonType)}
          >
            <option key="лекционное" value="лекционное">Лекционное</option>
            <option key="лабораторное" value="лабораторное">Лабораторное</option>
          </select>
        </div>

        <button
            onClick={handleAddSchedule}
            disabled={selectedClassroom == 0 || selectedCurriculum == 0}
        >
          Добавить
        </button>
        <button onClick={() => setIsModalOpen(false)}>
          Отмена
        </button>
      </div>
    )}
    </>
  );
};