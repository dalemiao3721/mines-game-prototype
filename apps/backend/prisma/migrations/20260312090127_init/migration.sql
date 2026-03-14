-- CreateEnum
CREATE TYPE "BetStatus" AS ENUM ('ACTIVE', 'SETTLED');

-- CreateEnum
CREATE TYPE "Outcome" AS ENUM ('WIN', 'LOSE');

-- CreateTable
CREATE TABLE "bet_records" (
    "bet_id" TEXT NOT NULL,
    "session_id" TEXT NOT NULL,
    "player_id" TEXT NOT NULL,
    "bet_amount" DECIMAL(65,30) NOT NULL,
    "mine_count" INTEGER NOT NULL,
    "rtp_setting" INTEGER NOT NULL,
    "status" "BetStatus" NOT NULL DEFAULT 'ACTIVE',
    "picked_tiles" INTEGER[],
    "current_multiplier" DECIMAL(65,30) NOT NULL DEFAULT 1.0,
    "server_seed_hash" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bet_records_pkey" PRIMARY KEY ("bet_id")
);

-- CreateTable
CREATE TABLE "settlements" (
    "settlement_id" TEXT NOT NULL,
    "bet_id" TEXT NOT NULL,
    "outcome" "Outcome" NOT NULL,
    "bet_amount" DECIMAL(65,30) NOT NULL,
    "final_multiplier" DECIMAL(65,30) NOT NULL,
    "payout" DECIMAL(65,30) NOT NULL,
    "profit" DECIMAL(65,30) NOT NULL,
    "settled_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "settlements_pkey" PRIMARY KEY ("settlement_id")
);

-- CreateTable
CREATE TABLE "draw_logs" (
    "draw_id" TEXT NOT NULL,
    "bet_id" TEXT NOT NULL,
    "server_seed" TEXT NOT NULL,
    "server_seed_hash" TEXT NOT NULL,
    "client_seed" TEXT,
    "mine_positions" INTEGER[],
    "total_tiles" INTEGER NOT NULL DEFAULT 25,
    "mine_count" INTEGER NOT NULL,
    "revealed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "draw_logs_pkey" PRIMARY KEY ("draw_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "bet_records_session_id_key" ON "bet_records"("session_id");

-- CreateIndex
CREATE UNIQUE INDEX "settlements_bet_id_key" ON "settlements"("bet_id");

-- CreateIndex
CREATE UNIQUE INDEX "draw_logs_bet_id_key" ON "draw_logs"("bet_id");

-- AddForeignKey
ALTER TABLE "settlements" ADD CONSTRAINT "settlements_bet_id_fkey" FOREIGN KEY ("bet_id") REFERENCES "bet_records"("bet_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "draw_logs" ADD CONSTRAINT "draw_logs_bet_id_fkey" FOREIGN KEY ("bet_id") REFERENCES "bet_records"("bet_id") ON DELETE RESTRICT ON UPDATE CASCADE;
