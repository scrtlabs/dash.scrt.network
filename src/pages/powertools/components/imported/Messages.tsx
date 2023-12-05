import { Tooltip } from '@mui/material'
import React from 'react'
import {
  coinFromString,
  coinsFromString,
  ibcDenom,
  MsgBeginRedelegate,
  MsgBeginRedelegateParams,
  MsgCreateValidator,
  MsgCreateValidatorParams,
  MsgCreateVestingAccount,
  MsgCreateVestingAccountParams,
  MsgDelegate,
  MsgDelegateParams,
  MsgDeposit,
  MsgDepositParams,
  MsgEditValidator,
  MsgEditValidatorParams,
  MsgExec,
  MsgExecuteContract,
  MsgExecuteContractParams,
  MsgFundCommunityPool,
  MsgFundCommunityPoolParams,
  MsgGrant,
  MsgGrantAllowance,
  MsgInstantiateContract,
  MsgInstantiateContractParams,
  MsgMultiSend,
  MsgMultiSendParams,
  MsgRevoke,
  MsgRevokeAllowance,
  MsgSend,
  MsgSendParams,
  MsgSetAutoRestake,
  MsgSetAutoRestakeParams,
  MsgSetWithdrawAddress,
  MsgSetWithdrawAddressParams,
  MsgStoreCode,
  MsgSubmitProposal,
  MsgTransfer,
  MsgTransferParams,
  MsgUndelegate,
  MsgUndelegateParams,
  MsgUnjail,
  MsgUnjailParams,
  MsgVote,
  MsgVoteParams,
  MsgVoteWeighted,
  MsgVoteWeightedParams,
  MsgWithdrawDelegatorReward,
  MsgWithdrawDelegatorRewardParams,
  MsgWithdrawValidatorCommission,
  MsgWithdrawValidatorCommissionParams,
  SecretNetworkClient,
  selfDelegatorAddressToValidatorAddress,
  toBase64,
  VoteOption
} from 'secretjs'

export type SupportedMessage =
  | MsgBeginRedelegate
  | MsgCreateValidator
  | MsgCreateVestingAccount
  | MsgDelegate
  | MsgDeposit
  | MsgEditValidator
  | MsgExec
  | MsgExecuteContract<any>
  | MsgFundCommunityPool
  | MsgGrant
  | MsgGrantAllowance
  | MsgInstantiateContract
  | MsgMultiSend
  | MsgRevoke
  | MsgRevokeAllowance
  | MsgSend
  | MsgSetWithdrawAddress
  | MsgStoreCode
  | MsgSubmitProposal
  | MsgTransfer
  | MsgUndelegate
  | MsgUnjail
  | MsgVote
  | MsgVoteWeighted
  | MsgWithdrawDelegatorReward
  | MsgWithdrawValidatorCommission
  | MsgSetAutoRestake

