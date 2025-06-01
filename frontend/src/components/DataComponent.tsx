import { useMemo } from 'react';
import { UniversityTable } from './UniversityTable.tsx';
import { LecturersTable } from './LecturersTable.tsx';
import { ClassroomsTable } from './ClassroomsTable.tsx';
import { SubjectsTable } from './SubjectsTable.tsx';
import { FlowsTable } from './flowsTable.tsx';
import { Curriculum } from './Curriculum.tsx';
import { UniversityType, SubjectType, FlowType, CurriculumType, LecturerType, GroupType } from '../types';

export interface DataProps {
  universityData: UniversityType[];
  setUniversityData: React.Dispatch<React.SetStateAction<UniversityType[]>>;
  subjects: SubjectType[];
  setSubjects: React.Dispatch<React.SetStateAction<SubjectType[]>>;
  flows: FlowType[];
  setFlows: React.Dispatch<React.SetStateAction<FlowType[]>>;
  CurriculumData: CurriculumType[];
  setCurriculumData: React.Dispatch<React.SetStateAction<CurriculumType[]>>;
}

/// В компоненте описаны все элементы на вкладке "Данные"
export const DataComponent = ({
  universityData, setUniversityData,
  subjects, setSubjects,
  flows, setFlows,
  CurriculumData, setCurriculumData,
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
  //
  const allGroups = useMemo<GroupType[]>(() => {
    const getAllGroups = (data: UniversityType[]): GroupType[] => {
      return data.flatMap(university => 
        university.faculties.flatMap(faculty => 
          faculty.departments.flatMap(department => 
            department.specialities.flatMap(speciality => speciality.groups)
          )
        )
      );
    };
    return Array.from(new Set(getAllGroups(universityData)));
  }, [universityData]);
  // Все преподаватели
  const allLecturers = useMemo<LecturerType[] >(() => {
    const getAllLecturers = (data: UniversityType[]): LecturerType[]  => {
      return data.flatMap(university => 
        university.faculties.flatMap(faculty => 
          faculty.departments.flatMap(department => department.lecturers)
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
      <Curriculum
        data={CurriculumData}
        setData={setCurriculumData}
        subjects={subjects}
        allGroups={allGroups}
        flows={flows}
        lecturers={allLecturers}
      />
    </>
  );
};