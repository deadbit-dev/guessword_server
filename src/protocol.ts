export interface NetMessage {
    id: NetIdMessages;
    data: any;
}

export enum NetIdMessages {
    CONNECT,
    DISCONNECT,
    PING,
    PONG,
    ECHO,
    BROADCAST,
}

export type NetMessages = {
    [NetIdMessages.CONNECT]: Connect,
    [NetIdMessages.DISCONNECT]: Disconnect,

    // NOTE: Diagnostics
    [NetIdMessages.PING]: Ping,
    [NetIdMessages.PONG]: Pong,
    [NetIdMessages.ECHO]: Echo,

    [NetIdMessages.BROADCAST]: Broadcast,
};

export const NetMessagesNames = {
    [NetIdMessages.CONNECT]: "CONNECT",
    [NetIdMessages.DISCONNECT]: "DISCONNECT",
    [NetIdMessages.PING]: "PING",
    [NetIdMessages.PONG]: "PONG",
    [NetIdMessages.ECHO]: "ECHO",
    [NetIdMessages.BROADCAST]: "BROADCAST",
}

export interface Connect {
    client_id: string;
    total_clients: number;
    // TODO: id_session, hash, version, lang...
}

export interface Disconnect {
    client_id: string;
    total_clients: number;
}

export interface Ping {
    client_time: number;
}

export interface Pong {
    client_time: number;
    server_time: number;
}

export interface Echo {
    data: object;
}

export interface Broadcast {
    client_id: string;
    data: object;
}