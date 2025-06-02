#
#
#

'''Модуль отвечает за определение методов веб-API'''

from typing import Tuple, Optional

import uvicorn

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from db.main_db import Database, CourseEnum, LessonType


ListenParams = Tuple[str, int]


class WebApp:
    '''Класс для настройки веб-API'''
    def __init__(self, db: Database, listen_params: ListenParams) -> None:
        self.db = db
        self.listen_params = listen_params
        self.app = FastAPI()

        origins = [
            'http://localhost:5173',
            'localhost:5173'
        ]

        self.app.add_middleware(
            CORSMiddleware,
            allow_origins=origins,
            allow_credentials=True,
            allow_methods=['*'],
            allow_headers=['*']
        )

        self.app.add_api_route(
            '/structural_divizion',
            self.add_structural_divizion,
            methods=["POST"]
        )
        self.app.add_api_route(
            '/speciality', self.add_speciality, methods=["POST"]
        )
        self.app.add_api_route('/group', self.add_group, methods=["POST"])
        self.app.add_api_route('/teacher', self.add_teacher, methods=["POST"])
        self.app.add_api_route(
            '/classroom', self.add_classroom, methods=["POST"]
        )
        self.app.add_api_route('/subject', self.add_subject, methods=["POST"])
        self.app.add_api_route(
            '/subject', self.db.get_subjects, methods=["GET"]
        )
        self.app.add_api_route('/flow', self.add_flow, methods=["POST"])
        self.app.add_api_route('/flow', self.db.get_flows, methods=["GET"])
        self.app.add_api_route(
            '/curriculum', self.add_lesson_to_plan, methods=["POST"]
        )
        self.app.add_api_route(
            '/curriculum', self.db.get_curriculum, methods=["GET"]
        )
        self.app.add_api_route(
            '/schedule', self.add_lesson_to_schedule, methods=["POST"]
        )
        self.app.add_api_route(
            '/schedule', self.db.get_schedule, methods=["GET"]
        )
        self.app.add_api_route(
            '/schedule', self.edit_schedule_cell, methods=["PUT"]
        )
        self.app.add_api_route(
            '/schedule', self.remove_schedule_cell, methods=["DELETE"]
        )
        self.app.add_api_route('/university_data', self.db.get_university_data)

    def add_structural_divizion(
        self,
        name: str,
        short_name: Optional[str] = None,
        parent_id: Optional[int] = None
    ) -> int:
        '''Добавляет структурное подразделение. Если родительского подразделения
        не существует или подразделеие с таким названием уже есть -
        возвращает ошибку 404'''
        try:
            return self.db.add_structural_divizion(parent_id, name, short_name)
        except ValueError as exc:
            raise HTTPException(status_code=404, detail=exc.message) from exc

    def add_speciality(
        self,
        department_id: int,
        name: str
    ) -> int:
        '''Добавляет специальность. Если родительского подразделения
        не существует или специальность с таким названием уже есть -
        возвращает ошибку 404'''
        try:
            return self.db.add_speciality(department_id, name)
        except ValueError as exc:
            raise HTTPException(status_code=404, detail=exc.message) from exc

    def add_group(
        self,
        speciality_id: int,
        name: str,
        course: CourseEnum,
        student_count: int
    ) -> int:
        '''Добавляет группу. Если специальности не существует или группа с таким
        именем уже есть - возвращает ошибку 404'''
        try:
            return self.db.add_group(speciality_id, name, course, student_count)
        except ValueError as exc:
            raise HTTPException(status_code=404, detail=exc.message) from exc

    def add_teacher(
        self,
        department_id: int,
        name: str
    ) -> int:
        '''Добавляет преподавателя. Если родительской кафедры не существует или
        преподаватель с таким ФИО уже есть - возвращает ошибку 404'''
        try:
            return self.db.add_teacher(department_id, name)
        except ValueError as exc:
            raise HTTPException(status_code=404, detail=exc.message) from exc

    def add_classroom(
        self,
        faculty_id: int,
        name: str,
        capacity: int,
        department_id: Optional[int] = None
    ) -> int:
        '''Добавляет аудиторию. Если родительского факультета, кафедры не
        существует или аудитория с таким номером уже есть -
        возвращает ошибку 404'''
        try:
            return self.db.add_classroom(
                faculty_id, department_id, name, capacity
            )
        except ValueError as exc:
            raise HTTPException(status_code=404, detail=exc.message) from exc

    def add_subject(
        self,
        name: str,
        short_name: str
    ) -> int:
        '''Добавляет предмет. Если предмет с таким названием уже есть -
        возвращает ошибку 404. Сокращённое название может быть неуникально'''
        try:
            return self.db.add_subject(name, short_name)
        except ValueError as exc:
            raise HTTPException(status_code=404, detail=exc.message) from exc

    def add_flow(self, groups: list[str]) -> int:
        '''Добавляет поток (список групп). Если в потоке есть несуществующие
        группы - возвращает ошибку 404'''
        try:
            return self.db.add_flow(groups)
        except ValueError as exc:
            raise HTTPException(status_code=404, detail=exc.message) from exc

    def add_lesson_to_plan(
        self,
        subject_id: int,
        hours: int,
        primary_teacher_id: int,
        secondary_teacher_id: Optional[int] = None,
        group_id: Optional[int] = None,
        flow_id: Optional[int] = None
    ) -> int:
        '''Добавляет занятие в учебный план.
        Возвращает ошибку 404 если:
        
        - Предмета, одного из преподавателей, группы или потока нет в БД

        - Указаны и группа, и поток, либо не указано ни то, ни другое
        
        - У группы/потока уже есть такой предмет'''
        try:
            return self.db.add_lesson_to_plan(
                subject_id, hours, primary_teacher_id,
                secondary_teacher_id, group_id, flow_id
            )
        except ValueError as exc:
            raise HTTPException(status_code=404, detail=exc.message) from exc

    def add_lesson_to_schedule(
        self,
        week: int,
        day: int,
        pair: int,
        classroom_id: int,
        curriculum_id: int,
        lesson_type: LessonType
    ) -> int:
        '''Добавляет ячейку расписания. Если аудитории или занятия из учебного
        плана не существует либо параметр не корректен - возвращает ошибку 404.

        Параметры:
        
        - week (неделя) - 1 либо 2

        - day (день) - от 1 до 6 (понедельник - 1, суббота - 6)

        - pair (номер пары) - от 1 до 8'''
        try:
            return self.db.add_lesson_to_schedule(
                week, day, pair, classroom_id, curriculum_id, lesson_type
            )
        except ValueError as exc:
            raise HTTPException(status_code=404, detail=exc.message) from exc

    def edit_schedule_cell(
        self,
        id: int,
        classroom_id: int,
        curriculum_id: int,
        lesson_type: LessonType
    ) -> None:
        '''Изменяет ячейку расписания с заданным id'''
        try:
            return self.db.edit_schedule_cell(
                id, classroom_id, curriculum_id, lesson_type
            )
        except ValueError as exc:
            raise HTTPException(status_code=404, detail=exc.message) from exc

    def remove_schedule_cell(self, id: int) -> None:
        '''Удаляет ячейку расписания с заданным id'''
        try:
            return self.db.remove_schedule_cell(id)
        except ValueError as exc:
            raise HTTPException(status_code=404, detail=exc.message) from exc

    def serve(self) -> None:
        '''Начинает обслуживание сервера-API'''
        host, port = self.listen_params
        uvicorn.run(self.app, host=host, port=port)
