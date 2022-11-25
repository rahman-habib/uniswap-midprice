import axios from "axios"
export const getabi=async(address)=>{
    const url=`https://api.etherscan.io/api?module=contract&action=getabi&address=${address}&apikey=YJ4SMW71XQFEIVEWKA8M2BDZWB7S29RV2S`
    const res=await axios.get(url)
    const abi=JSON.parse(res.data.result)
    return abi;

}