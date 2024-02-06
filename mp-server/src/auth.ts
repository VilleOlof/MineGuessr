import { Elysia } from "elysia";

// TODO: Implement auth_plugin
export const auth_plugin = new Elysia().decorate('auth', () => {
    console.log('auth');
    return true;
});