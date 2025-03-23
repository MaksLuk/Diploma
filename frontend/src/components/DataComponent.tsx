import { useMemo } from 'react';
import { UniversityTable } from './UniversityTable.tsx';
import { LecturersTable } from './LecturersTable.tsx';
import { ClassroomsTable } from './ClassroomsTable.tsx';
import { SubjectsTable } from './SubjectsTable.tsx';
import { FlowsTable } from './flowsTable.tsx';
import { Syllabus } from './Syllabus.tsx';
import { UniversityType, SubjectType, FlowType, SyllabusType } from '../types';

export interface DataProps {
  universityData: UniversityType[];
  setUniversityData: React.Dispatch<React.SetStateAction<UniversityType[]>>;
  subjects: SubjectType[];
  setSubjects: React.Dispatch<React.SetStateAction<SubjectType[]>>;
  flows: FlowType[];
  setFlows: React.Dispatch<React.SetStateAction<FlowType[]>>;
  syllabusData: SyllabusType[];
  setSyllabusData: React.Dispatch<React.SetStateAction<SyllabusType[]>>;
}

/// В компоненте описаны все элементы на вкладке "Данные"
export const DataComponent = ({
  universityData, setUniversityData,
  subjects, setSubjects,
  flows, setFlows,
  syllabusData, setSyllabusData,
}: DataProps) => {
  // Получение все названия групп из университетских данных
  const groupNames = useMemo<string[]>(() => {
    const getAllGroups = (data: UniversityType[]): string[] => {
      return data.flatMap(university => 
        university.faculties.flatMap(faculty => 
          faculty.departments.flatMap(department => 
            department.specialities.flatMap(speciality => 
              speciality.groups.map(group => group.name)
            )
          )
        )
      );
    };
    return Array.from(new Set(getAllGroups(universityData)));
  }, [universityData]);
  // Все преподаватели
  const allLecturers = useMemo<string[]>(() => {
    const getAllLecturers = (data: UniversityType[]): string[] => {
      return data.flatMap(university => 
        university.faculties.flatMap(faculty => 
          faculty.departments.flatMap(department => 
            department.lecturers.map(lecturer => lecturer.fullName)
          )
        )
      );
    };
    return Array.from(new Set(getAllLecturers(universityData)));
  }, [universityData]);

  return (
    <>
      <UniversityTable
        data={universityData}
        setData={setUniversityData}
      />
      <LecturersTable
        data={universityData}
        setData={setUniversityData}
      />
      <ClassroomsTable
        data={universityData}
        setData={setUniversityData}
      />
      <SubjectsTable
        data={subjects}
        setData={setSubjects}
      />
      <FlowsTable
        allGroups={groupNames}
        data={flows}
        setData={setFlows}
      />
      <Syllabus
        data={syllabusData}
        setData={setSyllabusData}
        subjects={subjects}
        allGroups={groupNames}
        flows={flows}
        lecturers={allLecturers}
      />
    </>
  );
};