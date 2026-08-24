import type { WrapperType } from "./wrapper.type";

/**
 * Тип аффикса: префикс или суффикс.
 * @category Типы
 * @group Аффиксы
 */
export type Affix = "prefix" | "suffix";

/**
 * Вспомогательный тип для приведения массива типов к массиву строк.
 * @category Типы
 * @group Утилиты
 */
export type AllToString<T extends unknown[]> = {
  [P in keyof T]: string;
};

/**
 * @category Типы
 * @group Аффиксы
 */
export type AffixHandlerType<Affixes extends AffixType[]> = {
  execute(affixes: AllToString<Affixes>, value: string): string;
};

/**
 * Контракт для отдельного аффикса.
 * @category Типы
 * @group Аффиксы
 */
export type AffixType = {
  /**
   * Применяет аффикс к строке.
   * @param affix - Строка аффикса.
   * @param value - Исходная строка.
   * @returns Результирующая строка.
   */
  execute(affix: string, value: string): string;
};

/**
 * Параметры конструктора базового аффикса.
 * @category Типы
 * @group Аффиксы
 */
export type AffixConstructor = {
  readonly type: Affix;
  readonly separator: string;
  readonly wrapper?: WrapperType;
};

/**
 * Параметры конструктора для аффикса-наследника (без поля type).
 * @category Типы
 * @group Аффиксы
 */
export type AffixChildConstructor = Omit<AffixConstructor, "type">;
