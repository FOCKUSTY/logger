import type { BaseFormatter } from "../formatter";
import type {
  AffixHandlerType,
  BaseLoggerContext,
  FileServiceType,
  InputParameter,
  LevelLogMethod,
  LoggerBaseConfigurationParameter,
  LoggerConstructor,
  LoggerContext,
  LoggerInput,
  LoggerLevels,
  LoggerLogConfigurationParameter,
  LoggerReadConfigurationParameter,
  LoggerReadListeners,
  LoggerServiceType,
  PromiseFunctions,
  Std,
  TimestampServiceType,
  UserInputSettings,
} from "../types";

import {
  BASE_CONTEXT,
  DEFAULT_FORMATTER_HANDLER,
  DEFAULT_STD,
  EMPTY_STRING,
  USER_INPUT_REGEX,
  USER_INPUT_SETTINGS,
} from "../constants";

import { AffixHandler, NamePrefix, TimestampPrefix } from "../affix";

/**
 * Абстрактный базовый класс для логгеров.
 * Предоставляет общую логику: форматирование, проверку уровня логирования,
 * контекст, работу с файлом и стандартными потоками ввода/вывода.
 *
 * @template Levels – строковые литералы уровней логирования (например, 'info' | 'warn').
 * @template BaseInput – тип данных, которые могут быть переданы в логгер (по умолчанию never).
 * @category Абстракции
 * @group Логгер
 */
export abstract class BaseLogger<
  Levels extends Record<string, number> = Record<string, number>,
  BaseInput = never,
