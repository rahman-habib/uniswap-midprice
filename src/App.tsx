
import './App.css';
import { ethers } from 'ethers'
import { Pool ,TickMath,FullMath} from '@uniswap/v3-sdk'
import { Token } from '@uniswap/sdk-core'
import  IUniswapV3Pool  from '../src/UniswapV3Pool.json'
import { useEffect, useState } from 'react';
import JSBI from 'jsbi'



//infura api endpoint :69c39fd6924f4d07a55b182175f1fdd1


function App() {
  useEffect(()=>{
    const interval = setInterval(() => {
      main()
      console.log("refreshed!")
    }, 1000);
  
    return () => clearInterval(interval);
  //main()
    
  },[])
  
  const [sqrtprice,setsqrtprice]=useState('');
  const [liquidity,setliquidity]=useState('');
  const [fee,setfee]=useState('');
  const [inputAmount,setinputAmount]=useState(1);
  const [token0Status,settoken0Status]=useState('');
  const [token0satatePool,settoken0satatePool]=useState('');

 
  const [tickSpacing,settickSpacing]=useState('');

  const [tick,setTick]=useState('');
  const provider = new ethers.providers.JsonRpcProvider('https://mainnet.infura.io/v3/69c39fd6924f4d07a55b182175f1fdd1')
 const poolAddress = '0x4e68ccd3e89f51c3074ca5072bbac773960dfa36'
 //https://info.uniswap.org/#/pools/0x5777d92f208679db4b9778590fa3cab3ac9e2168

const poolContract = new ethers.Contract(poolAddress, IUniswapV3Pool.abi, provider)

interface Immutables {
  factory: string
  token0: string
  token1: string
  fee: number
  tickSpacing: number
  maxLiquidityPerTick: ethers.BigNumber
}

interface State {
  liquidity: ethers.BigNumber
  sqrtPriceX96: ethers.BigNumber
  tick: number
  observationIndex: number
  observationCardinality: number
  observationCardinalityNext: number
  feeProtocol: number
  unlocked: boolean
}

async function getPoolImmutables() {
  const [factory, token0, token1, fee, tickSpacing, maxLiquidityPerTick] = await Promise.all([
    poolContract.factory(),
    poolContract.token0(),
    poolContract.token1(),
    poolContract.fee(),
    poolContract.tickSpacing(),
    poolContract.maxLiquidityPerTick(),
  ])

  const immutables: Immutables = {
    factory,
    token0,
    token1,
    fee,
    tickSpacing,
    maxLiquidityPerTick,
  }
  return immutables
}

async function getPoolState() {
  const [liquidity, slot] = await Promise.all([poolContract.liquidity(), poolContract.slot0()])

  const PoolState: State = {
    liquidity,
    sqrtPriceX96: slot[0],
    tick: slot[1],
    observationIndex: slot[2],
    observationCardinality: slot[3],
    observationCardinalityNext: slot[4],
    feeProtocol: slot[5],
    unlocked: slot[6],
  }

  return PoolState
}

async function main() {
  const [immutables, state] = await Promise.all([getPoolImmutables(), getPoolState()])
  // const token0Address=await poolContract.token0()
  // const token1Address=await poolContract.token1()
  // const token0abi=await getabi(token0Address)
  // const token1abi=await getabi(token1Address)
  // const token0contract = new ethers.Contract(token0Address, token0abi, provider)
  // const token1contract = new ethers.Contract(token1Address, token1abi, provider)
  // console.log(token1contract)
  // console.log(token0contract)
  // const token0decimals=await token0contract.decimals()
  // const tokenname0=await token0contract.name()
  // const token0symbol=await token0contract.symbol()
  // const token1decimals=await token1contract.decimals()
  // const tokenname1=await token1contract.name()
  // const token1symbol=await token1contract.symbol()
  // console.log("token 0 decimals",token0decimals)
  // console.log("token 1 decimals",token1decimals)

  const TokenA = new Token(3, immutables.token0, 18, 'DAi', 'Dai Stablecoin')

  const TokenB = new Token(3, immutables.token1, 6, 'USDC', 'USD Coin')

  const DAI_USDC_POOL = new Pool(
    TokenA,
    TokenB,
    immutables.fee,
    state.sqrtPriceX96.toString(),
    state.liquidity.toString(),
    state.tick
  )
  setliquidity(DAI_USDC_POOL.liquidity.toString())
  setTick(DAI_USDC_POOL.tickCurrent.toString())
 setsqrtprice(DAI_USDC_POOL.sqrtRatioX96.toString())
 setfee(DAI_USDC_POOL.fee.toString())
 settickSpacing(DAI_USDC_POOL.tickSpacing.toString())

//using sqrtRation from the pool
const ratioX192p=JSBI.multiply(DAI_USDC_POOL.sqrtRatioX96,DAI_USDC_POOL.sqrtRatioX96)
const baseAmuntp=JSBI.BigInt(inputAmount*(10**DAI_USDC_POOL.token0.decimals))
const shiftp=JSBI.leftShift(JSBI.BigInt(1),JSBI.BigInt(192))
const quoteAmountp=FullMath.mulDivRoundingUp(ratioX192p,baseAmuntp,shiftp)
const quoteamountOutp=quoteAmountp.toString()
const token0toToken1p=parseInt(quoteamountOutp)/(10**DAI_USDC_POOL.token1.decimals)


 


//using tick price
const sqrtRatioX96=TickMath.getSqrtRatioAtTick(DAI_USDC_POOL.tickCurrent)
const ratioX192=JSBI.multiply(sqrtRatioX96,sqrtRatioX96)
const baseAmunt=JSBI.BigInt(inputAmount*(10**DAI_USDC_POOL.token0.decimals))
const shift=JSBI.leftShift(JSBI.BigInt(1),JSBI.BigInt(192))
const quoteAmount=FullMath.mulDivRoundingUp(ratioX192,baseAmunt,shift)
const quoteamountOut=quoteAmount.toString()
const token0toToken1=parseInt(quoteamountOut)/(10**DAI_USDC_POOL.token1.decimals)




const token0name=DAI_USDC_POOL.token0.symbol?DAI_USDC_POOL.token0.symbol.toString():""
const token1name=DAI_USDC_POOL.token1.symbol?DAI_USDC_POOL.token1.symbol.toString():""

settoken0Status("by using tick value from pool==== "+inputAmount+" "+token0name+" to "+token1name+" :"+token0toToken1)
settoken0satatePool("by using sqrtRatioX96 from pool=== " +inputAmount+" "+token0name+" to "+token1name+" :"+token0toToken1p)
}


  return (
    <div className="App">
     <h1>my work</h1>
    <div>
      <h1>uniswap slot 0 data</h1>
      <p>{token0Status}</p>
      <p>{token0satatePool}</p>
      <p>sqrtPriceX96 : {sqrtprice}</p>
      <p>Tick : {tick}</p>
      <p>liquidity : {liquidity}</p>
      <p>Tick spacing : {tickSpacing}</p>
      <p>Fee : {fee}</p>
    
    </div>
    </div>
  );
}

export default App;
