import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma.js";

export const auth = betterAuth({
    database: prismaAdapter(prisma, {
        provider: "postgresql",
    }),

    baseURL: process.env.BETTER_AUTH_URL,

    trustedOrigins: [
        "http://localhost:3000",
    ],

    user: {
        modelName: "User",

        additionalFields: {
            role: {
                type: ["STUDENT", "INSTRUCTOR"],
                required: true,
                defaultValue: "STUDENT",
                input: false,
                returned: true,
            },
        },
    },

    emailAndPassword: {
        enabled: true,
    },
});