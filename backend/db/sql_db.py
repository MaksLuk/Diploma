#
#
#

'''Модуль определяет взаимодействие с реляционными БД'''

from typing import List, Optional
from collections import defaultdict

from sqlmodel import (
  Field, SQLModel, create_engine, Session, select, Relationship, CheckConstraint
)
from sqlalchemy.orm import aliased

from db.main_db import (
    Database, LessonType, CourseEnum, UniversityData, DepartmentData, GroupData,
    FacultyData, LecturerData, ClassroomData, SpecialityData, SubjectsData,
    FlowsData, CurriculumData, ScheduleData, ScheduleCellData
)


class Department(SQLModel, table=True):
    """Структурное подразделение
    Подразлеления без родителя - университет
    Дочерние университету подразделения - факультеты
    Дочерние факультетам - кафедры"""
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(index=True, unique=True)
    short_name: Optional[str]
    parent_id: Optional[int] = Field(default=None, foreign_key="department.id")

    # Связь на самого себя для иерархии
    parent: Optional["Department"] = Relationship(
        back_populates="children", 
        sa_relationship_kwargs={
            "remote_side": "Department.id",
            "foreign_keys": "Department.parent_id"
        }
    )
    children: List["Department"] = Relationship(back_populates="parent")


class Specialty(SQLModel, table=True):
    """Специальность"""
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(index=True, unique=True)
    department_id: int = Field(foreign_key="department.id")

    department: Department = Relationship()


class FlowGroupLink(SQLModel, table=True):
    """Связь многие-ко-многим между Потоком и Группами"""
    flow_id: Optional[int] = Field(default=None, foreign_key="flow.id", primary_key=True)
    group_id: Optional[int] = Field(default=None, foreign_key="group.id", primary_key=True)


class Group(SQLModel, table=True):
    """Группа"""
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(index=True, unique=True)
    course: CourseEnum
    specialty_id: int = Field(foreign_key="specialty.id")
    student_count: int

    specialty: Specialty = Relationship()
    # Обратная связь для связи многие-ко-многим с Flow
    flows: List["Flow"] = Relationship(back_populates="groups", link_model=FlowGroupLink)


class Flow(SQLModel, table=True):
    """Поток"""
    id: Optional[int] = Field(default=None, primary_key=True)

    groups: List[Group] = Relationship(back_populates="flows", link_model=FlowGroupLink)


class Classroom(SQLModel, table=True):
    """Аудитория"""
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(index=True, unique=True)
    capacity: int
    faculty_id: int = Field(foreign_key="department.id")
    department_id: Optional[int] = Field(foreign_key="department.id")

    faculty: Department = Relationship(
        sa_relationship_kwargs={"foreign_keys": "Classroom.faculty_id"}
    )
    department: Optional[Department] = Relationship(
        sa_relationship_kwargs={"foreign_keys": "Classroom.department_id"}
    )


class Subject(SQLModel, table=True):
    """Предмет"""
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(index=True, unique=True)
    short_name: str


class Teacher(SQLModel, table=True):
    """Преподаватель"""
    id: Optional[int] = Field(default=None, primary_key=True)
    full_name: str = Field(index=True, unique=True)
    department_id: int = Field(foreign_key="department.id")

    department: Department = Relationship()


class Curriculum(SQLModel, table=True):
    """Учебный план"""
    __table_args__ = (
        CheckConstraint("hours IN (72, 108, 144)", name="hours_check"),
    )

    id: Optional[int] = Field(default=None, primary_key=True)
    subject_id: int = Field(foreign_key="subject.id")
    hours: int
    primary_teacher_id: int = Field(foreign_key="teacher.id")
    secondary_teacher_id: Optional[int] = Field(foreign_key="teacher.id")
    group_id: Optional[int] = Field(default=None, foreign_key="group.id")
    flow_id: Optional[int] = Field(default=None, foreign_key="flow.id")

    subject: Subject = Relationship()
    primary_teacher: Teacher = Relationship(
        sa_relationship_kwargs={"foreign_keys": "Curriculum.primary_teacher_id"}
    )
    secondary_teacher: Optional[Teacher] = Relationship(
        sa_relationship_kwargs={
            "foreign_keys": "Curriculum.secondary_teacher_id"
        }
    )
    group: Optional[Group] = Relationship()
    flow: Optional[Flow] = Relationship()


