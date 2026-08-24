---
title: Formatters
category: API
---

# Форматтеры

Форматтеры преобразуют массив входных данных в строку. Все форматтеры наследуют абстрактный класс `BaseFormatter`.

## BaseFormatter

```typescript
abstract class BaseFormatter<Input extends LoggerInput<T>, T = never> {
  public constructor(protected readonly separator: string = "\n") {}
  public execute(input: Input[]): string;
  public filter(input: LoggerInput[]): { can: Input[]; cannot: LoggerInput[] };
  public abstract canFormat(input: LoggerInput): boolean;
  protected abstract format(input: Input[]): string[];
}
```

- `execute` — применяет форматирование и соединяет результат через разделитель.
- `filter` — разделяет входной массив на те элементы, которые может обработать форматтер, и остальные.
- `canFormat` — проверяет, может ли форматтер обработать конкретное значение.
- `format` — преобразует массив обработанных данных в массив строк.

## DefaultFormatter

Вызывает `toString()` у объектов, которые имеют этот метод.

```typescript
class DefaultFormatter extends BaseFormatter<{ toString(): string }>
```

## ErrorFormatter

Форматирует ошибки в строку с именем, сообщением, причиной (cause) и стеком.

```typescript
class ErrorFormatter extends BaseFormatter<Error>
```

## NullableFormatter

Преобразует `null` и `undefined` в строки "null" и "undefined".

```typescript
class NullableFormatter extends BaseFormatter<Nullable>
```

## FormatterHandler

Составной форматтер, который применяет массив форматтеров последовательно. Каждый форматтер обрабатывает свою часть данных. Если после всех форматтеров остались необработанные данные, они преобразуются через `toString()`.

```typescript
class FormatterHandler extends BaseFormatter<LoggerInput> {
  public constructor(private readonly formatters: BaseFormatter<LoggerInput>[]);
}
```
