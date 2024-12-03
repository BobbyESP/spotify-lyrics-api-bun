export interface ServerMessage<T = unknown> {
    error: boolean;
    message: string;
    data?: T; // Para incluir datos adicionales si se requiere
}
