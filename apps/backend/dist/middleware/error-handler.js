export class GameError extends Error {
    statusCode;
    constructor(statusCode, message) {
        super(message);
        this.statusCode = statusCode;
        this.name = 'GameError';
    }
}
export function errorHandler(err, _req, res, _next) {
    if (err instanceof GameError) {
        res.status(err.statusCode).json({ error: err.message });
        return;
    }
    console.error('Unexpected error:', err);
    res.status(500).json({ error: 'Internal server error' });
}
//# sourceMappingURL=error-handler.js.map