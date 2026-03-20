import crypto from 'crypto';
export function generateId(prefix) {
    const random = crypto.randomBytes(12).toString('hex');
    const timestamp = Date.now().toString(36);
    return `${prefix}-${timestamp}-${random}`;
}
//# sourceMappingURL=id-generator.js.map