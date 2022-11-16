const { ethers } = require("hardhat")
const { get, post } = require('axios')
const BRINK_API_URL = 'https://app-api.brink.trade'
const VERIFIER_V1 = '0x6ef84B098A812B8f4C81cD6d0B0A5a64d17C9B3e'
const DAI_ADDRESS = '0x6b175474e89094c44da98b954eedeac495271d0f'
const CRYPTO_COVEN_COLLECTION_ADDRESS = '0x5180db8f5c931aae63c74266b211f580155ecac8'
const MAX_UINT256 = '115792089237316195423570985008687907853269984665640564039457584007913129639935'

const addTrailingSlash = str => str.charAt(str.length-1) !== '/' ? `${str}/` : str


const cosito = {
  order: {
    types: {
      MetaDelegateCall: [
        {
          name: "to",
          type: "address",
        },
        {
          name: "data",
          type: "bytes",
          calldata: true,
        },
      ],
    },
    domain: {
      name: "BrinkAccount",
      version: "1",
      chainId: 1,
      verifyingContract: "0x6ef84B098A812B8f4C81cD6d0B0A5a64d17C9B3e",
    },
    value: {
      to: "0x6ef84B098A812B8f4C81cD6d0B0A5a64d17C9B3e",
      data: "0x78c5c0a1000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000000000000000000000000000000dcf41b8447ab36a08a8487d429d249bdfed3d850000000000000000000000000dcf41b8447ab36a08a8487d429d249bdfed3d85000000000000000000000000000000000000000000000000000000000000000a000000000000000000000000000000000000000000000000000000000000000affffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff",
    },
  },
  orderHash: "0x9c5dbfa733e385a3be61655826893ace02923355fb8f416decd1b3c2560444e4",
  signedParams: [
    {
      name: "to",
      type: "address",
      value: "0x6ef84B098A812B8f4C81cD6d0B0A5a64d17C9B3e",
    },
    {
      name: "data",
      type: "bytes",
      value: "0x78c5c0a1000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000000000000000000000000000000dcf41b8447ab36a08a8487d429d249bdfed3d850000000000000000000000000dcf41b8447ab36a08a8487d429d249bdfed3d85000000000000000000000000000000000000000000000000000000000000000a000000000000000000000000000000000000000000000000000000000000000affffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff",
      callData: {
        functionName: "tokenToToken",
        params: [
          {
            name: "bitmapIndex",
            type: "uint256",
            value: "1",
          },
          {
            name: "bit",
            type: "uint256",
            value: "0",
          },
          {
            name: "tokenIn",
            type: "address",
            value: "0x0dcf41b8447ab36a08a8487d429d249bdfed3d85",
          },
          {
            name: "tokenOut",
            type: "address",
            value: "0x0dcf41b8447ab36a08a8487d429d249bdfed3d85",
          },
          {
            name: "tokenInAmount",
            type: "uint256",
            value: "10",
          },
          {
            name: "tokenOutAmount",
            type: "uint256",
            value: "10",
          },
          {
            name: "expiryBlock",
            type: "uint256",
            value: "115792089237316195423570985008687907853269984665640564039457584007913129639935",
          },
        ],
      },
    },
  ],
}


async function runStart () {

  // get the signer
  const [owner] = await ethers.getSigners();
  const signerAddress = await owner.getAddress()

  // get Account Address for given signer
  const accountResp = await get(addTrailingSlash(BRINK_API_URL) + 'signer/' + signerAddress)
  const accountAddress = accountResp.data.account

  // get the bit data for the account address
  const nextBitResp = await get(addTrailingSlash(BRINK_API_URL) + 'nextBit?account=' + accountAddress)
  const bitmapIndex = nextBitResp.data.nextBit.bitmapIndex
  const bit = nextBitResp.data.nextBit.bit

  // construct the signed Message
  // here we will use the NftApprovalSwapVerifier to create a limit order for an NFT, and the function tokenToNft
  // because we want to swap a token for an NFT. You could use a different verifier and verifier function to achieve
  // a different type of limit order. The available verifiers are listed below, with their code

  const params = {
    verifier: VERIFIER_V1,
    function: 'tokenToToken',
    orderParams: {
      bit,
      bitmapIndex,
      tokenIn: '0x0dcf41b8447ab36a08a8487d429d249bdfed3d85',
      tokenInAmount: '10',
      tokenOut: '0x0dcf41b8447ab36a08a8487d429d249bdfed3d85',
      tokenOutAmount: '10',
      expiryBlock: MAX_UINT256,
    }
  }

  // Use createOrder endpoint 

    const url = `${addTrailingSlash(BRINK_API_URL)}createOrder?function=${params.function}&verifier=${params.verifier}&params=${JSON.stringify(params.orderParams)}`
    
    const response = await get(url)

    const { order, orderHash, signedParams } = cosito

  // Sign response 
  const ownerSignature = await owner._signTypedData( order.domain , order.types , order.value )
  
  const signedMessage = {
    message: orderHash,
    EIP712TypedData: order,
    signature: ownerSignature,
    signer: signerAddress,
    accountAddress,
    functionName: 'metaDelegateCall',
    signedParams
  }

  // Use submitOrder endpoint

  const submitUrl = `${addTrailingSlash(BRINK_API_URL)}submit`
    
  const submitResponse = await post(submitUrl, signedMessage)

  console.log(submitResponse)
}
  
runStart()




