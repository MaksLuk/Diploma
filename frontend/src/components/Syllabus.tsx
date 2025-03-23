// syllabus - учебный план
import React, { useState, useEffect } from 'react';
import { SyllabusType, SubjectType, FlowType } from '../types';

// Количество часов за семестр
const HOURS = [72, 108, 144];
// Вид аттестации
const ATTESTATIONS = ["Экзамен", "Дифференцированный зачёт", "Зачёт"];

interface SyllabusProps {
  data: SyllabusType[];
  setData: React.Dispatch<React.SetStateAction<SyllabusType[]>>;
  subjects: SubjectType[],
  allGroups: string[],
  flows: FlowType[],
  lecturers: string[],
}

export const Syllabus = ({ data, setData, subjects, allGroups, flows, lecturers }: SyllabusProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedHours, setSelectedHours] = useState(0);
  const [selectedAttestation, setSelectedAttestation] = useState("");
  const [selectedLecturer, setSelectedLecturer] = useState<string>("");
  const [selectedSecondLecturer, setSelectedSecondLecturer] = useState<string | null>(null);

  const [selectedGroups, setSelectedGroups] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [filteredGroups, setFilteredGroups] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedFlow, setSelectedFlow] = useState<number | null>(null);

  // Фильтрация подсказок при вводе
  useEffect(() => {
    const filtered = allGroups.filter(
      (group) => 
        group.toLowerCase().includes(inputValue.toLowerCase()) &&
        !selectedGroups.includes(group)
    );
    setFilteredGroups(filtered);
  }, [inputValue, allGroups, selectedGroups]);

  // Добавление группы через input
  const handleAddGroup = () => {
    if (inputValue && allGroups.includes(inputValue)) {
      setSelectedGroups(prev => [...prev, inputValue]);
      setInputValue('');
      setShowSuggestions(false);
    }
  };

  // Добавление всех групп из выбранного потока
  const handleAddAllFromFlow = () => {
    if (selectedFlow === null) return;

    const flow = flows.find(f => f.id === selectedFlow);
    if (!flow) return;

    const newGroups = flow.groups.filter(g => !selectedGroups.includes(g));
    setSelectedGroups(prev => [...prev, ...newGroups]);
    setSelectedFlow(null);
  };

  const handleAddSyllabus = () => {
    const newId = data.length > 0
      ? Math.max(...data.map(g => g.id)) + 1
      : 1;
    setData([
      ...data,
      {
        id: newId,
        subject: selectedSubject,
        groups: selectedGroups,
        hours: selectedHours,
        attestation: selectedAttestation,
        lecturer: selectedLecturer,
        secondLecturer: selectedSecondLecturer? selectedSecondLecturer : undefined,
      }
    ]);
    setSelectedGroups([]);
    setIsModalOpen(false);
    setSelectedSubject("");
    setSelectedHours(0);
    setSelectedAttestation("");
    setSelectedFlow(null);
    setInputValue('');
    setShowSuggestions(false);
    setSelectedLecturer("");
    setSelectedSecondLecturer(null);
  };

  return (
    <>
      <h2>Учебный план</h2>
      <table border={1} cellPadding="5" cellSpacing="0">
      <thead>
        <tr>
          <th>Предмет</th>
          <th>Группы</th>
          <th>Часы</th>
          <th>Вид аттестации</th>
          <th>Преподаватели</th>
        </tr>
      </thead>
      <tbody>
        {data.map((syllabus) => (
          <React.Fragment key={syllabus.id}>
            <tr>
              <td>{syllabus.subject}</td>
              <td>{syllabus.groups.join(", ")}</td>
              <td>{syllabus.hours}</td>
              <td>{syllabus.attestation}</td>
              <td>{syllabus.secondLecturer? syllabus.lecturer + ', ' + syllabus.secondLecturer : syllabus.lecturer}</td>
            </tr>
          </React.Fragment>
        ))}
      </tbody>
      </table>

      <div>
        <button onClick={() => setIsModalOpen(true)}>
          Добавить
        </button>
      </div>

      {isModalOpen && (
        <div className="modal">
          <select
            className="styled-select"
            value={selectedSubject || ""}
            onChange={(e) => setSelectedSubject(e.target.value)}
          >
            <option value="">Выберите предмет</option>
            {subjects.map(subject => (
              <option key={subject.name} value={subject.name}>
                {subject.name}
              </option>
            ))}
          </select>

          <div style={{ marginBottom: '1rem' }}>
            <input
              type="text"
              value={inputValue}
              onChange={(e) => {
                setInputValue(e.target.value);
                setShowSuggestions(true);
              }}
              placeholder="Введите группу"
              style={{
                padding: '8px',
                width: '300px',
                marginRight: '8px',
                border: '1px solid #ccc'
              }}
            />

            {/* Список подсказок */}
            {showSuggestions && filteredGroups.length > 0 && (
              <div 
                style={{
                  position: 'absolute',
                  width: '100%',
                  border: '1px solid #ccc',
                  backgroundColor: 'white',
                  maxHeight: '150px',
                  overflowY: 'auto',
                  marginTop: '2px',
                  borderRadius: '4px'
                }}
              >
                {filteredGroups.map((group, index) => (
                  <div 
                    key={index}
                    onClick={() => {
                      setInputValue(group);
                      setFilteredGroups([]);
                      setShowSuggestions(false);
                    }}
                    style={{
                      padding: '8px',
                      cursor: 'pointer',
                      borderBottom: '1px solid #eee',
                    }}
                    className="suggestion"
                  >
                    {group}
                  </div>
                ))}
              </div>
            )}

            <button 
              onClick={handleAddGroup} 
              disabled={!inputValue || !allGroups.includes(inputValue)}
              style={{
                padding: '8px 16px',
                marginLeft: '8px',
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                cursor: 'pointer',
              }}
              className={`add-button ${!inputValue || !allGroups.includes(inputValue) ? 'disabled' : ''}`}
            >
              Добавить группу
            </button>
          </div>

          {/* Выбор потока для добавления всех групп */}
          <div style={{ marginBottom: '1rem' }}>
            <select 
              value={selectedFlow ?? ''}
              onChange={(e) => setSelectedFlow(Number(e.target.value) || null)}
              style={{
                padding: '8px',
                width: '300px',
                marginBottom: '8px',
                border: '1px solid #ccc'
              }}
            >
              <option value="">Выберите поток</option>
              {flows.map(flow => (
                <option key={flow.id} value={flow.id}>
                  Поток {flow.id} (Группы: {flow.groups.join(", ")})
                </option>
              ))}
            </select>

            <button 
              onClick={handleAddAllFromFlow}
              disabled={selectedFlow === null}
              style={{
                padding: '8px 16px',
                marginLeft: '8px',
                backgroundColor: '#28a745',
                color: 'white',
                border: 'none',
                cursor: 'pointer',
              }}
              className={`add-button ${!inputValue || !allGroups.includes(inputValue) ? 'disabled' : ''}`}
            >
              Добавить поток
            </button>
          </div>

          <ul style={{ listStyleType: 'none', padding: 0 }}>
            {selectedGroups.map((group, index) => (
              <li 
                key={index} 
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '8px',
                  marginBottom: '4px',
                  border: '1px solid #eee',
                  borderRadius: '4px'
                }}
              >
                {group}
                <button 
                  onClick={() => setSelectedGroups(prev => prev.filter((_, i) => i !== index))}
                  style={{
                    border: 'none',
                    background: 'transparent',
                    color: 'red',
                    cursor: 'pointer',
                    marginLeft: '8px'
                  }}
                >
                  ×
                </button>
              </li>
            ))}
          </ul>

          <select
            className="styled-select"
            value={selectedHours}
            onChange={(e) => setSelectedHours(parseInt(e.target.value))}
          >
            <option value="0">Выберите число часов (за семестр)</option>
            {HOURS.map(hour => (
              <option key={hour} value={hour}>
                {hour}
              </option>
            ))}
          </select>
          <select
            className="styled-select"
            value={selectedAttestation}
            onChange={(e) => setSelectedAttestation(e.target.value)}
          >
            <option value="">Выберите вид аттестации</option>
            {ATTESTATIONS.map(attestation => (
              <option key={attestation} value={attestation}>
                {attestation}
              </option>
            ))}
          </select>
          <div className="form-group">
            <label htmlFor="firstLecturer">Преподаватель:</label>
            <input
              id="firstLecturer"
              type="text"
              value={selectedLecturer}
              onChange={(e) => setSelectedLecturer(e.target.value)}
              list="lecturers"
              placeholder="Выберите преподавателя"
              style={{
                padding: '8px',
                width: '300px',
                marginRight: '8px',
                border: '1px solid #ccc'
              }}
              className="form-control"
            />
            <datalist id="lecturers">
              {lecturers.map(lecturer => (
                <option key={lecturer} value={lecturer} />
              ))}
            </datalist>
          </div>

          <div className="form-group" style={{ marginTop: '1rem', marginBottom: '1rem' }}>
            <label htmlFor="firstLecturer">
              Второй преподаватель (необязательно):
            </label>
            <input
              type="text"
              value={selectedSecondLecturer || ''}
              onChange={(e) => {
                const value = e.target.value;
                setSelectedSecondLecturer(value === '' ? null : value);
              }}
              list="secondLecturers"
              placeholder="Выберите преподавателя"
              style={{
                padding: '8px',
                width: '300px',
                marginRight: '8px',
                border: '1px solid #ccc'
              }}
              className="form-control"
            />
            <datalist id="secondLecturers">
              {lecturers.map(lecturer => (
                <option key={lecturer} value={lecturer} />
              ))}
            </datalist>
          </div>
          <button
            onClick={handleAddSyllabus}
            disabled={
              !selectedSubject ||
              !selectedHours ||
              !selectedAttestation ||
              !lecturers.includes(selectedLecturer) ||
              (selectedSecondLecturer !== null && !lecturers.includes(selectedSecondLecturer)) ||
              selectedSecondLecturer === selectedLecturer
            }
          >
            Добавить
          </button>
          <button onClick={() => setIsModalOpen(false)}>
            Отмена
          </button>
        </div>
      )}
    </>
  )
}