export type LoggerName<T extends string> =
    'Commands' |
    'Events'   |
    'Fail'     |
    'Loader'   |
    'Updater'  |
    T;