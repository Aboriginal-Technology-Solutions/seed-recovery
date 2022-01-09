import { config as dotenvCfg } from 'dotenv'
dotenvCfg()
import { ethers, HDNode, Wallet, BigNumber } from 'ethers'
import { clear, log } from 'console'
import axios from 'axios'
import { concatMap, filter, from, map, mergeMap } from 'rxjs'
import { randomBytes, createHash } from 'crypto'
import { fromWei } from './utils'

const THETA_OLD_TOKEN = `0x3883f5e181fccaF8410FA61e12b59BAd963fb645`
const {
  MAINNET_INFURA_WSS_URL,
  INFURA_KEY
} = process.env

let wordlist = `https://raw.githubusercontent.com/bitcoin/bips/master/bip-0039/english.txt`

const seeds = []
const passwords = []

const providerUrl = `${MAINNET_INFURA_WSS_URL}/${INFURA_KEY}`
const provider = new ethers.providers.WebSocketProvider(providerUrl)
log(ethers.utils.defaultPath, providerUrl)

const convert = {
  bin2dec : s => parseInt(s, 2).toString(10),
  bin2hex : s => parseInt(s, 2).toString(16),
  dec2bin : s => parseInt(s, 10).toString(2),
  dec2hex : s => parseInt(s, 10).toString(16),
  hex2bin : s => parseInt(s, 16).toString(2),
  hex2dec : s => parseInt(s, 16).toString(10)
};

  const derivePaths = [
    {
      name: `Ethereum`,
      path: `m/44'/60'/0'/0`,
    },
    {
      name: `Ethereum Classic`,
      path: `m/44'/61'/0'/0`,
    },
    {
      name: `Ethereum Testnet (Ropsten)`,
      path: `m/44'/1'/0'/0`,
    },
    {
      name: `Ethereum (Ledger) `,
      path: `m/44'/60'/0'`,
    },
    {
      name: `Ethereum Classic (Ledger)`,
      path: `m/44'/60'/160720'/0`,
    },
    {
      name: `Ethereum Classic (Ledger, Vintage MEW)`,
      path: `m/44'/60'/160720'/0'`,
    },
    {
      name: `Ethereum (Ledger Live) `,
      path: `m/44'/60'`,
    },
    {
      name:"Ethereum Classic (Ledger Live)", path: "m/44'/61'",
    },
    {
      name:"Ethereum (KeepKey)", path: "m/44'/60'",
    },
    {
      name:"Ethereum Classic (KeepKey)", path: "m/44'/61'",
    },
    {
      name:"RSK Mainnet", path: "m/44'/137'/0'/0",
    },
    {
      name:"Expanse", path: "m/44'/40'/0'/0",
    },
    {
      name:"Ubiq", path: "m/44'/108'/0'/0",
    },
    {
      name:"Ellaism", path: "m/44'/163'/0'/0",
    },
    {
      name:"EtherGem", path: "m/44'/1987'/0'/0",
    },
    {
      name:"Callisto", path: "m/44'/820'/0'/0",
    },
    {
      name:"Ethereum Social", path: "m/44'/1128'/0'/0",
    },
    {
      name:"Musicoin", path: "m/44'/184'/0'/0",
    },
    {
      name:"EOS Classic", path: "m/44'/2018'/0'/0",
    },
    {
      name:"Akroma", path: "m/44'/200625'/0'/0",
    },
    {
      name:"Ether Social Network", path: "m/44'/31102'/0'/0",
    },
    {
      name:"PIRL", path: "m/44'/164'/0'/0",
    },
    {
      name:"GoChain", path: "m/44'/6060'/0'/0",
    },
    {
      name:"Ether-1", path: "m/44'/1313114'/0'/0",
    },
    {
      name:"Atheios", path: "m/44'/1620'/0'/0",
    },
    {
      name:"TomoChain", path: "m/44'/889'/0'/0",
    },
    {
      name:"Mix Blockchain", path: "m/44'/76'/0'/0",
    },
    {
      name:"Iolite", path: "m/44'/1171337'/0'/0",
    },
    {
      name:"ThunderCore", path: "m/44'/1001'/0'/0",
    }
  ]
  let targetAddresses = [
    `0x8Eb9182A20c5E0Fc41821df71d4F1cfadeDC7FA6`
  ]


function getToken (address, wallet) {
  return new ethers.Contract(
    address,
    [`function balanceOf(address token) external view returns(uint)`],
    wallet
  )
}
// log(HDNode.fromMnemonic( phrase ))

class SeedRecovery {
  #_seeds = null
  #_passwords = null
  #_provider = null

  get provider () {
    return this.#_provider
  }

  constructor (seed, passwords, wordlist, provider) {
    this.#_seeds = seeds
    this.wordlist = []
    this.wordlistUrl = wordlist
    this.#_passwords = passwords
    this.#_provider = provider
    clear()
    log(`Fraktal Seed Rovery\n`)
  }

  async init() {

    log(`Initializng...`)
    // log(this.provider)
    await this.provider.ready
    await this.getWordlist(this.wordlist)
    log(`Initialized...\n`)
  }

