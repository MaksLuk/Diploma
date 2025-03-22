type ClassroomType = {
    id: number;
    number: string;
};
  
type LecturerType = {
    id: number;
    fullName: string;
};
  
type GroupType = {
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