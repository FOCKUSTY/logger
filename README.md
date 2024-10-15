# Logger

Простой вывод выших сообщений в консоль

![Static Badge](https://img.shields.io/badge/fockusty-logger-logger)
![GitHub top language](https://img.shields.io/github/languages/top/fockusty/logger)
![GitHub](https://img.shields.io/github/license/fockusty/logger)
![GitHub Repo stars](https://img.shields.io/github/stars/fockusty/logger)
![GitHub issues](https://img.shields.io/github/issues/fockusty/logger)

![Logotype](./assets/logger.logo.svg)

### Установка (Windows, npm/pnpm)

1. Локально

```
npm install --save fock-logger --latest
```

или

```
pnpm install --save fock-logger --latest
```

2. Глобально

```
npm install --global --save fock-logger --latest
```

или

```
pnpm install --global --save fock-logger --latest
```

<hr>

## Примеры

```ts
import Logger, { Colors } from "f-logger"

/* dir - Ваша рут-папка */
/* loggerName - Название вашего логгера */
const dir = "./"
const loggerName = "The Void" /* MY-APP-NAME */

/* Первый logger - бесцветный */
/* Второй logger - с цветами, первый цвет - цвет логгера, второй цвет - цвет сообщения */
const loggerNO_COLOR = new Logger(loggerName, dir)
const loggerCOLOR = new Logger(loggerName, dir, [Colors.magenta, Colors.reset])

/* Если вы хотите вывести бесцветное сообщение в чат, просто введите текст */
loggerNO_COLOR.execute("Hello, World !")
// \u001B[35mThe Void\u001B[0m: \u001B[0mHello, World !\u001B[0m (The Void: Hello, World!)

loggerCOLOR.execute("Hello, World !")
// \u001B[35mThe Void\u001B[0m: \u001B[0mHello, World!\u001B[0m (The Void: Hello, World!)

loggerCOLOR.execute("Hello, World !", Colors.magenta)
// \u001B[35mThe Void\u001B[0m: \u001B[35m0mHello, World!\u001B[0m (The Void: Hello, World!)
```

# Если

-   Если возникли проблемы или сложности, создайте [обсуждение](https://github.com/fockusty/logger/issues/new/choose) в репозитории
-   Если Вы заметили проблемы в коде, пишите мне в [Discord](https://discord.gg/5MJrRjzPec) или в [Telegram](https://t.me/FOCKUSTY)

<div align="center">
    <img src="./assets/logger.banner.svg" alt="banner">
</div>
