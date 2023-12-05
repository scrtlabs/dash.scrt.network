import { Window as KeplrWindow } from '@keplr-wallet/types'
import { FileCopyOutlined } from '@mui/icons-material'
import { Dialog, DialogContent, DialogTitle, Typography } from '@mui/material'
import Button from '@mui/material/Button'
import React, { useEffect, useState } from 'react'
import CopyToClipboard from 'react-copy-to-clipboard'
import { isMobile } from 'react-device-detect'
import { Else, If, Then } from 'react-if'
import { Breakpoint } from 'react-socks'
import { MetaMaskWallet, SecretNetworkClient } from 'secretjs'

declare global {
  interface Window extends KeplrWindow {}
}
window.addEventListener('keplr_keystorechange', () => {
  console.log('Key store in Keplr is changed. Refreshing page.')
  location.reload()
})

const LOCALSTORAGE_KEY = 'superuser_wallet'

type Wallet = {
  name: string
  img: string
  isDesktop: boolean
  isMobile: boolean
  connect: (
    setSecretjs: React.Dispatch<React.SetStateAction<SecretNetworkClient | null>>,
    setWalletAddress: React.Dispatch<React.SetStateAction<string>>,
    url: string,
    chainId: string
  ) => Promise<void>
}

const wallets: Wallet[] = [
  {
    name: 'Keplr',
    img: '/keplr.svg',
    isDesktop: true,
    isMobile: false,
    connect: connectKeplr
  },
  {
    name: 'Fina',
    img: '/fina.webp',
    isDesktop: false,
    isMobile: true,
    connect: connectFina
  },
  {
    name: 'StarShell',
    img: '/starshell.svg',
    isDesktop: true,
    isMobile: false,
    connect: connectStarShell
  },
  {
    name: 'Leap',
    img: '/leap.png',
    isDesktop: true,
    isMobile: true,
    connect: connectLeap
  },
  {
    name: 'MetaMask',
    img: '/metamask.svg',
    isDesktop: true,
    isMobile: true,
    connect: connectMetamask
  }
]

export function WalletButton({
  secretjs,
  setSecretjs,
  walletAddress,
  setWalletAddress,
  url,
  chainId
}: {
  secretjs: SecretNetworkClient | null
  setSecretjs: React.Dispatch<React.SetStateAction<SecretNetworkClient | null>>
  walletAddress: string
  setWalletAddress: React.Dispatch<React.SetStateAction<string>>
  url: string
  chainId: string
}) {
  const [isCopied, setIsCopied] = useState<boolean>(false)
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false)
  const [connectedWallet, setConnectedWallet] = useState<string>('')

  useEffect(() => {
    function localStorageEventHandler() {
      const walletName = localStorage.getItem(LOCALSTORAGE_KEY)
      if (walletName) {
        setConnectedWallet(walletName)
      }
    }

    // call on startup
    localStorageEventHandler()

    // call on every change
    window.addEventListener('storage', localStorageEventHandler)

    // remove when the component unmounts
    return () => window.removeEventListener('storage', localStorageEventHandler)
  }, [])

  const content = (
    <div style={{ display: 'flex', placeItems: 'center', borderRadius: 10 }}>
      {(() => {
        const img = wallets.find((w) => w.name === connectedWallet)?.img

        if (!img) {
          return null
        }

        return (
          <img
            src={wallets.find((w) => w.name === connectedWallet)?.img}
            style={{ width: '1.8rem', borderRadius: 10 }}
          />
        )
      })()}
      <span style={{ margin: '0 0.3rem' }}>
        <If condition={walletAddress.length > 0}>
          <Then>
            <strong>
              <Breakpoint small down>{`${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`}</Breakpoint>
              <Breakpoint medium up>
                {`${walletAddress.slice(0, 12)}...${walletAddress.slice(-5)}`}
              </Breakpoint>
            </strong>
          </Then>
          <Else>
            <strong>Connect</strong>
          </Else>
        </If>
      </span>
    </div>
  )

  if (secretjs) {
    return (
      <CopyToClipboard
        text={walletAddress}
        onCopy={() => {
          setIsCopied(true)
          setTimeout(() => setIsCopied(false), 3000)
        }}
      >
        <Button
          variant="contained"
          style={{
            background: 'rgb(232, 236, 251)',
            textTransform: 'none',
            color: 'black'
          }}
        >
          {content} <FileCopyOutlined fontSize="small" style={isCopied ? { fill: 'green' } : undefined} />
        </Button>
      </CopyToClipboard>
    )
  } else {
    return (
      <>
        <Button
          variant="contained"
          style={{
            background: 'rgb(232, 236, 251)',
            color: 'black'
          }}
          onClick={() => setIsDialogOpen(true)}
        >
          {content}
        </Button>
        <Dialog open={isDialogOpen} onClose={() => setIsDialogOpen(false)}>
          <DialogTitle>Connect a wallet</DialogTitle>

          <DialogContent>
            <Breakpoint medium up>
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.8rem',
                  placeContent: 'flex-start',
                  placeItems: 'center'
                }}
              >
                {getWalletsButtons(
                  wallets.filter((wallet) => wallet.isDesktop),
                  setSecretjs,
                  setWalletAddress,
                  url,
                  chainId
                )}
              </div>
            </Breakpoint>
            <Breakpoint small down>
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.8rem',
                  placeContent: 'flex-start',
                  placeItems: 'center'
                }}
              >
                {getWalletsButtons(
                  wallets.filter((wallet) => wallet.isMobile),
                  setSecretjs,
                  setWalletAddress,
                  url,
                  chainId
                )}
              </div>
            </Breakpoint>
          </DialogContent>
        </Dialog>
      </>
    )
  }
}

