---
title: Logger и BaseLogger
category: API
---

# Классы Logger и BaseLogger

## BaseLogger

Абстрактный базовый класс, реализующий общую логику форматирования, проверки уровня и управления контекстом.

**Конструктор:**

```typescript
new BaseLogger(
  data: LoggerConstructor<Levels, BaseInput>,
  std?: Std
)
```

**Защищённые методы (доступны в наследниках):**

- `shouldLog(log: boolean, level: Levels): boolean` — определяет, нужно ли логировать сообщение.
- `applyContext(context: LoggerContext<Levels>): Required<LoggerContext<Levels>>` — объединяет базовый и переданный контекст.
- `applyReadListeners(listeners: LoggerReadListeners | undefined, handlers: PromiseFunctions): object` — настраивает слушатели для потокового ввода.
- `format(input: BaseInput[]): string` — применяет форматтер и аффиксы к массиву данных.

## Logger

Основной класс, наследующий `BaseLogger` и реализующий методы `execute` и `read`.

**Конструктор:**

```typescript
new Logger(
  data: LoggerConstructor<Levels, BaseInput>,
  std?: Std
)
```

**Методы:**

- `execute(input: InputParameter<BaseInput>, configuration: LoggerBaseConfigurationParameter<Levels>): Promise<string>`  
  Записывает лог-сообщение. Возвращает отформатированную строку.

- `read(input: InputParameter<BaseInput>, configuration: LoggerReadConfigurationParameter<Levels>): Promise<string>`  
  Выводит приглашение и ожидает ввод пользователя. Возвращает введённую строку (без символа перевода строки).

### Параметры конструктора (LoggerConstructor)

```typescript
type LoggerConstructor<Levels extends string, T = never> = {
  readonly timestampService: TimestampServiceType;
  readonly fileService: FileServiceType;
  readonly formatterHandler?: BaseFormatter<LoggerInput<T>, T>;
  readonly name: string;
  readonly userInputSettings?: Partial<UserInputSettings>;
  readonly baseLevels: LoggerLevels<Levels>;
  readonly baseContext?: BaseLoggerContext;
};
```

- `timestampService` — экземпляр сервиса временных меток.
- `fileService` — экземпляр файлового сервиса.
- `formatterHandler` — обработчик форматтеров (по умолчанию используется стандартный набор).
- `name` — имя логгера, будет добавляться как префикс.
- `userInputSettings` — настройки для пользовательского ввода (префикс и разделитель при записи в файл).
- `baseLevels` — настройки уровней логирования.
- `baseContext` — базовый контекст (флаги и разделитель).
