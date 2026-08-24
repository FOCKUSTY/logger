---
title: Кастомизация
category: Руководство
---

# Расширение и кастомизация

## Создание собственного форматтера

Наследуйте `BaseFormatter` и реализуйте `canFormat` и `format`.

```typescript
class MyCustomFormatter extends BaseFormatter<{ custom: string }> {
  public canFormat(input: LoggerInput): boolean {
    return input && typeof input === "object" && "custom" in input;
  }

  protected format(input: { custom: string }[]): string[] {
    return input.map((item) => `[CUSTOM] ${item.custom}`);
  }
}
```

Затем подключите его в `FormatterHandler`:

```typescript
const handler = new FormatterHandler([
  new MyCustomFormatter(),
  new ErrorFormatter(),
  new DefaultFormatter(),
]);
```

## Создание собственного аффикса

Наследуйте `BaseAffix` и переопределите конструктор с нужным типом:

```typescript
class MyPrefix extends BaseAffix {
  public constructor(data: AffixChildConstructor) {
    super({ type: "prefix", ...data });
  }
}
```

## Включение/выключение компонентов

`TimestampService` и любые другие, наследующие `Turnable`, можно включать/выключать:

```typescript
timestampService.disable();
// Теперь временные метки не добавляются
```

## Создание собственного сервиса

Вы можете реализовать интерфейсы `FileServiceType` или `TimestampServiceType` и передать их в конструктор логгера.

## Использование кастомного форматтера для пользовательского ввода

При вызове `read` вы можете передать собственные данные в `input`, которые будут отформатированы через тот же `formatterHandler`.
