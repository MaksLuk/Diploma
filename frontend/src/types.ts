type ClassroomType = {
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
    shortName: string;
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