  async getWordlist(wordlist) {
    const counter = 0
    return new Promise((resolve, reject) => {
      let _tmp = []
      from(axios.get(this.wordlistUrl))
        .pipe(
          mergeMap(list => list.data.split('\n')),
          filter(word => word !== ''),
        )
        .subscribe(word => {
          this.wordlist.push(word)
        }, err => reject(err), async () => {
          resolve(await Promise.all(this.wordlist))
        })
    })
  }
  async generateSeed(numWords) {
    return await ethers.Wallet.createRandom()
    return await HDNode.entr(ethers.utils.randomBytes(16))
  }
  async getRandNum () {
    let num = randomBytes(1).toString('hex') % 2048 
    if (isNaN(num)) return this.getRandNum()
    return num
  }
}

function hex2bin(hex){
  return (parseInt(hex, 16).toString(2))
  .padStart(63, '0');
}

const recover = new SeedRecovery(seeds, passwords, wordlist, provider)

function run (paths) {
  log(paths)
}

async function getDerivationPaths (priority = [], accountMax = 20, changeMax = 20, indexMax = 20, coinId = 60, purpose = 44) {
  const paths = priority
  let x =0, y = 0, z = 0;
  
  for (z = 0; z < indexMax; z++) {
    paths.push(`m/${purpose}'/${coinId}'/${z}`)
    for (y = 0; y < changeMax; y++) {
      paths.push(`m/${purpose}'/${coinId}'/${y}'/${z}`)
      for (x = 0; x < accountMax; x++) {
        paths.push(`m/${purpose}'/${coinId}'/${x}'/${y}'/${z}`)
      }
    }
  }
  return await paths
}

async function getWallets (wallets, _path) {
  const wallets$ = from(wallets)
  
  await wallets$.pipe(
    mergeMap(data => {
      return ethers.utils.HDNode.fromMnemonic(data.mnemonic.phrase)
    })
  )
}
const cache = {}

