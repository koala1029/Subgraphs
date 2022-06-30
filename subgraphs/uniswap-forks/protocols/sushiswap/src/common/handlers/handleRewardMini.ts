import { ethereum, BigInt, BigDecimal } from "@graphprotocol/graph-ts";
import { NetworkConfigs } from "../../../../../configurations/configure";
import { LiquidityPool, _MasterChef, _MasterChefStakingPool } from "../../../../../generated/schema";
import { getOrCreateToken } from "../../../../../src/common/getters";
import { getRewardsPerDay } from "../../../../../src/common/rewards";
import { findNativeTokenPerToken, updateNativeTokenPriceInUSD } from "../../../../../src/price/price";
import { MasterChef } from "../constants";
import { getOrCreateMasterChef } from "../helpers";

export function updateMasterChefDeposit(event: ethereum.Event, pid: BigInt, amount: BigInt): void {
  let miniChefV2Pool = _MasterChefStakingPool.load(MasterChef.MINICHEF + "-" + pid.toString())!;
  let miniChefV2 = getOrCreateMasterChef(event, MasterChef.MINICHEF);

  let pool = LiquidityPool.load(miniChefV2Pool.poolAddress);
  if (!pool) {
    return;
  }

  let rewardAmountPerInterval = miniChefV2.adjustedRewardTokenRate.times(miniChefV2Pool.poolAllocPoint).div(miniChefV2.totalAllocPoint);
  let rewardAmountPerIntervalBigDecimal = BigDecimal.fromString(rewardAmountPerInterval.toString());
  let rewardTokenPerDay = getRewardsPerDay(event.block.timestamp, event.block.number, rewardAmountPerIntervalBigDecimal, miniChefV2.rewardTokenInterval);

  let nativeToken = updateNativeTokenPriceInUSD();
  let rewardToken = getOrCreateToken(NetworkConfigs.getRewardToken());

  miniChefV2Pool.lastRewardBlock = event.block.number;

  rewardToken.lastPriceUSD = findNativeTokenPerToken(rewardToken, nativeToken);

  pool.stakedOutputTokenAmount = pool.stakedOutputTokenAmount!.plus(amount)
  pool.rewardTokenEmissionsAmount = [BigInt.fromString(rewardTokenPerDay.toString())];
  pool.rewardTokenEmissionsUSD = [rewardTokenPerDay.times(rewardToken.lastPriceUSD!)];

  miniChefV2Pool.save()
  miniChefV2.save()
  rewardToken.save()
  nativeToken.save()
  pool.save()
}

export function updateMasterChefWithdraw(event: ethereum.Event, pid: BigInt, amount: BigInt): void {
  let miniChefV2Pool = _MasterChefStakingPool.load(MasterChef.MINICHEF + "-" + pid.toString())!;
  let miniChefV2 = getOrCreateMasterChef(event, MasterChef.MINICHEF);

  // Return if pool does not exist
  let pool = LiquidityPool.load(miniChefV2Pool.poolAddress);
  if (!pool) {
    return;
  }

  let rewardAmountPerInterval = miniChefV2.adjustedRewardTokenRate.times(miniChefV2Pool.poolAllocPoint).div(miniChefV2.totalAllocPoint);
  let rewardAmountPerIntervalBigDecimal = BigDecimal.fromString(rewardAmountPerInterval.toString());
  let rewardTokenPerDay = getRewardsPerDay(event.block.timestamp, event.block.number, rewardAmountPerIntervalBigDecimal, miniChefV2.rewardTokenInterval);

  let nativeToken = updateNativeTokenPriceInUSD();
  let rewardToken = getOrCreateToken(NetworkConfigs.getRewardToken());

  miniChefV2Pool.lastRewardBlock = event.block.number;

  rewardToken.lastPriceUSD = findNativeTokenPerToken(rewardToken, nativeToken);

  pool.stakedOutputTokenAmount = pool.stakedOutputTokenAmount!.minus(amount)
  pool.rewardTokenEmissionsAmount = [BigInt.fromString(rewardTokenPerDay.toString())];
  pool.rewardTokenEmissionsUSD = [rewardTokenPerDay.times(rewardToken.lastPriceUSD!)];

  miniChefV2Pool.save()
  miniChefV2.save()
  rewardToken.save()
  nativeToken.save()
  pool.save()
}

// export function updateMasterChefHarvest(event: ethereum.Event, pid: BigInt, amount: BigInt): void {
//   let masterChefPool = _MasterChefStakingPool.load(pid.toString())!;
//   // Return if pool does not exist
//   let pool = LiquidityPool.load(masterChefPool.poolAddress);
//   if (!pool) {
//     return;
//   }
//   pool.stakedOutputTokenAmount = pool.stakedOutputTokenAmount!.minus(amount)
// }