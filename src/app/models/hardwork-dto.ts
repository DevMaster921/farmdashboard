export class HardWorkDto {
  id: string;
  vault: string;
  block: number;
  blockDate: number;
  network: string;
  shareChange: Date;
  fullRewardUsd: number;
  fullRewardUsdTotal: number;
  tvl: number;
  allProfit: number;
  periodOfWork: number;
  psPeriodOfWork: number;
  perc: number;
  apr: number;
  weeklyProfit: number;
  weeklyAllProfit: number;
  psTvlUsd: number;
  psApr: number;
  farmBuyback: number;
  farmBuybackSum: number;
  callsQuantity: number;
  poolUsers: number;
  savedGasFees: number;
  savedGasFeesSum: number;
  fee: number;
  weeklyAverageTvl: number;

  blockDateAdopted: Date;

  public static fromJson(data: string): HardWorkDto {
    const jsonData = JSON.parse(data);
    const tx: HardWorkDto = new HardWorkDto();

    tx.id = jsonData.id;
    tx.vault = jsonData.vault;
    tx.block = jsonData.block;
    tx.blockDate = jsonData.blockDate;
    tx.network = jsonData.network;
    tx.shareChange = jsonData.shareChange;
    tx.fullRewardUsd = jsonData.fullRewardUsd;
    tx.fullRewardUsdTotal = jsonData.fullRewardUsdTotal;
    tx.tvl = jsonData.tvl;
    tx.allProfit = jsonData.allProfit;
    tx.periodOfWork = jsonData.periodOfWork;
    tx.psPeriodOfWork = jsonData.psPeriodOfWork;
    tx.perc = jsonData.perc;
    tx.apr = jsonData.apr;
    tx.weeklyProfit = jsonData.weeklyProfit;
    tx.weeklyAllProfit = jsonData.weeklyAllProfit;
    tx.psTvlUsd = jsonData.psTvlUsd;
    tx.psApr = jsonData.psApr;
    tx.farmBuyback = jsonData.farmBuyback;
    tx.farmBuybackSum = jsonData.farmBuybackSum;
    tx.callsQuantity = jsonData.callsQuantity;
    tx.poolUsers = jsonData.poolUsers;
    tx.savedGasFees = jsonData.savedGasFees;
    tx.savedGasFeesSum = jsonData.savedGasFeesSum;
    tx.fee = jsonData.fee;
    tx.weeklyAverageTvl = jsonData.weeklyAverageTvl;

    HardWorkDto.enrich(tx);
    return tx;
  }

  public static enrich(tx: HardWorkDto): void {
    HardWorkDto.fillBlockDateAdopted(tx);
  }

  public static fillBlockDateAdopted(tx: HardWorkDto): void {
    if (tx && tx?.blockDateAdopted == null) {
      const d = new Date(0);
      d.setUTCSeconds(tx.blockDate);
      tx.blockDateAdopted = d;
    }
  }
}
