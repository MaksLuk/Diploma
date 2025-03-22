import { useState, useMemo } from 'react';
import { UniversityTable } from './UniversityTable.tsx';
import { LecturersTable } from './LecturersTable.tsx';
import { ClassroomsTable } from './ClassroomsTable.tsx';
import { SubjectsTable } from './SubjectsTable.tsx';
import { FlowsTable } from './flowsTable.tsx';
import { Syllabus } from './Syllabus.tsx';
import { UniversityType, SubjectType, FlowType } from '../types';

/// В компоненте описаны все элементы на вкладке "Данные"
export const DataComponent = () => {
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
    { id: 1, name: "Биология" },
    { id: 2, name: "Химия" },
    { id: 3, name: "Физика" },
  ]);
  const [flows, setFlows] = useState<FlowType[]>([
    { id: 1, groups: ["ПИ-101", "ПИ-102"] },
    { id: 2, groups: ["ПИ-101", "АЛГ-201", "АЛГ-202"] },
  ]);

  // Получение все названия групп из университетских данных
  const groupNames = useMemo(() => {
    const getAllGroups = (data: UniversityType[]): string[] => {
      return data.flatMap(university => 
        university.faculties.flatMap(faculty => 
          faculty.departments.flatMap(department => 
            department.specialities.flatMap(speciality => 
              speciality.groups.map(group => group.name)
            )
          )
        )
      );
    };
    return Array.from(new Set(getAllGroups(universityData)));
  }, [universityData]);

  return (
    <>
      <UniversityTable
        data={universityData}
        setData={setUniversityData}
      />
      <LecturersTable
        data={universityData}
        setData={setUniversityData}
      />
      <ClassroomsTable
        data={universityData}
        setData={setUniversityData}
      />
      <SubjectsTable
        data={subjects}
        setData={setSubjects}
      />
      <FlowsTable
        allGroups={groupNames}
        data={flows}
        setData={setFlows}
      />
      <Syllabus />
    </>
  );
};