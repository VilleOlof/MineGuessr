export async function load({ locals }) {
    const session = await locals.auth.validate();

    return {
        logged_in: session?.user !== null,
    }
}