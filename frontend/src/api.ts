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

// Добавление структурного подразделения: университета, факультета либо кафедры
export const createStructuralDivision = async (
  name: string,
  parent_id?: number,
  short_name?: string
): Promise<number> => {
  try {
    const url = new URL('http://localhost:8000/structural_divizion');
    url.searchParams.append('name', name);
    if (short_name) url.searchParams.append('short_name', short_name);
    if (parent_id !== undefined) url.searchParams.append('parent_id', parent_id.toString());

    const response = await fetch(url.toString(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        `Ошибка ${response.status}: ${errorData.detail || 'Неизвестная ошибка'}`
      );
    }

    return await response.json();
  } catch (error) {
    console.error('Ошибка создания подразделения:', error);
    throw error;
  }
};

// Добавление специальности
export const createSpeciality = async (
  department_id: number,
  name: string
): Promise<number> => {
  try {
    const url = new URL('http://localhost:8000/speciality');
    url.searchParams.append('department_id', department_id.toString());
    url.searchParams.append('name', name);

    const response = await fetch(url.toString(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        `Ошибка ${response.status}: ${errorData.detail || 'Неизвестная ошибка'}`
      );
    }

    return await response.json();
  } catch (error) {
    console.error('Ошибка создания специальности:', error);
    throw error;
  }
};

// Добавление группы
export const createGroup = async (
  speciality_id: number,
  name: string,
  course: string, // Предполагается, что тип CourseEnum определен
  student_count: number
): Promise<number> => {
  try {
    const url = new URL('http://localhost:8000/group');
    url.searchParams.append('speciality_id', speciality_id.toString());
    url.searchParams.append('name', name);
    url.searchParams.append('course', course);
    url.searchParams.append('student_count', student_count.toString());

    const response = await fetch(url.toString(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Ошибка ${response.status}: ${errorData.detail || 'Неизвестная ошибка'}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Ошибка создания группы:', error);
    throw error;
  }
};

// Добавление преподавателя
export const createTeacher = async (
  department_id: number,
  name: string
): Promise<number> => {
  try {
    const url = new URL('http://localhost:8000/teacher');
    url.searchParams.append('department_id', department_id.toString());
    url.searchParams.append('name', name);

    const response = await fetch(url.toString(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Ошибка ${response.status}: ${errorData.detail || 'Неизвестная ошибка'}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Ошибка создания преподавателя:', error);
    throw error;
  }
};

// Добавление аудитории
export const createClassroom = async (
  faculty_id: number,
  name: string,
  capacity: number,
  department_id?: number
): Promise<number> => {
  try {
    const url = new URL('http://localhost:8000/classroom');
    url.searchParams.append('faculty_id', faculty_id.toString());
    if (department_id) {
      url.searchParams.append('department_id', department_id.toString());
    }
    url.searchParams.append('name', name);
    url.searchParams.append('capacity', capacity.toString());

    const response = await fetch(url.toString(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Ошибка ${response.status}: ${errorData.detail || 'Неизвестная ошибка'}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Ошибка создания аудитории:', error);
    throw error;
  }
};

// Добавление предмета
export const createSubject = async (
  name: string,
  short_name: string
): Promise<number> => {
  try {
    const url = new URL('http://localhost:8000/subject');
    url.searchParams.append('name', name);
    url.searchParams.append('short_name', short_name);

    const response = await fetch(url.toString(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Ошибка ${response.status}: ${errorData.detail || 'Неизвестная ошибка'}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Ошибка создания предмета:', error);
    throw error;
  }
};

// Добавление потока (с передачей данных в теле запроса)
export const createFlow = async (
  groups: string[] // Массив имен групп
): Promise<number> => {
  try {
    const response = await fetch('http://localhost:8000/flow', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(groups),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Ошибка ${response.status}: ${errorData.detail || 'Неизвестная ошибка'}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Ошибка создания потока:', error);
    throw error;
  }
};

// Добавление занятия в учебный план
export const addCurriculumLesson = async (
  subject_id: number,
  hours: number,
  primary_teacher_id: number,
  secondary_teacher_id?: number,
  group_id?: number,
  flow_id?: number
): Promise<number> => {
  try {
    const url = new URL('http://localhost:8000/curriculum');
    url.searchParams.append('subject_id', subject_id.toString());
    url.searchParams.append('hours', hours.toString());
    url.searchParams.append('primary_teacher_id', primary_teacher_id.toString());
    
    if (secondary_teacher_id !== undefined) {
      url.searchParams.append('secondary_teacher_id', secondary_teacher_id.toString());
    }
    if (group_id !== undefined) {
      url.searchParams.append('group_id', group_id.toString());
    }
    if (flow_id !== undefined) {
      url.searchParams.append('flow_id', flow_id.toString());
    }

    const response = await fetch(url.toString(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Ошибка ${response.status}: ${errorData.detail || 'Неизвестная ошибка'}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Ошибка добавления занятия в учебный план:', error);
    throw error;
  }
};

// Добавление занятия в расписание
export const addScheduleLesson = async (
  week: number,
  day: number,
  pair: number,
  classroom_id: number,
  curriculum_id: number,
  lesson_type: string
): Promise<number> => {
  try {
    const url = new URL('http://localhost:8000/schedule');
    url.searchParams.append('week', week.toString());
    url.searchParams.append('day', day.toString());
    url.searchParams.append('pair', pair.toString());
    url.searchParams.append('classroom_id', classroom_id.toString());
    url.searchParams.append('curriculum_id', curriculum_id.toString());
    url.searchParams.append('lesson_type', lesson_type);

    const response = await fetch(url.toString(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Ошибка ${response.status}: ${errorData.detail || 'Неизвестная ошибка'}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Ошибка добавления занятия в расписание:', error);
    throw error;
  }
};