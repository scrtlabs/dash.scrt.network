import { Plugin } from 'vite'

export function whip003(): Plugin {
  return {
    name: 'build-tokens',
    async buildStart(options) {
      const { chains, tokens, snips } = await import('./src/utils/config')

      const whip003 = {
        chains: {},
        contracts: {}
      }

      // add chain definitions
      for (const chain of Object.values(chains)) {
        whip003.chains[chain.chain_id] = {
          namespace: 'cosmos',
          reference: chain.chain_id,
          label: chain.chain_name,
          bech32s: chain.bech32_prefix
        }
      }

      // add IBC tokens
      for (const token of Object.values(tokens)) {
        whip003.contracts[token.name] = {
          chain: 'cosmos:secret-4',
          address: token.address,
          label:
            1 === token.withdrawals.length
              ? token.deposits[0].chain_name
              : 'SCRT' === token.name
              ? 'Secret Network'
              : token.name,
          interfaces: {
            snip20: {
              symbol: token.name,
              decimals: token.decimals,
              coingeckoId: token.coingecko_id
            }
          }
        }
      }

      // add IBC tokens
      for (const token of Object.values(tokens)) {
        whip003.contracts[token.name] = {
          chain: 'cosmos:secret-4',
          address: token.address,
          label:
            1 === token.withdrawals.length
              ? token.deposits[0].chain_name
              : 'SCRT' === token.name
              ? 'Secret Network'
              : token.name,
          interfaces: {
            snip20: {
              symbol: token.name,
              decimals: token.decimals,
              coingeckoId: token.coingecko_id
            }
          }
        }
      }

      // add SNIPs
      for (const snip of Object.values(snips)) {
        whip003.contracts[snip.name] = {
          chain: 'cosmos:secret-4',
          address: snip.address,
          label: snip.coingecko_id
            ? snip.coingecko_id.replace(/-/g, ' ').replace(/\b[a-z]/g, (s) => s.toUpperCase())
            : snip.name,
          interfaces: {
            snip20: {
              symbol: snip.name,
              decimals: snip.decimals,
              coingeckoId: snip.coingecko_id
            }
          }
        }
      }

      // emit the whip-003 JSON definition
      this.emitFile({
        type: 'asset',
        fileName: 'whip-003.json',
        source: JSON.stringify(whip003, null, '\t')
      })
    }
  }
}
