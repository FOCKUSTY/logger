import type { LoggerInput } from "../types";
import { BaseFormatter } from "./base.formatter";

/**
 * Форматтер для объектов, у которых есть метод toString().
 * Вызывает toString() у каждого элемента.
 * @category Классы
 * @group Форматтер
 */
export class DefaultFormatter extends BaseFormatter<{ toString(): string }> {
  public canFormat(input: LoggerInput): boolean {
    if (!input?.toString) {
      return false;
    }

    if (typeof input.toString !== "function") {
      return false;
    }

    return true;
  }

  /**
   * Преобразует массив объектов в строки, вызывая их метод toString().
   * @param input Массив объектов, имеющих метод toString().
   * @returns Массив строковых представлений.
   */
  protected format(input: { toString(): string }[]): string[] {
    return input.map((data) => data.toString());
  }
}
