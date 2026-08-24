---
title: Affixes
category: API
---

# Аффиксы

Аффиксы — это префиксы или суффиксы, добавляемые к сообщению. Они реализуют интерфейс `AffixType`.

## BaseAffix

Базовый класс для аффикса.

```typescript
class BaseAffix implements AffixType {
  public constructor(data: AffixConstructor);
  public execute(affix: string, value: string): string;
  public connect(value1: string, value2: string): string;
}
```

- `execute` — добавляет аффикс (префикс или суффикс) с разделителем.
- `connect` — соединяет две строки через разделитель.

## NamePrefix

Префикс для имени логгера.

```typescript
class NamePrefix extends BaseAffix {
  public constructor(data: AffixChildConstructor);
}
```

## TimestampPrefix

Префикс для временной метки.

```typescript
class TimestampPrefix extends BaseAffix {
  public constructor(data: AffixChildConstructor);
}
```

## AffixHandler

Применяет массив аффиксов к строке в заданном порядке.

```typescript
class AffixHandler<const Affixes extends BaseAffix[]> {
  public constructor(private readonly affixes: Affixes);
  public execute(affixes: AllToString<Affixes>, value: string): string;
}
```
