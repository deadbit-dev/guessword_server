import { NetMessage, NetIdMessages, NetMessages } from "./protocol";
import { WsClient, WsServer } from "./ws_server";

interface Client {
    id: string;
    ws: WsClient;
}

export function GameServer(port: number = 3000) {
    let server: ReturnType<typeof WsServer<unknown>>;
    const clients: Map<string, Client> = new Map();

    function start() {
        server = WsServer(port,
            on_client_connected,
            on_client_disconnected,
            (client, data) => {
                const parsed_message = JSON.parse(data as string) as NetMessage;
                on_message(client, parsed_message.id, parsed_message.data);
            }
        );
    }

    function on_client_connected(_client: WsClient) {
        const clientId = generateClientId();
        const client: Client = { id: clientId, ws: _client };

        clients.set(clientId, client);
        console.log(`Client connected: ${client.id}`);

        broadcast(NetIdMessages.CONNECT, {
            client_id: client.id,
            total_clients: clients.size
        }, [client.id]);
    }

    function on_client_disconnected(_client: WsClient) {
        const client = findClientByWebSocket(_client);
        if (!client) return;

        clients.delete(client.id);
        console.log(`Client disconnected: ${client.id}`);

        broadcast(NetIdMessages.DISCONNECT, {
            client_id: client.id,
            total_clients: clients.size
        }, [client.id]);
    }

    function on_message<T extends keyof NetMessages>(socket: WsClient, id_message: T, _message: NetMessages[T]) {
        switch (id_message) {
            case NetIdMessages.PING:
                const ping_message = _message as NetMessages[NetIdMessages.PING];
                server.send(socket, {
                    id: NetIdMessages.PONG,
                    data: {
                        client_time: ping_message.client_time,
                        server_time: Date.now()
                    }
                });
                break;
            case NetIdMessages.ECHO:
                server.send(socket, {
                    id: NetIdMessages.ECHO,
                    data: _message,
                });
                break;
            case NetIdMessages.BROADCAST:
                const client = findClientByWebSocket(socket);
                if (!client) return;

                broadcast(NetIdMessages.BROADCAST, {
                    client_id: client.id,
                    data: _message
                }, [client.id]);
                break;

            default:
                // NOTE: Эхо для неизвестных типов сообщений
                server.send(socket, {
                    id: NetIdMessages.ECHO,
                    data: _message,
                });
        }
    }

    function broadcast(id_message: keyof NetMessages, data: NetMessages[keyof NetMessages], except_client_ids?: string[]) {
        for (const client of clients.values()) {
            if (except_client_ids && except_client_ids.includes(client.id)) continue;
            server.send(client.ws, {
                id: id_message,
                data: data
            });
        }
    }

    // NOTE: for now we just simple generate client id

    function generateClientId(): string {
        return Math.random().toString(36).substring(2, 15) +
            Math.random().toString(36).substring(2, 15);
    }

    function findClientByWebSocket(ws: WsClient): Client | undefined {
        for (const client of clients.values()) {
            if (client.ws === ws) {
                return client;
            }
        }
        return undefined;
    }

    return {
        start
    }
}