// Curriculum - учебный план
import React, { useState } from 'react';
import { CurriculumType, SubjectType, FlowType, LecturerType, GroupType } from '../types';
import { addCurriculumLesson } from '../api';

// Количество часов за семестр
const HOURS = [72, 108, 144];
// Вид аттестации
const ATTESTATIONS = ["Экзамен", "Дифференцированный зачёт", "Зачёт"];

interface CurriculumProps {
  data: CurriculumType[];
  setData: React.Dispatch<React.SetStateAction<CurriculumType[]>>;
  subjects: SubjectType[],
  allGroups: GroupType[],
  flows: FlowType[],
  lecturers: LecturerType[],
}

export const Curriculum = ({ data, setData, subjects, allGroups, flows, lecturers }: CurriculumProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedGroup, setSelectedGroup] = useState("");
  const [selectedHours, setSelectedHours] = useState(0);
  const [selectedAttestation, setSelectedAttestation] = useState("");
  const [selectedLecturer, setSelectedLecturer] = useState<string>("");
  const [selectedSecondLecturer, setSelectedSecondLecturer] = useState<string | null>(null);
  const [selectedFlow, setSelectedFlow] = useState<number | null>(null);

  const handleAddCurriculum = async () => {
    const selectedSubjectData = subjects.find(u => u.name === selectedSubject);
    if (!selectedSubjectData) return;
    const primaryTeacher = lecturers.find(u => u.full_name === selectedLecturer);
    if (!primaryTeacher) return;
    const secondaryTeacher = lecturers.find(u => u.full_name === selectedSecondLecturer);
    const groupData = allGroups.find(u => u.name === selectedGroup);
    const newId = await addCurriculumLesson(
      selectedSubjectData.id,
      selectedHours,
      primaryTeacher.id,
      secondaryTeacher?.id,
      groupData ? groupData.id : undefined,
      selectedFlow ? selectedFlow : undefined
    );
    let selectedGroups: string[] = [];
    if (groupData) selectedGroups = [groupData.name];
    else {
      const flow = flows.find(u => u.id == selectedFlow);
      if (flow)
        selectedGroups = flow.groups;
    }
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
    setIsModalOpen(false);
    setSelectedSubject("");
    setSelectedHours(0);
    setSelectedAttestation("");
    setSelectedFlow(null);
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
        {data.map((Curriculum) => (
          <React.Fragment key={Curriculum.id}>
            <tr>
              <td>{Curriculum.subject}</td>
              <td>{Curriculum.groups.join(", ")}</td>
              <td>{Curriculum.hours}</td>
              <td>{Curriculum.attestation}</td>
              <td>{Curriculum.secondLecturer? Curriculum.lecturer + ', ' + Curriculum.secondLecturer : Curriculum.lecturer}</td>
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

          <div>
            <select
              className="styled-select"
              value={selectedGroup || ""}
              onChange={(e) => {setSelectedGroup(e.target.value); setSelectedFlow(null);}}
            >
              <option value="">Выберите группу</option>
              {allGroups.map(group => (
                <option key={group.name} value={group.name}>
                  {group.name}
                </option>
              ))}
            </select>

          </div>

          {/* Выбор потока для добавления всех групп */}
          <div>
            <select 
              className="styled-select"
              value={selectedFlow ?? ''}
              onChange={(e) => {setSelectedFlow(Number(e.target.value) || null); setSelectedGroup("");}}
            >
              <option value="">Выберите поток</option>
              {flows.map(flow => (
                <option key={flow.id} value={flow.id}>
                  Поток {flow.id} (Группы: {flow.groups.join(", ")})
                </option>
              ))}
            </select>
          </div>

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
                <option key={lecturer.full_name} value={lecturer.full_name} />
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
                <option key={lecturer.full_name} value={lecturer.full_name} />
              ))}
            </datalist>
          </div>
          <button
            onClick={handleAddCurriculum}
            disabled={
              !selectedSubject ||
              !selectedHours ||
              !selectedAttestation ||
              !lecturers.map(l => l.full_name).includes(selectedLecturer) ||
              (selectedSecondLecturer !== null && !lecturers.map(l => l.full_name).includes(selectedSecondLecturer)) ||
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