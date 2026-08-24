import type { FileServiceConstructor, FileServiceType } from "../types";
import type { WriteStream } from "fs";

import { readFile, unlink, writeFile, access, mkdir } from "fs/promises";
import { createWriteStream } from "fs";
import { parse } from "path";

/**
 * Сервис для работы с одним файлом: чтение, запись (добавление в конец),
 * перезапись, удаление, проверка существования.
 *
 * Создаёт поток записи в режиме 'append' и автоматически создаёт директорию,
 * если её нет.
 *
 * @example
 * const fileService = new FileService({ filePath: './logs/app.log' });
 * await fileService.write('Log entry');
 * @category Классы
 * @group Файлы
 */
export class FileService implements FileServiceType {
  private _stream?: WriteStream;

  protected readonly _path: string;
  protected readonly _dir: string;

  private _exists: boolean = false;

  public constructor(data: FileServiceConstructor) {
    this._path = data.filePath;
    this._dir = parse(data.filePath).dir;

    process.once("exit", () => {
      this._stream?.destroy();
    });
  }

  /**
   * Читает всё содержимое файла.
   * @returns {Promise<string>} Содержимое файла в виде строки.
   * @throws {Error} Если файл не удаётся прочитать (например, нет прав).
   */
  public async read(): Promise<string> {
    await this.createIfNotExists();

    return readFile(this._path, { encoding: "utf-8" });
  }

  /**
   * Добавляет строку в конец файла (не перезаписывает).
   * @param {string} data – данные для записи.
   * @returns {Promise<boolean>} `true`, если запись выполнена успешно.
   */
  public async write(data: string): Promise<boolean> {
    await this.createIfNotExists();

    return this.stream.write(data);
  }

  /**
   * Полностью перезаписывает файл новым содержимым.
   * @param {string} data – новые данные.
   * @returns {Promise<void>}
   */
  public async overwrite(data: string): Promise<void> {
    await this.createIfNotExists();

    return writeFile(this._path, data, { encoding: "utf-8" });
  }

  /**
   * Удаляет файл.
   * @returns {Promise<void>}
   * @throws {Error} Если файл не существует или нет прав на удаление.
   */
  public async delete(): Promise<void> {
    await this.createIfNotExists();
    await unlink(this._path);
    this._exists = false;
  }

  /**
   * Закрывает поток записи.
   */
  public close() {
    return this.stream.close();
  }

  /**
   * Проверяет, существует ли файл на диске (с кешированием результата).
   * @returns {Promise<boolean>} `true`, если файл существует.
   */
  public async exists(): Promise<boolean> {
    if (this._exists) {
      return true;
    }

    try {
      await access(this._path);
      this._exists = true;
      return true;
    } catch (error) {
      return false;
    }
  }

  public get stream(): WriteStream {
    return this.getStream();
  }

  public getStream() {
    if (this._stream) {
      return this._stream;
    }

    const stream = createWriteStream(this._path, {
      flags: "a",
      encoding: "utf-8",
    });

    this._stream = stream;
    return stream;
  }

  private async createIfNotExists() {
    const exists = await this.exists();
    if (exists) {
      return;
    }

    await mkdir(this._dir, { recursive: true });
    await writeFile(this._path, "", { encoding: "utf-8" });
    this._exists = true;
    return;
  }
}
