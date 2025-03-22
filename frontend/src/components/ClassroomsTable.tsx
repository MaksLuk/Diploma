import React, { useState, useEffect } from 'react';
import { UniversityTableProps } from '../types';

export const ClassroomsTable = ({ data, setData }: UniversityTableProps) => {
  const [IsAddClassroomModalOpen, setIsAddClassroomModalOpen] = useState(false);
  const [selectedUniversityIdToClassroom, setSelectedUniversityIdToClassroom] = useState<number|null>(null);
  const [selectedFacultyIdToClassroom, setSelectedFacultyIdToClassroom] = useState<number|null>(null);
  const [selectedDepartmentIdToClassroom, setSelectedDepartmentIdToClassroom] = useState<number|null>(null);
  const [newClassroomNumber, setNewClassroomNumber] = useState("");

  useEffect(() => {
    setSelectedFacultyIdToClassroom(null);
    setSelectedDepartmentIdToClassroom(null);
  }, [selectedUniversityIdToClassroom]);

  useEffect(() => {
    setSelectedDepartmentIdToClassroom(null);
  }, [selectedFacultyIdToClassroom]);

  const addClassroom = () => {
    if (
      !selectedUniversityIdToClassroom ||
      !selectedFacultyIdToClassroom ||
      !newClassroomNumber
    ) return;

    const selectedUniversity = data.find(u => u.id === selectedUniversityIdToClassroom);
    const selectedFaculty = selectedUniversity?.faculties.find(f => f.id === selectedFacultyIdToClassroom);

    if (selectedDepartmentIdToClassroom === null) {
      // Если кафедра не выбрана - аудитория принадлежит всему факультету
      if (!selectedFaculty) return;
      const newId = selectedFaculty.classrooms.length > 0
        ? Math.max(...selectedFaculty.classrooms.map(g => g.id)) + 1
        : 1;
      setData(prevData => prevData.map(university => {
        if (university.id === selectedUniversityIdToClassroom) {
          return {
            ...university,
            faculties: university.faculties.map(faculty => {
              if (faculty.id === selectedFacultyIdToClassroom) {
                return {
                  ...faculty,
                  classrooms: [
                    ...faculty.classrooms,
                    { id: newId, number: newClassroomNumber }
                  ]
                };
              }
              return faculty;
            })
          };
        }
        return university;
      }));
    } else {
      // Если кафедра выбрана - добавляем аудиторию к кафедре
      const selectedDepartment = selectedFaculty?.departments.find(d => d.id === selectedDepartmentIdToClassroom);
      if (!selectedDepartment) return;
      const newId = selectedDepartment.classrooms.length > 0
        ? Math.max(...selectedDepartment.classrooms.map(g => g.id)) + 1
        : 1;
        setData(prevData => prevData.map(university => {
          if (university.id === selectedUniversityIdToClassroom) {
            return {
              ...university,
              faculties: university.faculties.map(faculty => {
                if (faculty.id === selectedFacultyIdToClassroom) {
                  return {
                    ...faculty,
                    departments: faculty.departments.map(department => {
                      if (department.id === selectedDepartmentIdToClassroom) {
                        return {
                          ...department,
                          classrooms: [
                            ...department.classrooms,
                            { id: newId, number: newClassroomNumber }
                          ]
                        };
                      }
                      return department;
                    })
                  };
                }
                return faculty;
              })
            };
          }
          return university;
        }));
    }

    setIsAddClassroomModalOpen(false);
    setSelectedUniversityIdToClassroom(null);
    setSelectedFacultyIdToClassroom(null);
    setSelectedDepartmentIdToClassroom(null);
    setNewClassroomNumber("");
  };

  return (
    <>
      <h2>Аудитории</h2>
      <table border={1} cellPadding="5" cellSpacing="0">
        <thead>
          <tr>
            <th>Номер</th>
            <th>Факультет</th>
            <th>Кафедра</th>
          </tr>
        </thead>
        <tbody>
          {data.map((university) => (
            <React.Fragment key={university.id}>
              <tr>
                <th colSpan={3}>{university.name}</th>
              </tr>
              {university.faculties.map((faculty) => (
                <React.Fragment key={faculty.id}>
                  {faculty.classrooms.map((classroom) => (
                    <tr key={`{faculty.id}-{classroom.id}`}>
                      <td>{classroom.number}</td>
                      <td>{faculty.name}</td>
                      <td></td>
                    </tr>
                  ))}
                  {faculty.departments.map((department) => (
                    <React.Fragment key={department.id}>
                      {department.classrooms.map((classroom) => (
                        <tr key={`{faculty.id}-{department.id}-{classroom.id}`}>
                          <td>{classroom.number}</td>
                          <td>{faculty.name}</td>
                          <td>{department.name}</td>
                        </tr>
                      ))}
                    </React.Fragment>
                  ))}
                </React.Fragment>
              ))}
            </React.Fragment>
          ))}
        </tbody>
      </table>

      <button onClick={() => setIsAddClassroomModalOpen(true)}>
        Добавить аудиторию
      </button>

      {IsAddClassroomModalOpen && (
        <div className="modal">
          <h3>Добавить аудиторию</h3>

          <div className="form-group">
            <label>Университет:</label>
            <select
              className="styled-select"
              value={selectedUniversityIdToClassroom || ''}
              onChange={(e) => setSelectedUniversityIdToClassroom(Number(e.target.value))}
            >
              <option value="">Выберите университет</option>
              {data.map(university => (
                <option key={university.id} value={university.id}>
                  {university.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Факультет:</label>
            <select
              className="styled-select"
              disabled={!selectedUniversityIdToClassroom}
              value={selectedFacultyIdToClassroom || ''}
              onChange={(e) => setSelectedFacultyIdToClassroom(Number(e.target.value))}
            >
              <option value="">Выберите факультет</option>
              {selectedUniversityIdToClassroom && (
                data.find(u => u.id === selectedUniversityIdToClassroom)?.faculties.map(faculty => (
                  <option key={faculty.id} value={faculty.id}>
                    {faculty.name}
                  </option>
                )) || []
              )}
            </select>
          </div>

          <div className="form-group">
            <label>Кафедра (не обязательное):</label>
            <select
              className="styled-select"
              disabled={!selectedFacultyIdToClassroom}
              value={selectedDepartmentIdToClassroom || ''}
              onChange={(e) => setSelectedDepartmentIdToClassroom(Number(e.target.value))}
            >
              <option value="">Выберите кафедру</option>
              {selectedFacultyIdToClassroom && (
                data.find(u => u.id === selectedUniversityIdToClassroom)
                  ?.faculties.find(f => f.id === selectedFacultyIdToClassroom)
                  ?.departments.map(department => (
                    <option key={department.id} value={department.id}>
                      {department.name}
                    </option>
                  )) || []
              )}
            </select>
          </div>

          <div className="form-group">
            <label>Номер:</label>
            <input
              type="text"
              className="input-field"
              value={newClassroomNumber}
              onChange={(e) => setNewClassroomNumber(e.target.value.trim())}
            />
          </div>

          <div className="button-container">
            <button
              onClick={addClassroom}
              disabled={
                !selectedUniversityIdToClassroom ||
                !selectedFacultyIdToClassroom ||
                !newClassroomNumber
              }
            >
              Добавить
            </button>
            <button
              onClick={() => setIsAddClassroomModalOpen(false)}
            >
              Отмена
            </button>
          </div>
        </div>
      )}
    </>
  )
}