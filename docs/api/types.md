---
title: Types
category: API
---

# Типы и интерфейсы

Основные типы экспортируются из пакета. Ниже приведены наиболее важные.

## LoggerInput

Тип данных, которые можно передать в логгер. Может быть объектом с `toString()`, `null`/`undefined`, ошибкой или пользовательским типом `T`.

```typescript
type LoggerInput<T = never> = Prettify<
  { toString(): string } | Nullable | Error | T
>;
```

## LoggerLevels

Настройки уровней логирования.

```typescript
export type LoggerLevels<Levels extends Record<string, number>> = {
  readonly levels: Levels;
  readonly level: keyof Levels;
};
```

## LoggerContext

Контекст вызова (включает уровень и флаги).

```typescript
type LoggerContext<Levels extends Record<string, number>> =
  BaseLoggerContext & {
    readonly level: keyof Levels;
  };
```

## BaseLoggerContext

Базовая часть контекста.

```typescript
type BaseLoggerContext = {
  readonly separator?: string;
  readonly writeFile?: boolean;
  readonly log?: boolean;
};
```

## LoggerConstructor

Параметры конструктора логгера.

```typescript
type LoggerConstructor<Levels extends Record<string, number>, T = never> = {
  readonly timestampService?: TimestampServiceType;
  readonly fileService?: FileServiceType;
  readonly formatterHandler?: BaseFormatter<LoggerInput<T>, T>;
  readonly name: string;
  readonly userInputSettings?: Partial<UserInputSettings>;
  readonly baseLevels: LoggerLevels<Levels>;
  readonly baseContext?: BaseLoggerContext;
};
```

## UserInputSettings

Настройки для пользовательского ввода.

```typescript
type UserInputSettings = {
  readonly prefix: string;
  readonly separator: string;
};
```

## FileServiceType

Интерфейс файлового сервиса.

```typescript
type FileServiceType = {
  read(): Promise<string>;
  write(data: string): Promise<boolean>;
  overwrite(data: string): Promise<void>;
  delete(): Promise<void>;
  close(): void;
};
```

## TimestampServiceType

Интерфейс сервиса временных меток.

```typescript
type TimestampServiceType = {
  execute(date?: Date): string;
};
```

## WrapperType

Интерфейс для обёртки строки.

```typescript
type WrapperType = {
  execute(value: string): string;
};
```

## TurnableType

Интерфейс для включаемых/выключаемых компонентов.

```typescript
type TurnableType<Type, Return = Type> = {
  readonly enabled: boolean;
  execute(value: Type, use?: boolean): Return;
  enable(): void;
  disable(): void;
  turn(on: boolean): void;
};
```

## Affix, AffixType, AffixHandlerType

Типы для аффиксов.

```typescript
type Affix = "prefix" | "suffix";
type AffixType = { execute(affix: string, value: string): string };
type AffixHandlerType<Affixes extends AffixType[]> = {
  execute(affixes: AllToString<Affixes>, value: string): string;
};
```

## InputParameter

Входной параметр для методов `execute` и `read`.

```typescript
type InputParameter<T = never> = LoggerInput<T> | LoggerInput<T>[];
```

## LoggerReadListeners и LoggerReadConfigurationParameter

Настройки для метода `read`.

```typescript
type LoggerReadListeners = {
  onReadable?: () => void;
  onError?: (error: unknown) => void;
  onEnd?: () => void;
  onData?: (chunk: unknown) => void;
  onStart?: () => void;
};

type LoggerReadListenersParameter = {
  listeners?: (input: ReadStream) => LoggerReadListeners;
};

type LoggerReadConfigurationParameter<Levels extends string> =
  LoggerBaseConfigurationParameter<Levels> & LoggerReadListenersParameter;
```
