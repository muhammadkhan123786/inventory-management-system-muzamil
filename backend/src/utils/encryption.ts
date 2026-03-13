// utils/encryption.ts

import crypto from 'crypto';
import dotenv from 'dotenv';

dotenv.config();

const ALGORITHM = process.env.ALGORITHM;

// Validate encryption key
if (!process.env.ENCRYPTION_KEY) {
    throw new Error(
        'ENCRYPTION_KEY is missing in environment variables. ' +
        'Add ENCRYPTION_KEY to your .env file or set it in the environment before starting the app.'
    );
}

// Create 32-byte encryption key from environment variable
const ENCRYPTION_KEY = crypto
    .createHash('sha256')
    .update(process.env.ENCRYPTION_KEY as string)
    .digest();

/**
 * Encrypt sensitive data (credentials, tokens)
 * @param data - Plain object to encrypt
 * @returns Encrypted string in format: "iv:encryptedData"
 */
export function encryptCredentials(data: any): string {
    try {
        // Generate random initialization vector
        const iv = crypto.randomBytes(16);

        // Create cipher
        const cipher = crypto.createCipheriv(ALGORITHM, ENCRYPTION_KEY, iv);

        // Encrypt data
        let encrypted = cipher.update(JSON.stringify(data), 'utf8', 'hex');
        encrypted += cipher.final('hex');

        // Return format: iv:encryptedData
        return `${iv.toString('hex')}:${encrypted}`;
    } catch (error) {
        console.error('Encryption error:', error);
        throw new Error('Failed to encrypt credentials');
    }
}

/**
 * Decrypt sensitive data
 * @param encryptedCredentials - Encrypted string in format "iv:encryptedData"
 * @returns Decrypted object
 */
export function decryptCredentials(encryptedCredentials: string): any {
    try {
        // Split iv and encrypted data
        const [ivHex, encryptedData] = encryptedCredentials.split(':');

        if (!ivHex || !encryptedData) {
            throw new Error('Invalid encrypted credentials format');
        }

        // Convert iv from hex to buffer
        const iv = Buffer.from(ivHex, 'hex');

        // Create decipher
        const decipher = crypto.createDecipheriv(ALGORITHM, ENCRYPTION_KEY, iv);

        // Decrypt data
        let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
        decrypted += decipher.final('utf8');

        // Parse and return
        return JSON.parse(decrypted);
    } catch (error) {
        console.error('Decryption error:', error);
        throw new Error('Failed to decrypt credentials');
    }
}

/**
 * Generate a new encryption key (run this once to create your ENCRYPTION_KEY)
 * @returns Random 32-byte hex string
 */
export function generateEncryptionKey(): string {
    return crypto.randomBytes(32).toString('hex');
}

// Export for testing
if (require.main === module) {
    console.log('\n🔐 Encryption Key Generator\n');
    console.log('Add this to your .env file:\n');
    console.log(`ENCRYPTION_KEY=${generateEncryptionKey()}\n`);
}