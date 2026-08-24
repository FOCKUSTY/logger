import type { LoggerInput } from "../types";
import { EMPTY_STRING } from "../constants";
import { BaseFormatter } from "./base.formatter";

/**
 * Составной форматтер, который последовательно применяет массив форматтеров.
 * Каждый форматтер обрабатывает свою часть данных, оставшиеся необработанными
 * преобразуются через toString().
 * @category Классы
 * @group Форматтер
 */
export class FormatterHandler extends BaseFormatter<LoggerInput> {
  /**
   * @param {BaseFormatter<LoggerInput>[]} formatters – список форматтеров в порядке применения.
   */
  public constructor(
    private readonly formatters: BaseFormatter<LoggerInput>[],
  ) {
    super(EMPTY_STRING);
  }

  /**
   * Фильтрация не требуется: все данные передаются дальше.
   * @param input Входной массив.
   * @returns Объект с полем can (все входные данные) и пустым cannot.
   */
  public filter(input: LoggerInput[]) {
    return {
      can: input,
      cannot: [],
    };
  }

  /**
   * Всегда возвращает true, так как этот форматтер обрабатывает любые данные.
   * @returns true.
   */
  public canFormat(): boolean {
    return true;
  }

  protected format(input: LoggerInput[]): string[] {
    let loggerInput = [...input];

    const output: string[] = [];
    for (const formatter of this.formatters) {
      const { can, cannot } = formatter.filter(loggerInput);
      if (can.length === 0) {
        loggerInput = cannot;
        continue;
      }

      const text = formatter.execute(can);
      output.push(text);
      loggerInput = cannot;
    }

    if (loggerInput.length > 0) {
      output.push(
        ...loggerInput.map((value) => {
          if (!value) return `${value}`;

          return value.toString();
        }),
      );
    }

    return output;
  }
}
