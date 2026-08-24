/**
 * Утилитарный тип для "приведения" пересечений к читаемому объектному типу.
 * Используется для улучшения отображения типов в IDE и сообщениях об ошибках.
 * @template T – исходный тип (обычно пересечение).
 * @example
 * type A = { a: number } & { b: string };
 * type B = Prettify<A>; // { a: number; b: string }
 * @category Типы
 * @group Утилиты
 */
export type Prettify<T> = {
  [K in keyof T]: T[K];
} & {};
