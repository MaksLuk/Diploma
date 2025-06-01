#
#
#

'''Модуль определяет абстракцию для взаимодействия с любыми БД'''

import abc
from enum import Enum
from typing import Optional

from pydantic import BaseModel


class CourseEnum(str, Enum):
    """Возможные значения курса"""
    BACHELOR_1 = "Бакалавриат, 1"
    BACHELOR_2 = "Бакалавриат, 2"
    BACHELOR_3 = "Бакалавриат, 3"
    BACHELOR_4 = "Бакалавриат, 4"
    MASTER_1 = "Магистратура, 1"
    MASTER_2 = "Магистратура, 2"
    SPECIALIST_1 = "Специалитет, 1"
    SPECIALIST_2 = "Специалитет, 2"
    SPECIALIST_3 = "Специалитет, 3"
    SPECIALIST_4 = "Специалитет, 4"
    SPECIALIST_5 = "Специалитет, 5"


class LessonType(str, Enum):
    """Возможные типы занятий"""
    LECTURE = "лекционное"
    LAB = "лабораторное"


class GroupData(BaseModel):
    '''Вспомогательный тип данных для структуры университета
    для get_university_data. Содержит данные о группах'''
    id: int
    name: str
    course: CourseEnum
    students_count: int


class SpecialityData(BaseModel):
    '''Вспомогательный тип данных для структуры университета
    для get_university_data. Содержит данные о специальностях'''
    id: int
    name: str
    groups: list[GroupData]


class LecturerData(BaseModel):
    '''Вспомогательный тип данных для структуры университета
    для get_university_data. Содержит данные о преподавателях'''
    id: int
    full_name: str


class ClassroomData(BaseModel):
    '''Вспомогательный тип данных для структуры университета
    для get_university_data. Содержит данные об аудиториях'''
    id: int
    number: str
    capacity: int


class DepartmentData(BaseModel):
    '''Вспомогательный тип данных для структуры университета
    для get_university_data. Содержит данные о кафедрах'''
    id: int
    name: str
    short_name: str
    specialities: list[SpecialityData]
    lecturers: list[LecturerData]
    classrooms: list[ClassroomData]


class FacultyData(BaseModel):
    '''Вспомогательный тип данных для структуры университета
    для get_university_data. Содержит данные о факультетах.
    departments - кафедры
    classrooms - аудитории факультета, не относящиеся ни к одной кафедре'''
    id: int
    name: str
    departments: list[DepartmentData]
    classrooms: list[ClassroomData]


class UniversityData(BaseModel):
    '''Тип данных структуры университета для функции get_university_data'''
    id: int
    name: str
    faculties: list[FacultyData]


class SubjectsData(BaseModel):
    '''Данные о предметах для метода get_subjects'''
    id: int
    name: str
    short_name: str


class FlowsData(BaseModel):
    '''Данные о потоках для метода get_flows. groups - список названий групп'''
    id: int
    groups: list[str]


class CurriculumData(BaseModel):
    '''Данные об учебном плане для метода get_curriculum.
    subject - сокращенное название предмета
    groups - названия групп, у которых проводится занятие. Если в БД указана
    группа, то указывается список из одной этой группы. Если указан поток,
    то список всех групп потока
    primary_teacher - ФИО основного преподавателя
    secondary_teacher - ФИО второго преподавателя (если он есть)'''
    id: int
    subject: str
    groups: list[str]
    hours: int
    primary_teacher: str
    secondary_teacher: Optional[str]


class ScheduleCellData(BaseModel):
    '''Данные о ячейке расписания'''
    lesson_type: LessonType
    subject: str    # Название предмета
    teachers: str   # Преподватели
    classroom: str  # Номер аудитории


class ScheduleData(BaseModel):
    '''Данные о расписании'''
    data: dict[
        int,  # Уровень 0: Неделя (1 либо 2)
        dict[
            int,  # Уровень 1: День недели (1-6, понедельник-суббота)
            dict[
                int,  # Уровень 3: номер пары (1-8)
                dict[
                    str,  # Уровень 4: Группа (название)
                    ScheduleCellData
                ]
            ]
        ]
    ]


class Database(abc.ABC):
    '''Абстрактный класс для взаимодействия с любыми БД'''
    @abc.abstractmethod
    def add_structural_divizion(
        self,
        parent_id: Optional[int],
        name: str
    ) -> int:
        '''Добавляет структурное подразделение (университет, факультет, кафедру)
        Возвращает id добавленной записи'''

    @abc.abstractmethod
    def add_speciality(
        self,
        department_id: int,
        name: str
    ) -> int:
        '''Добавляет специальность, возвращает id добавленной записи'''

    @abc.abstractmethod
    def add_group(
        self,
        speciality_id: int,
        name: str,
        course: CourseEnum,
        student_count: int
    ) -> int:
        '''Добавляет группу, возвращает id добавленной записи'''

    @abc.abstractmethod
    def add_teacher(
        self,
        department_id: int,
        name: str
    ) -> int:
        '''Добавляет преподавателя, возвращает id добавленной записи'''

    @abc.abstractmethod
    def add_classroom(
        self,
        faculty_id: int,
        department_id: Optional[int],
        name: str,
        capacity: int
    ) -> int:
        '''Добавляет аудиторию, возвращает id добавленной записи'''

    @abc.abstractmethod
    def add_subject(
        self,
        name: str,
        short_name: str
    ) -> int:
        '''Добавляет аудиторию, возвращает id добавленной записи'''

    @abc.abstractmethod
    def add_flow(self, groups: list[str]) -> int:
        '''Добавляет поток, возвращает id добавленной записи'''

    @abc.abstractmethod
    def add_lesson_to_plan(
        self,
        subject_id: int,
        hours: int,
        primary_teacher_id: int,
        secondary_teacher_id: int,
        group_id: Optional[int],
        flow_id: Optional[int]
    ) -> int:
        '''Добавляет занятие в учебный план, возвращает id добавленной записи'''

    @abc.abstractmethod
    def add_lesson_to_schedule(
        self,
        week: int,
        day: int,
        pair: int,
        classroom_id: int,
        curriculum_id: int,
        lesson_type: LessonType
    ) -> int:
        '''Добавляет занятие в расписание, возвращает id добавленной записи'''

    @abc.abstractmethod
    def get_university_data(self) -> list[UniversityData]:
        '''Возвращает данные о структуре университета, которые выключат в себя:
        - Университеты
        - Факультеты
        - Кафедры
        - Специальности
        - Группы
        - Аудитории кафедр
        - Аудитории факультетов (те, у которых не указан параметр кафедры)
        - Преподаватели'''

    @abc.abstractmethod
    def get_subjects(self) -> list[SubjectsData]:
        '''Возвращает данные о предметах'''

    @abc.abstractmethod
    def get_flows(self) -> list[FlowsData]:
        '''Возвращает данные о потоках (списках групп)'''

    @abc.abstractmethod
    def get_curriculum(self) -> list[CurriculumData]:
        '''Возвращает учебный план'''

    @abc.abstractmethod
    def get_schedule(self) -> ScheduleData:
        '''Возвращает расписание занятий'''
