import React, { useState, useEffect } from 'react';
import { UniversityTableProps } from '../types';
import { createStructuralDivision, createSpeciality, createGroup } from '../api';

const COURSES = [
  { value: 'Бакалавриат, 1', label: 'Бакалавриат, 1' },
  { value: 'Бакалавриат, 2', label: 'Бакалавриат, 2' },
  { value: 'Бакалавриат, 3', label: 'Бакалавриат, 3' },
  { value: 'Бакалавриат, 4', label: 'Бакалавриат, 4' },
  { value: 'Магистратура, 1', label: 'Магистратура, 1' },
  { value: 'Магистратура, 2', label: 'Магистратура, 2' },
  { value: 'Специалитет, 1', label: 'Специалитет, 1' },
  { value: 'Специалитет, 2', label: 'Специалитет, 2' },
  { value: 'Специалитет, 3', label: 'Специалитет, 3' },
  { value: 'Специалитет, 4', label: 'Специалитет, 4' },
  { value: 'Специалитет, 5', label: 'Специалитет, 5' }
];

export const UniversityTable = ({ data, setData }: UniversityTableProps) => {
  // Упрощает добавление университетов/факультетов/кафдер/групп
  // Добавление университета
  const [isAddUniversityModalOpen, setIsAddUniversityModalOpen] = useState(false);
  const [newUniversityName, setNewUniversityName] = useState("");
  // Добавление факультета
  const [isAddFacultyModalOpen, setIsAddFacultyModalOpen] = useState(false);
  const [selectedUniversityIdToFaculty, setSelectedUniversityIdToFaculty] = useState<number|null>(null);
  const [newFacultyName, setNewFacultyName] = useState("");
  // Добавление кафедры
  const [isAddDepartmentModalOpen, setIsAddDepartmentModalOpen] = useState(false);
  const [selectedUniversityIdToDepartment, setSelectedUniversityIdToDepartment] = useState<number|null>(null);
  const [selectedFacultyIdToDepartment, setSelectedFacultyIdToDepartment] = useState<number|null>(null);
  const [newDepartmentName, setNewDepartmentName] = useState('');
  const [newDepartmentShortName, setNewDepartmentShortName] = useState('');
  // Добавление специальности
  const [isAddSpecialityModalOpen, setIsAddSpecialityModalOpen] = useState(false);
  const [selectedUniversityIdToSpeciality, setSelectedUniversityIdToSpeciality] = useState<number|null>(null);
  const [selectedFacultyIdToSpeciality, setSelectedFacultyIdToSpeciality] = useState<number|null>(null);
  const [selectedDepartmentIdToSpeciality, setSelectedDepartmentIdToSpeciality] = useState<number|null>(null);
  const [newSpecialityName, setNewSpecialityName] = useState('');
  // Добавление группы
  const [isAddGroupModalOpen, setIsAddGroupModalOpen] = useState(false);
  const [selectedUniversityIdToGroup, setSelectedUniversityIdToGroup] = useState<number|null>(null);
  const [selectedFacultyIdToGroup, setSelectedFacultyIdToGroup] = useState<number|null>(null);
  const [selectedDepartmentIdToGroup, setSelectedDepartmentIdToGroup] = useState<number|null>(null);
  const [selectedSpecialityIdToGroup, setSelectedSpecialityIdToGroup] = useState<number|null>(null);
  const [newGroupName, setNewGroupName] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('');
  const [studentsCount, setStudentsCount] = useState(15);

  // Сброс факультета при выборе нового университета
  useEffect(() => {
    setSelectedFacultyIdToDepartment(null);
  }, [selectedUniversityIdToDepartment]);

  useEffect(() => {
    setSelectedFacultyIdToSpeciality(null);
    setSelectedDepartmentIdToSpeciality(null);
  }, [selectedUniversityIdToSpeciality]);

  useEffect(() => {
    setSelectedDepartmentIdToSpeciality(null);
  }, [selectedFacultyIdToSpeciality]);

  useEffect(() => {
    setSelectedFacultyIdToGroup(null);
    setSelectedDepartmentIdToGroup(null);
    setSelectedSpecialityIdToGroup(null);
  }, [selectedUniversityIdToGroup]);

  useEffect(() => {
    setSelectedDepartmentIdToGroup(null);
    setSelectedSpecialityIdToGroup(null);
  }, [selectedFacultyIdToGroup]);

  useEffect(() => {
    setSelectedSpecialityIdToGroup(null);
  }, [selectedDepartmentIdToGroup]);

  const addUniversity = async () => {
    const newId = await createStructuralDivision(newUniversityName);
    setData(prevData => [
      ...prevData,
      {
        id: newId,
        name: newUniversityName,
        faculties: []
      }
    ]);
    setIsAddUniversityModalOpen(false);
    setNewUniversityName("");
  };
  
  const addFaculty = async () => {
    // Находим выбранный университет
    const selectedUniversity = data.find(
      (university) => university.id === selectedUniversityIdToFaculty
    );
    if (!selectedUniversity) return;
    // Находим максимальный ID факультета в университете. Если их нет, то 0
    const newId = await createStructuralDivision(newFacultyName, selectedUniversity.id);
    // Добавляем факультет
    setData(prevData =>
      prevData.map(university => {
        if (university.id === selectedUniversityIdToFaculty) {
          return {
            ...university,
            faculties: [
              ...university.faculties,
              {
                id: newId,
                name: newFacultyName,
                departments: [],
                classrooms: []
              }
            ]
          };
        }
        return university;
      })
    );
    setIsAddFacultyModalOpen(false);
    setSelectedUniversityIdToFaculty(null);
    setNewFacultyName("");
  };
  
  const addDepartment = async () => {
    if (!selectedUniversityIdToDepartment || !selectedFacultyIdToDepartment || !newDepartmentName || !newDepartmentShortName) return;

    // Находим выбранный факультет
    const selectedUniversity = data.find(u => u.id === selectedUniversityIdToDepartment);
    if (!selectedUniversity) return;
    const selectedFaculty = selectedUniversity.faculties.find(f => f.id === selectedFacultyIdToDepartment);
    if (!selectedFaculty) return;

    // Добавляем кафедру
    const newId = await createStructuralDivision(newDepartmentName, selectedFaculty.id, newDepartmentShortName);
    setData(prevData => prevData.map(university => {
      if (university.id === selectedUniversityIdToDepartment) {
        return {
          ...university,
          faculties: university.faculties.map(faculty => {
            if (faculty.id === selectedFacultyIdToDepartment) {
              return {
                ...faculty,
                departments: [
                  ...faculty.departments,
                  {
                    id: newId,
                    name: newDepartmentName,
                    shortName: newDepartmentShortName,
                    specialities: [],
                    lecturers: [],
                    classrooms: []
                  }
                ]
              };
            }
            return faculty;
          })
        };
      }
      return university;
    }));

    // Сбрасываем состояние
    setIsAddDepartmentModalOpen(false);
    setSelectedUniversityIdToDepartment(null);
    setSelectedUniversityIdToDepartment(null);
    setNewDepartmentName('');
    setNewDepartmentShortName('');
  };

  const addSpeciality = async () => {
    if (
      !selectedUniversityIdToSpeciality ||
      !selectedFacultyIdToSpeciality ||
      !selectedDepartmentIdToSpeciality ||
      !newSpecialityName
    ) return;

    // Находим выбранную кафедру
    const selectedUniversity = data.find(u => u.id === selectedUniversityIdToSpeciality);
    if (!selectedUniversity) return;
    const selectedFaculty = selectedUniversity.faculties.find(f => f.id === selectedFacultyIdToSpeciality);
    if (!selectedFaculty) return;
    const selectedDepartment = selectedFaculty.departments.find(d => d.id === selectedDepartmentIdToSpeciality);
    if (!selectedDepartment) return;

    // Добавляем специальность
    const newId = await createSpeciality(selectedDepartment.id, newSpecialityName);
    setData(prevData => prevData.map(university => {
      if (university.id === selectedUniversityIdToSpeciality) {
        return {
          ...university,
          faculties: university.faculties.map(faculty => {
            if (faculty.id === selectedFacultyIdToSpeciality) {
              return {
                ...faculty,
                departments: faculty.departments.map(department => {
                  if (department.id === selectedDepartmentIdToSpeciality) {
                    return {
                      ...department,
                      specialities: [
                        ...department.specialities,
                        {
                          id: newId,
                          name: newSpecialityName,
                          groups: []
                        }
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

    // Сбрасываем состояние
    setIsAddSpecialityModalOpen(false);
    setSelectedUniversityIdToSpeciality(null);
    setSelectedFacultyIdToSpeciality(null);
    setSelectedDepartmentIdToSpeciality(null);
    setNewSpecialityName('');
  };
  
  const addGroup = async () => {
    if (
      !selectedUniversityIdToGroup ||
      !selectedFacultyIdToGroup ||
      !selectedDepartmentIdToGroup ||
      !selectedSpecialityIdToGroup ||
      !newGroupName ||
      !selectedCourse
    ) return;

    // Находим выбранную специальность
    const selectedUniversity = data.find(u => u.id === selectedUniversityIdToGroup);
    if (!selectedUniversity) return;
    const selectedFaculty = selectedUniversity.faculties.find(f => f.id === selectedFacultyIdToGroup);
    if (!selectedFaculty) return;
    const selectedDepartment = selectedFaculty.departments.find(d => d.id === selectedDepartmentIdToGroup);
    if (!selectedDepartment) return;
    const selectedSpeciality = selectedDepartment.specialities.find(s => s.id === selectedSpecialityIdToGroup);
    if (!selectedSpeciality) return;

    // Добавляем группу
    const newId = await createGroup(selectedSpeciality.id, newGroupName, selectedCourse, studentsCount)
    setData(prevData => prevData.map(university => {
      if (university.id === selectedUniversityIdToGroup) {
        return {
          ...university,
          faculties: university.faculties.map(faculty => {
            if (faculty.id === selectedFacultyIdToGroup) {
              return {
                ...faculty,
                departments: faculty.departments.map(department => {
                  if (department.id === selectedDepartmentIdToGroup) {
                    return {
                      ...department,
                      specialities: department.specialities.map(speciality => {
                        if (speciality.id === selectedSpecialityIdToGroup) {
                          return {
                            ...speciality,
                            groups: [
                              ...speciality.groups,
                              {
                                id: newId,
                                name: newGroupName,
                                course: selectedCourse,
                                studentsCount: studentsCount
                              }
                            ]
                          };
                        }
                        return speciality;
                      })
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

    // Сбрасываем состояние
    setIsAddGroupModalOpen(false);
    setSelectedUniversityIdToGroup(null);
    setSelectedFacultyIdToGroup(null);
    setSelectedDepartmentIdToGroup(null);
    setSelectedSpecialityIdToGroup(null);
    setNewGroupName('');
    setSelectedCourse('');
    setStudentsCount(15);
  };

  return (
    <>
      <h2>Структурные подразделения</h2>
      <table border={1} cellPadding="5" cellSpacing="0">
      <thead>
        <tr>
          <th>Факультет</th>
          <th>Кафедра</th>
          <th>Специальность</th>
          <th>Курс</th>
          <th>Группа</th>
          <th>Число студентов</th>
        </tr>
      </thead>
      <tbody>
        {data.map((university) => (
          <React.Fragment key={university.id}>
            <tr>
              <th colSpan={7}>{university.name}</th>
            </tr>

            {university.faculties.map((faculty) => (
              <React.Fragment key={faculty.id}>
                {/* Строка факультета, если нет кафедр */}
                {faculty.departments.length === 0 && (
                  <tr>
                    <td>{faculty.name}</td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                  </tr>
                )}

                {faculty.departments.map((department) => (
                  <React.Fragment key={department.id}>
                    {/* Строка кафедры, если нет специальностей */}
                    {department.specialities.length === 0 && (
                      <tr>
                        <td>{faculty.name}</td>
                        <td>{department.name}</td>
                        <td></td>
                        <td></td>
                        <td></td>
                        <td></td>
                      </tr>
                    )}

                    {department.specialities.map((speciality) => (
                      <React.Fragment key={speciality.id}>
                        {speciality.groups.length === 0 && (
                          <tr>
                            <td>{faculty.name}</td>
                            <td>{department.name}</td>
                            <td>{speciality.name}</td>
                            <td></td>
                            <td></td>
                            <td></td>
                          </tr>
                        )}

                        {speciality.groups.map((group) => (
                          <tr key={group.id}>
                            <td>{faculty.name}</td>
                            <td>{department.name}</td>
                            <td>{speciality.name}</td>
                            <td>{group.course}</td>
                            <td>{group.name}</td>
                            <td>{group.studentsCount}</td>
                          </tr>
                        ))}
                      </React.Fragment>
                    ))}
                  </React.Fragment>
                ))}
              </React.Fragment>
            ))}
          </React.Fragment>
        ))}
      </tbody>
      </table>

      <div>
        <button onClick={() => setIsAddUniversityModalOpen(true)}>
          Добавить университет
        </button>
    
        <button onClick={() => setIsAddFacultyModalOpen(true)}>
          Добавить факультет
        </button>
    
        <button onClick={() => setIsAddDepartmentModalOpen(true)}>
          Добавить кафедру
        </button>

        <button onClick={() => setIsAddSpecialityModalOpen(true)}>
          Добавить специальность
        </button>
    
        <button onClick={() => setIsAddGroupModalOpen(true)}>
          Добавить группу
        </button>
      </div>

      {isAddUniversityModalOpen && (
        <div className="modal">
          <input
            type="text"
            placeholder="Название университета"
            value={newUniversityName}
            onChange={(e) => setNewUniversityName(e.target.value)}
            className="input-field"
          />
          <button
            onClick={addUniversity}
            disabled={!newUniversityName}
          >
            Добавить
          </button>
          <button onClick={() => setIsAddUniversityModalOpen(false)}>
            Отмена
          </button>
        </div>
      )}

      {isAddFacultyModalOpen && (
        <div className="modal">
          <h3>Добавить факультет</h3>

          <div style={{ marginBottom: "15px" }}>
            <select
              className="styled-select"
              value={selectedUniversityIdToFaculty || ""}
              onChange={(e) => setSelectedUniversityIdToFaculty(parseInt(e.target.value))}
            >
              <option value="">Выберите университет</option>
              {data.map(university => (
                <option key={university.id} value={university.id}>
                  {university.name}
                </option>
              ))}
            </select>

            <input
              type="text"
              placeholder="Название факультета"
              value={newFacultyName}
              onChange={(e) => setNewFacultyName(e.target.value)}
              className="input-field"
            />
          </div>

          <div className="button-container">
            <button
              onClick={addFaculty}
              disabled={!selectedUniversityIdToFaculty || !newFacultyName}
            >
              Добавить
            </button>
            <button
              onClick={() => setIsAddFacultyModalOpen(false)}
            >
              Отмена
            </button>
          </div>
        </div>
      )}

      {isAddDepartmentModalOpen && (
        <div className="modal">
          <h3>Добавить кафедру</h3>

          <div className="form-group">
            <label>Университет:</label>
            <select
              className="styled-select"
              value={selectedUniversityIdToDepartment || ''}
              onChange={(e) => setSelectedUniversityIdToDepartment(parseInt(e.target.value))}
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
              disabled={!selectedUniversityIdToDepartment}
              value={selectedFacultyIdToDepartment || ''}
              onChange={(e) => setSelectedFacultyIdToDepartment(parseInt(e.target.value))}
            >
              <option value="">Выберите факультет</option>
              {selectedUniversityIdToDepartment && (
                data.find(u => u.id === selectedUniversityIdToDepartment)?.faculties.map(faculty => (
                  <option key={faculty.id} value={faculty.id}>
                    {faculty.name}
                  </option>
                )) || []
              )}
            </select>
          </div>

          <div className="form-group">
            <label>Название кафедры:</label>
            <input
              type="text"
              className="input-field"
              value={newDepartmentName}
              onChange={(e) => setNewDepartmentName(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Сокращённое название:</label>
            <input
              type="text"
              className="input-field"
              value={newDepartmentShortName}
              onChange={(e) => setNewDepartmentShortName(e.target.value)}
            />
          </div>

          <div className="button-container">
            <button
              onClick={addDepartment}
              disabled={
                !selectedUniversityIdToDepartment ||
                !selectedFacultyIdToDepartment ||
                !newDepartmentName ||
                !newDepartmentShortName
              }
            >
              Добавить
            </button>
            <button
              onClick={() => setIsAddDepartmentModalOpen(false)}
            >
              Отмена
            </button>
          </div>
        </div>
      )}

      {isAddSpecialityModalOpen && (
        <div className="modal">
          <h3>Добавить специальность</h3>

          <div className="form-group">
            <label>Университет:</label>
            <select
              className="styled-select"
              value={selectedUniversityIdToSpeciality || ''}
              onChange={(e) => setSelectedUniversityIdToSpeciality(parseInt(e.target.value))}
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
              disabled={!selectedUniversityIdToSpeciality}
              value={selectedFacultyIdToSpeciality || ''}
              onChange={(e) => setSelectedFacultyIdToSpeciality(parseInt(e.target.value))}
            >
              <option value="">Выберите факультет</option>
              {selectedUniversityIdToSpeciality && (
                data.find(u => u.id === selectedUniversityIdToSpeciality)?.faculties.map(faculty => (
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
              disabled={!selectedFacultyIdToSpeciality}
              value={selectedDepartmentIdToSpeciality || ''}
              onChange={(e) => setSelectedDepartmentIdToSpeciality(parseInt(e.target.value))}
            >
              <option value="">Выберите кафедру</option>
              {selectedFacultyIdToSpeciality && (
                data.find(u => u.id === selectedUniversityIdToSpeciality)
                  ?.faculties.find(f => f.id === selectedFacultyIdToSpeciality)
                  ?.departments.map(department => (
                    <option key={department.id} value={department.id}>
                      {department.name}
                    </option>
                  )) || []
              )}
            </select>
          </div>

          <div className="form-group">
            <label>Название специальности:</label>
            <input
              type="text"
              className="input-field"
              value={newSpecialityName}
              onChange={(e) => setNewSpecialityName(e.target.value.trim())}
            />
          </div>

          <div className="button-container">
            <button
              onClick={addSpeciality}
              disabled={
                !selectedUniversityIdToSpeciality ||
                !selectedFacultyIdToSpeciality ||
                !selectedDepartmentIdToSpeciality ||
                !newSpecialityName
              }
            >
              Добавить
            </button>
            <button
              onClick={() => setIsAddSpecialityModalOpen(false)}
            >
              Отмена
            </button>
          </div>
        </div>
      )}

      {isAddGroupModalOpen && (
        <div className="modal">
          <h3>Добавить группу</h3>

          <div className="form-group">
            <label>Университет:</label>
            <select
              className="styled-select"
              value={selectedUniversityIdToGroup || ''}
              onChange={(e) => setSelectedUniversityIdToGroup(parseInt(e.target.value))}
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
              disabled={!selectedUniversityIdToGroup}
              value={selectedFacultyIdToGroup || ''}
              onChange={(e) => setSelectedFacultyIdToGroup(parseInt(e.target.value))}
            >
              <option value="">Выберите факультет</option>
              {selectedUniversityIdToGroup && (
                data.find(u => u.id === selectedUniversityIdToGroup)?.faculties.map(faculty => (
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
              disabled={!selectedFacultyIdToGroup}
              value={selectedDepartmentIdToGroup || ''}
              onChange={(e) => setSelectedDepartmentIdToGroup(parseInt(e.target.value))}
            >
              <option value="">Выберите кафедру</option>
              {selectedFacultyIdToGroup && (
                data.find(u => u.id === selectedUniversityIdToGroup)
                  ?.faculties.find(f => f.id === selectedFacultyIdToGroup)
                  ?.departments.map(department => (
                    <option key={department.id} value={department.id}>
                      {department.name}
                    </option>
                  )) || []
              )}
            </select>
          </div>

          <div className="form-group">
            <label>Специальность:</label>
            <select
              className="styled-select"
              disabled={!selectedDepartmentIdToGroup}
              value={selectedSpecialityIdToGroup || ''}
              onChange={(e) => setSelectedSpecialityIdToGroup(parseInt(e.target.value))}
            >
              <option value="">Выберите кафедру</option>
              {selectedDepartmentIdToGroup && (
                data.find(u => u.id === selectedUniversityIdToGroup)
                  ?.faculties.find(f => f.id === selectedFacultyIdToGroup)
                  ?.departments.find(f => f.id === selectedDepartmentIdToGroup)
                  ?.specialities.map(speciality => (
                    <option key={speciality.id} value={speciality.id}>
                      {speciality.name}
                    </option>
                  )) || []
              )}
            </select>
          </div>

          <div className="form-group">
            <label>Название группы:</label>
            <input
              type="text"
              className="input-field"
              value={newGroupName}
              onChange={(e) => setNewGroupName(e.target.value.trim())}
            />
          </div>

          <div className="form-group">
            <label>Курс:</label>
            <select
              className="styled-select"
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
            >
              <option value="">Выберите курс</option>
              {COURSES.map(course => (
                <option key={course.value} value={course.value}>
                  {course.label}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Число студентов:</label>
            <input
              type="number"
              className="input-field"
              value={studentsCount}
              min="15"
              onChange={(e) => setStudentsCount(parseInt(e.target.value))}
            />
          </div>

          <div className="button-container">
            <button
              onClick={addGroup}
              disabled={
                !selectedUniversityIdToGroup ||
                !selectedFacultyIdToGroup ||
                !selectedDepartmentIdToGroup ||
                !selectedSpecialityIdToGroup ||
                !newGroupName ||
                !selectedCourse
              }
            >
              Добавить
            </button>
            <button
              onClick={() => setIsAddGroupModalOpen(false)}
            >
              Отмена
            </button>
          </div>
        </div>
      )}
    </>
  );
};
