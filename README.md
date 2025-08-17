# Minimal WebSocket Server

Минимальный WebSocket сервер, созданный с использованием Bun и TypeScript.

## Возможности

- 🔌 WebSocket соединения в реальном времени
- 📡 Простой HTTP endpoint для проверки работы сервера
- 🏓 Ping/Pong для проверки соединения
- 📤 Broadcast сообщения всем клиентам
- 🔄 Echo функциональность
- 📊 Отслеживание подключений/отключений

## Требования

- [Bun](https://bun.sh/) (версия 1.0.0 или выше)

## Установка

1. Установите зависимости:
```bash
bun install
```

## Запуск

### Режим разработки (с автоперезагрузкой)
```bash
bun run dev
```

### Продакшн режим
```bash
bun run start
```

## Использование

### HTTP Endpoint
- **URL**: `http://localhost:3000/`
- **Описание**: Простая страница с информацией о сервере

### WebSocket Endpoint
- **URL**: `ws://localhost:3000/ws`
- **Протокол**: WebSocket

## API

### Типы сообщений

#### От клиента к серверу:
- `ping` - проверка соединения
- `echo` - отправка сообщения и получение эха
- `broadcast` - отправка сообщения всем клиентам

#### От сервера к клиенту:
- `welcome` - приветственное сообщение при подключении
- `client_connected` - уведомление о новом участнике
- `client_disconnected` - уведомление об отключении участника
- `pong` - ответ на ping
- `echo` - эхо для echo сообщений
- `broadcast` - сообщение от другого клиента

## Примеры использования

### Подключение WebSocket клиента
```javascript
const ws = new WebSocket('ws://localhost:3000/ws');

ws.onopen = () => {
    console.log('Connected to server');
};

ws.onmessage = (event) => {
    const message = JSON.parse(event.data);
    console.log('Received:', message);
};

// Отправка ping
ws.send(JSON.stringify({
    type: 'ping',
    data: { timestamp: Date.now() },
    timestamp: Date.now()
}));

// Отправка echo
ws.send(JSON.stringify({
    type: 'echo',
    data: { message: 'Hello World' },
    timestamp: Date.now()
}));

// Broadcast сообщение
ws.send(JSON.stringify({
    type: 'broadcast',
    data: { message: 'Hello everyone!' },
    timestamp: Date.now()
}));
```

## Структура проекта

```
guessword_server/
├── src/
│   └── index.ts          # Основной файл сервера
├── package.json          # Зависимости и скрипты
├── tsconfig.json         # Конфигурация TypeScript
└── README.md            # Документация
```

## Технологии

- **Backend**: Bun, TypeScript
- **Протокол**: WebSocket
- **HTTP**: Простой HTTP endpoint

## Лицензия

MIT
