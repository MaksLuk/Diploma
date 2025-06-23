#
#
#

'''Модуль определяет взаимодействие с реляционными БД'''

from typing import List, Optional
from collections import defaultdict

from sqlmodel import (
  Field, SQLModel, create_engine, Session, select, Relationship, CheckConstraint
)
from sqlalchemy import func
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

    def create_test_data(self) -> None:
        '''Создание тестовых данных'''
        with Session(self.engine) as session:
            # Университет
            university = Department(name="Технический Университет", short_name="ТУ")
            session.add(university)
            session.commit()
            session.refresh(university)
            
            # Факультеты
            faculty1 = Department(
                name="Факультет Информационных Технологий", 
                short_name="ФИТ",
                parent_id=university.id
            )
            faculty2 = Department(
                name="Инженерный Факультет", 
                short_name="ИФ",
                parent_id=university.id
            )
            session.add_all([faculty1, faculty2])
            session.commit()
            session.refresh(faculty1)
            session.refresh(faculty2)
            
            # Кафедры
            department1 = Department(
                name="Кафедра Программной Инженерии",
                short_name="КПИ",
                parent_id=faculty1.id
            )
            department2 = Department(
                name="Кафедра Искусственного Интеллекта",
                short_name="КИИ",
                parent_id=faculty1.id
            )
            department3 = Department(
                name="Кафедра Машиностроения",
                short_name="КМ",
                parent_id=faculty2.id
            )
            session.add_all([department1, department2, department3])
            session.commit()
            session.refresh(department1)
            session.refresh(department2)
            session.refresh(department3)
            
            # Специальности
            spec1 = Specialty(name="Программная инженерия", department_id=department1.id)
            spec2 = Specialty(name="Искусственный интеллект", department_id=department2.id)
            spec3 = Specialty(name="Машиностроение", department_id=department3.id)
            session.add_all([spec1, spec2, spec3])
            session.commit()
            session.refresh(spec1)
            session.refresh(spec2)
            session.refresh(spec3)
            
            # Группы
            groups = [
                # ФИТ
                Group(name="ПИ-101", course=CourseEnum.BACHELOR_1, specialty_id=spec1.id, student_count=20),
                Group(name="ПИ-102", course=CourseEnum.BACHELOR_1, specialty_id=spec1.id, student_count=25),
                Group(name="ПИ-201", course=CourseEnum.BACHELOR_2, specialty_id=spec1.id, student_count=30),
                Group(name="ПИ-301", course=CourseEnum.BACHELOR_3, specialty_id=spec1.id, student_count=28),
                
                Group(name="ИИ-101", course=CourseEnum.BACHELOR_1, specialty_id=spec2.id, student_count=22),
                Group(name="ИИ-201", course=CourseEnum.BACHELOR_2, specialty_id=spec2.id, student_count=26),
                
                # ИФ
                Group(name="МС-101", course=CourseEnum.BACHELOR_1, specialty_id=spec3.id, student_count=35),
                Group(name="МС-102", course=CourseEnum.BACHELOR_1, specialty_id=spec3.id, student_count=40),
                Group(name="МС-301", course=CourseEnum.BACHELOR_3, specialty_id=spec3.id, student_count=32),
            ]
            session.add_all(groups)
            session.commit()
            
            # Потоки
            flow1 = Flow()  # Поток из ПИ-101 и ПИ-102
            flow2 = Flow()  # Поток из МС-101 и МС-102
            session.add_all([flow1, flow2])
            session.flush()
            
            # Добавление групп в потоки
            for group in [groups[0], groups[1]]:  # ПИ-101, ПИ-102
                session.add(FlowGroupLink(flow_id=flow1.id, group_id=group.id))
            
            for group in [groups[6], groups[7]]:  # МС-101, МС-102
                session.add(FlowGroupLink(flow_id=flow2.id, group_id=group.id))
            
            # Аудитории
            classrooms = [
                # Аудитории кафедр
                Classroom(name="А-101", capacity=30, faculty_id=faculty1.id, department_id=department1.id),
                Classroom(name="А-102", capacity=40, faculty_id=faculty1.id, department_id=department1.id),
                Classroom(name="Б-201", capacity=25, faculty_id=faculty1.id, department_id=department2.id),
                Classroom(name="К-105", capacity=35, faculty_id=faculty2.id, department_id=department3.id),
                
                # Аудитории факультетов
                Classroom(name="Лекторий-1", capacity=100, faculty_id=faculty1.id),
                Classroom(name="Лекторий-2", capacity=80, faculty_id=faculty2.id),
                Classroom(name="Компьютерный класс-1", capacity=20, faculty_id=faculty1.id),
                Classroom(name="Лаборатория-1", capacity=15, faculty_id=faculty2.id),
            ]
            session.add_all(classrooms)
            
            # Преподаватели
            teachers = [
                Teacher(full_name="Иванов Иван Иванович", department_id=department1.id),
                Teacher(full_name="Петрова Анна Сергеевна", department_id=department1.id),
                Teacher(full_name="Сидоров Алексей Владимирович", department_id=department2.id),
                Teacher(full_name="Козлова Мария Дмитриевна", department_id=department3.id),
                Teacher(full_name="Николаев Дмитрий Петрович", department_id=department3.id),
            ]
            session.add_all(teachers)
            
            # Предметы
            subjects = [
                Subject(name="Математический анализ", short_name="МатАн"),
                Subject(name="Программирование на Python", short_name="Python"),
                Subject(name="Базы данных", short_name="БД"),
                Subject(name="Машинное обучение", short_name="МО"),
                Subject(name="Теоретическая механика", short_name="ТерМех"),
                Subject(name="Сопротивление материалов", short_name="СопрМат"),
            ]
            session.add_all(subjects)
            session.commit()
            
            # Учебные планы
            curriculum = [
                # Для отдельных групп
                Curriculum(
                    subject_id=subjects[0].id,
                    hours=72,
                    primary_teacher_id=teachers[0].id,
                    group_id=groups[0].id  # ПИ-101
                ),
                Curriculum(
                    subject_id=subjects[1].id,
                    hours=108,
                    primary_teacher_id=teachers[1].id,
                    group_id=groups[2].id  # ПИ-201
                ),
                Curriculum(
                    subject_id=subjects[3].id,
                    hours=72,
                    primary_teacher_id=teachers[2].id,
                    group_id=groups[4].id  # ИИ-101
                ),
                
                # Для потоков
                Curriculum(
                    subject_id=subjects[0].id,
                    hours=144,
                    primary_teacher_id=teachers[0].id,
                    secondary_teacher_id=teachers[1].id,
                    flow_id=flow1.id  # Поток из ПИ-101 и ПИ-102
                ),
                Curriculum(
                    subject_id=subjects[4].id,
                    hours=108,
                    primary_teacher_id=teachers[3].id,
                    flow_id=flow2.id  # Поток из МС-101 и МС-102
                ),
                
                # Сложный случай (большой поток)
                Curriculum(
                    subject_id=subjects[5].id,
                    hours=72,
                    primary_teacher_id=teachers[4].id,
                    group_id=groups[8].id  # МС-301
                )
            ]
            session.add_all(curriculum)
            
            # Несколько существующих занятий в расписании
            existing_lessons = [
                Lesson(
                    week=1,
                    day=1,  # Понедельник
                    pair=1,
                    classroom_id=classrooms[0].id,
                    curriculum_id=curriculum[0].id,
                    lesson_type=LessonType.LECTURE
                ),
                Lesson(
                    week=1,
                    day=1,
                    pair=2,
                    classroom_id=classrooms[1].id,
                    curriculum_id=curriculum[1].id,
                    lesson_type=LessonType.LAB
                )
            ]
            session.add_all(existing_lessons)
            
            session.commit()

    def auto_schedule(self) -> None:
        '''Автоматическое составление расписания с учётом семестровой нагрузки'''
        with Session(self.engine) as session:
            # Сбор существующей занятости для недель 1 и 2
            busy_rooms = set()
            busy_teachers = set()
            busy_groups = set()
            
            # Загрузка существующих занятий в неделях 1 и 2
            existing_lessons = session.exec(
                select(Lesson)
                .where(Lesson.week.in_([1, 2]))
            ).all()
            
            for lesson in existing_lessons:
                curriculum = session.get(Curriculum, lesson.curriculum_id)
                if not curriculum:
                    continue
                    
                # Определение групп
                group_ids = []
                if curriculum.group_id:
                    group_ids = [curriculum.group_id]
                elif curriculum.flow_id:
                    flow_groups = session.exec(
                        select(FlowGroupLink.group_id)
                        .where(FlowGroupLink.flow_id == curriculum.flow_id)
                    ).all()
                    group_ids = [g[0] for g in flow_groups]
                
                # Преподаватели
                teacher_ids = [curriculum.primary_teacher_id]
                if curriculum.secondary_teacher_id:
                    teacher_ids.append(curriculum.secondary_teacher_id)
                
                # Обновление занятости
                for gid in group_ids:
                    busy_groups.add((lesson.week, lesson.day, lesson.pair, gid))
                for tid in teacher_ids:
                    busy_teachers.add((lesson.week, lesson.day, lesson.pair, tid))
                busy_rooms.add((lesson.week, lesson.day, lesson.pair, lesson.classroom_id))

            # Подготовка учебных планов
            curriculum_data = []
            all_curriculum = session.exec(select(Curriculum)).all()
            
            # Шаблоны занятий на двухнедельный цикл
            curriculum_templates = {
                72: [LessonType.LECTURE],  # 1 лекция за 2 недели
                108: [LessonType.LECTURE, LessonType.LAB],  # 1 лекция + 1 лаба
                144: [LessonType.LECTURE, LessonType.LAB, LessonType.LAB]  # 1 лекция + 2 лабы
            }
            
            for curr in all_curriculum:
                # Проверка допустимости часов
                if curr.hours not in curriculum_templates:
                    print(f"Недопустимое количество часов: {curr.hours} для curriculum_id={curr.id}")
                    continue
                    
                # Получаем шаблон занятий для данного количества часов
                template = curriculum_templates[curr.hours]
                
                # Подсчёт уже запланированных занятий каждого типа в цикле (недели 1 и 2)
                type_counter = {LessonType.LECTURE: 0, LessonType.LAB: 0}
                for lesson_type in template:
                    existing_count = session.scalar(
                        select(func.count(Lesson.id))
                        .where(Lesson.curriculum_id == curr.id)
                        .where(Lesson.week.in_([1, 2]))
                        .where(Lesson.lesson_type == lesson_type)
                    ) or 0
                    type_counter[lesson_type] = existing_count
                
                # Определяем, сколько занятий каждого типа нужно добавить
                needed_lessons = []
                for lesson_type in template:
                    # Сколько должно быть занятий этого типа
                    required_count = sum(1 for t in template if t == lesson_type)
                    # Сколько уже есть
                    current_count = type_counter[lesson_type]
                    # Сколько нужно добавить
                    to_add = required_count - current_count
                    
                    # Добавляем в список необходимых занятий
                    needed_lessons.extend([lesson_type] * to_add)
                
                if not needed_lessons:
                    continue
                    
                # Определение групп и вместимости
                group_ids = []
                capacity_required = 0
                if curr.group_id:
                    group = session.get(Group, curr.group_id)
                    if group:
                        group_ids = [group.id]
                        capacity_required = group.student_count
                elif curr.flow_id:
                    flow_groups = session.exec(
                        select(Group)
                        .join(FlowGroupLink, Group.id == FlowGroupLink.group_id)
                        .where(FlowGroupLink.flow_id == curr.flow_id)
                    ).all()
                    group_ids = [g.id for g in flow_groups]
                    capacity_required = sum(g.student_count for g in flow_groups)
                
                if not group_ids:
                    continue
                    
                # Подходящие аудитории
                classrooms = session.exec(
                    select(Classroom)
                    .where(Classroom.capacity >= capacity_required)
                ).all()
                classroom_ids = [c.id for c in classrooms]
                
                curriculum_data.append({
                    'obj': curr,
                    'needed_lessons': needed_lessons,
                    'groups': group_ids,
                    'teachers': [
                        t for t in [curr.primary_teacher_id, curr.secondary_teacher_id] 
                        if t is not None
                    ],
                    'classrooms': classroom_ids,
                    'capacity_req': capacity_required
                })
            
            # Сортировка по сложности (вместимость аудитории и количество групп)
            curriculum_data.sort(key=lambda x: (-x['capacity_req'], -len(x['groups'])))
            
            # Распределение занятий
            for item in curriculum_data:
                curr = item['obj']
                for lesson_type in item['needed_lessons']:
                    placed = False
                    for week in [1, 2]:
                        for day in range(1, 7):  # Пн-Сб
                            for pair in range(1, 9):  # 1-8 пары
                                # Проверка групп
                                if any(
                                    (week, day, pair, gid) in busy_groups 
                                    for gid in item['groups']
                                ):
                                    continue
                                    
                                # Проверка преподавателей
                                if any(
                                    (week, day, pair, tid) in busy_teachers 
                                    for tid in item['teachers']
                                ):
                                    continue
                                
                                # Поиск свободной аудитории
                                for room_id in item['classrooms']:
                                    if (week, day, pair, room_id) in busy_rooms:
                                        continue
                                    
                                    # Создание занятия
                                    new_lesson = Lesson(
                                        week=week,
                                        day=day,
                                        pair=pair,
                                        classroom_id=room_id,
                                        curriculum_id=curr.id,
                                        lesson_type=lesson_type
                                    )
                                    session.add(new_lesson)
                                    
                                    # Обновление занятости
                                    busy_rooms.add((week, day, pair, room_id))
                                    for gid in item['groups']:
                                        busy_groups.add((week, day, pair, gid))
                                    for tid in item['teachers']:
                                        busy_teachers.add((week, day, pair, tid))
                                    
                                    placed = True
                                    break
                                if placed:
                                    break
                            if placed:
                                break
                        if placed:
                            break
                    if not placed:
                        print(f"Не удалось разместить curriculum_id={curr.id} (тип: {lesson_type})")
                        
            session.commit()

    def find_collisions(self) -> dict:
        '''Поиск коллизий и окон в расписании'''
        with Session(self.engine) as session:
            # Загрузка всех занятий
            lessons = session.exec(select(Lesson)).all()
            
            # Структуры для анализа
            group_schedule = defaultdict(lambda: defaultdict(lambda: defaultdict(list)))
            teacher_schedule = defaultdict(lambda: defaultdict(lambda: defaultdict(list)))
            room_schedule = defaultdict(lambda: defaultdict(lambda: defaultdict(list)))
            
            # Заполнение структур
            for lesson in lessons:
                curriculum = session.get(Curriculum, lesson.curriculum_id)
                if not curriculum:
                    continue
                    
                # Определение групп
                group_ids = []
                if curriculum.group_id:
                    group_ids = [curriculum.group_id]
                elif curriculum.flow_id:
                    # Исправление: получение простого списка ID групп
                    flow_groups = session.exec(
                        select(FlowGroupLink.group_id)
                        .where(FlowGroupLink.flow_id == curriculum.flow_id)
                    ).all()
                    group_ids = [g for g, in flow_groups] if flow_groups and isinstance(flow_groups[0], tuple) else flow_groups
                
                # Преподаватели
                teacher_ids = [curriculum.primary_teacher_id]
                if curriculum.secondary_teacher_id:
                    teacher_ids.append(curriculum.secondary_teacher_id)
                
                # Заполнение данных
                for group_id in group_ids:
                    group_schedule[group_id][lesson.week][lesson.day].append((lesson.pair, lesson.id))
                
                for teacher_id in teacher_ids:
                    teacher_schedule[teacher_id][lesson.week][lesson.day].append((lesson.pair, lesson.id))
                
                room_schedule[lesson.classroom_id][lesson.week][lesson.day].append((lesson.pair, lesson.id))
            
            # Поиск ошибок (наложение занятий)
            errors = []
            
            # Для групп
            for group_id, weeks in group_schedule.items():
                for week, days in weeks.items():
                    for day, pairs in days.items():
                        pairs.sort()
                        for i in range(1, len(pairs)):
                            if pairs[i][0] == pairs[i-1][0]:
                                errors.append({
                                    "type": "group",
                                    "id": group_id,
                                    "week": week,
                                    "day": day,
                                    "pair": pairs[i][0],
                                    "lesson_ids": [pairs[i-1][1], pairs[i][1]]
                                })
            
            # Для преподавателей
            for teacher_id, weeks in teacher_schedule.items():
                for week, days in weeks.items():
                    for day, pairs in days.items():
                        pairs.sort()
                        for i in range(1, len(pairs)):
                            if pairs[i][0] == pairs[i-1][0]:
                                errors.append({
                                    "type": "teacher",
                                    "id": teacher_id,
                                    "week": week,
                                    "day": day,
                                    "pair": pairs[i][0],
                                    "lesson_ids": [pairs[i-1][1], pairs[i][1]]
                                })
            
            # Для аудиторий
            for room_id, weeks in room_schedule.items():
                for week, days in weeks.items():
                    for day, pairs in days.items():
                        pairs.sort()
                        for i in range(1, len(pairs)):
                            if pairs[i][0] == pairs[i-1][0]:
                                errors.append({
                                    "type": "classroom",
                                    "id": room_id,
                                    "week": week,
                                    "day": day,
                                    "pair": pairs[i][0],
                                    "lesson_ids": [pairs[i-1][1], pairs[i][1]]
                                })
            
            # Поиск окон
            group_windows = []
            teacher_windows = []
            
            # Для групп
            for group_id, weeks in group_schedule.items():
                for week, days in weeks.items():
                    for day, pairs in days.items():
                        pairs.sort()
                        for i in range(1, len(pairs)):
                            gap = pairs[i][0] - pairs[i-1][0] - 1
                            if gap > 0:
                                group_windows.append({
                                    "group_id": group_id,
                                    "week": week,
                                    "day": day,
                                    "window_start_pair": pairs[i-1][0],
                                    "window_end_pair": pairs[i][0],
                                    "window_size": gap
                                })
            
            # Для преподавателей
            for teacher_id, weeks in teacher_schedule.items():
                for week, days in weeks.items():
                    for day, pairs in days.items():
                        pairs.sort()
                        for i in range(1, len(pairs)):
                            gap = pairs[i][0] - pairs[i-1][0] - 1
                            if gap > 0:
                                teacher_windows.append({
                                    "teacher_id": teacher_id,
                                    "week": week,
                                    "day": day,
                                    "window_start_pair": pairs[i-1][0],
                                    "window_end_pair": pairs[i][0],
                                    "window_size": gap
                                })
            
            return {
                "errors": errors,
                "group_windows": group_windows,
                "teacher_windows": teacher_windows
            }


def get_database(db_string: str) -> Database:
    '''Проверяет, корректно ли введён параметр базы данных,
    возвращает объект БД'''
    try:
        return SQLDatabase(db_string)
    except Exception as e:
        raise TypeError(
            f'The database address is incorrect. Error: {e}'
        ) from e