export const messages: {
  [name: string]: {
    module: string
    example: (secretjs: SecretNetworkClient, old: any, prefix: string, denom: string) => any
    converter: (input: any, prefix: string, denom: string) => SupportedMessage
    relevantInfo?: (
      secretjs: SecretNetworkClient,
      prefix: string,
      denom: string,
      msgInput: string,
      setMsgInput: (input: string) => void
    ) => Promise<any>
  }
} = {
  MsgSend: {
    module: 'bank',
    example: (secretjs: SecretNetworkClient, old: MsgSendParams, prefix: string, denom: string): MsgSendParams => {
      if (old) {
        old.from_address = secretjs.address
        return old
      } else {
        return {
          from_address: secretjs.address,
          to_address: `${prefix}1example`,
          //@ts-ignore
          amount: `1${denom}`
        }
      }
    },
    converter: (input: any): SupportedMessage => {
      input.amount = coinsFromString(input.amount)
      return new MsgSend(input)
    },
    relevantInfo: bankRelevantInfo
  },
  MsgDelegate: {
    module: 'staking',
    example: (
      secretjs: SecretNetworkClient,
      old: MsgDelegateParams,
      prefix: string,
      denom: string
    ): MsgDelegateParams => {
      if (old) {
        old.delegator_address = secretjs.address
        return old
      } else {
        return {
          delegator_address: secretjs.address,
          validator_address: `${prefix}valoper1example`,
          //@ts-ignore
          amount: `1${denom}`
        }
      }
    },
    converter: (input: any): SupportedMessage => {
      input.amount = coinFromString(input.amount)
      return new MsgDelegate(input)
    },
    relevantInfo: stakingRelevantInfo
  },
  MsgSetAutoRestake: {
    module: 'distribution',
    example: (
      secretjs: SecretNetworkClient,
      old: MsgSetAutoRestakeParams,
      prefix: string,
      denom: string
    ): MsgSetAutoRestakeParams => {
      if (old) {
        old.delegator_address = secretjs.address
        return old
      } else {
        return {
          delegator_address: secretjs.address,
          validator_address: `${prefix}valoper1example`,
          enabled: true
        }
      }
    },
    converter: (input: any): SupportedMessage => {
      return new MsgSetAutoRestake(input)
    },
    relevantInfo: stakingRelevantInfo
  },
  MsgBeginRedelegate: {
    module: 'staking',
    example: (
      secretjs: SecretNetworkClient,
      old: MsgBeginRedelegateParams,
      prefix: string,
      denom: string
    ): MsgBeginRedelegateParams => {
      if (old) {
        old.delegator_address = secretjs.address
        return old
      } else {
        return {
          delegator_address: secretjs.address,
          validator_src_address: `${prefix}valoper1example`,
          validator_dst_address: `${prefix}valoper1example`,
          //@ts-ignore
          amount: `1${denom}`
        }
      }
    },
    converter: (input: any): SupportedMessage => {
      input.amount = coinFromString(input.amount)
      return new MsgBeginRedelegate(input)
    },
    relevantInfo: stakingRelevantInfo
  },
  MsgCreateValidator: {
    module: 'staking',
    example: (
      secretjs: SecretNetworkClient,
      old: MsgCreateValidatorParams,
      prefix: string,
      denom: string
    ): MsgCreateValidatorParams => {
      if (old) {
        old.delegator_address = secretjs.address
        return old
      } else {
        return {
          delegator_address: secretjs.address,
          commission: {
            max_change_rate: 0.01, // can change +-1% every 24h
            max_rate: 0.1, // 10%
            rate: 0.05 // 5%
          },
          description: {
            moniker: "My validator's display name",
            identity: 'ID on keybase.io, to have a logo on explorer and stuff',
            website: 'example.com',
            security_contact: 'security@example.com',
            details: 'We are good'
          },
          pubkey: toBase64(new Uint8Array(32).fill(1)), // validator tendermit pubkey
          min_self_delegation: '1', // ${denom}
          //@ts-ignore
          initial_delegation: `1${denom}`
        }
      }
    },
    converter: (input: any) => {
      input.initial_delegation = coinFromString(input.amount)
      return new MsgCreateValidator(input)
    }
  },
  MsgCreateVestingAccount: {
    module: 'vesting',
    example: (
      secretjs: SecretNetworkClient,
      old: MsgCreateVestingAccountParams,
      prefix: string,
      denom: string
    ): MsgCreateVestingAccountParams => {
      if (old) {
        old.from_address = secretjs.address
        return old
      } else {
        return {
          from_address: secretjs.address,
          to_address: `${prefix}1example`,
          //@ts-ignore
          amount: `1${denom}`,
          end_time: '2020-09-15T14:00:00Z',
          delayed: false
        }
      }
    },
    converter: (input: any): SupportedMessage => {
      input.amount = coinsFromString(input.amount)
      return new MsgCreateVestingAccount(input)
    }
  },
  MsgDeposit: {
    module: 'gov',
    example: (
      secretjs: SecretNetworkClient,
      old: MsgDepositParams,
      prefix: string,
      denom: string
    ): MsgDepositParams => {
      if (old) {
        old.depositor = secretjs.address
        return old
      } else {
        return {
          depositor: secretjs.address,
          proposal_id: '1',
          //@ts-ignore
          amount: `1${denom}`
        }
      }
    },
    converter: (input: any): SupportedMessage => {
      input.amount = coinsFromString(input.amount)
      return new MsgDeposit(input)
    }
  },
  MsgEditValidator: {
    module: 'staking',
    example: (
      secretjs: SecretNetworkClient,
      old: MsgEditValidatorParams,
      prefix: string,
      denom: string
    ): MsgEditValidatorParams => {
      if (old) {
        old.validator_address = selfDelegatorAddressToValidatorAddress(secretjs.address, prefix)
        return old
      } else {
        return {
          validator_address: selfDelegatorAddressToValidatorAddress(secretjs.address, prefix),
          // optional: if description is provided it updates all values
          description: {
            moniker: "My new validator's display name",
            identity: 'ID on keybase.io, to have a logo on explorer and stuff',
            website: 'edited-example.com',
            security_contact: 'security@edited-example.com',
            details: 'We are good probably'
          },
          commission_rate: 0.04, // optional: 4% commission cannot be changed more than once in 24h
          min_self_delegation: '3' // optional: 3${denom}
        }
      }
    },
    converter: (input: any): SupportedMessage => new MsgEditValidator(input)
  },
  MsgExecuteContract: {
    module: 'compute',
    example: (
      secretjs: SecretNetworkClient,
      old: MsgExecuteContractParams<any>,
      prefix: string,
      denom: string
    ): MsgExecuteContractParams<any> => {
      if (old) {
        old.sender = secretjs.address
        return old
      } else {
        return {
          sender: secretjs.address,
          contract_address: `${prefix}1example`,
          msg: {
            set_viewing_key: {
              key: 'banana 🍌'
            }
          },
          code_hash: 'abcdefg', // optional
          //@ts-ignore
          sent_funds: `1${denom}` // optional
        }
      }
    },
    converter: (input: any): SupportedMessage => {
      if (input.sent_funds) {
        input.sent_funds = coinsFromString(input.sent_funds)
      }
      return new MsgExecuteContract(input)
    }
  },
  MsgFundCommunityPool: {
    module: 'distribution',
    example: (secretjs: SecretNetworkClient, old: MsgFundCommunityPoolParams): MsgFundCommunityPoolParams => {
      if (old) {
        old.depositor = secretjs.address
        return old
      } else {
        return {
          depositor: secretjs.address,
          //@ts-ignore
          amount: `1${denom}`
        }
      }
    },
    converter: (input: any): SupportedMessage => {
      input.amount = coinsFromString(input.amount)
      return new MsgFundCommunityPool(input)
    },
    relevantInfo: bankRelevantInfo
  },
  MsgInstantiateContract: {
    module: 'compute',
    example: (secretjs: SecretNetworkClient, old: MsgInstantiateContractParams): MsgInstantiateContractParams => {
      if (old) {
        old.sender = secretjs.address
        return old
      } else {
        return {
          sender: secretjs.address,
          code_id: 1,
          init_msg: {
            gm: {
              hello: 'world'
            }
          },
          label: 'gm',
          //@ts-ignore
          init_funds: `1${denom}`, // optional
          code_hash: 'abcdefg' // optional
        }
      }
    },
    converter: (input: any): SupportedMessage => {
      if (input.init_funds) {
        input.init_funds = coinsFromString(input.init_funds)
      }
      return new MsgInstantiateContract(input)
    }
  },
  MsgMultiSend: {
    module: 'bank',
    example: (
      secretjs: SecretNetworkClient,
      old: MsgMultiSendParams,
      prefix: string,
      denom: string
    ): MsgMultiSendParams => {
      if (old) {
        old.inputs[0].address = secretjs.address
        return old
      } else {
        return {
          inputs: [
            {
              address: secretjs.address,
              //@ts-ignore
              coins: `2${denom}`
            }
          ],
          outputs: [
            {
              address: `${prefix}1example`,
              //@ts-ignore
              coins: `1${denom}`
            },
            {
              address: `${prefix}1example`,
              //@ts-ignore
              coins: `1${denom}`
            }
          ]
        }
      }
    },
    converter: (input: any): SupportedMessage => {
      for (let i = 0; i < input.inputs.length; i++) {
        input.inputs[i].coins = coinsFromString(input.inputs[i].coins)
      }
      for (let i = 0; i < input.outputs.length; i++) {
        input.outputs[i].coins = coinsFromString(input.outputs[i].coins)
      }
      return new MsgMultiSend(input)
    },
    relevantInfo: bankRelevantInfo
  },
  // MsgGrant: {
  //   module: "authz",
  //   example: (secretjs: SecretNetworkClient,old: MsgGrantParams): MsgGrantParams => ({}),
  //   converter: (input: any): SupportedMessage => {},
  // },
  // MsgRevoke: {
  //   module: "authz",
  //   example: (secretjs: SecretNetworkClient,old: MsgRevokeParams): MsgRevokeParams => ({}),
  //   converter: (input: any): SupportedMessage => {},
  // },
  // MsgExec: {
  //   module: "authz",
  //   example: (secretjs: SecretNetworkClient,old: MsgExecParams): MsgExecParams => ({}),
  //   converter: (input: any): SupportedMessage => {},
  // },
  // MsgGrantAllowance: {
  //   module: "feegrant",
  //   example: (secretjs: SecretNetworkClient,old: MsgGrantAllowanceParams): MsgGrantAllowanceParams => ({}),
  //   converter: (input: any): SupportedMessage => {},
  // },
  // MsgRevokeAllowance: {
  //   module: "feegrant",
  //   example: (secretjs: SecretNetworkClient,old: MsgRevokeAllowanceParams): MsgRevokeAllowanceParams => ({}),
  //   converter: (input: any): SupportedMessage => {},
  // },
  MsgSetWithdrawAddress: {
    module: 'distribution',
    example: (
      secretjs: SecretNetworkClient,
      old: MsgSetWithdrawAddressParams,
      prefix: string,
      denom: string
    ): MsgSetWithdrawAddressParams => {
      if (old) {
        old.delegator_address = secretjs.address
        return old
      } else {
        return {
          delegator_address: secretjs.address,
          withdraw_address: `${prefix}1example`
        }
      }
    },
    converter: (input: any): SupportedMessage => new MsgSetWithdrawAddress(input)
  },
  // MsgStoreCode: {
  //   module: "compute",
  //   example: (secretjs: SecretNetworkClient,old: MsgStoreCodeParams): MsgStoreCodeParams => ({}),
  //   converter: (input: any): SupportedMessage => {},
  // },
  // MsgSubmitProposal: {
  //   module: "gov",
  //   example: (secretjs: SecretNetworkClient,old: MsgSubmitProposalParams): MsgSubmitProposalParams => ({}),
  //   converter: (input: any): SupportedMessage => {},
  // },
  MsgTransfer: {
    module: 'ibc-transfer',
    example: (
      secretjs: SecretNetworkClient,
      old: MsgTransferParams,
      prefix: string,
      denom: string
    ): MsgTransferParams => {
      if (old) {
        old.sender = secretjs.address
        return old
      } else {
        return {
          sender: secretjs.address,
          receiver: 'osmo1example',
          //@ts-ignore
          token: `1${denom}`,
          source_channel: 'channel-1',
          source_port: 'transfer',
          timeout_timestamp: '600',
          memo: ''
        }
      }
    },
    converter: (input: any): SupportedMessage => {
      input.token = coinFromString(input.token)
      input.timeout_timestamp = String(Math.floor(Date.now() / 1000) + Number(input.timeout_timestamp))
      return new MsgTransfer(input)
    },
    relevantInfo: bankRelevantInfo
  },
  MsgUndelegate: {
    module: 'staking',
    example: (
      secretjs: SecretNetworkClient,
      old: MsgUndelegateParams,
      prefix: string,
      denom: string
    ): MsgUndelegateParams => {
      if (old) {
        old.delegator_address = secretjs.address
        return old
      } else {
        return {
          delegator_address: secretjs.address,
          validator_address: `${prefix}valoper1example`,
          //@ts-ignore
          amount: `1${denom}`
        }
      }
    },
    converter: (input: any): SupportedMessage => {
      input.amount = coinFromString(input.amount)
      return new MsgUndelegate(input)
    },
    relevantInfo: stakingRelevantInfo
  },
  MsgUnjail: {
    module: 'slashing',
    example: (secretjs: SecretNetworkClient, old: MsgUnjailParams, prefix: string, denom: string): MsgUnjailParams => {
      if (old) {
        old.validator_addr = selfDelegatorAddressToValidatorAddress(secretjs.address, prefix)
        return old
      } else {
        return {
          validator_addr: selfDelegatorAddressToValidatorAddress(secretjs.address, prefix)
        }
      }
    },
    converter: (input: any): SupportedMessage => new MsgUnjail(input)
  },
  MsgVote: {
    module: 'gov',
    example: (secretjs: SecretNetworkClient, old: MsgVoteParams): MsgVoteParams => {
      if (old) {
        old.voter = secretjs.address
        return old
      } else {
        return {
          voter: secretjs.address,
          proposal_id: '123',
          //@ts-ignore
          option: 'YES/NO/ABSTAIN/NO_WITH_VETO'
        }
      }
    },
    converter: (input: any): SupportedMessage => {
      input.option = (input.option as string).toUpperCase()
      switch (input.option) {
        case 'YES':
          input.option = VoteOption.VOTE_OPTION_YES
          break
        case 'NO':
          input.option = VoteOption.VOTE_OPTION_NO
          break
        case 'ABSTAIN':
          input.option = VoteOption.VOTE_OPTION_ABSTAIN
          break
        case 'NO_WITH_VETO':
          input.option = VoteOption.VOTE_OPTION_NO_WITH_VETO
          break
        default:
          throw new Error(`unknown vote option ${input.option}`)
      }

      return new MsgVote(input)
    },
    relevantInfo: undefined // TODO
  },
  MsgVoteWeighted: {
    module: 'gov',
    example: (secretjs: SecretNetworkClient, old: MsgVoteWeightedParams): MsgVoteWeightedParams => {
      if (old) {
        old.voter = secretjs.address
        return old
      } else {
        return {
          voter: secretjs.address,
          proposal_id: '123',
          options: [
            {
              //@ts-ignore
              option: 'YES/NO/ABSTAIN/NO_WITH_VETO',
              weight: 0.6
            },
            {
              //@ts-ignore
              option: 'YES/NO/ABSTAIN/NO_WITH_VETO',
              weight: 0.4
            }
          ]
        }
      }
    },
    converter: (input: any): SupportedMessage => {
      for (let i = 0; i < input.options.length; i++) {
        input.options[i].option = (input.options[i].option as string).toUpperCase()
        switch (input.options[i].option) {
          case 'YES':
            input.options[i].option = VoteOption.VOTE_OPTION_YES
            break
          case 'NO':
            input.options[i].option = VoteOption.VOTE_OPTION_NO
            break
          case 'ABSTAIN':
            input.options[i].option = VoteOption.VOTE_OPTION_ABSTAIN
            break
          case 'NO_WITH_VETO':
            input.options[i].option = VoteOption.VOTE_OPTION_NO_WITH_VETO
            break
          default:
            throw new Error(`unknown vote option ${input.options[i].option}`)
        }
      }

      return new MsgVoteWeighted(input)
    },
    relevantInfo: undefined // TODO
  },
  MsgWithdrawDelegatorReward: {
    module: 'distribution',
    example: (
      secretjs: SecretNetworkClient,
      old: MsgWithdrawDelegatorRewardParams,
      prefix: string,
      denom: string
    ): MsgWithdrawDelegatorRewardParams => {
      if (old) {
        return Object.assign({}, old, { delegator_address: secretjs.address })
      } else {
        return {
          delegator_address: secretjs.address,
          validator_address: `${prefix}1example`
        }
      }
    },
    converter: (input: any): SupportedMessage => new MsgWithdrawDelegatorReward(input),
    relevantInfo: stakingRelevantInfo
  },
  MsgWithdrawValidatorCommission: {
    module: 'distribution',
    example: (
      secretjs: SecretNetworkClient,
      old: MsgWithdrawValidatorCommissionParams,
      prefix: string,
      denom: string
    ): MsgWithdrawValidatorCommissionParams => {
      if (old) {
        old.validator_address = selfDelegatorAddressToValidatorAddress(secretjs.address, prefix)
        return old
      } else {
        return {
          validator_address: selfDelegatorAddressToValidatorAddress(secretjs.address, prefix)
        }
      }
    },
    converter: (input: any): MsgWithdrawValidatorCommission => new MsgWithdrawValidatorCommission(input)
  }
}

