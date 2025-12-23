# Мессенджер для обмена сообщениями

Проект представляет собой веб-приложение на Django, с возможность обмена сообщениями в личных и групповых чатах.

Серверная часть поставляется вместе с клиентской нереактивной.

### Требования
- Python 3.12 (тестировалось на Python 3.12.10)
- PostgreSQL (17)

### Установка серверной части
    - git clone https://github.com/Sukhar1922/Messenger.git
    - cd Messenger/server/
    - cp .env.example .env
    - nano .env (Указать настройки БД)
    - python3 -m venv venv
    - pip install -r requirements.txt
    - cd Messenger
    - python3 manage.py migrate
    - python3 manage.py createsuperuser

### Запуск на тестовом сервере
    - daphne Messenger.asgi:application

После запуска на тестовом сервере, сервис будет доступен по http://127.0.0.1:8000

### Пути для серверной части
- `/` - Главная страница клиентской части
- `admin/` - Админ панель
- `api/` - API
- `api/docs/swagger/` - Swagger