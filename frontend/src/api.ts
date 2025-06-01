// Модуль определяет взаимодействие с методами API

import { UniversityType, SubjectType, FlowType, CurriculumType } from './types';


// Получение данных о структурных подразделения университета
export const fetchUniversityData = async (): Promise<UniversityType[]> => {
    try {
      const response = await fetch("http://localhost:8000/university_data");
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error("Failed to fetch university data:", error);
      return [];
    }
};

// Получение предметов
export const fetchSubjects = async (): Promise<SubjectType[]> => {
    try {
      const response = await fetch("http://localhost:8000/subject");
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error("Failed to fetch university data:", error);
      return [];
    }
};

// Получение потоков
export const fetchFlows = async (): Promise<FlowType[]> => {
    try {
      const response = await fetch("http://localhost:8000/flow");
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error("Failed to fetch university data:", error);
      return [];
    }
};

// Получение учебного плана
export const fetchCurriculum = async (): Promise<CurriculumType[]> => {
    try {
      const response = await fetch("http://localhost:8000/curriculum");
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error("Failed to fetch university data:", error);
      return [];
    }
};