export const balanceFormat = new Intl.NumberFormat('en-US', {
  minimumFractionDigits: 0,
  maximumFractionDigits: 6
}).format

async function bankRelevantInfo(
  secretjs: SecretNetworkClient,
  prefix: string,
  denom: string,
  msgInput: string,
  setMsgInput: (input: string) => void
): Promise<any> {
  try {
    const { balances } = await secretjs.query.bank.allBalances({
      address: secretjs.address
    })

    const { denom_traces } = await secretjs.query.ibc_transfer.denomTraces({
      pagination: {
        limit: '10000'
      }
    })

    const ibcDenomToBaseDenom: { [ibcDenom: string]: string } = Object.assign(
      {},
      ...denom_traces!.map(({ path, base_denom }) => {
        const split = path!.split('/')
        const paths: {
          incomingPortId: string
          incomingChannelId: string
        }[] = []
        for (let i = 0; i < split.length; i += 2) {
          paths.push({
            incomingPortId: split[i],
            incomingChannelId: split[i + 1]
          })
        }

        return {
          [ibcDenom(paths, base_denom!)]: `${base_denom!}${paths.length > 1 ? ' (non-direct)' : ''}`
        }
      })
    )

    let result = balances
      ?.sort((a, b) => (a.denom?.startsWith('ibc/') ? 1 : -1))
      .map((c) => (
        <tr key={`${c.amount}${c.denom}`}>
          <td style={{ overflowWrap: 'break-word' }}>{c.amount}</td>
          <td style={{ overflowWrap: 'anywhere' }}>{c.denom}</td>
          <td style={{ overflowWrap: 'break-word' }}>
            {c.denom === denom
              ? `${(() => {
                  const { humanDenom, decimals } = humanizeDenom(denom)
                  return `${balanceFormat(Number(c.amount) / Number(`1e${decimals}`))} ${humanDenom}`
                })()}`
              : ibcDenomToBaseDenom[c.denom!]
              ? (() => {
                  const { humanDenom, decimals } = humanizeDenom(ibcDenomToBaseDenom[c.denom!])
                  return `${balanceFormat(Number(c.amount) / Number(`1e${decimals}`))} ${humanDenom}`
                })()
              : ''}
          </td>
        </tr>
      ))

    if (result) {
      if (balances?.length === 0) {
        return 'No balance'
      } else {
        return (
          <table>
            <thead>
              <tr>
                <th>Balance</th>
                <th>Denom</th>
                <th>Pretty</th>
              </tr>
            </thead>
            <tbody>{result}</tbody>
          </table>
        )
      }
    } else {
      return 'No balance'
    }
  } catch (error) {
    if (error instanceof Error) {
      return error.message
    } else {
      return JSON.stringify(error)
    }
  }
}

