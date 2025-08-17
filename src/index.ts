import { Server, ServerWebSocket } from "bun";

interface WebSocketMessage {
    type: string;
    data: any;
    timestamp: number;
}

interface Client {
    id: string;
    ws: ServerWebSocket<unknown>;
}

class WebSocketServer {
    private clients: Map<string, Client> = new Map();
    private server: Server;

    constructor(port: number = 3000) {
        this.server = Bun.serve({
            port,
            fetch: (req, server) => {
                const url = new URL(req.url);

                if (url.pathname === "/ws") {
                    const upgraded = server.upgrade(req);
                    if (upgraded) {
                        return undefined;
                    }
                    return new Response("Upgrade failed", { status: 500 });
                }

                return new Response("WebSocket server running on /ws", {
                    status: 200,
                    headers: { "Content-Type": "text/plain" }
                });
            },
            websocket: {
                open: (ws) => {
                    const clientId = this.generateClientId();
                    const client: Client = { id: clientId, ws };

                    this.clients.set(clientId, client);

                    console.log(`Client connected: ${clientId}`);

                    // NOTE: Отправляем приветственное сообщение
                    this.sendToClient(clientId, {
                        type: "welcome",
                        data: {
                            message: "Connected to server",
                            clientId
                        },
                        timestamp: Date.now()
                    });

                    // NOTE: Уведомляем всех о новом клиенте
                    this.broadcast({
                        type: "client_connected",
                        data: {
                            clientId,
                            totalClients: this.clients.size
                        },
                        timestamp: Date.now()
                    }, clientId);
                },

                message: (ws, message) => {
                    try {
                        const parsedMessage = JSON.parse(message as string) as WebSocketMessage;
                        const client = this.findClientByWebSocket(ws);

                        if (!client) return;

                        console.log(`Message from ${client.id}:`, parsedMessage);

                        // NOTE: Обрабатываем различные типы сообщений
                        switch (parsedMessage.type) {
                            case "echo":
                                this.sendToClient(client.id, {
                                    type: "echo",
                                    data: parsedMessage.data,
                                    timestamp: Date.now()
                                });
                                break;

                            case "ping":
                                this.sendToClient(client.id, {
                                    type: "pong",
                                    data: { timestamp: Date.now() },
                                    timestamp: Date.now()
                                });
                                break;

                            case "broadcast":
                                this.broadcast({
                                    type: "broadcast",
                                    data: {
                                        clientId: client.id,
                                        message: parsedMessage.data.message
                                    },
                                    timestamp: Date.now()
                                });
                                break;

                            default:
                                // NOTE: Эхо для неизвестных типов сообщений
                                this.sendToClient(client.id, {
                                    type: "echo",
                                    data: parsedMessage.data,
                                    timestamp: Date.now()
                                });
                        }
                    } catch (error) {
                        console.error("Error parsing message:", error);
                    }
                },

                close: (ws, code, reason) => {
                    const client = this.findClientByWebSocket(ws);
                    if (client) {
                        this.clients.delete(client.id);
                        console.log(`Client disconnected: ${client.id}`);

                        // NOTE: Уведомляем всех о отключении клиента
                        this.broadcast({
                            type: "client_disconnected",
                            data: {
                                clientId: client.id,
                                totalClients: this.clients.size
                            },
                            timestamp: Date.now()
                        });
                    }
                }
            }
        });

        console.log(`🚀 WebSocket server running on port ${port}`);
        console.log(`📡 WebSocket endpoint: ws://localhost:${port}/ws`);
        console.log(`📋 HTTP endpoint: http://localhost:${port}/`);
    }

    private generateClientId(): string {
        return Math.random().toString(36).substring(2, 15) +
            Math.random().toString(36).substring(2, 15);
    }

    private findClientByWebSocket(ws: ServerWebSocket<unknown>): Client | undefined {
        for (const client of this.clients.values()) {
            if (client.ws === ws) {
                return client;
            }
        }
        return undefined;
    }

    private sendToClient(clientId: string, message: WebSocketMessage): void {
        const client = this.clients.get(clientId);
        if (client && client.ws.readyState === 1) {
            client.ws.send(JSON.stringify(message));
        }
    }

    private broadcast(message: WebSocketMessage, excludeClientId?: string): void {
        for (const [clientId, client] of this.clients) {
            if (excludeClientId && clientId === excludeClientId) continue;
            if (client.ws.readyState === 1) {
                client.ws.send(JSON.stringify(message));
            }
        }
    }
}

// Запускаем сервер
new WebSocketServer(3000);
