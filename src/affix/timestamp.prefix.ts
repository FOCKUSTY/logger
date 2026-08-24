import type { AffixChildConstructor } from "../types";
import { BaseAffix } from "./base.affix";

/**
 * Аффикс-префикс, представляющий временную метку.
 * Использует разделитель и обёртку по умолчанию (без обёртки).
 * @category Классы
 * @group Аффиксы
 */
export class TimestampPrefix extends BaseAffix {
  /**
   * Создаёт префикс для временной метки.
   * @param data Конфигурация без поля type (автоматически устанавливается "prefix").
   */
  public constructor(data: AffixChildConstructor) {
    super({ type: "prefix", ...data });
  }
}
