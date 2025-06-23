# Основной модуль приложения

import logging

from web import WebApp
from db.sql_db import get_database


LISTEN_HOST = '0.0.0.0'
DEFAULT_LISTEN_PORT = 8000


logging.basicConfig(
    level=logging.INFO, filename='log.log', filemode='a',
    format='%(asctime)s %(levelname)s %(message)s'
)


def main() -> int:
    '''Метод для запуска веб-API'''
    db = get_database('sqlite:///test_schedule.sqlite')
    #db.create_test_data()
    web_app = WebApp(db, (LISTEN_HOST, DEFAULT_LISTEN_PORT))
    web_app.serve()

if __name__ == '__main__':
    main()