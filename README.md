### Hexlet tests and linter status:
[![Actions Status](https://github.com/kirillchistov/fullstack-javascript-project-4/actions/workflows/hexlet-check.yml/badge.svg)](https://github.com/kirillchistov/fullstack-javascript-project-4/actions)

[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=kirillchistov_fullstack-javascript-project-4&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=kirillchistov_fullstack-javascript-project-4)

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

## Запуск с логами:

```bash
DEBUG=page-loader,axios page-loader --output /var/tmp https://ru.hexlet.io/courses
```

Пример для тестов:
```bash
DEBUG=page-loader,axios,nock.* npm test
```

## Шаги и задачи

### Шаг 7
- [x] Добавить библиотеку listr в проект, используйте флаг одновременной загрузки.
- [x] Добавить отображение прогресса закачки ресурсов в терминал.
- [x] Проверить что приложение проходит все тесты (втч SonarQube)
- [x] Добавить .gitignore и пр. по чек-листу автопроверки
- [x] Добавить localhost в разрешенные домены
- [x] Добавить в ридми аскинему с примером установки пакета и его работы. [Asciinema](https://asciinema.org/a/4gPEiWjlJHs6uqtA)
### Шаг 6
- [x] Написать тесты на ошибочные ситуации.
- [x] При загрузке страницы и ресурсов, должны учитываться все возможные сетевые проблемы и http-ответы, не равные 200. В случае ошибок нужно пользователю выводить сообщение о том какая возникла проблема и с каким ресурсом.
- [x] Невозможность проведения файловых операций также должна приводить к нормальной остановке и показу дружелюбного сообщения пользователю. В первую очередь это касается ошибок доступа, а так же отсутствия директории назначения.
- [x] Добавить в ридми аскинему с примером работы, в процессе которой произошла ошибка. [Asciinema](https://asciinema.org/a/wZFR5rvM7kAZXOY0)
### Шаг 5
- [x] Включить логирование axios.
- [x] Включить логирование nock.
- [x] Добавить библиотеку debug в проект.
- [x] Включить логирование в библиотеке под неймспейсом page-loader.
- [x] Добавить в ридми аскинему с примером логирования. [Asciinema](https://asciinema.org/a/NqrE4AVP0BMtkJhU)
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
