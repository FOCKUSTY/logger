/**
 * Контракт для обёртки строки.
 *
 * @category Типы
 * @group Утилиты
 */
export type WrapperType = {
  /**
   * Оборачивает переданную строку.
   * @param value - Строка для обёртки.
   * @returns Оборачиваемая строка.
   */
  execute(value: string): string;
};
