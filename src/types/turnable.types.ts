/**
 * Контракт для объектов, которые можно включать/выключать.
 * @template Type - Тип входного значения.
 * @template Return - Тип возвращаемого значения (по умолчанию Type).
 * @category Типы
 * @group Утилиты
 */
export type TurnableType<Type, Return = Type> = {
  readonly enabled: boolean;

  /**
   * Выполняет преобразование, если включено, иначе возвращает fallback.
   * @param value - Входное значение.
   * @param use - Флаг принудительного использования (если false, всегда fallback).
   * @returns Результат.
   */
  execute(value: Type, use?: boolean): Return;

  /** Включает функциональность. */
  enable(): void;
  /** Выключает функциональность. */
  disable(): void;
  /** Устанавливает состояние включения/выключения. */
  turn(on: boolean): void;
};

/**
 * Параметры конструктора для включения/выключения.
 * @category Типы
 * @group Утилиты
 */
export type TurnableConstructor = {
  readonly use?: boolean;
};
