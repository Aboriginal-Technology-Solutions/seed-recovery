const { ethers } = require('ethers')

const fromWei = (x, u = 18) => ethers.utils.formatUnits(x, u);

const toWei = (x, u = 18) => ethers.utils.parseUnits(`${x}`, u)
const pctDiff = (startVal, newVal) => Math.abs(100 * (newVal - startVal) / startVal)

const bpsToPct =  (bps) => bps / 10000 

const sleep = async time => new Promise(resolve => setTimeout(() => resolve(time), time))

module.exports = {
  fromWei,
  toWei,
  pctDiff,
  bpsToPct,
  sleep
}