import { GameModule } from "../../shared/GameModule";

export module MPGame {
    export type State = "lobby" | "playing" | "finished" | "aborted" | "error";
}

export class MPGame {
    public state: MPGame.State = "lobby";

    public players: { [id: string]: GameModule.Round } = {};
}