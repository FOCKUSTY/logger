import type { LoggerInput } from "../types";

/**
 * Абстрактный класс для форматирования входных данных в строку.
 * @template Input – тип данных, которые умеет форматировать конкретный форматтер.
 * @template T – исходный тип (по умолчанию never), используется для связи с LoggerInput.
 * @category Абстракции
 * @group Форматтер
 */
export abstract class BaseFormatter<Input extends LoggerInput<T>, T = never> {
  /**
   * @param {string} separator разделитель между частями (по умолчанию '\\n').
   */
  public constructor(protected readonly separator: string = "\n") {}

  /**
   * Преобразует массив входных данных в строку, применяя `format` и соединяя разделителем.
   * @param {Input[]} input массив данных.
   * @returns {string} Строка, готовая к выводу.
   */
  public execute(input: Input[]): string {
    return this.format(input).join(this.separator);
  }

  /**
   * Разделяет массив данных на те, которые может обработать этот форматтер, и те, которые нет.
   * @param {LoggerInput[]} input исходный массив.
   * @returns Объект с полями `can` (обрабатываемые) и `cannot` (необрабатываемые).
   */
  public filter(input: LoggerInput[]): {
    can: Input[];
    cannot: LoggerInput[];
  } {
    const can: Input[] = [];
    const cannot: LoggerInput[] = [];

    for (const data of input) {
      if (this.canFormat(data)) {
        can.push(data as Input);
      } else {
        cannot.push(data);
      }
    }

    return { can, cannot };
  }

  /**
   * Проверяет, может ли форматтер обработать конкретное значение.
   * @param {LoggerInput} input проверяемое значение.
   * @returns {boolean} `true`, если форматирование возможно.
   */
  public abstract canFormat(input: LoggerInput): boolean;

  /**
   * Преобразует массив обработанных данных в массив строк.
   * @param {Input[]} input данные, для которых canFormat вернул true.
   * @returns {string[]} Массив строковых представлений.
   */
  protected abstract format(input: Input[]): string[];
}
