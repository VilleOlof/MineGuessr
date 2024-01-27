-- CreateTable
CREATE TABLE "Stat" (
    "game_id" TEXT NOT NULL,
    "round_id" INTEGER NOT NULL,
    "location_x" INTEGER NOT NULL,
    "location_z" INTEGER NOT NULL,
    "guess_x" INTEGER NOT NULL,
    "guess_z" INTEGER NOT NULL,
    "distance" INTEGER NOT NULL,
    "time" INTEGER NOT NULL,
    "panorama_id" INTEGER NOT NULL,
    "game_type" INTEGER NOT NULL DEFAULT 0,
    "date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "user_id" TEXT,

    PRIMARY KEY ("game_id", "round_id"),
    CONSTRAINT "Stat_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Suggestion" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "text" TEXT NOT NULL,
    "date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Statistics" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "user_id" TEXT NOT NULL,
    "games_played" INTEGER NOT NULL,
    "games_finished" INTEGER NOT NULL,
    "total_score" INTEGER NOT NULL,
    "average_score" REAL NOT NULL,
    "average_distance" REAL NOT NULL,
    "total_distance" INTEGER NOT NULL,
    "best_score" INTEGER NOT NULL,
    "worst_score" INTEGER NOT NULL,
    "total_time" INTEGER NOT NULL,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "Statistics_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User" ("user_id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "avatar" TEXT,
    "perm_lvl" INTEGER NOT NULL DEFAULT 0
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "active_expires" BIGINT NOT NULL,
    "idle_expires" BIGINT NOT NULL,
    "user_id" TEXT NOT NULL,
    CONSTRAINT "Session_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Key" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT NOT NULL,
    "hashed_password" TEXT,
    CONSTRAINT "Key_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Statistics_user_id_key" ON "Statistics"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "User_user_id_key" ON "User"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");
