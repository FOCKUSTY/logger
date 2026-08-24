import type { LoggerInput, Nullable } from "../types";
import { BaseFormatter } from "./base.formatter";

/**
 * Форматтер для null и undefined.
 * Возвращает строку "null" или "undefined".
 * @category Классы
 * @group Форматтер
 */
export class NullableFormatter extends BaseFormatter<Nullable> {
  public canFormat(input: LoggerInput): boolean {
    if (input === null) {
      return true;
    }

    if (input === undefined) {
      return true;
    }

    return false;
  }

  protected format(input: Nullable[]): string[] {
    return input.map((data) => this.formatNullable(data));
  }

  /**
   * Форматирует одно значение null/undefined.
   * @param input Значение.
   * @returns Строковое представление (использует шаблонную строку).
   */
  protected formatNullable(input: Nullable) {
    return `${input}`;
  }
}