> implements LoggerServiceType<Levels, BaseInput> {
  private _reading: boolean = false;

  protected readonly _file_service?: FileServiceType;
  protected readonly _formatter_handler: BaseFormatter<
    LoggerInput<BaseInput>,
    BaseInput
  >;
  protected readonly _timestamp_service?: TimestampServiceType;
  protected readonly _levels: LoggerLevels<Levels>;
  protected readonly _context: BaseLoggerContext;
  protected readonly _standard: Std;
  /** Настройки форматирования пользовательского ввода (префикс, разделитель) при записи в файл. */
  protected readonly _user_input_settings: UserInputSettings;

  protected readonly _affix_handler: AffixHandlerType<
    [NamePrefix, TimestampPrefix]
  >;

  protected readonly _name: string;

  /**
   * Объект с методами для каждого уровня логирования.
   * Позволяет вызывать логгер напрямую через `logger.log[level](...)` вместо
   * `logger.execute(..., { context: { level } })`.
   *
   * @example
   * logger.log.info('Сервер запущен');
   * logger.log.error('Ошибка подключения', { context: { writeFile: true } });
   */
  public log: Record<keyof Levels, LevelLogMethod<Levels, BaseInput>>;

  /**
   * Создаёт экземпляр базового логгера.
   * @param {LoggerConstructor<Levels, BaseInput>} data параметры конструктора.
   * @param {Std} [std=DEFAULT_STD] стандартные потоки ввода/вывода.
   */
  public constructor(
    data: LoggerConstructor<Levels, BaseInput>,
    std: Std = DEFAULT_STD,
  ) {
    this._file_service = data.fileService;
    this._timestamp_service = data.timestampService;
    this._levels = data.baseLevels;
    this._name = data.name;

    this._formatter_handler =
      data.formatterHandler ?? DEFAULT_FORMATTER_HANDLER;
    this._context = data.baseContext ?? BASE_CONTEXT;
    this._user_input_settings = {
      ...USER_INPUT_SETTINGS,
      ...data.userInputSettings,
    };

    this._affix_handler = new AffixHandler([
      new NamePrefix({ separator: ": " }),
      new TimestampPrefix({ separator: " " }),
    ]);

    this.log = this.applyLogLevels();

    this._standard = std;
  }

  /**
   * Основной метод для записи лога. Реализуется в наследниках.
   * @param {InputParameter<BaseInput>} input данные для логирования (один или массив).
   * @param {LoggerBaseConfigurationParameter<Levels>} configuration настройки контекста.
   * @returns {Promise<string>} Отформатированная строка, которая была записана.
   */
  public abstract execute(
    input: InputParameter<BaseInput>,
    configuration: LoggerBaseConfigurationParameter<Levels>,
  ): Promise<string>;

  /**
   * Метод для чтения пользовательского ввода с интерактивным ожиданием.
   * @param {InputParameter<BaseInput>} input – данные, которые будут выведены перед запросом.
   * @param {LoggerReadConfigurationParameter<Levels>} configuration – настройки, включая контекст и слушатели.
   * @returns {Promise<string>} Введённая пользователем строка.
   */
  public abstract read(
    input: InputParameter<BaseInput>,
    configuration: LoggerReadConfigurationParameter<Levels>,
  ): Promise<string>;

  /**
   * Проверяет, не выполняется ли уже операция чтения.
   * @throws {Error} Если чтение уже активно.
   */
  protected validateRead(): true {
    if (this._reading) {
      throw new Error("Can not start read while other active");
    }

    return true;
  }

  /**
   * Определяет, нужно ли логировать сообщение на основе уровня и конфигурации.
   * @param {boolean} log флаг "логировать вообще" из контекста.
   * @param {Levels} level уровень текущего сообщения.
   * @returns {boolean} `true`, если логирование разрешено.
   */
  protected shouldLog(log: boolean, level: keyof Levels): boolean {
    return (
      log &&
      this._levels.levels[level] >= this._levels.levels[this._levels.level]
    );
  }

  /**
   * Применяет контекст, объединяя дефолтный, базовый и переданный.
   * @param {LoggerContext<Levels>} context – контекст из вызова.
   * @returns {Required<LoggerContext<Levels>>} Полный контекст со всеми полями.
   */
  protected applyContext(
    context: LoggerContext<Levels>,
  ): Required<LoggerContext<Levels>> {
    return {
      ...BASE_CONTEXT,
      ...this._context,
      ...context,
    };
  }

  /**
   * Настраивает слушатели для потокового ввода.
   * @param {LoggerReadListeners | undefined} listeners – колбэки.
   * @param {PromiseFunctions} handlers – resolve/reject для промиса.
   * @returns Объект с функциями-обработчиками и очисткой.
   */
  protected applyReadListeners(
    listeners: LoggerReadListeners | undefined,
    { resolve, reject }: PromiseFunctions,
  ) {
    const stdin = this._standard.input;

    const cleanup = () => {
      stdin.removeListener("readable", onReadable);
      stdin.removeListener("error", onError);
      stdin.removeListener("end", onEnd);
      stdin.removeListener("data", onData);

      stdin.pause();
    };

    const onReadable = async () => {
      try {
        listeners?.onReadable?.();

        const userInput: string = stdin.read();
        if (!userInput) {
          return reject(new Error("No user input resolved"));
        }

        const data = userInput.replace(USER_INPUT_REGEX, EMPTY_STRING);
        await this._file_service?.write(
          this._user_input_settings.prefix +
            this._user_input_settings.separator +
            data,
        );
        resolve(data);
        return cleanup();
      } catch (error) {
        return reject(error);
      }
    };

    const onError = (error: unknown) => {
      listeners?.onError?.(error);
      cleanup();
      return reject(error);
    };

    const onEnd = () => {
      listeners?.onEnd?.();
      cleanup();
      return reject(new Error("Stream ended without data"));
    };

    const onData = (chunk: unknown) => {
      listeners?.onData?.(chunk);
    };

    return {
      cleanup,
      onReadable,
      onError,
      onEnd,
      onData,
    };
  }

  /**
   * Форматирует массив входных данных в строку для вывода.
   * Последовательно применяет:
   * 1. Цепочку форматтеров (через `_formatter_handler`),
   * 2. Временную метку (через `_timestamp_service`),
   * 3. Аффиксы – имя логгера и временную метку (через `_affix_handler`).
   *
   * @param input Массив данных для форматирования (может содержать любые значения,
   *                поддерживаемые форматтерами).
   * @returns Отформатированная строка, готовая к записи в лог (без завершающего разделителя).
   * @protected
   */
  protected format(input: BaseInput[]) {
    const data = this._formatter_handler.execute(input);
    const timestamp = this._timestamp_service?.execute() ?? EMPTY_STRING;

    const text = this._affix_handler.execute([this._name, timestamp], data);
    return text;
  }

  private applyLogLevels(): Record<
    keyof Levels,
    LevelLogMethod<Levels, BaseInput>
  > {
    const levels = Object.keys(this._levels.levels) as (keyof Levels)[];
    const entries = levels.map((level) => {
      const method: LevelLogMethod<Levels, BaseInput> = (
        input,
        configuration,
      ) => {
        return this.execute(input, {
          ...configuration,
          context: {
            level,
            ...configuration?.context,
          },
        });
      };

      return [level, method];
    });

    return Object.fromEntries(entries) as Record<
      keyof Levels,
      LevelLogMethod<Levels, BaseInput>
    >;
  }
}
