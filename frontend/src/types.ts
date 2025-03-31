type ClassroomType = {
    id: number;
    number: string;
};
  
type LecturerType = {
    id: number;
    fullName: string;
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
    shortName: string;  // Сокращение
};

// Потоки
export type FlowType = {
    id: number;
    groups: string[];
};

// Учебный план
export type SyllabusType = {
    id: number;
    subject: string;    // Идентификация предмета по полному имени
    groups: string[];   // Список групп
    hours: number;  // Число часов за семестр
    attestation: string;    // Вид аттестации
    lecturer: string; // ФИО преподавателя
    secondLecturer?: string; // ФИО второго преподавателя
};