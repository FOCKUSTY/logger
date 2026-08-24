---
title: FileService
category: API
---

# Класс FileService

Реализует интерфейс `FileServiceType`.

**Конструктор:**

```typescript
new FileService(data: FileServiceConstructor)
```

где `FileServiceConstructor`:

```typescript
type FileServiceConstructor = {
  readonly filePath: string;
};
```

**Методы:**

- `read(): Promise<string>` — читает всё содержимое файла.
- `write(data: string): Promise<boolean>` — добавляет строку в конец файла.
- `overwrite(data: string): Promise<void>` — перезаписывает файл новым содержимым.
- `delete(): Promise<void>` — удаляет файл.
- `close(): void` — закрывает поток записи.
- `exists(): Promise<boolean>` — проверяет существование файла (с кешированием).
- `getStream(): WriteStream` — возвращает внутренний поток записи (создаётся при первом вызове).

Сервис автоматически создаёт директорию для файла, если её нет. Поток записи открывается в режиме `append`.
