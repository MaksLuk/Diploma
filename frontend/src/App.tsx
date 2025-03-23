import { useState } from 'react'
import './App.css'
import { UniversityType, SubjectType, FlowType, SyllabusType } from './types';

import { ScheduleComponent } from './components/ScheduleComponent.tsx';
import { DataComponent } from './components/DataComponent.tsx';

function App() {
  const [universityData, setUniversityData] = useState<UniversityType[]>([
    {
      id: 1,
      name: "Московский университет",
      faculties: [
        {
          id: 1,
          name: "Факультет информатики",
          departments: [
            {
              id: 1,
              name: "Кафедра программирования",
              specialities: [
                {
                  id: 1,
                  name: "ПИ",
                  groups: [
                    {
                      id: 1,
                      name: "ПИ-101",
                      course: "Бакалавриат, 1",
                      studentsCount: 30
                    },
                    {
                      id: 2,
                      name: "ПИ-102",
                      course: "Бакалавриат, 1",
                      studentsCount: 25
                    }
                  ],
                }
              ],
              lecturers: [
                { id: 1, fullName: "Иванов И.И." },
                { id: 2, fullName: "Петров П.П." }
              ],
              classrooms: [
                { id: 1, number: "7-205" },
                { id: 2, number: "7-206" }
              ]
            }
          ],
          classrooms: [
            { id: 1, number: "7-101" },
            { id: 2, number: "7-102" }
          ]
        },
        {
          id: 2,
          name: "Факультет математики",
          departments: [
            {
              id: 2,
              name: "Кафедра алгебры",
              specialities: [
                {
                  id: 1,
                  name: "АЛГ",
                  groups: [
                    {
                      id: 3,
                      name: "АЛГ-201",
                      course: "Магистратура, 1",
                      studentsCount: 20
                    },
                    {
                      id: 4,
                      name: "АЛГ-202",
                      course: "Магистратура, 1",
                      studentsCount: 22
                    }
                  ]
                }
              ],
              lecturers: [
                { id: 1, fullName: "Сидоров И.И." },
                { id: 2, fullName: "Смирнов П.П." }
              ],
              classrooms: []
            }
          ],
          classrooms: []
        }
      ]
    },
    {
      id: 2,
      name: "Санкт-Петербургский университет",
      faculties: [
        {
          id: 3,
          name: "Факультет физики",
          departments: [
            {
              id: 3,
              name: "Кафедра теоретической физики",
              specialities: [
                {
                  id: 1,
                  name: "ФИЗ",
                  groups: [
                    {
                      id: 5,
                      name: "ФИЗ-101",
                      course: "Бакалавриат, 1",
                      studentsCount: 28
                    },
                    {
                      id: 6,
                      name: "ФИЗ-102",
                      course: "Бакалавриат, 1",
                      studentsCount: 32
                    }
                  ]
                }
              ],
              lecturers: [],
              classrooms: []
            }
          ],
          classrooms: []
        },
        {
          id: 4,
          name: "Факультет химии",
          departments: [
            {
              id: 4,
              name: "Кафедра органической химии",
              specialities: [
                {
                  id: 1,
                  name: "ХИМ",
                  groups: [
                    {
                      id: 7,
                      name: "ХИМ-201",
                      course: "Магистратура, 2",
                      studentsCount: 18
                    },
                    {
                      id: 8,
                      name: "ХИМ-202",
                      course: "Магистратура, 2",
                      studentsCount: 21
                    }
                  ]
                }
              ],
              lecturers: [],
              classrooms: []
            }
          ],
          classrooms: []
        }
      ]
    }
  ]);
  const [subjects, setSubjects] = useState<SubjectType[]>([
    { id: 1, name: "Биология", shortName: "Биология" },
    { id: 2, name: "Химия", shortName: "Химия" },
    { id: 3, name: "Физика", shortName: "Физика" },
    { id: 4, name: "Основны объектно-ориентировааного программирования", shortName: "Основы ООП" },
  ]);
  const [flows, setFlows] = useState<FlowType[]>([
    { id: 1, groups: ["ПИ-101", "ПИ-102"] },
    { id: 2, groups: ["ПИ-101", "АЛГ-201", "АЛГ-202"] },
  ]);
  const [syllabusData, setSyllabusData] = useState<SyllabusType[]>([
    {
      id: 1,
      subject: "Биология",
      groups: ["ПИ-101", "ПИ-102"],
      hours: 144,
      attestation: "Зачёт",
      lecturer: "Иванов И.И.",
    }
  ]);

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
        {activeTab === 'Данные' &&
          <DataComponent
            universityData={universityData}
            setUniversityData={setUniversityData}
            subjects={subjects}
            setSubjects={setSubjects}
            flows={flows}
            setFlows={setFlows}
            syllabusData={syllabusData}
            setSyllabusData={setSyllabusData}
          />
        }
        {activeTab === 'Расписание' && <ScheduleComponent />}
      </div>
    </div>
  );
}

export default App;
