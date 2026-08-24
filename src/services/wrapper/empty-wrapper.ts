import type { WrapperType } from "../../types";

/**
 * Реализация обёртки, которая возвращает значение без изменений.
 * @category Классы
 * @group Утилиты
 */
export class EmptyWrapper implements WrapperType {
  /**
   * Возвращает переданное значение без изменений.
   * @param value Исходная строка.
   * @returns Та же строка.
   */
  public execute(value: string): string {
    return value;
  }
}
