### Hexlet tests and linter status:
[![Actions Status](https://github.com/kirillchistov/fullstack-javascript-project-4/actions/workflows/hexlet-check.yml/badge.svg)](https://github.com/kirillchistov/fullstack-javascript-project-4/actions)

## Загрузчик страниц (JS)
- Этот проект про глубокую проработку асинхронного кода. 
- PageLoader — утилита командной строки, которая скачивает страницы из интернета и сохраняет их на компьютере. 
- Вместе со страницей она скачивает все ресурсы (картинки, стили и js), давая возможность открывать страницу без интернета.
- [Демонстрация работы проекта](https://asciinema.org/a/dVKok25V5xW2SkjMF4LE8fZOw)

## Установка

```bash
npm install
npm link
```

## Запуск

```bash
page-loader --output /var/tmp https://ru.hexlet.io/courses
```

## Шаги и задачи

### Шаг 7
- [] 
- [] [Asciinema]()
### Шаг 6
- [] 
### Шаг 5
- [] 
- [] [Asciinema]()
### Шаг 4
- [x] Добавить в тесты проверку скачивания ресурсов и изменения HTML.
- [x] Реализовать скачивание всех локальных ресурсов со страницы.
- [x] Изменить HTML так, чтобы все ссылки на локальные ресурсы указывали на скачанные файлы.
- [x] Добавить в README аскинему с примером работы пакета. [Asciinema](https://asciinema.org/a/YAQKO63HBv3Pr7P2)
### Шаг 3
- [x] Добавить в тесты проверку скачивания изображений и изменения HTML.
- [x] Изменить HTML так, чтобы все ссылки указывали на скачанные файлы.
- [x] Добавить в ридми аскинему с примером работы пакета. [Asciinema](https://asciinema.org/a/NZ6ilWhfECCmwSW0)
### Шаг 2
- [x] Склонировать созданный репозиторий локально и инициализировать с именем @hexlet/code.
- [x] Выполнить все необходимые приготовления (Github Actions, SonarQube, Eslint, добавить бейджики в ридми).
- [x] Написать тесты (лучше до кода!).
- [x] Реализовать загрузку указанной страницы.
- [x] Поставить пакет, используя npm link, убедиться в том что он работает.
- [x] Добавить в Readme аскинему с примером работы пакета: [Asciinema](https://asciinema.org/a/q7f38Cf9zDavXoxS)

### Шаг 1
- [x] Подключиться к GitHub и [создать репозиторий](https://github.com/kirillchistov/fullstack-javascript-project-4)
- [x] Посмотреть [демо проекта](https://asciinema.org/a/dVKok25V5xW2SkjMF4LE8fZOw) и разобраться с идеей проекта / утилиты
- [x] Подготовить рабочее окружение к разработке
