import type { LoggerInput } from "../types";
import { BaseFormatter } from "./base.formatter";

/**
 * Форматтер для ошибок (Error).
 * Преобразует ошибку в строку с именем, сообщением, причиной (cause) и стеком.
 * @category Классы
 * @group Форматтер
 */
export class ErrorFormatter extends BaseFormatter<Error> {
  public canFormat(input: LoggerInput): boolean {
    return input instanceof Error;
  }

  protected format(input: Error[]) {
    return input.map((error) => this.formatError(error));
  }

  /**
   * Форматирует одну ошибку в строку.
   * @param error Ошибка.
   * @returns Строка вида "[Имя]: сообщение (причина) \nстек".
   */
  protected formatError(error: Error) {
    const cause = error.cause ? `\n(${error.cause})` : "";
    const stack = error.stack ? `\n${error.stack}` : "";
    return `[${error.name}]: ${error.message}${cause}${stack}`;
  }
}
