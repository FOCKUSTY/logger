import type { Affix, AffixConstructor, AffixType, WrapperType } from "../types";
import { EmptyWrapper } from "../services";

/**
 * Базовый класс для аффикса (префикса или суффикса).
 * Аффикс добавляет обёртку (например, скобки) и разделитель к строке.
 * @category Классы
 * @group Аффиксы
 */
export class BaseAffix implements AffixType {
  protected readonly separator: string;
  protected readonly type: Affix;
  protected readonly wrapper: WrapperType;

  /**
   * Создаёт аффикс с заданными параметрами.
   * @param data Конфигурация аффикса: тип, разделитель, опциональная обёртка.
   */
  public constructor(data: AffixConstructor) {
    this.separator = data.separator;
    this.type = data.type;
    this.wrapper = data.wrapper ?? new EmptyWrapper();
  }

  /**
   * Применяет аффикс к строке: добавляет аффикс как префикс или суффикс с разделителем.
   * @param affix Строка аффикса (например, "[timestamp]").
   * @param value Исходная строка.
   * @returns Строка с добавленным аффиксом.
   */
  public execute(affix: string, value: string): string {
    const wrappedAffix = this.wrapper.execute(affix);
    if (this.type === "prefix") {
      return this.connect(wrappedAffix, value);
    }

    return this.connect(value, wrappedAffix);
  }

  /**
   * Соединяет две строки через разделитель.
   * @param value1 - Первая часть.
   * @param value2 - Вторая часть.
   * @returns Результат конкатенации с разделителем.
   */
  public connect(value1: string, value2: string) {
    return value1 + this.separator + value2;
  }
}
