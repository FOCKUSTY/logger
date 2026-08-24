---
title: К прочтению
category: Руководство
---

# fock-logger

Простой, гибкий и расширяемый логгер для ваших pet-проектов.

## Особенности

- Логирование в консоль и/или файл (с автоматическим созданием директорий).
- Уровни логирования (настраиваемые, с фильтрацией по приоритету).
- Интерактивный ввод — метод `read()` для запроса данных от пользователя.
- Форматирование — встроенные форматтеры для ошибок, null/undefined, toString() и цепочка кастомных форматтеров.
- Временные метки — настраиваемый формат (локали, часовые пояса или собственная функция).
- Префиксы/суффиксы — легко добавить имя логгера или другую информацию к каждому сообщению.
- Включаемые/выключаемые компоненты (например, временные метки можно отключить).
- Написано на TypeScript — полная типизация и поддержка IDE.

## Установка

```bash
npm install fock-logger
```

## Быстрый старт

```typescript
import { Logger, FileService, TimestampService } from "fock-logger";

// 1. Создаём сервисы
const fileService = new FileService({ filePath: "./logs/app.log" });
const timestampService = new TimestampService({
  timeZone: "Europe/Moscow",
  locale: "ru-RU",
});

// 2. Определяем уровни логирования
const levels = {
  levels: { debug: 0, info: 1, warn: 2, error: 3 },
  level: "info", // текущий уровень (будут выводиться только >= info)
};

// 3. Создаём логгер
const logger = new Logger({
  name: "my-app",
  fileService, // опционально
  timestampService, // опционально
  baseLevels: levels,
  baseContext: { log: true, writeFile: true }, // по умолчанию пишем и в консоль, и в файл
});

// 4. Логируем
await logger.execute("Сервер запущен", { context: { level: "info" } });
// или: await logger.log.info("Сервер запущен");

// 5. Читаем ввод пользователя
const answer = await logger.read("Как вас зовут?", {
  context: { level: "info" },
});
console.log(`Привет, ${answer}!`);
```

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
const levels: LoggerLevels<"debug" | "info" | "warn" | "error"> = {
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

## Лицензия

MIT © [FOCKUSTY](https://github.com/FOCKUSTY)

## Содействие

Пожалуйста, ознакомьтесь с [CONTRIBUTING.md](./CONTRIBUTING.md) перед отправкой pull request. Мы придерживаемся соглашения LAF и принципов SOLID.
