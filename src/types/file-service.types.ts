/**
 * Параметры конструктора для создания экземпляра FileService.
 * @category Типы
 * @group Файлы
 */
export type FileServiceConstructor = {
  /** Абсолютный или относительный путь к целевому файлу. */
  readonly filePath: string;
};

/**
 * Интерфейс сервиса для работы с файлом.
 * Предоставляет методы чтения, записи (добавления), перезаписи, удаления
 * и закрытия потока.
 * @category Типы
 * @group Файлы
 */
export type FileServiceType = {
  /**
   * Читает всё содержимое файла в виде строки.
   * @returns {Promise<string>} Содержимое файла.
   */
  read(): Promise<string>;

  /**
   * Добавляет строку в конец файла (не перезаписывая существующие данные).
   * @param {string} data – данные для записи.
   * @returns {Promise<boolean>} `true`, если запись прошла успешно.
   */
  write(data: string): Promise<boolean>;

  /**
   * Полностью перезаписывает файл новым содержимым.
   * @param {string} data – новые данные.
   * @returns {Promise<void>}
   */
  overwrite(data: string): Promise<void>;

  /**
   * Удаляет файл с диска.
   * @returns {Promise<void>}
   * @throws {Error} Если файл не существует или нет прав.
   */
  delete(): Promise<void>;

  /**
   * Закрывает внутренний поток записи.
   */
  close(): void;
};
