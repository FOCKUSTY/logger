# Logger

Простой вывод выших сообщений в консоль

![Static Badge](https://img.shields.io/badge/fockusty-logger-logger)
![GitHub top language](https://img.shields.io/github/languages/top/fockusty/logger)
![GitHub](https://img.shields.io/github/license/fockusty/logger)
![GitHub Repo stars](https://img.shields.io/github/stars/fockusty/logger)
![GitHub issues](https://img.shields.io/github/issues/fockusty/logger)

![Logotype](./assets/logger.logo.svg)

### Установка (Windows, npm)

```
npm install fock-logger@latest
```

<hr>

## Примеры

```ts
import Logger, { Colors } from "f-logger";

/* dir - Ваша рут-папка */
/* loggerName - Название вашего логгера */
const dir = "./";
const loggerName = "The Void"; /* MY-APP-NAME */

/* Первый logger - бесцветный */
/* Второй logger - с цветами, первый цвет - цвет логгера, второй цвет - цвет сообщения */
const loggerNO_COLOR = new Logger(loggerName, dir);
const loggerCOLOR = new Logger(loggerName, dir, [Colors.magenta, Colors.reset]);

/* Если вы хотите вывести бесцветное сообщение в чат, просто введите текст */
loggerNO_COLOR.execute("Hello, World !");
// \u001B[35mThe Void\u001B[0m: \u001B[0mHello, World !\u001B[0m (The Void: Hello, World!)

loggerCOLOR.execute("Hello, World !");
// \u001B[35mThe Void\u001B[0m: \u001B[0mHello, World!\u001B[0m (The Void: Hello, World!)

loggerCOLOR.execute("Hello, World !", Colors.magenta);
// \u001B[35mThe Void\u001B[0m: \u001B[35m0mHello, World!\u001B[0m (The Void: Hello, World!)
```

# config-файл
config-файл называется `.loggercfg`, его можно создать автоматически:

```ts
import { Configurator } from "fock-logger";

new Configurator(true);
```

Стандартный файл выглядит так:
```json
{
    "dir": "./",
    "level": "info",
    "deletion_interval": 7,
    "colors": [
        "\u001b[0m",
        "\u001b[0m"
    ],
    "loggers": {
        "Success": {
            "name": "Success",
            "colors": [
                "\u001b[31m",
                "\u001b[32m"
            ]
        },
        "Fail": {
            "name": "Fail",
            "colors": [
                "\u001b[31m",
                "\u001b[31m"
            ]
        }
    }
}
```

Рассмотрим подробнее

1. `dir` - Ваша папка, где будет лежать config-файл `.loggercfg`, и папка `log`, принимает значения типа: `string`.
2. `level` - Уровень логирования в консоли, `info` - Вся информация, `warn` - Предупреждения, `err` - Ошибки, принимает значения типа: `string`.
3. `deletion_interval` - Промежуток удаления лога, принимает значение типа `number`, отображает количесто дней (Количество дней, после которых лог удалится)
4. `colors` - Стандартные цвета для логгера, принимает значения типа: `[Colors, Colors]`.
5. `loggers` - Ваши логгеры, принимает значения типа: `LoggersNameType` (`{[key: string]: {name: string, colors: [Colors, Colors]}}`).

## Внимание!
- Если у Вас есть файл `loggers.json` логгеры не будут записываться в конфиг.
- Чтобы их записывать в конфиг, удалите файл `loggers.json`.
- Или иначе, если Вам конфиг не нужен и Вас устраивают стандартные значение, то ничего не делаете, `loggers.json` сам создаться с предустановленными настройками.

# Если

- Если возникли проблемы или сложности, создайте [обсуждение](https://github.com/fockusty/logger/issues/new/choose) в репозитории
- Если Вы заметили проблемы в коде, пишите мне в [Discord](https://discord.gg/5MJrRjzPec) или в [Telegram](https://t.me/FOCKUSTY)

<div align="center">
    <img src="./assets/logger.banner.svg" alt="banner">
</div>
