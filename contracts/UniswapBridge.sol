// SPDX-License-Identifier: GPL-2.0-only
// Copyright 2020 Spilsbury Holdings Ltd
pragma solidity >=0.6.6 <0.8.0;
pragma abicoder v2;

import {SafeMath} from '@openzeppelin/contracts/math/SafeMath.sol';
import {IERC20} from '@openzeppelin/contracts/token/ERC20/IERC20.sol';

import '@uniswap/v3-periphery/contracts/interfaces/ISwapRouter.sol';
import '@uniswap/v3-core/contracts/interfaces/IUniswapV3Factory.sol';
import "@uniswap/v3-periphery/contracts/interfaces/IPeripheryImmutableState.sol";

import {IDefiBridge} from './interfaces/IDefiBridge.sol';
import {Types} from './Types.sol';

contract UniswapBridge is IDefiBridge {
    using SafeMath for uint256;

    address public immutable rollupProcessor;
    address public weth;
    uint24 public constant poolFee = 3000; //0.3%

    ISwapRouter public immutable swapRouter;
    IUniswapV3Factory public immutable v3Factory;

    constructor(address _rollupProcessor, address _swapRouter) public {
        rollupProcessor = _rollupProcessor;
        swapRouter = ISwapRouter(_swapRouter);
        weth = IPeripheryImmutableState(_swapRouter).WETH9();
        v3Factory = IUniswapV3Factory(_swapRouter);
    }

    receive() external payable {}

    function convert(
        Types.AztecAsset calldata inputAssetA,
        Types.AztecAsset calldata,
        Types.AztecAsset calldata outputAssetA,
        Types.AztecAsset calldata,
        uint256 inputValue,
        uint256,
        uint64
    )
        external
        payable
        override
        returns (
            uint256 outputValueA,
            uint256,
            bool isAsync
        )
    {
        require(msg.sender == rollupProcessor, 'UniswapBridge: INVALID_CALLER');
        isAsync = false;
        uint256[] memory amounts;
        uint256 deadline = block.timestamp;

        // This should check the pair exists on UNISWAP
        address pairExist = v3Factory.getPool(
            inputAssetA.erc20Address, 
            outputAssetA.erc20Address, 
            poolFee);
        require(pairExist != address(0), "Pair doesn't exist.");

        // This is only for ETH/ERC20 or ERC20/ETH pairs
        if (
            inputAssetA.assetType == Types.AztecAssetType.ETH && 
            outputAssetA.assetType == Types.AztecAssetType.ERC20 )
        {
            ISwapRouter.ExactInputSingleParams memory params =
                ISwapRouter.ExactInputSingleParams({
                    tokenIn: weth,
                    tokenOut: outputAssetA.erc20Address,
                    fee: poolFee,
                    recipient: rollupProcessor,
                    deadline: block.timestamp,
                    amountIn: inputValue,
                    amountOutMinimum: 0,
                    sqrtPriceLimitX96: 0
                });
            
            outputValueA = swapRouter.exactInputSingle(params);

        } else if (
            inputAssetA.assetType == Types.AztecAssetType.ERC20 && 
            outputAssetA.assetType == Types.AztecAssetType.ETH ) 
        {
            require(
                IERC20(inputAssetA.erc20Address).approve(address(swapRouter), inputValue),
                'UniswapBridge: APPROVE_FAILED'
            );
            ISwapRouter.ExactInputSingleParams memory params =
                ISwapRouter.ExactInputSingleParams({
                    tokenIn: inputAssetA.erc20Address,
                    tokenOut: weth,
                    fee: poolFee,
                    recipient: rollupProcessor,
                    deadline: block.timestamp,
                    amountIn: inputValue,
                    amountOutMinimum: 0,
                    sqrtPriceLimitX96: 0
                });

            outputValueA = swapRouter.exactInputSingle(params);


        } else {
            // TODO what about swapping tokens?
            revert('UniswapBridge: INCOMPATIBLE_ASSET_PAIR');
        }
    }

    function canFinalise(
        uint256 /*interactionNonce*/
    ) external view override returns (bool) {
        return false;
    }

    function finalise(uint256) external payable override returns (uint256, uint256) {
        require(false);
    }
}