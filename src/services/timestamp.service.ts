import type {
  TimestampConstructor,
  TimestampServiceType,
  WrapperType,
} from "../types";

import { TimestampWrapper } from "./wrapper";
import { EMPTY_STRING } from "../constants";
import { Turnable } from "../utility";

/**
 * Сервис для генерации строковых представлений текущего времени.
 * Может быть использован для логирования, именования файлов и других задач.
 *
 * @example
 * const ts = new TimestampService({
 *   formatter: (date) => date.toLocaleString('ru-RU'),
 * });
 * console.log(ts.execute()); // "29.03.2025, 12:34:56"
 * @category Классы
 * @group Фундамент
 */
export class TimestampService
  extends Turnable<Date, string>
  implements TimestampServiceType
{
  private readonly formatter: (date: Date) => string;
  private readonly wrapper: WrapperType;

  /**
   * @param {TimestampConstructor} data – настройки форматирования.
   */
  public constructor(data: TimestampConstructor = {}) {
    super();

    this.wrapper = data.wrapper ?? new TimestampWrapper();

    if (data.formatter) {
      this.formatter = data.formatter;
      return;
    }

    if (data.locale || data.timeZone) {
      this.formatter = (date) => {
        const formatter = new Intl.DateTimeFormat(data.locale ?? "default", {
          timeZone: data.timeZone,
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: false,
        });
        return formatter.format(date);
      };
      return;
    }

    this.formatter = (date) => date.toISOString();
  }

  /**
   * Генерирует строку текущего времени.
   * @returns {string} Отформатированная временная метка.
   */
  protected run(date: Date = new Date()): string {
    const timestamp = this.formatter(date);
    return this.wrapper.execute(timestamp);
  }

  protected fallback(): string {
    return EMPTY_STRING;
  }
}
