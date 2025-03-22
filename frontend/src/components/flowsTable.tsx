import React, { useState, useEffect } from 'react';
import { FlowType } from '../types';

export interface FlowsTableProps {
  allGroups: string[];
  data: FlowType[];
  setData: React.Dispatch<React.SetStateAction<FlowType[]>>;
}

export const FlowsTable = ({ allGroups, data, setData }: FlowsTableProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [flows, setFlows] = useState<string[]>([]);
  // Вспомогательные значения
  const [inputValue, setInputValue] = useState('');
  const [filteredGroups, setFilteredGroups] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Фильтрация подсказок при вводе
  useEffect(() => {
    const filtered = allGroups.filter(name => 
      name.toLowerCase().includes(inputValue.toLowerCase())
    );
    setFilteredGroups(filtered);
  }, [inputValue, allGroups]);

  // Добавление группы в flows
  const handleAdd = () => {
    if (inputValue && allGroups.includes(inputValue)) {
      setFlows(prevFlows => [...prevFlows, inputValue]);
      setInputValue('');
      setShowSuggestions(false);
    }
  };

  // Удаление группы из flows
  const handleDelete = (index: number) => {
    setFlows(prevFlows => prevFlows.filter((_, i) => i !== index));
  };

  const addFlow = () => {
    const newId = data.length > 0
      ? Math.max(...data.map(g => g.id)) + 1
      : 1;
    setData([...data, { id: newId, groups: flows }]);
    setFlows([]);
    setInputValue('');
    setFilteredGroups([]);
    setShowSuggestions(false);
    setIsModalOpen(false);
  };

  return (
    <>
      <h2>Потоки</h2>
      <table border={1} cellPadding="5" cellSpacing="0">
      <thead>
      </thead>
      <tbody>
        {data.map((flow) => (
          <React.Fragment key={flow.id}>
            <tr>
              <th>{flow.groups.join(", ")}</th>
            </tr>
          </React.Fragment>
        ))}
      </tbody>
      </table>

      <div>
        <button onClick={() => setIsModalOpen(true)}>
          Добавить поток
        </button>
      </div>

      {isModalOpen && (
        <div className="modal">
          <div style={{ position: 'relative', marginBottom: '1rem' }}>
            <input
              type="text"
              value={inputValue}
              onChange={(e) => {
                setInputValue(e.target.value);
                setShowSuggestions(true);
              }}
              placeholder="Выберите группу"
              style={{
                padding: '8px', 
                width: '300px', 
                marginBottom: '5px',
                border: '1px solid #ccc'
              }}
            />

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
                      '&:hover': { backgroundColor: '#f0f0f0' }
                    }}
                  >
                    {group}
                  </div>
                ))}
              </div>
            )}

            <button 
              onClick={handleAdd} 
              disabled={!inputValue || !allGroups.includes(inputValue)}
              style={{
                padding: '8px 16px',
                marginLeft: '8px',
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                cursor: 'pointer',
                '&:disabled': { opacity: 0.6 }
              }}
            >
              Добавить
            </button>
          </div>

          <ul style={{ listStyleType: 'none', padding: 0 }}>
            {flows.map((flow, index) => (
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
                <span>{flow}</span>
                <button 
                  onClick={() => handleDelete(index)}
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
          <button
            onClick={addFlow}
            disabled={flows.length === 0}
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