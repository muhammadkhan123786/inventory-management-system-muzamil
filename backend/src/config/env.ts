import { z } from 'zod';


const envSchema = z.object({
    PORT: z.string().default('3000'),
    MONGO_URI: z.string().min(1),
    FRONTEND_URL: z.string().url(),
    API_PREFIX: z.string().default('/api'),
    JWT_SECRET: z.string().min(1),
    JWT_EXPIRES_IN: z.string().min(1)
});


const parsed = envSchema.safeParse(process.env);


if (!parsed.success) {
    console.error('❌ Invalid environment variables');
    console.error(parsed.error.format());
    process.exit(1);
}


export const env = {
    port: Number(parsed.data.PORT),
    mongoUri: parsed.data.MONGO_URI,
    frontendUrl: parsed.data.FRONTEND_URL,
    apiPrefix: parsed.data.API_PREFIX,
    JWT_SECRET: parsed.data.JWT_SECRET,
    JWT_EXPIRES_IN: parsed.data.JWT_EXPIRES_IN
};

