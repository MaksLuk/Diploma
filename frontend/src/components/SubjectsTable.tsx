import React, { useState } from 'react';
import { SubjectType } from '../types';
import { createSubject } from '../api';

export interface SubjectsTableProps {
  data: SubjectType[];
  setData: React.Dispatch<React.SetStateAction<SubjectType[]>>;
}

export const SubjectsTable = ({ data, setData }: SubjectsTableProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newSubjectName, setNewSubjectName] = useState("");
  const [newSubjectShortName, setNewSubjectShortName] = useState("");

  const addSubject = async () => {
    const newId = await createSubject(newSubjectName, newSubjectShortName);
    setData(prevData => [
      ...prevData,
      {
        id: newId,
        name: newSubjectName,
        short_name: newSubjectShortName,
      }
    ]);
    setIsModalOpen(false);
    setNewSubjectName("");
    setNewSubjectShortName("");
  };

  return (
    <>
      <h2>Предметы</h2>
      <table border={1} cellPadding="5" cellSpacing="0">
      <thead>
        <tr>
          <th>Название</th>
          <th>Сокращение</th>
        </tr>
      </thead>
      <tbody>
        {data.map((subject) => (
          <React.Fragment key={subject.id}>
            <tr>
              <td>{subject.name}</td>
              <td>{subject.short_name}</td>
            </tr>
          </React.Fragment>
        ))}
      </tbody>
      </table>

      <div>
        <button onClick={() => setIsModalOpen(true)}>
          Добавить предмет
        </button>
      </div>

      {isModalOpen && (
        <div className="modal">
          <input
            type="text"
            placeholder="Название предмета"
            value={newSubjectName}
            onChange={(e) => setNewSubjectName(e.target.value)}
            className="input-field"
          />
          <input
            type="text"
            placeholder="Сокращение"
            value={newSubjectShortName}
            onChange={(e) => setNewSubjectShortName(e.target.value)}
            className="input-field"
          />
          <button
            onClick={addSubject}
            disabled={!newSubjectName || !newSubjectShortName}
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