async function stakingRelevantInfo(
  secretjs: SecretNetworkClient,
  prefix: string,
  denom: string,
  msgInput: string,
  setMsgInput: (input: string) => void
): Promise<any> {
  try {
    const { balance } = await secretjs.query.bank.balance({
      address: secretjs.address,
      denom
    })

    const { delegation_responses } = await secretjs.query.staking.delegatorDelegations({
      delegator_addr: secretjs.address
    })

    const pendingRewards: { [validator: string]: string } = {}
    for (const d of delegation_responses || []) {
      const validator = d.delegation?.validator_address!
      const { rewards } = await secretjs.query.distribution.delegationRewards({
        delegator_address: secretjs.address,
        validator_address: validator
      })

      pendingRewards[validator] =
        rewards
          ?.map(
            (r) =>
              `${Math.floor(Number(r.amount))}${r.denom} (${(() => {
                const { humanDenom, decimals } = humanizeDenom(denom)
                return `${balanceFormat(Math.floor(Number(r.amount)) / Number(`1e${decimals}`))} ${humanDenom}`
              })()})`
          )
          .join(',') || ''
    }

    const validators: { [validator: string]: string } = {}
    for (const validator_addr of Object.keys(pendingRewards)) {
      const { validator } = await secretjs.query.staking.validator({
        validator_addr
      })

      validators[validator_addr] = validator!.description!.moniker!
    }

    const delegations = delegation_responses?.map((d) => {
      return (
        <tr key={`${d.delegation?.validator_address}`}>
          <td style={{ overflowWrap: 'break-word' }}>{`${d.balance?.amount}${d.balance?.denom}`}</td>

          <td style={{ display: 'flex', placeItems: 'center', gap: '0.4em' }}>
            <span style={{ overflowWrap: 'anywhere' }}>
              {d.delegation?.validator_address} ({validators[d.delegation?.validator_address!]})
            </span>
            <Tooltip title={`Click to use ${validators[d.delegation?.validator_address!]} in content`} placement="top">
              <img
                src="/plus.svg"
                style={{
                  width: '1em',
                  cursor: 'pointer'
                  /* , borderRadius: 10 */
                }}
                onClick={async () =>
                  setMsgInput(msgInput.replace(/secretvaloper1example/, d.delegation?.validator_address!))
                }
              />
            </Tooltip>
          </td>
          <td style={{ overflowWrap: 'break-word' }}>{pendingRewards[d.delegation?.validator_address!]}</td>
        </tr>
      )
    })

    return (
      <table>
        <thead>
          <tr>
            <th>Balance:</th>
            <th>
              {`${balance?.amount || 0}${balance?.denom || prefix} (${(() => {
                const { humanDenom, decimals } = humanizeDenom(denom)
                return `${balanceFormat(Number(balance?.amount) / Number(`1e${decimals}`))} ${humanDenom}`
              })()})`}
            </th>
          </tr>
          {delegations?.length !== 0 ? (
            <tr>
              <th>Delegation</th>
              <th>Validator</th>
              <th>Pending Rewards</th>
            </tr>
          ) : (
            <tr>
              <th>No delegations</th>
            </tr>
          )}
        </thead>
        <tbody>{delegations}</tbody>
      </table>
    )
  } catch (error) {
    if (error instanceof Error) {
      return error.message
    } else {
      return JSON.stringify(error)
    }
  }
}

function humanizeDenom(baseDenom: string): {
  humanDenom: string
  decimals: number
} {
  const nonDirect = baseDenom.toLocaleLowerCase().includes('non-direct')
  const strippedBaseDenom = baseDenom.replace(/ \(non-direct\)/i, '')

  let humanDenom: string | undefined
  let decimals = 6

  switch (strippedBaseDenom) {
    case 'inj':
      humanDenom = 'INJ'
      decimals = 18
      break
    case 'uusd':
      humanDenom = 'UST'
      break
    case 'rowan':
      humanDenom = 'ROWAN'
      decimals = 18
      break
    case 'aevmos':
      humanDenom = 'EVMOS'
      decimals = 18
      break
    default:
      break
  }

  if (!humanDenom) {
    humanDenom = baseDenom.toUpperCase().slice(1)
  }

  if (nonDirect) {
    humanDenom += ' (non-direct)'
  }

  return { humanDenom, decimals }
}
