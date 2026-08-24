import type { LoggerInput } from "./logger-service.types";

/**
 * Контракт для форматтера.
 * Форматтер преобразует массив входных данных в строку.
 * @category Типы
 * @group Форматтер
 */
export type Formatter = {
  /**
   * Основной метод форматирования.
   * @param {LoggerInput[]} input – массив значений для форматирования.
   * @returns {string} Готовая строка.
   */
  execute(input: LoggerInput[]): string;
};
