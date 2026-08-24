import type { AffixChildConstructor } from "../types";
import { BaseAffix } from "./base.affix";

/**
 * Аффикс-префикс, представляющий имя логгера.
 * Использует разделитель и обёртку по умолчанию (без обёртки).
 * @category Классы
 * @group Аффиксы
 */
export class NamePrefix extends BaseAffix {
  /**
   * Создаёт префикс для имени.
   * @param data Конфигурация без поля type (автоматически устанавливается "prefix").
   */
  public constructor(data: AffixChildConstructor) {
    super({ type: "prefix", ...data });
  }
}