async function main () {
  cache.derivePaths = await getDerivationPaths(derivePaths.map(x => x.path), 100, 100, 100)

  // await recover.init()

  // const wallets = []
  // // const mnemonic = (await ethers.Wallet.createRandom()).mnemonic
  const mnemonic = [
    `sentence hello gas already skate flower adapt switch fabric box gospel find rug hollow trick ill tape obvious penalty master destroy film carpet fit`,
    (ethers.utils.entropyToMnemonic(randomBytes(32))),
    (ethers.utils.entropyToMnemonic(randomBytes(32))),
  ]
  const wallets = await Promise.all(mnemonic)


  // const mnemonic = {
  //   phrase: 'sentence hello gas already skate flower adapt switch fabric box gospel find rug hollow trick ill tape obvious penalty master destroy film carpet fit',
  //   path: "m/44'/60'/136'/0"
  // }

  // const hdNode = ethers.utils.HDNode.fromMnemonic(mnemonic.phrase)


  // hdNode.balance = await provider.getBalance(hdNode.address)
  // // const hdNode = HDNode.
  // log(`MAIN ADDRESS: ${hdNode.address}\tPRIVATE_KEY: ${hdNode.privateKey}`)
  
  // let _hdNode
  // // _hdNode.balance = await provider.getBalance(_hdNode.address)
  // // // const _hdNode = _HDNode.
  // // log(`ADDRESS: ${_hdNode.address}\tPRIVATE_KEY: ${_hdNode.privateKey}`)
  // // // log(Object.keys(_hdNode))

  let max = 100
  let count = 0
  let cursor = [process.stdout.columns, process.stdout.rows]
  process.stdout.cursorTo(0, process.stdout.rows)

  // await derivePaths.map(async obj => {
  //   const { name, path } = obj
  //   log({obj})
  // })
  async function getWallet () {

  }
  let key = 0

  from(cache.derivePaths)
    .pipe(
      map(x => ({path: x})),
      concatMap(path => {
        return from(mnemonic)
          .pipe(
            map(mnemonic => ({wallet: ethers.utils.HDNode.fromMnemonic(mnemonic), path: path.path})),
            map(data => {
              const { wallet, path: _path } = data
              const originWallet = wallet
              const derivePath = _path
              const derivedWallet = wallet.derivePath(derivePath)
              return {
                originWallet,
                derivedWallet,
                derivePath
              }
            }),
            filter(data => data.derivedWallet.address.toLowerCase() === `0x181dacde47676ba24cbe675a72ab80a9ad9054ee`.toLowerCase()),
            // map(data => ({
            //   address: data.wallet.address,

            // }))           
          )

      }),
      
    )
    .subscribe(data => {
      log(`FOUND wallet [ ADDRESS: ${data.derivedWallet.address} => PK: ${data.derivedWallet.privateKey} ] `)
      count++
    }, err => log(), () => log({count}))
  run()
  // for (let i = 0; i < max; i++) {
  //   let derivation = `m/44'/60'/${i}`
  //   _hdNode = hdNode.derivePath(derivation)
  //   _hdNode.balance = await provider.getBalance(_hdNode.address)
  //   process.stdout.cursorTo(0, process.stdout.rows)
  //   process.stdout.clearLine()

  //   let hasTargetAddress = !!targetAddresses.filter(targetAddress => {
  //     return targetAddress.toLowerCase() === _hdNode.address.toLowerCase()
  //   }).length

  //   if (hasTargetAddress || Number(fromWei(_hdNode.balance)) > 0) {
  //       process.stdout.clearLine()
  //       process.stdout.cursorTo(0, process.stdout.rows - 4)
  //       process.stdout.clearLine()

  //       log(`FOUND MATCHING ADDRESS...`)
  //       log(`\tADDRESS: ${_hdNode.address}\n\tPRIVATE_KEY: ${_hdNode.privateKey} \n\tDERIVATION: ${derivation} \n\tBALANCE: ${_hdNode.balance}\n\n\n`)
  //       process.stdout.cursorTo(0, process.stdout.rows)

  //       process.stdout.clearLine()


  //     } else {
  //       if (count % 10 === 0 && count > 0) process.stdout.clearLine()

  //       process.stdout.clearLine()
  //       process.stdout.write(
  //         `PROCESSING => ADDRESS: ${_hdNode.address} \tBALANCE: ${_hdNode.balance}\t${'[ PROCESSED: ' + count + ' ] ' + '.'.repeat(count % 50)}`
  //       )
  //       count++
  //     }


  // }

  // for (let i = 0; i < max; i++) {
  //   for (let n = 0; n < max; n++) {
  //     let derivation = `m/44'/60'/${i}/${n}`
  //     _hdNode = hdNode.derivePath(derivation)
  //     _hdNode.balance = await provider.getBalance(_hdNode.address)
  //     process.stdout.cursorTo(0, process.stdout.rows)
  //     process.stdout.clearLine()

  //     let hasTargetAddress = !!targetAddresses.filter(targetAddress => {
  //       return targetAddress.toLowerCase() === _hdNode.address.toLowerCase()
  //     }).length

  //     if (hasTargetAddress || Number(fromWei(_hdNode.balance)) > 0) {
  //         process.stdout.clearLine()
  //         process.stdout.cursorTo(0, process.stdout.rows - 4)
  //         process.stdout.clearLine()

  //         log(`FOUND MATCHING ADDRESS...`)
  //         log(`\tADDRESS: ${_hdNode.address}\n\tPRIVATE_KEY: ${_hdNode.privateKey} \n\tDERIVATION: ${derivation} \n\tBALANCE: ${_hdNode.balance}\n\n\n`)
  //         process.stdout.cursorTo(0, process.stdout.rows)

  //         process.stdout.clearLine()


  //       } else {
  //         if (count % 10 === 0 && count > 0) process.stdout.clearLine()

  //         process.stdout.clearLine()
  //         process.stdout.write(
  //           `PROCESSING => ADDRESS: ${_hdNode.address} \tBALANCE: ${_hdNode.balance}\t${'[ PROCESSED: ' + count + ' ] ' + '.'.repeat(count % 50)}`
  //         )
  //         count++
  //       }
  //     }

  // }


  // for (let i = 0; i < max; i++) {
  //   for (let x = 0; x < max; x++) {
  //     for (let y = 0; y < max; y++) {
  //       let derivation = `m/44'/60'/${y}'/${x}'/${i}`

  //       _hdNode = hdNode.derivePath(derivation)
  //       _hdNode.balance = await provider.getBalance(_hdNode.address)
  //       process.stdout.cursorTo(0, process.stdout.rows)
  //       process.stdout.clearLine()
  
  //       let hasTargetAddress = !!targetAddresses.filter(targetAddress => {
  //         return targetAddress.toLowerCase() === _hdNode.address.toLowerCase()
  //       }).length
  
  //       if (hasTargetAddress || Number(fromWei(_hdNode.balance)) > 0) {
  //           process.stdout.clearLine()
  //           process.stdout.cursorTo(0, process.stdout.rows - 4)
  //           process.stdout.clearLine()
  
  //           log(`FOUND MATCHING ADDRESS...`)
  //           log(`\tADDRESS: ${_hdNode.address}\n\tPRIVATE_KEY: ${_hdNode.privateKey} \n\tDERIVATION: ${derivation} \n\tBALANCE: ${_hdNode.balance}\n\n\n`)
  //           process.stdout.cursorTo(0, process.stdout.rows)
  
  //           process.stdout.clearLine()
  
  
  //         } else {
  //           if (count % 10 === 0 && count > 0) process.stdout.clearLine()
  
  //           process.stdout.clearLine()
  //           process.stdout.write(
  //             `PROCESSING => ADDRESS: ${_hdNode.address} \tBALANCE: ${_hdNode.balance}\t${'[ PROCESSED: ' + count + ' ] ' + '.'.repeat(count % 50)}`
  //           )
  //           count++
  //         }
  
  //     }
      
  //   }
  // }

}

main()