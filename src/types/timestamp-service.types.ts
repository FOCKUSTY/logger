import type { WrapperType } from "./wrapper.type";

/**
 * Опции для создания экземпляра TimestampService.
 * @category Типы
 * @group Сервисы
 */
export type TimestampFormatterOptions =
  | {
      readonly formatter: (date: Date) => string;
      readonly locale?: undefined;
      readonly timeZone?: undefined;
    }
  | {
      readonly formatter?: undefined;
      readonly locale?: string;
      readonly timeZone: string;
    }
  | {
      readonly formatter?: undefined;
      readonly locale?: undefined;
      readonly timeZone?: undefined;
    };

/**
 * @category Типы
 * @group Сервисы
 */
export type TimestampConstructor = TimestampFormatterOptions & {
  wrapper?: WrapperType;
};

/**
 * Интерфейс сервиса временных меток.
 * @category Типы
 * @group Сервисы
 */
export type TimestampServiceType = {
  /**
   * Возвращает текущую временную метку в виде строки.
   * @returns {string} Строка, представляющая текущее время.
   */
  execute(date?: Date): string;
};
