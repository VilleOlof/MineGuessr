import type { LayoutServerLoad } from "./$types";

export const load: LayoutServerLoad = async ({ locals }) => {
    const session = await locals.auth.validate();

    return {
        user: session?.user ?? null
    }
};