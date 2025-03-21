import React, { useState, useEffect } from 'react';

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

export const UniversityTable = () => {
  const [data, setData] = useState([
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
              ]
            }
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
              ]
            }
          ]
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
              lecturers: []
            }
          ]
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
              lecturers: []
            }
          ]
        }
      ]
    }
  ]);
  // Упрощает добавление университетов/факультетов/кафдер/групп
  const [isAddUniversityModalOpen, setIsAddUniversityModalOpen] = useState(false);
  const [newUniversityName, setNewUniversityName] = useState("");

  const [isAddFacultyModalOpen, setIsAddFacultyModalOpen] = useState(false);
  const [selectedUniversityIdToFaculty, setSelectedUniversityIdToFaculty] = useState<number|null>(null);
  const [newFacultyName, setNewFacultyName] = useState("");

  const [isAddDepartmentModalOpen, setIsAddDepartmentModalOpen] = useState(false);
  const [selectedUniversityIdToDepartment, setSelectedUniversityIdToDepartment] = useState<number|null>(null);
  const [selectedFacultyIdToDepartment, setSelectedFacultyIdToDepartment] = useState<number|null>(null);
  const [newDepartmentName, setNewDepartmentName] = useState('');

  const [isAddGroupModalOpen, setIsAddGroupModalOpen] = useState(false);
  const [selectedUniversityIdToGroup, setSelectedUniversityIdToGroup] = useState<number|null>(null);
  const [selectedFacultyIdToGroup, setSelectedFacultyIdToGroup] = useState<number|null>(null);
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<number|null>(null);
  const [newGroupName, setNewGroupName] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('');
  const [studentsCount, setStudentsCount] = useState(15);

  // Добавление преподавателей
  const [isAddLecturerModalOpen, setIsAddLecturerModalOpen] = useState(false);
  const [selectedUniversityIdToLecturer, setSelectedUniversityIdToLecturer] = useState<number|null>(null);
  const [selectedFacultyIdToLecturer, setSelectedFacultyIdToLecturer] = useState<number|null>(null);
  const [selectedDepartmentIdToLecturer, setSelectedDepartmentIdToLecturer] = useState<number|null>(null);
  const [newLecturerName, setNewLecturerName] = useState("");

  // Сброс факультета при выборе нового университета
  useEffect(() => {
    setSelectedFacultyIdToDepartment(null);
  }, [selectedUniversityIdToDepartment]);

  useEffect(() => {
    setSelectedFacultyIdToGroup(null);
    setSelectedDepartmentId(null);
  }, [selectedUniversityIdToGroup]);

  useEffect(() => {
    setSelectedDepartmentId(null);
  }, [selectedFacultyIdToGroup]);

  useEffect(() => {
    setSelectedFacultyIdToLecturer(null);
    setSelectedDepartmentIdToLecturer(null);
  }, [selectedUniversityIdToLecturer]);

  useEffect(() => {
    setSelectedDepartmentIdToLecturer(null);
  }, [selectedFacultyIdToLecturer]);

  const addUniversity = () => {
    const currentId = 
      data.length > 0 
        ? Math.max(...data.map(f => f.id)) + 1
        : 1;
    setData(prevData => [
      ...prevData,
      {
        id: currentId,
        name: newUniversityName,
        faculties: []
      }
    ]);
    setIsAddUniversityModalOpen(false);
    setNewUniversityName("");
  };
  
  const addFaculty = () => {
    // Находим выбранный университет
    const selectedUniversity = data.find(
      (university) => university.id === selectedUniversityIdToFaculty
    );
    if (!selectedUniversity) return;
    // Находим максимальный ID факультета в университете. Если их нет, то 0
    const maxFacultyId = 
      selectedUniversity.faculties.length > 0 
        ? Math.max(...selectedUniversity.faculties.map(f => f.id)) 
        : 0;
    const newId = maxFacultyId + 1;
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
                departments: []
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
  
  const addDepartment = () => {
    if (!selectedUniversityIdToDepartment || !selectedFacultyIdToDepartment || !newDepartmentName) return;

    // Находим выбранный факультет
    const selectedUniversity = data.find(u => u.id === selectedUniversityIdToDepartment);
    if (!selectedUniversity) return;
    const selectedFaculty = selectedUniversity.faculties.find(f => f.id === selectedFacultyIdToDepartment);
    if (!selectedFaculty) return;

    // Генерируем новый ID кафедры
    const newId = selectedFaculty.departments.length > 0
      ? Math.max(...selectedFaculty.departments.map(d => d.id)) + 1
      : 1;

    // Добавляем кафедру
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
                    groups: [],
                    lecturers: []
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
  };
  
  const addGroup = () => {
    if (
      !selectedUniversityIdToGroup ||
      !selectedFacultyIdToGroup ||
      !selectedDepartmentId ||
      !newGroupName ||
      !selectedCourse
    ) return;

    // Находим выбранную кафедру
    const selectedUniversity = data.find(u => u.id === selectedUniversityIdToGroup);
    if (!selectedUniversity) return;
    const selectedFaculty = selectedUniversity.faculties.find(f => f.id === selectedFacultyIdToGroup);
    if (!selectedFaculty) return;
    const selectedDepartment = selectedFaculty.departments.find(d => d.id === selectedDepartmentId);
    if (!selectedDepartment) return;

    // Генерируем новый ID группы
    const newId = selectedDepartment.groups.length > 0
      ? Math.max(...selectedDepartment.groups.map(g => g.id)) + 1
      : 1;

    // Добавляем группу
    setData(prevData => prevData.map(university => {
      if (university.id === selectedUniversityIdToGroup) {
        return {
          ...university,
          faculties: university.faculties.map(faculty => {
            if (faculty.id === selectedFacultyIdToGroup) {
              return {
                ...faculty,
                departments: faculty.departments.map(department => {
                  if (department.id === selectedDepartmentId) {
                    return {
                      ...department,
                      groups: [
                        ...department.groups,
                        {
                          id: newId,
                          name: newGroupName,
                          course: selectedCourse,
                          studentsCount: studentsCount
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
    setIsAddGroupModalOpen(false);
    setSelectedUniversityIdToGroup(null);
    setSelectedFacultyIdToGroup(null);
    setSelectedDepartmentId(null);
    setNewGroupName('');
    setSelectedCourse('');
    setStudentsCount(15);
  };

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
      <h2>Структурные подразделения</h2>
      <table border={1} cellPadding="5" cellSpacing="0">
      <thead>
        <tr>
          <th>Факультет</th>
          <th>Кафедра</th>
          <th>Курс</th>
          <th>Группа</th>
          <th>Число студентов</th>
        </tr>
      </thead>
      <tbody>
        {data.map((university) => (
          <React.Fragment key={university.id}>
            <tr>
              <th colSpan={6}>{university.name}</th>
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
                  </tr>
                )}

                {faculty.departments.map((department) => (
                  <React.Fragment key={department.id}>
                    {/* Строка кафедры, если нет групп */}
                    {department.groups.length === 0 && (
                      <tr>
                        <td>{faculty.name}</td>
                        <td>{department.name}</td>
                        <td></td>
                        <td></td>
                        <td></td>
                      </tr>
                    )}

                    {department.groups.map((group) => (
                      <tr key={group.id}>
                        <td>{faculty.name}</td>
                        <td>{department.name}</td>
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
            onChange={(e) => setNewUniversityName(e.target.value.trim())}
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
              onChange={(e) => setNewFacultyName(e.target.value.trim())}
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
              onChange={(e) => setNewDepartmentName(e.target.value.trim())}
            />
          </div>

          <div className="button-container">
            <button
              onClick={addDepartment}
              disabled={
                !selectedUniversityIdToDepartment ||
                !selectedFacultyIdToDepartment ||
                !newDepartmentName
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
              value={selectedDepartmentId || ''}
              onChange={(e) => setSelectedDepartmentId(parseInt(e.target.value))}
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

          {/* Кнопки */}
          <div className="button-container">
            <button
              onClick={addGroup}
              disabled={
                !selectedUniversityIdToGroup ||
                !selectedFacultyIdToGroup ||
                !selectedDepartmentId ||
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

      <h2>Профессорско-преподавательский составя</h2>
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
  );
};
