#!/usr/bin/env node
import { ContractTransaction } from '@ethersproject/contracts';
import UniswapV3FactoryJson from '@uniswap/v3-core/artifacts/contracts/UniswapV3Factory.sol/UniswapV3Factory.json';
import UniswapV3PoolJson from '@uniswap/v3-core/artifacts/contracts/UniswapV3Pool.sol/UniswapV3Pool.json';
import IWETH from '@uniswap/v3-periphery/artifacts/contracts/interfaces/external/IWETH9.sol/IWETH9.json';
//should we keep using the v2 weth9 contract in v3 ??
import WETH9 from '@uniswap/v2-periphery/build/WETH9.json';
import UniswapV3RouterJson from '@uniswap/v3-periphery/artifacts/contracts/SwapRouter.sol/SwapRouter.json';
import { Contract, ContractFactory, Signer } from 'ethers';

import { abi as IUniswapV3PoolABI } from "@uniswap/v3-core/artifacts/contracts/interfaces/IUniswapV3Pool.sol/IUniswapV3Pool.json";

export const createPair = async (
  owner: Signer,
  router: Contract,
  asset: Contract,
  initialTokenSupply = 1000n * 10n ** 18n,
  initialEthSupply = 10n ** 18n,
) => {

  const factory = new Contract(await router.factory(), UniswapV3FactoryJson.abi, owner);
  const weth = new Contract(await router.WETH9(), IWETH.abi, owner);
  const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';

  if ((await factory.getPool(asset.address, weth.address, 3000)) != ZERO_ADDRESS) {
    console.log(`UniswapPair [${await asset.name()} - WETH] already created.`);
    return;
  }

  const minConfirmations = [1337, 31337].indexOf(await owner.getChainId()) >= 0 ? 1 : 3;
  const withConfirmation = async (action: Promise<ContractTransaction>) => {
    const tx2 = await action;
    await tx2.wait(minConfirmations);
  };

  console.log(`Create UniswapPair [${await asset.name()} - WETH]...`);

  await withConfirmation(factory.createPool(asset.address, weth.address, 3000));
  const poolAddress = await factory.getPool(asset.address, weth.address, 3000);
  const pool = new Contract(poolAddress, IUniswapV3PoolABI, owner);
  console.log(`Pair contract address: ${poolAddress}`);

  await withConfirmation(asset.mint(pool.address, initialTokenSupply));

  await withConfirmation(weth.deposit({ value: initialEthSupply }));
  await withConfirmation(weth.transfer(pool.address, initialEthSupply));

  // // Don't do this in production.
  const MIN_TICK = -887272;
  const MAX_TICK = -MIN_TICK;

  await pool.mint(
    await owner.getAddress(),
    MIN_TICK,
    MAX_TICK,
    initialTokenSupply+initialEthSupply,
    "0x");

  await factory.mint(
    await owner.getAddress(),
    MIN_TICK,
    MAX_TICK,
    initialTokenSupply+initialEthSupply,
    "0x");

  console.log(`Initial token supply: ${initialTokenSupply}`);
  console.log(`Initial ETH supply: ${initialEthSupply}`);

};

export const deployUniswap = async (owner: Signer) => {
  console.log('Deploying UniswapFactory...');
  const UniswapFactory = new ContractFactory(UniswapV3FactoryJson.abi, UniswapV3FactoryJson.bytecode, owner);
  // const owner2 = await owner.getAddress()
  // console.log("owner: ",owner2)
  const factory = await UniswapFactory.deploy();
  console.log(`UniswapFactory contract address: ${factory.address}`);

  console.log('Deploying WETH...');
  const WETHFactory = new ContractFactory(WETH9.abi, WETH9.bytecode, owner);
  const weth = await WETHFactory.deploy();
  console.log(`WETH contract address: ${weth.address}`);

  console.log('Deploying UniswapV3Router...');
  const UniswapV3Router = new ContractFactory(UniswapV3RouterJson.abi, UniswapV3RouterJson.bytecode, owner);
  const router = await UniswapV3Router.deploy(factory.address, weth.address);
  console.log(`UniswapV3Router contract address: ${router.address}`);

  return router;
};
