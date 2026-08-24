import type { TurnableConstructor, TurnableType } from "../types";

/**
 * @category Абстракции
 * @group Утилиты
 */
export abstract class Turnable<Type, Return = Type> implements TurnableType<
  Type,
  Return
> {
  private _enabled: boolean = true;

  public constructor(data?: TurnableConstructor) {
    this._enabled = data?.use ?? true;
  }

  public get enabled() {
    return this._enabled;
  }

  public execute(value: Type, use?: boolean): Return {
    if (use === false) {
      return this.fallback(value);
    }

    if (!this._enabled) {
      return this.fallback(value);
    }

    return this.run(value);
  }

  public turn(on: boolean): void {
    this._enabled = on;
  }

  public enable(): void {
    return this.turn(true);
  }

  public disable(): void {
    return this.turn(false);
  }

  /**
   * Возвращает значение, используемое, когда функциональность отключена.
   * @param value Исходное значение.
   * @returns Значение-заглушка.
   */
  protected abstract fallback(value: Type): Return;

  /**
   * Выполняет основную логику преобразования, когда функциональность включена.
   * @param value Исходное значение.
   * @returns Преобразованное значение.
   */
  protected abstract run(value: Type): Return;
}
