import Database from "bun:sqlite";

const db = new Database(Bun.env.DB);

export function db_session_valid_call(session: string): { success: boolean, player_id: string } {
    if (Bun.env.DB === undefined && Bun.env.DEV === "true") return { success: true, player_id: "" };

    const query = db.prepare(`
        SELECT * FROM Session
        WHERE id = ?
    `);

    const db_session = query.get(session) as {
        id: string;
        active_expires: BigInt;
        idle_expires: BigInt;
        user_id: string;
    } | null;

    if (db_session) {
        return { success: true, player_id: db_session.user_id };
    }
    else {
        return { success: false, player_id: "" };
    }
}

export function get_user(player_id: string) {
    const query = db.prepare(`
        SELECT * FROM User
        WHERE id = ?
    `);

    const db_user = query.get(player_id) as {
        id: string;
        user_id: string;
        username: string;
        avatar: string | null;
        labels: string;
        perm_lvl: number;
    } | null;

    if (db_user) {
        return db_user;
    }
    else {
        if (Bun.env.DEV === "true") {
            return {
                id: player_id,
                user_id: player_id,
                username: player_id,
                avatar: null,
                labels: "",
                perm_lvl: 0
            };
        }

        console.error(`User ${player_id} not found`);
        return null;
    }

}

export let ws_authed_users: { [key: string]: boolean } = {};
export const get_auth_string = (player_id: string, auth_session: string) => `${player_id}-${auth_session}`;

setInterval(() => {
    // Clear out old auths
    ws_authed_users = {};
}, 1000 * 60 * 60); // 1 hour
