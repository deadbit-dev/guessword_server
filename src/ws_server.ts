import { ServerWebSocket } from "bun";

export type IWsServer<T> = ReturnType<typeof WsServer<T>>;
export type WsClient = ServerWebSocket<unknown>;

export function WsServer<T>(port: number,
    on_client_connected: (client: ServerWebSocket<T>) => void,
    on_client_disconnected: (client: ServerWebSocket<T>) => void,
    on_data: (client: ServerWebSocket<T>, data: String | Buffer) => void) {

    type WsClient = ServerWebSocket<T>;

    const server = Bun.serve<T, {}>({
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
                on_client_connected(ws);
            },
            close: (ws, code, reason) => {
                on_client_disconnected(ws);
            },
            message: (ws, message) => {
                on_data(ws, message);
            }
        }
    });

    function send(client: WsClient, data: object) {
        client.send(JSON.stringify(data));
    }

    function remove_client_by_socket(client: WsClient) {
        if (client.readyState == WebSocket.OPEN)
            client.close();
    }

    return {
        send,
        remove_client_by_socket,
        server
    }
}