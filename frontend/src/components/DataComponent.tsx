import { useState } from 'react';
import { UniversityTable } from './UniversityTable.tsx';
import { LecturersTable } from './LecturersTable.tsx';
import { ClassroomsTable } from './ClassroomsTable.tsx';
import { UniversityType } from '../types';

/// В компоненте описаны все элементы на вкладке "Данные"
export const DataComponent = () => {
  const [data, setData] = useState<UniversityType[]>([
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
              groups: [ // Теперь группы хранятся напрямую в кафедре
                {
                  id: 1,
                  name: "ПИ-101",
                  course: "Бакалавриат, 1", // Новое свойство
                  studentsCount: 30
                },
                {
                  id: 2,
                  name: "ПИ-102",
                  course: "Бакалавриат, 1",
                  studentsCount: 25
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

  return (
    <>
      <UniversityTable
        data={data}
        setData={setData}
      />
      <LecturersTable
        data={data}
        setData={setData}
      />
      <ClassroomsTable
        data={data}
        setData={setData}
      />
    </>
  );
};