export type ClassroomType = {
    id: number;
    number: string;
};
  
export type LecturerType = {
    id: number;
    full_name: string;
};
  
export type GroupType = {
    id: number;
    name: string;
    course: string;
    studentsCount: number;
};

/// Специальности
type SpecialitiesType = {
    id: number;
    name: string;
    groups: GroupType[];
}
  
type DepartmentType = {
    id: number;
    name: string;
    short_name: string;
    specialities: SpecialitiesType[];
    lecturers: LecturerType[];
    classrooms: ClassroomType[];
};
  
type FacultyType = {
    id: number;
    name: string;
    departments: DepartmentType[];
    classrooms: ClassroomType[];
};
  
export type UniversityType = {
    id: number;
    name: string;
    faculties: FacultyType[];
};

/// Интерфейс для входных данных компонентов
export interface UniversityTableProps {
    data: UniversityType[];
    setData: React.Dispatch<React.SetStateAction<UniversityType[]>>;
}

export type SubjectType = {
    id: number;
    name: string;
    short_name: string;  // Сокращение
};

// Потоки
export type FlowType = {
    id: number;
    groups: string[];
};

// Учебный план
export type CurriculumType = {
    id: number;
    subject: string;    // Идентификация предмета по полному имени
    groups: string[];   // Список групп
    hours: number;  // Число часов за семестр
    primary_teacher: string; // ФИО преподавателя
    secondary_teacher?: string; // ФИО второго преподавателя
};

// Типы для расписания занятий (получение из API)

export type LessonType = "лекционное" | "лабораторное";

// Данные ячейки расписания
export interface ScheduleCellData {
  lesson_type: LessonType;
  subject: string;     // Название предмета
  teachers: string;    // Преподаватели
  classroom: string;   // Номер аудитории
}

export type WeekNumber = 1 | 2; // Номер недели
export type DayNumber = 1 | 2 | 3 | 4 | 5 | 6; // День недели (Пн-Сб)
export type PairNumber = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8; // Номер пары

// Основная структура расписания
export interface ScheduleData {
    data: {
      [week in WeekNumber]?: {                      // Неделя (1 или 2)
        [day in DayNumber]?: {                     // День недели (1-6)
          [classNum in PairNumber]?: {            // Номер пары (1-8)
            [group: string]: ScheduleCellData;     // Группа (название)
          }
        }
      }
    }
  }