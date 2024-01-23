// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			auth: import("lucia").AuthRequest;
		}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}

	namespace Lucia {
		type Auth = import("$lib/server/lucia").Auth;
		type DatabaseUserAttributes = {
			user_id: string; // Discord user ID
			username: string;
			avatar: string | null;
		};
		type DatabaseSessionAttributes = {};
	}
}

export { };
