-- CreateIndex
CREATE INDEX "bet_records_player_id_status_idx" ON "bet_records"("player_id", "status");

-- CreateIndex
CREATE INDEX "bet_records_player_id_created_at_idx" ON "bet_records"("player_id", "created_at");