class Lesson(SQLModel, table=True):
    """Занятие в расписании"""
    __table_args__ = (
        CheckConstraint("week IN (1, 2)", name="week_check"),
        CheckConstraint("day BETWEEN 1 AND 6", name="day_check"),
        CheckConstraint("pair BETWEEN 1 AND 8", name="pair_check"),
    )

    id: Optional[int] = Field(default=None, primary_key=True)
    week: int
    day: int
    pair: int
    classroom_id: int = Field(foreign_key="classroom.id")
    curriculum_id: int = Field(foreign_key="curriculum.id")
    lesson_type: LessonType

    classroom: Classroom = Relationship()
    curriculum: Curriculum = Relationship()


class SQLDatabase(Database):
    '''Класс для работы с реляционными БД через ORM'''
    def __init__(self, db_url: str) -> None:
        self.engine = create_engine(db_url)
        SQLModel.metadata.create_all(self.engine)

    def add_structural_divizion(
        self,
        parent_id: Optional[int],
        name: str,
        short_name: Optional[str]
    ) -> int:
        new_division = Department(
            name=name, parent_id=parent_id, short_name=short_name
        )
        with Session(self.engine) as session:
            # Проверка существования родительского подразделения
            if parent_id is not None:
                parent = session.get(Department, parent_id)
                if not parent:
                    raise ValueError(
                        f"Родительское подразделение с ID {parent_id} не найдено"
                    )
            # Проверка уникальности названия
            existing = session.exec(
                select(Department).where(Department.name == name)
            ).first()
            if existing:
                raise ValueError(
                    f"Подразделение с именем '{name}' уже существует"
                )

            session.add(new_division)
            session.commit()
            session.refresh(new_division)
        return new_division.id

    def add_speciality(
        self,
        department_id: int,
        name: str
    ) -> int:
        new_speciality = Specialty(name=name, department_id=department_id)
        with Session(self.engine) as session:
            # Проверка существования "родительской" кафедры
            parent = session.get(Department, department_id)
            if not parent:
                raise ValueError(f"Кафедра с ID {department_id} не найдена")
            # Проверка уникальности названия
            existing = session.exec(
                select(Specialty).where(Specialty.name == name)
            ).first()
            if existing:
                raise ValueError(f"Специальность '{name}' уже существует")

            session.add(new_speciality)
            session.commit()
            session.refresh(new_speciality)
        return new_speciality.id

    def add_group(
        self,
        speciality_id: int,
        name: str,
        course: CourseEnum,
        student_count: int
    ) -> int:
        new_group = Group(
            name=name,
            course=course,
            specialty_id=speciality_id,
            student_count=student_count
        )
        with Session(self.engine) as session:
            # Проверка существования "родительской" специальности
            parent = session.get(Specialty, speciality_id)
            if not parent:
                raise ValueError(f"Специальность с ID {speciality_id} не найдена")
            # Проверка уникальности названия
            existing = session.exec(
                select(Group).where(Group.name == name)
            ).first()
            if existing:
                raise ValueError(f"Группа '{name}' уже существует")
            # Сюда можно добавить проверку наличия в группе минимально необходимого числа студентов
            session.add(new_group)
            session.commit()
            session.refresh(new_group)
        return new_group.id

    def add_teacher(
        self,
        department_id: int,
        name: str
    ) -> int:
        new_teacher = Teacher(full_name=name, department_id=department_id)
        with Session(self.engine) as session:
            # Проверка существования "родительской" кафедры
            parent = session.get(Department, department_id)
            if not parent:
                raise ValueError(f"Кафедра с ID {department_id} не найдена")
            # Проверка уникальности ФИО
            existing = session.exec(
                select(Teacher).where(Teacher.full_name == name)
            ).first()
            if existing:
                raise ValueError(f"Преподаватель '{name}' уже существует")

            session.add(new_teacher)
            session.commit()
            session.refresh(new_teacher)
        return new_teacher.id

    def add_classroom(
        self,
        faculty_id: int,
        department_id: Optional[int],
        name: str,
        capacity: int
    ) -> int:
        new_classroom = Classroom(
            name=name,
            capacity=capacity,
            faculty_id=faculty_id,
            department_id=department_id
        )
        with Session(self.engine) as session:
            # Проверка существования "родительского" факультета
            parent_faculty = session.get(Department, faculty_id)
            if not parent_faculty:
                raise ValueError(f"Факультет с ID {faculty_id} не найден")
            # Проверка существования "родительской" кафедры
            if department_id:
                parent_department = session.get(Department, department_id)
                if not parent_department:
                    raise ValueError(f"Кафедра с ID {department_id} не найдена")
            # Проверка уникальности номера аудитории
            existing = session.exec(
                select(Classroom).where(Classroom.name == name)
            ).first()
            if existing:
                raise ValueError(f"Аудитория '{name}' уже существует")

            session.add(new_classroom)
            session.commit()
            session.refresh(new_classroom)
        return new_classroom.id

    def add_subject(
        self,
        name: str,
        short_name: str
    ) -> int:
        new_subject = Subject(name=name, short_name=short_name)
        with Session(self.engine) as session:
            # Проверка уникальности полного названия
            existing = session.exec(
                select(Subject).where(Subject.name == name)
            ).first()
            if existing:
                raise ValueError(f"Предмет '{name}' уже существует")

            session.add(new_subject)
            session.commit()
            session.refresh(new_subject)
        return new_subject.id

    def add_flow(self, groups: list[str]) -> int:
        with Session(self.engine) as session:
            # Проверка существования всех групп
            found_groups = session.exec(
                select(Group).where(Group.name.in_(groups))
            ).all()
            found_names = {g.name for g in found_groups}
            missing_groups = [name for name in groups if name not in found_names]
            if missing_groups:
                raise ValueError(f"Группы {', '.join(missing_groups)} не найдены")

            new_flow = Flow()
            session.add(new_flow)
            session.flush() # Для получения ID потока
            # Создание связи между потоком и группами
            for group in found_groups:
                session.add(FlowGroupLink(flow_id=new_flow.id, group_id=group.id))
            session.commit()
            return new_flow.id

    def add_lesson_to_plan(
        self,
        subject_id: int,
        hours: int,
        primary_teacher_id: int,
        secondary_teacher_id: Optional[int],
        group_id: Optional[int],
        flow_id: Optional[int]
    ) -> int:
        new_lesson = Curriculum(
            subject_id=subject_id,
            hours=hours,
            primary_teacher_id=primary_teacher_id,
            secondary_teacher_id=secondary_teacher_id,
            group_id=group_id,
            flow_id=flow_id
        )
        with Session(self.engine) as session:
            # Проверка существования предмета
            subject = session.get(Subject, subject_id)
            if not subject:
                raise ValueError(f"Предмет с ID {subject_id} не найден")
            # Проверка существования основного преподавателя
            primary_teacher = session.get(Teacher, primary_teacher_id)
            if not primary_teacher:
                raise ValueError(f"Преподаватель с ID {primary_teacher_id} не найден")
            # Проверка существования второго преподавателя
            if secondary_teacher_id:
                secondary_teacher = session.get(Teacher, secondary_teacher_id)
                if not secondary_teacher:
                    raise ValueError(f"Преподаватель с ID {secondary_teacher_id} не найден")
            # Проверка существования группы
            if group_id:
                group = session.get(Group, group_id)
                if not group:
                    raise ValueError(f"Группа с ID {group_id} не найдена")
            # Проверка существования потока
            if flow_id:
                flow = session.get(Flow, flow_id)
                if not flow:
                    raise ValueError(f"Поток с ID {flow_id} не найден")
            # Должна быть ЛИБО группа, ЛИБО поток
            if (group_id and flow_id)  or ((not group_id) and (not flow_id)):
                raise ValueError(f"Укажите ЛИБО группу, ЛИБО поток")
            # Проверка уникальности предмета и группы/потока
            existing = session.exec(
                select(Curriculum).where(
                    Curriculum.subject_id == subject_id,
                    Curriculum.group_id == group_id,
                    Curriculum.flow_id == flow_id
                )
            ).first()
            if existing:
                raise ValueError(f"Этот предмет у группы/потока уже есть в учебном плане")

            session.add(new_lesson)
            session.commit()
            session.refresh(new_lesson)
        return new_lesson.id

    def add_lesson_to_schedule(
        self,
        week: int,
        day: int,
        pair: int,
        classroom_id: int,
        curriculum_id: int,
        lesson_type: LessonType
    ) -> int:
        new_lesson = Lesson(
            week=week,
            day=day,
            pair=pair,
            classroom_id=classroom_id,
            curriculum_id=curriculum_id,
            lesson_type=lesson_type
        )
        with Session(self.engine) as session:
            # Проверка существования аудитории
            classroom = session.get(Classroom, classroom_id)
            if not classroom:
                raise ValueError(f"Аудитория с ID {classroom_id} не найдена")
            # Проверка существования занятия в учебном плане
            lesson_in_curriculum = session.get(Curriculum, curriculum_id)
            if not lesson_in_curriculum:
                raise ValueError(f"Занятия с ID {curriculum_id} нет в учебном плане")
            # Проверка корректности ввода недели/дня/номера пары
            if not week in (1, 2):
                raise ValueError(f"Параметр week может быть 1 либо 2")
            if not 1 <= day <= 6:
                raise ValueError(f"Параметр day должен быть числом от 1 до 6")
            if not 1 <= pair <= 8:
                raise ValueError(f"Параметр pair должен быть числом от 1 до 8")

            session.add(new_lesson)
            session.commit()
            session.refresh(new_lesson)
        return new_lesson.id

    def get_university_data(self) -> list[UniversityData]:
        with Session(self.engine) as session:
            # Получение всех подразделений и построение иерархии ВУЗа
            departments = session.exec(select(Department)).all()
            children_map = defaultdict(list)
            for dept in departments:
                children_map[dept.parent_id].append(dept)
            
            # Загрузка доп. данных
            specialties = session.exec(select(Specialty)).all()
            groups = session.exec(select(Group)).all()
            teachers = session.exec(select(Teacher)).all()
            classrooms = session.exec(select(Classroom)).all()
            
            # Группировка доп. данных
            specialties_by_dept = defaultdict(list)
            for spec in specialties:
                specialties_by_dept[spec.department_id].append(spec)
                
            groups_by_specialty = defaultdict(list)
            for group in groups:
                groups_by_specialty[group.specialty_id].append(group)
                
            teachers_by_dept = defaultdict(list)
            for teacher in teachers:
                teachers_by_dept[teacher.department_id].append(teacher)
                
            classrooms_by_dept = defaultdict(list)
            classrooms_by_faculty = defaultdict(list)
            for room in classrooms:
                if room.department_id:
                    classrooms_by_dept[room.department_id].append(room)
                else:
                    classrooms_by_faculty[room.faculty_id].append(room)
        
            # Создание структуры ВУЗа
            result = []
            for university in children_map[None]:  # Университеты (без родителя)
                faculties = []
                for faculty in children_map.get(university.id, []):  # Факультеты
                    departments_data = []
                    for department in children_map.get(faculty.id, []):  # Кафедры
                        # Сбор данных для кафедры
                        specs_data = []
                        for spec in specialties_by_dept.get(department.id, []):
                            groups_data = [
                                GroupData(
                                    id=g.id,
                                    name=g.name,
                                    course=g.course,
                                    students_count=g.student_count
                                ) for g in groups_by_specialty.get(spec.id, [])
                            ]
                            specs_data.append(
                                SpecialityData(
                                    id=spec.id,
                                    name=spec.name,
                                    groups=groups_data
                                )
                            )
                        
                        departments_data.append(
                            DepartmentData(
                                id=department.id,
                                name=department.name,
                                short_name=department.short_name,
                                specialities=specs_data,
                                lecturers=[
                                    LecturerData(id=t.id, full_name=t.full_name)
                                    for t in teachers_by_dept.get(department.id, [])
                                ],
                                classrooms=[
                                    ClassroomData(id=r.id, number=r.name, capacity=r.capacity)
                                    for r in classrooms_by_dept.get(department.id, [])
                                ]
                            )
                        )
                    
                    faculties.append(
                        FacultyData(
                            id=faculty.id,
                            name=faculty.name,
                            departments=departments_data,
                            classrooms=[
                                ClassroomData(id=r.id, number=r.name, capacity=r.capacity)
                                for r in classrooms_by_faculty.get(faculty.id, [])
                            ]
                        )
                    )
                
                result.append(
                    UniversityData(
                        id=university.id,
                        name=university.name,
                        faculties=faculties
                    )
                )
            
            return result

    def get_subjects(self) -> list[SubjectsData]:
        with Session(self.engine) as session:
            subjects = session.exec(select(Subject)).all()
            return [
                SubjectsData(
                    id=subject.id,
                    name=subject.name,
                    short_name=subject.short_name
                )
                for subject in subjects
            ]

    def get_flows(self) -> list[FlowsData]:
        with Session(self.engine) as session:
            # Загрузка потоков с группами
            flows = session.exec(
                select(Flow, Group)
                .join(FlowGroupLink, Flow.id == FlowGroupLink.flow_id)
                .join(Group, FlowGroupLink.group_id == Group.id)
            ).all()
            # Группировка групп по потокам
            flow_groups = defaultdict(list)
            for flow, group in flows:
                flow_groups[flow.id].append(group.name)
            
            return [
                FlowsData(id=flow_id, groups=groups)
                for flow_id, groups in flow_groups.items()
            ]

    def get_curriculum(self) -> list[CurriculumData]:
        with Session(self.engine) as session:
            TeacherPrimary = aliased(Teacher)
            TeacherSecondary = aliased(Teacher)

            # Загрузка учебных планов со связанными данными
            curriculum_query = (
                select(
                    Curriculum,
                    Subject.short_name,
                    TeacherPrimary.full_name,
                    TeacherSecondary.full_name,
                    Group.name,
                    Flow.id
                )
                .join(Subject, Curriculum.subject_id == Subject.id)
                .join(TeacherPrimary, Curriculum.primary_teacher_id == TeacherPrimary.id)
                .join(TeacherSecondary, Curriculum.secondary_teacher_id == TeacherSecondary.id, isouter=True)
                .join(Group, Curriculum.group_id == Group.id, isouter=True)
                .join(Flow, Curriculum.flow_id == Flow.id, isouter=True)
            )
            results = session.exec(curriculum_query).all()

            # Сбор ID всех потоков
            flow_ids = set()
            for res in results:
                if res[5]:  # Flow.id (индекс 5 в результате)
                    flow_ids.add(res[5])

            # Загрузка групп для потоков
            flow_groups_map = {}
            if flow_ids:
                flow_groups = session.exec(
                    select(FlowGroupLink.flow_id, Group.name)
                    .join(Group, FlowGroupLink.group_id == Group.id)
                    .where(FlowGroupLink.flow_id.in_(flow_ids))
                ).all()

                for flow_id, group_name in flow_groups:
                    if flow_id not in flow_groups_map:
                        flow_groups_map[flow_id] = []
                    flow_groups_map[flow_id].append(group_name)

            # Формарование результата
            curriculum_list = []
            for row in results:
                curriculum, subject_short, primary_teacher, secondary_teacher, group_name, flow_id = row

                groups = []
                if group_name:
                    groups = [group_name]
                elif flow_id:
                    groups = flow_groups_map.get(flow_id, [])

                curriculum_list.append(CurriculumData(
                    id=curriculum.id,
                    subject=subject_short,
                    groups=groups,
                    hours=curriculum.hours,
                    primary_teacher=primary_teacher,
                    secondary_teacher=secondary_teacher
                ))

            return curriculum_list

    def get_schedule(self) -> ScheduleData:
        with Session(self.engine) as session:
            PrimaryTeacher = aliased(Teacher)
            SecondaryTeacher = aliased(Teacher)
            
            schedule_query = (
                select(
                    Lesson,
                    Curriculum,
                    Subject,
                    Classroom,
                    PrimaryTeacher,
                    SecondaryTeacher,
                    Group
                )
                .join(Curriculum, Lesson.curriculum_id == Curriculum.id)
                .join(Subject, Curriculum.subject_id == Subject.id)
                .join(Classroom, Lesson.classroom_id == Classroom.id)
                .join(PrimaryTeacher, Curriculum.primary_teacher_id == PrimaryTeacher.id)
                .outerjoin(SecondaryTeacher, Curriculum.secondary_teacher_id == SecondaryTeacher.id)
                .outerjoin(Group, Curriculum.group_id == Group.id)
            )
            results = session.exec(schedule_query).all()

            flow_ids = set()
            for row in results:
                _, curriculum, *_, group = row
                if curriculum.flow_id is not None:
                    flow_ids.add(curriculum.flow_id)

            flow_groups = defaultdict(list)
            if flow_ids:
                flow_group_stmt = select(FlowGroupLink, Group).join(Group).where(FlowGroupLink.flow_id.in_(flow_ids))
                flow_group_results = session.exec(flow_group_stmt).all()
                for link, group in flow_group_results:
                    flow_groups[link.flow_id].append(group)

            schedule_dict = {
                week: {
                    day: {pair: {} for pair in range(1,9)} for day in range(1,7)
                } for week in range(1,3)
            }
            for row in results:
                lesson, curriculum, subject, classroom, primary_teacher, secondary_teacher, group = row
                
                groups = []
                if curriculum.group_id and group is not None:
                    groups = [group]
                elif curriculum.flow_id:
                    groups = flow_groups.get(curriculum.flow_id, [])

                teachers = primary_teacher.full_name
                if secondary_teacher:
                    teachers += f", {secondary_teacher.full_name}"

                cell_data = ScheduleCellData(
                    id=lesson.id,
                    lesson_type=lesson.lesson_type,
                    subject=subject.name,
                    teachers=teachers,
                    classroom=classroom.name
                )

                week = int(lesson.week)
                day = int(lesson.day)
                pair = int(lesson.pair)
                for group_obj in groups:
                    group_name = group_obj.name
                    
                    schedule_dict[week][day][pair][group_name] = cell_data

            # Преобразование defaultdict в обычный dict
            return ScheduleData(data=schedule_dict)

    def edit_schedule_cell(
        self,
        id: int,
        classroom_id: int,
        curriculum_id: int,
        lesson_type: LessonType
    ) -> None:
        with Session(self.engine) as session:
            # Получение занятия
            lesson = session.get(Lesson, id)
            if not lesson:
                raise ValueError(f"Ячейка расписания с ID {id} не найдена")
            # Проверка существования аудитории
            classroom = session.get(Classroom, classroom_id)
            if not classroom:
                raise ValueError(f"Аудитория с ID {classroom_id} не найдена")
            # Проверка существования занятия в учебном плане
            lesson_in_curriculum = session.get(Curriculum, curriculum_id)
            if not lesson_in_curriculum:
                raise ValueError(f"Занятия с ID {curriculum_id} нет в учебном плане")

            lesson.classroom_id = classroom_id
            lesson.curriculum_id = curriculum_id
            lesson.lesson_type = lesson_type

            session.add(lesson)
            session.commit()

    def remove_schedule_cell(self, id: int) -> None:
        with Session(self.engine) as session:
            lesson = session.get(Lesson, id)
            if not lesson:
                raise ValueError(f"Ячейка расписания с ID {id} не найдена")
            session.delete(lesson)
            session.commit()


def get_database(db_string: str) -> Database:
    '''Проверяет, корректно ли введён параметр базы данных,
    возвращает объект БД'''
    try:
        return SQLDatabase(db_string)
    except Exception as e:
        raise TypeError(
            f'The database address is incorrect. Error: {e}'
        ) from e
