import { calcMultiplier } from '../utils/combinatorics';
import { VALID_RTP_VALUES } from '../config/rtp.config';
export function getMultiplier(mineCount, openedTiles, rtp) {
    return calcMultiplier(mineCount, openedTiles, rtp);
}
export function getAvailableRTPValues() {
    return VALID_RTP_VALUES;
}
//# sourceMappingURL=rtp.service.js.map