function getWalletsButtons(
  wallets: Wallet[],
  setSecretjs: React.Dispatch<React.SetStateAction<SecretNetworkClient | null>>,
  setWalletAddress: React.Dispatch<React.SetStateAction<string>>,
  url: string,
  chainId: string
): JSX.Element {
  return (
    <>
      {wallets.map((wallet) => (
        <Button
          key={wallet.name}
          variant="contained"
          style={{
            background: 'rgb(232, 236, 251)',
            textTransform: 'none',
            color: 'black',
            minWidth: '18rem',
            minHeight: '3rem'
          }}
          onClick={() => {
            try {
              wallet.connect(setSecretjs, setWalletAddress, url, chainId)
            } catch (error) {
              console.log('wallet connect error', JSON.stringify(error))
            }
          }}
        >
          <div
            style={{
              width: '100%',
              display: 'flex',
              gap: '0.5em',
              placeContent: 'flex-start',
              placeItems: 'center'
            }}
          >
            <img
              src={wallet.img}
              style={{
                width: '1.8rem',
                borderRadius: 10,
                marginRight: '0.5rem'
              }}
            />
            <Typography component="span">
              <strong>{wallet.name}</strong>
            </Typography>
          </div>
        </Button>
      ))}
    </>
  )
}

export async function reconnectWallet(
  setSecretjs: React.Dispatch<React.SetStateAction<SecretNetworkClient | null>>,
  setWalletAddress: React.Dispatch<React.SetStateAction<string>>,
  url: string,
  chainId: string
): Promise<void> {
  const walletName = localStorage.getItem(LOCALSTORAGE_KEY)
  const wallet = wallets.find((w) => w.name === walletName)

  if (!wallet) {
    throw new Error(`Cannot find ${walletName} wallet`)
  }

  return wallet.connect(setSecretjs, setWalletAddress, url, chainId)
}

async function connectKeplr(
  setSecretjs: React.Dispatch<React.SetStateAction<SecretNetworkClient | null>>,
  setWalletAddress: React.Dispatch<React.SetStateAction<string>>,
  url: string,
  chainId: string,
  walletNameForLocalStorage: string = 'Keplr'
) {
  await window.keplr!.enable(chainId)

  const wallet = window.keplr!.getOfflineSignerOnlyAmino(chainId)
  const [{ address: walletAddress }] = await wallet.getAccounts()

  const secretjs = new SecretNetworkClient({
    url,
    chainId,
    wallet,
    walletAddress: walletAddress,
    encryptionUtils: window.keplr!.getEnigmaUtils(chainId)
  })

  setWalletAddress(walletAddress)
  setSecretjs(secretjs)

  localStorage.setItem(LOCALSTORAGE_KEY, walletNameForLocalStorage)
  window.dispatchEvent(new Event('storage'))
}

