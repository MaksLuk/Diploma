import React, { useState, useEffect } from 'react';
import { UniversityTableProps } from '../types';

export const LecturersTable = ({ data, setData }: UniversityTableProps) => {
  const [isAddLecturerModalOpen, setIsAddLecturerModalOpen] = useState(false);
  const [selectedUniversityIdToLecturer, setSelectedUniversityIdToLecturer] = useState<number|null>(null);
  const [selectedFacultyIdToLecturer, setSelectedFacultyIdToLecturer] = useState<number|null>(null);
  const [selectedDepartmentIdToLecturer, setSelectedDepartmentIdToLecturer] = useState<number|null>(null);
  const [newLecturerName, setNewLecturerName] = useState("");

  useEffect(() => {
    setSelectedFacultyIdToLecturer(null);
    setSelectedDepartmentIdToLecturer(null);
  }, [selectedUniversityIdToLecturer]);

  useEffect(() => {
    setSelectedDepartmentIdToLecturer(null);
  }, [selectedFacultyIdToLecturer]);

  const addLecturer = () => {
    if (
      !selectedUniversityIdToLecturer ||
      !selectedFacultyIdToLecturer ||
      !selectedDepartmentIdToLecturer ||
      !newLecturerName
    ) return;

    const selectedUniversity = data.find(u => u.id === selectedUniversityIdToLecturer);
    const selectedFaculty = selectedUniversity?.faculties.find(f => f.id === selectedFacultyIdToLecturer);
    const selectedDepartment = selectedFaculty?.departments.find(d => d.id === selectedDepartmentIdToLecturer);
    if (!selectedDepartment) return;

    const newId = selectedDepartment.lecturers.length > 0
      ? Math.max(...selectedDepartment.lecturers.map(g => g.id)) + 1
      : 1;

    setData(prevData => prevData.map(university => {
      if (university.id === selectedUniversityIdToLecturer) {
        return {
          ...university,
          faculties: university.faculties.map(faculty => {
            if (faculty.id === selectedFacultyIdToLecturer) {
              return {
                ...faculty,
                departments: faculty.departments.map(department => {
                  if (department.id === selectedDepartmentIdToLecturer) {
                    return {
                      ...department,
                      lecturers: [
                        ...department.lecturers,
                        { id: newId, fullName: newLecturerName.trim() }
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

    setIsAddLecturerModalOpen(false);
    setSelectedUniversityIdToLecturer(null);
    setSelectedFacultyIdToLecturer(null);
    setSelectedDepartmentIdToLecturer(null);
    setNewLecturerName("");
  };

  return (
    <>
      <h2>Профессорско-преподавательский состав</h2>
      <table border={1} cellPadding="5" cellSpacing="0">
        <thead>
          <tr>
            <th>Факультет</th>
            <th>Кафедра</th>
            <th>ФИО</th>
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
                  {faculty.departments.map((department) => (
                    <React.Fragment key={department.id}>
                      {department.lecturers.map((lecturer) => (
                        <tr key={lecturer.id}>
                          <td>{faculty.name}</td>
                          <td>{department.name}</td>
                          <td>{lecturer.fullName}</td>
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

      <button onClick={() => setIsAddLecturerModalOpen(true)}>
        Добавить преподавателя
      </button>

      {isAddLecturerModalOpen && (
        <div className="modal">
          <h3>Добавить преподавателя</h3>

          <div className="form-group">
            <label>Университет:</label>
            <select
              className="styled-select"
              value={selectedUniversityIdToLecturer || ''}
              onChange={(e) => setSelectedUniversityIdToLecturer(Number(e.target.value))}
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
              disabled={!selectedUniversityIdToLecturer}
              value={selectedFacultyIdToLecturer || ''}
              onChange={(e) => setSelectedFacultyIdToLecturer(Number(e.target.value))}
            >
              <option value="">Выберите факультет</option>
              {selectedUniversityIdToLecturer && (
                data.find(u => u.id === selectedUniversityIdToLecturer)?.faculties.map(faculty => (
                  <option key={faculty.id} value={faculty.id}>
                    {faculty.name}
                  </option>
                )) || []
              )}
            </select>
          </div>

          <div className="form-group">
            <label>Кафедра:</label>
            <select
              className="styled-select"
              disabled={!selectedFacultyIdToLecturer}
              value={selectedDepartmentIdToLecturer || ''}
              onChange={(e) => setSelectedDepartmentIdToLecturer(Number(e.target.value))}
            >
              <option value="">Выберите кафедру</option>
              {selectedFacultyIdToLecturer && (
                data.find(u => u.id === selectedUniversityIdToLecturer)
                  ?.faculties.find(f => f.id === selectedFacultyIdToLecturer)
                  ?.departments.map(department => (
                    <option key={department.id} value={department.id}>
                      {department.name}
                    </option>
                  )) || []
              )}
            </select>
          </div>

          <div className="form-group">
            <label>ФИО:</label>
            <input
              type="text"
              className="input-field"
              value={newLecturerName}
              onChange={(e) => setNewLecturerName(e.target.value)}
            />
          </div>

          <div className="button-container">
            <button
              onClick={addLecturer}
              disabled={
                !selectedUniversityIdToLecturer ||
                !selectedFacultyIdToLecturer ||
                !selectedDepartmentIdToLecturer ||
                !newLecturerName.trim()
              }
            >
              Добавить
            </button>
            <button
              onClick={() => setIsAddLecturerModalOpen(false)}
            >
              Отмена
            </button>
          </div>
        </div>
      )}
    </>
  )
}