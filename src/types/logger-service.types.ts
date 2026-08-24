import type { FileServiceType } from "./file-service.types";
import type { ReadStream, WriteStream } from "tty";
import type { BaseFormatter } from "../formatter";
import type { Prettify } from "./prettify.type";
import type { TimestampServiceType } from "./timestamp-service.types";

/**
 * Стандартные потоки ввода/вывода (заимствованы из Node.js).
 * @category Типы
 * @group Фундамент
 */
export type Std = {
  /** Поток вывода (обычно stdout). */
  readonly output: WriteStream;
  /** Поток ввода (обычно stdin). */
  readonly input: ReadStream;
};

/**
 * Настройки форматирования пользовательского ввода при записи в файл.
 * Используются в методе read для добавления префикса перед введёнными данными.
 * @category Типы
 * @group Утилиты
 */
export type UserInputSettings = {
  /** Строка, добавляемая перед пользовательским вводом (например, "User:"). */
  readonly prefix: string;
  /** Разделитель между префиксом и самим вводом (например, пробел). */
  readonly separator: string;
};

/**
 * Параметры для создания логгера (конструктора).
 * @template Levels строковые литералы уровней логирования.
 * @template T тип дополнительных данных, которые могут передаваться в логгер.
 * @category Типы
 * @group Логгер
 */
export type LoggerConstructor<
  Levels extends Record<string, number>,
  T = never,
> = {
  readonly timestampService?: TimestampServiceType;
  /** Сервис для работы с файлом лога. */
  readonly fileService?: FileServiceType;
  /** Форматтер, используемый по умолчанию (необязательно). */
  readonly formatterHandler?: BaseFormatter<LoggerInput<T>, T>;

  readonly name: string;

  /**
   * Настройки форматирования пользовательского ввода при записи в файл.
   * Используются в методе read для добавления префикса перед введёнными данными.
   */
  readonly userInputSettings?: Partial<UserInputSettings>;
  /** Базовые настройки уровней логирования. */
  readonly baseLevels: LoggerLevels<Levels>;
  /** Базовый контекст (флаги, разделитель) необязательно. */
  readonly baseContext?: BaseLoggerContext;
};

/**
 * Тип, представляющий значения null или undefined.
 * @category Типы
 * @group Утилиты
 */
export type Nullable = null | undefined;

/**
 * Тип данных, которые могут быть переданы в логгер.
 * Это может быть:
 * - объект с методом toString()
 * - null или undefined
 * - ошибка (Error)
 * - произвольный тип T (обычно используется для кастомизации)
 *
 * @template T пользовательский тип (по умолчанию never).
 * @category Типы
 * @group Логгер
 */
export type LoggerInput<T = never> = Prettify<
  | {
      toString(): string;
    }
  | Nullable
  | Error
  | T
>;

/**
 * Функции resolve и reject для Promise, используемые в асинхронных операциях.
 * @template T тип результата.
 * @category Типы
 * @group Утилиты
 */
export type PromiseFunctions<T = unknown> = {
  resolve(value: T): void;
  reject(reason?: any): void;
};

/**
 * Входной параметр для методов execute и read.
 * Может быть как одним значением, так и массивом значений.
 * @template T тип данных (по умолчанию never).
 * @category Типы
 * @group Утилиты
 */
export type InputParameter<T = never> = LoggerInput<T> | LoggerInput<T>[];

/**
 * Настройки уровней логирования.
 * @template Levels строковые литералы уровней.
 * @category Типы
 * @group Логгер
 */
export type LoggerLevels<Levels extends Record<string, number>> = {
  /** Соответствие уровня его числовому приоритету (чем больше число, тем важнее). */
  readonly levels: Levels;
  /** Текущий активный уровень: сообщения с меньшим приоритетом игнорируются. */
  readonly level: keyof Levels;
};

/**
 * Базовый контекст логирования (общий для всех вызовов).
 * Определяет, куда и как выводить лог.
 * @category Типы
 * @group Логгер
 */
export type BaseLoggerContext = {
  /** Разделитель между частями сообщения (по умолчанию '\\n'). */
  readonly separator?: string;
  /** Записывать ли лог в файл. */
  readonly writeFile?: boolean;
  /** Выводить ли лог в консоль (stdout). */
  readonly log?: boolean;
};

/**
 * Полный контекст логирования для конкретного вызова.
 * Объединяет базовый контекст с обязательным указанием уровня.
 * @template Levels уровни логирования.
 * @category Типы
 * @group Логгер
 */
export type LoggerContext<Levels extends Record<string, number>> =
  BaseLoggerContext & {
    /** Уровень, с которым логируется текущее сообщение. */
    readonly level: keyof Levels;
  };

