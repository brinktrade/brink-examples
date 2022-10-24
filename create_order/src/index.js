const { ethers } = require("hardhat")
const { get } = require('axios')
const BRINK_API_URL = 'https://app-api.brink.trade'
const NFT_APPROVAL_SWAP_VERIFIER = '0x47b16A209c757FA4A34BbfBbE48204906C4FDE5d'
const DAI_ADDRESS = '0x6b175474e89094c44da98b954eedeac495271d0f'
const CRYPTO_COVEN_COLLECTION_ADDRESS = '0x5180db8f5c931aae63c74266b211f580155ecac8'
const MAX_UINT256 = '115792089237316195423570985008687907853269984665640564039457584007913129639935'

const addTrailingSlash = str => str.charAt(str.length-1) !== '/' ? `${str}/` : str

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
  // LimitSwapApprovalVerifier.sol: https://etherscan.io/address/0x89d2D7803f8DC44eD24dCCeBE4222E35B0756a33#code
  // NftApprovalSwapVerifier.sol: https://etherscan.io/address/0x47b16A209c757FA4A34BbfBbE48204906C4FDE5d#code

  const verifier = NFT_APPROVAL_SWAP_VERIFIER
  const verifierFunc = 'tokenToNft'
  const tokenIn = DAI_ADDRESS
  const nftOut = CRYPTO_COVEN_COLLECTION_ADDRESS
  const tokenInAmount = ethers.utils.parseUnits('250', 18) // 250 DAI
  const expiryBlock = MAX_UINT256 // No expiry
  const recipient = signerAddress // recipient of NFT

  // Use createOrder endpoint 

  // Sign response 

  // Use submitOrder endpoint

}
  
runStart()




