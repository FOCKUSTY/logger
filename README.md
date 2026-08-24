---
title: К прочтению
category: Руководство
---

<!-- Banner -->
<p align="center">
  <img src="./assets/logger.banner.svg" alt="fock-logger banner" width="100%">
</p>

# fock-logger

Простой, гибкий и расширяемый логгер для ваших pet-проектов.

[![Static Badge](https://img.shields.io/badge/fockusty-logger-logger?style=for-the-badge&logo=npm&color=blue)](https://www.npmjs.com/package/fock-logger)
[![GitHub top language](https://img.shields.io/github/languages/top/fockusty/logger?style=for-the-badge)](https://github.com/fockusty/logger)
[![GitHub license](https://img.shields.io/github/license/fockusty/logger?style=for-the-badge)](LICENSE)
[![CI](https://img.shields.io/github/actions/workflow/status/fockusty/logger/publish.yaml?style=for-the-badge)](https://github.com/fockusty/logger/actions)

[![npm version](https://img.shields.io/npm/v/fock-logger?style=for-the-badge)](https://www.npmjs.com/package/fock-logger)
[![npm downloads](https://img.shields.io/npm/dt/fock-logger?style=for-the-badge)](https://www.npmjs.com/package/fock-logger)

---

## Установка

```bash
npm install fock-logger
```

---

## Особенности

- Логирование в консоль и/или файл (с автоматическим созданием директорий).
- Настраиваемые уровни логирования с фильтрацией по приоритету.
- Интерактивный ввод — метод `read()` для запроса данных от пользователя.
- Гибкое форматирование: встроенные форматтеры для ошибок, `null`/`undefined`, `toString()` и цепочка кастомных форматтеров.
- Временные метки с поддержкой локалей, часовых поясов или собственной функции форматирования.
- Добавление префиксов/суффиксов (например, имя логгера или метка времени).
- Возможность включать/выключать отдельные компоненты (например, временные метки).
- Полная типизация и поддержка IDE.

---

## Быстрый старт

```typescript
import { Logger, FileService, TimestampService } from "fock-logger";

// 1. Создаём сервисы (оба опциональны)
const fileService = new FileService({ filePath: "./logs/app.log" });
const timestampService = new TimestampService({
  timeZone: "Europe/Moscow",
  locale: "ru-RU",
});

// 2. Определяем уровни логирования
const levels = {
  levels: { debug: 0, info: 1, warn: 2, error: 3 },
  level: "info", // будут выводиться только info и выше
};

// 3. Создаём логгер
const logger = new Logger({
  name: "my-app",
  fileService,
  timestampService,
  baseLevels: levels,
  baseContext: { log: true, writeFile: true },
});

// 4. Логируем
await logger.execute("Сервер запущен", { context: { level: "info" } });
// или с использованием свойства `log`:
await logger.log.info("Сервер запущен");

// 5. Читаем ввод пользователя
const userName = await logger.read("Введите ваше имя:", {
  context: { level: "info" },
});
console.log(`Привет, ${userName}!`);
```

---

## API

### Основные классы

- **`Logger`** — основной класс. Наследует `BaseLogger` и реализует методы `execute` и `read`.
- **`BaseLogger`** — абстрактный базовый класс с общей логикой (форматирование, контекст, уровни).
- **`FileService`** — работа с файлом лога (чтение, запись, перезапись, удаление).
- **`TimestampService`** — генерация временных меток с поддержкой локалей и часовых поясов.
- **`FormatterHandler`** — цепочка форматтеров, применённых к данным.
- **`AffixHandler`** — добавление префиксов/суффиксов (например, имя логгера и временная метка).

### Настройка уровней логирования

```typescript
const levels = {
  levels: {
    debug: 0,
    info: 1,
    warn: 2,
    error: 3,
  },
  level: "info",
};
```

### Контекст вызова

При каждом вызове `execute` или `read` можно передать контекст:

```typescript
{
  context: {
    level: 'warn',        // уровень для данного сообщения
    log: true,            // выводить в консоль
    writeFile: true,      // записывать в файл
    separator: '\n'       // разделитель между частями сообщения
  }
}
```

### Кастомный форматтер

```typescript
import { BaseFormatter, LoggerInput, FormatterHandler } from "fock-logger";

class MyFormatter extends BaseFormatter<{ custom: string }> {
  public canFormat(input: LoggerInput): boolean {
    return input && typeof input === "object" && "custom" in input;
  }

  protected format(input: { custom: string }[]): string[] {
    return input.map((item) => `[CUSTOM] ${item.custom}`);
  }
}

const formatterHandler = new FormatterHandler([
  new MyFormatter(),
  new DefaultFormatter(),
]);

const logger = new Logger({
  // ...
  formatterHandler,
});
```

### Отключение временных меток

```typescript
const timestampService = new TimestampService();
timestampService.disable(); // или timestampService.turn(false);

// Теперь execute() будет возвращать строку без временной метки
```

---

## Ссылки

Пакет: [npm/fock-logger](https://www.npmjs.com/package/fock-logger)
Документация: [fockusty.github.io/logger](https://fockusty.github.io/logger)

## Лицензия

MIT © [FOCKUSTY](https://github.com/FOCKUSTY)

## Содействие

Пожалуйста, ознакомьтесь с [CONTRIBUTING.md](./CONTRIBUTING.md) перед отправкой pull request. Мы придерживаемся соглашения LAF и принципов SOLID.

---

<p align="center">
  <img src="./assets/logger.logo.svg" alt="fock-logger logo" width="200">
</p>
