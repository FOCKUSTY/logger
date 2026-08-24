---
title: Быстрый старт
category: Руководство
---

# Быстрый старт

Создайте экземпляр логгера, настройте сервисы и начните логировать:

```typescript
import type { LoggerLevels } from "fock-logger";
import { Logger, FileService, TimestampService } from "fock-logger";

// 1. Сервис для записи в файл
const fileService = new FileService({ filePath: "./logs/app.log" });

// 2. Сервис временных меток (с московским временем)
const timestampService = new TimestampService({
  timeZone: "Europe/Moscow",
  locale: "ru-RU",
});

// 3. Уровни логирования
const levels: LoggerLevels<{ debug: 0; info: 1; warn: 2; error: 3 }> = {
  levels: { debug: 0, info: 1, warn: 2, error: 3 },
  level: "info", // будут выводиться только info и выше
};

// 4. Логгер
const logger = new Logger({
  name: "my-app",
  fileService,
  timestampService,
  baseLevels: levels,
  baseContext: { log: true, writeFile: true },
});

// 5. Логирование
await logger.execute("Приложение запущено", { context: { level: "info" } });
// или: await logger.log.info("Сервер запущен");

// 6. Чтение пользовательского ввода
const userName = await logger.read("Введите ваше имя:", {
  context: { level: "info" },
});
console.log(`Привет, ${userName}!`);
```

Подробнее о настройке и возможностях читайте в следующих разделах.
