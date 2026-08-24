import type { AffixHandlerType, AllToString } from "../types";
import type { BaseAffix } from "./base.affix";

/**
 * Обработчик аффиксов, применяющий массив аффиксов к строке в заданном порядке.
 * @template Affixes - тип массива аффиксов (экземпляров BaseAffix).
 * @category Классы
 * @group Аффиксы
 */
export class AffixHandler<
  const Affixes extends BaseAffix[],
> implements AffixHandlerType<Affixes> {
  /**
   * Создаёт обработчик с указанными аффиксами.
   * @param affixes - Массив аффиксов, которые будут применяться последовательно.
   */
  public constructor(private readonly affixes: Affixes) {}

  /**
   * Применяет все аффиксы к исходной строке.
   * @param affixes - Массив строковых представлений аффиксов (порядок соответствует конструктору).
   * @param value - Исходная строка для обработки.
   * @returns Строка после применения всех аффиксов.
   */
  public execute(affixes: AllToString<Affixes>, value: string): string {
    let string = value;

    for (const index in affixes) {
      const affix = affixes[index];
      string = this.affixes[index].execute(affix, string);
    }

    return string;
  }
}
