import type { WrapperType } from "../../types";

/**
 * Обёртка для временной метки, добавляющая квадратные скобки.
 * @category Классы
 * @group Утилиты
 */
export class TimestampWrapper implements WrapperType {
  /**
   * Оборачивает временную метку в квадратные скобки.
   * @param timestamp Строка временной метки.
   * @returns Строка вида `[timestamp]`.
   */
  public execute(timestamp: string): string {
    return `[${timestamp}]`;
  }
}
