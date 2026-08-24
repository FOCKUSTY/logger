---
title: TimestampService
category: API
---

# Класс TimestampService

Генерирует временные метки. Наследуется от `Turnable<Date, string>`, поэтому может быть включён/выключен.

**Конструктор:**

```typescript
new TimestampService(data?: TimestampConstructor)
```

где `TimestampConstructor`:

```typescript
type TimestampConstructor = TimestampFormatterOptions & {
  wrapper?: WrapperType;
};

type TimestampFormatterOptions =
  | {
      formatter: (date: Date) => string;
      locale?: undefined;
      timeZone?: undefined;
    }
  | { formatter?: undefined; locale?: string; timeZone: string }
  | { formatter?: undefined; locale?: undefined; timeZone?: undefined };
```

- Если передан `formatter`, используется он.
- Если переданы `locale` и `timeZone`, используется `Intl.DateTimeFormat`.
- Иначе используется `date.toISOString()`.

**Методы:**

- `execute(date?: Date): string` — возвращает строку с временной меткой. Если дата не передана, используется текущая.
- `enable()`, `disable()`, `turn(on: boolean)` — управление включением.

По умолчанию `TimestampService` включён. При выключении `execute` возвращает пустую строку.