/**
 * Слушатели событий при чтении пользовательского ввода (в методе read).
 * @category Типы
 * @group Логгер
 */
export type LoggerReadListeners = {
  /** Вызывается, когда поток ввода готов к чтению. */
  onReadable?: () => void;
  /** Вызывается при ошибке потока. */
  onError?: (error: unknown) => void;
  /** Вызывается, когда поток завершён. */
  onEnd?: () => void;
  /** Вызывается при поступлении порции данных (chunk). */
  onData?: (chunk: unknown) => void;
  /** Вызывается в самом начале перед выводом приглашения. */
  onStart?: () => void;
};

/**
 * Параметры слушателей для метода read.
 * @category Типы
 * @group Логгер
 */
export type LoggerReadListenersParameter = {
  /**
   * Функция, которая принимает поток ввода и возвращает объект слушателей.
   * @param {ReadStream} input поток stdin.
   * @returns {LoggerReadListeners} Набор колбэков.
   */
  listeners?: (input: ReadStream) => LoggerReadListeners;
};

/**
 * Параметры конфигурации для метода execute.
 * @template Levels уровни логирования.
 * @category Типы
 * @group Логгер
 */
export type LoggerBaseConfigurationParameter<
  Levels extends Record<string, number>,
> = {
  /** Контекст вызова (уровень, флаги). */
  readonly context: LoggerContext<Levels>;
};

/**
 * Параметры конфигурации для методов логирования конкретного уровня
 * (используются в поле `log`).
 * В отличие от базовой конфигурации, уровень (`level`) не требуется,
 * так как он уже определён вызываемым методом (например, `logger.log.info`).
 *
 * @template Levels строковые литералы уровней логирования.
 * @category Типы
 * @group Логгер
 */
export type LoggerLogConfigurationParameter<
  Levels extends Record<string, number>,
> = {
  /**
   * Контекст вызова (без поля `level`).
   * Может содержать флаги `log`, `writeFile` и `separator`.
   */
  readonly context?: Omit<LoggerContext<Levels>, "level">;
};

/**
 * Тип функции для логирования на конкретном уровне.
 * Используется в свойстве `log` экземпляра логгера для вызова без явного указания уровня.
 *
 * @template Levels строковые литералы уровней логирования.
 * @template BaseInput - тип входных данных (по умолчанию `never`).
 *
 * @param input Данные для логирования (одно значение или массив).
 * @param configuration Дополнительная конфигурация (контекст без поля `level`).
 * @returns Promise с отформатированной строкой, которая была записана.
 *
 * @example
 * // Использование внутри логгера:
 * logger.log.info('Сообщение');
 * logger.log.warn('Предупреждение', { context: { writeFile: true } });
 *
 * @category Типы
 * @group Логгер
 */
export type LevelLogMethod<
  Levels extends Record<string, number>,
  BaseInput = never,
> = (
  input: InputParameter<BaseInput>,
  configuration?: LoggerLogConfigurationParameter<Levels>,
) => Promise<string>;

/**
 * Параметры конфигурации для метода read.
 * Расширяют базовые параметры возможностью задать слушатели.
 * @template Levels уровни логирования.
 * @category Типы
 * @group Логгер
 */
export type LoggerReadConfigurationParameter<
  Levels extends Record<string, number>,
> = LoggerBaseConfigurationParameter<Levels> & LoggerReadListenersParameter;

/**
 * Основной контракт сервиса логирования.
 * @template Levels уровни логирования.
 * @template Input тип входных данных (по умолчанию never).
 * @category Типы
 * @group Логгер
 */
export type LoggerServiceType<
  Levels extends Record<string, number> = Record<string, number>,
  Input = never,
> = {
  /**
   * Запись лог-сообщения.
   * @param {InputParameter<Input>} input данные для логирования.
   * @param {LoggerBaseConfigurationParameter<Levels>} configuration настройки.
   * @returns {Promise<string>} Отформатированная строка, которая была записана.
   */
  execute(
    input: InputParameter<Input>,
    configuration: LoggerBaseConfigurationParameter<Levels>,
  ): Promise<string>;

  /**
   * Вывод приглашения и чтение пользовательского ввода.
   * @param {InputParameter<Input>} input данные, выводимые перед запросом.
   * @param {LoggerReadConfigurationParameter<Levels>} configuration настройки и слушатели.
   * @returns {Promise<string>} Строка, введённая пользователем.
   */
  read(
    input: InputParameter<Input>,
    configuration: LoggerReadConfigurationParameter<Levels>,
  ): Promise<string>;
};