async function connectFina(
  setSecretjs: React.Dispatch<React.SetStateAction<SecretNetworkClient | null>>,
  setWalletAddress: React.Dispatch<React.SetStateAction<string>>,
  url: string,
  chainId: string
) {
  if (!window.keplr && isMobile) {
    const urlSearchParams = new URLSearchParams()
    urlSearchParams.append('network', chainId)
    urlSearchParams.append('url', window.location.href)

    window.open(`fina://wllet/dapps?${urlSearchParams.toString()}`, '_blank')

    localStorage.setItem(LOCALSTORAGE_KEY, 'Fina')
    window.dispatchEvent(new Event('storage'))
  } else {
    connectKeplr(setSecretjs, setWalletAddress, url, chainId, 'Fina')
  }
}

async function connectStarShell(
  setSecretjs: React.Dispatch<React.SetStateAction<SecretNetworkClient | null>>,
  setWalletAddress: React.Dispatch<React.SetStateAction<string>>,
  url: string,
  chainId: string
) {
  if (!window.keplr && isMobile) {
    // const urlSearchParams = new URLSearchParams();
    // urlSearchParams.append("network", chainId);
    // urlSearchParams.append("url", window.location.href);
    // window.open(`fina://wllet/dapps?${urlSearchParams.toString()}`, "_blank");
    // localStorage.setItem(LOCALSTORAGE_KEY, "Fina");
    // window.dispatchEvent(new Event("storage"));
  } else {
    connectKeplr(setSecretjs, setWalletAddress, url, chainId, 'StarShell')
  }
}

async function connectLeap(
  setSecretjs: React.Dispatch<React.SetStateAction<SecretNetworkClient | null>>,
  setWalletAddress: React.Dispatch<React.SetStateAction<string>>,
  url: string,
  chainId: string
) {
  //@ts-ignore
  if (!window.leap && isMobile) {
    // const urlSearchParams = new URLSearchParams();
    // urlSearchParams.append("network", chainId);
    // urlSearchParams.append("url", window.location.href);
    // window.open(`fina://wllet/dapps?${urlSearchParams.toString()}`, "_blank");
    // localStorage.setItem(LOCALSTORAGE_KEY, "Fina");
    // window.dispatchEvent(new Event("storage"));
  } else {
    //@ts-ignore
    await window.leap.enable(chainId)

    //@ts-ignore
    const wallet = window.leap.getOfflineSignerOnlyAmino(chainId)
    const [{ address: walletAddress }] = await wallet.getAccounts()

    const secretjs = new SecretNetworkClient({
      url,
      chainId,
      wallet,
      walletAddress,
      //@ts-ignore
      encryptionUtils: window.leap.getEnigmaUtils(chainId)
    })

    setWalletAddress(walletAddress)
    setSecretjs(secretjs)

    localStorage.setItem(LOCALSTORAGE_KEY, 'Leap')
    window.dispatchEvent(new Event('storage'))
  }
}

async function connectMetamask(
  setSecretjs: React.Dispatch<React.SetStateAction<SecretNetworkClient | null>>,
  setWalletAddress: React.Dispatch<React.SetStateAction<string>>,
  url: string,
  chainId: string
) {
  // @ts-ignore
  if (!window.ethereum && isMobile) {
    window.open(`https://metamask.app.link/dapp/${window.location.href.replace(/^https:\/\//, '')}`, '_blank')
  } else {
    // @ts-ignore
    const [ethAddress] = await window.ethereum.request({
      method: 'eth_requestAccounts'
    })

    // @ts-ignore
    const wallet = await MetaMaskWallet.create(window.ethereum, ethAddress)

    const secretjs = new SecretNetworkClient({
      url,
      chainId,
      wallet,
      walletAddress: wallet.address
    })

    setWalletAddress(wallet.address)
    setSecretjs(secretjs)
  }

  localStorage.setItem(LOCALSTORAGE_KEY, 'MetaMask')
  window.dispatchEvent(new Event('storage'))
}
