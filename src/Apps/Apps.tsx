import { faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { Component, useState } from "react";


export function Apps() {
  const dappsData = [
    // {
    //   "name": "Abakhus",
    //   "description": "A protocol to secure health and life science data.",
    //   "url": "https://abakhus.io/",
    //   "image": "abakhus.png",
    //   "tags": ["Communications"]
    // },
    // {
    //   "name": "ActiList",
    //   "description": "Interactive NFT marketplace with secret auctions and customizable access control.",
    //   "url": "https://abakhus.io/",
    //   "image": "actilist.webp",
    //   "tags": ["NFTs"]
    // },
    {
      "name": "Alter",
      "description": "A private and secure messaging app that protects your data and identity when communicating online.",
      "url": "https://alter.network/",
      "image": "alter.webp",
      "tags": ["Communications"]
    },
    {
      "name": "AmberDAO",
      "description": "A community-driven, privacy-preserving store of value token built on Secret Network.",
      "url": "https://twitter.com/AmberDAO_",
      "image": "amberdao.webp",
      "tags": ["Defi"]
    },
    // {
    //   "name": "BIDSHOP",
    //   "description": "The first and only trustless NFT marketplace with encrypted & secret bidding.",
    //   "url": "https://www.bidshop.io/",
    //   "image": "bidshop.webp",
    //   "tags": ["NFTs", "Games"]
    // },
    {
      "name": "BlackBox",
      "description": "A collection of dApps to bring together privacy and convenience.",
      "url": "https://blackbox.cash/",
      "image": "blackbox.webp",
      "tags": ["Defi"]
    },
    // {
    //   "name": "Blizzard",
    //   "description": "A balancer-like AMM that provides many features, competitive rates, and a zero-inflation stakeholder growth model.",
    //   "url": "https://blizzard.finance/",
    //   "image": "blizzard.svg",
    //   "tags": ["Defi"]
    // },
    {
      "name": "btn.group",
      "description": "Home of Button Swap, Secret Network's only DEX aggregator, and other DEFI apps and dapps.",
      "url": "https://btn.group/",
      "image": "btngroup.webp",
      "tags": ["Defi", "NFTs", "AMM"]
    },
    // {
    //   "name": "Bushi",
    //   "description": "A competitive third-person shooter that blurs the lines between traditional games, web3 gaming, and esports.",
    //   "url": "https://twitter.com/playBushi",
    //   "image": "bushi.webp",
    //   "tags": ["Games"]
    // },
    {
      "name": "CertUP",
      "description": "Revolutionising official document distribution, verification and publication through Secret NFTs.",
      "url": "https://certup.net/",
      "image": "certup.png",
      "tags": ["NFTs"]
    },
    {
      "name": "Data Vault",
      "description": "The world’s first decentralized privacy-preserving content management and data exchange protocol.",
      "url": "https://twitter.com/Data_Vault_",
      "image": "datavault.webp",
      "tags": ["Defi", "Social"]
    },
    {
      "name": "Legendao",
      "description": "A play-to-mint NFT platform that enables creators to launch their NFT projects in a unique, gamified way.",
      "url": "https://legendao.io/",
      "image": "legendao.webp",
      "tags": ["NFTs", "Games"]
    },
    {
      "name": "Lorem Ipsum",
      "description": "Lorem Ipsum – the first Metaverse on Secret Network and IBC with privacy features.",
      "url": "https://geeks.pics/",
      "image": "loremipsum.webp",
      "tags": ["NFTs", "Games"]
    },
    {
      "name": "onenet.",
      "description": "An all-in-one game distribution platform for Secret Network and the Cosmos ecosystem.",
      "url": "https://www.launchonenet.io/",
      "image": "onenet.webp",
      "tags": ["Games"]
    },
    // {
    //   "name": "Packs",
    //   "description": "A DAO platform that allows web3 teams to easily organize digital assets and make decisions together.",
    //   "url": "https://www.packs.space/",
    //   "image": "packs.png",
    //   "tags": ["Social", "Communications"]
    // },
    {
      "name": "Secret Bridges",
      "description": "Bridges from Ethereum, Binance Smart Chain, and Monero to Secret.",
      "url": "https://bridge.scrt.network/",
      "image": "secretbridges.webp",
      "tags": ["Defi"]
    },
    {
      "name": "Secret Dreamscape",
      "description": "A multiplayer card game that combines the addictive nature of word building with the social nuance of betting games.",
      "url": "https://twitter.com/SCRTDreamscape",
      "image": "secretdreamscape.webp",
      "tags": ["NFTs", "Games"]
    },
    {
      "name": "Secret Time Capsule",
      "description": "The first blockchain dApp to send messages and crypto coins into the future. Have fun, stake SCRTs and maximize your rewards!",
      "url": "https://secrettimecapsule.net/",
      "image": "secrettimecapsule.webp",
      "tags": ["Communications", "Defi"]
    },
    // {
    //   "name": "Secret Tokens",
    //   "description": "Wrapping Coins as Secret Tokens immediately supercharges them with private balances and private transfers.",
    //   "url": "https://wrap.scrt.network/",
    //   "image": "secrettokens.webp",
    //   "tags": []
    // },
    {
      "name": "SecretDAO",
      "description": "SecretDAO is a DAO creation tooling platform that aims to make DAO creation simple, easy, and accessible.",
      "url": "https://secretdao.com/",
      "image": "secretdao.webp",
      "tags": ["Communications", "Social"]
    },
    {
      "name": "SecretSwap 2.0",
      "description": "A liquidity hub DEX with sustainable and efficient liquidity",
      "url": "https://arufaresearch.com/",
      "image": "secretswap2_0.png",
      "tags": ["Defi", "AMM"]
    },
    {
      "name": "Selenian",
      "description": "Selenian Protocol helps users maximize returns on digital assets through unlocking capital efficiency across IBC.",
      "url": "https://selenian.network/",
      "image": "selenian.webp",
      "tags": ["Defi"]
    },
    // {
    //   "name": "Serenity Shield",
    //   "description": "Serenity Shield provides a tool for backing up your seed phrase and other sensitive data, allowing recovery in an emergency event.",
    //   "url": "https://serenityshield.io/",
    //   "image": "serenityshield.png",
    //   "tags": ["Defi"]
    // },
    {
      "name": "Shade Protocol",
      "description": "An array of connected privacy-preserving DeFi applications built on Secret Network.",
      "url": "https://shadeprotocol.io/",
      "image": "shadeprotocol.webp",
      "tags": ["Defi"]
    },
    {
      "name": "SiennaSwap",
      "description": "Privacy-first & cross-chain defi platform. Privately swap, lend and convert your tokens into their private equivalent.",
      "url": "https://sienna.network/swap/",
      "image": "siennaswap.webp",
      "tags": ["Defi", "AMM"]
    },
    {
      "name": "Stake Easy",
      "description": "The privacy-preserving liquid staking solution for Secret Network.",
      "url": "https://www.stakeeasy.finance/",
      "image": "stakeeasy.webp",
      "tags": ["Defi"]
    },
    {
      "name": "Stashh",
      "description": "Mint, buy, and trade the first NFTs with native privacy and access control, known as Secret NFTs.",
      "url": "https://stashh.io/",
      "image": "stashh.webp",
      "tags": ["NFTs"]
    },
    {
      "name": "V-IRL",
      "description": "Bridging Virtual assets to real life. The world's first anonymous on-chain redemptions. Merch, authentication, ticketing/access, and more.",
      "url": "https://www.v-irl.com/",
      "image": "virl.webp",
      "tags": ["NFTs"]
    },
    // {
    //   "name": "YOIU",
    //   "description": "A gateway to future IDO's of tech startups, fueled by secret tokens.",
    //   "url": "https://yoiu.notion.site/yoiu/YOIU-s-Gateway-a006a05c39a241638bb7cff2f7c2de5a",
    //   "image": "yoiu.png",
    //   "tags": ["Defi", "Social"]
    // }
  ]

  interface IDappItemProps {
    name?: string;
    description?: string;
    url?: string;
    image?: string;
    tags?: string[];
  }

  class DappItem extends Component<IDappItemProps> {
    render() {
      var tags = this.props.tags?.map((tag) =>
        <span className="bg-zinc-900 text-xs font-semibold px-2 py-1 rounded-md inline-block">{tag}</span>
      );
      return ( 
        <>
          <a href={this.props.url || "#"} target={this.props.url ? "_blank" : "_self"} className="col-span-12 sm:col-span-6 md:col-span-4 xl:col-span-3">
            <div className="bg-zinc-800 hover:bg-zinc-700 transition-colors p-4 flex flex-col h-full rounded-xl overflow-hidden">
              <img src={"/dapps/" + this.props.image} alt={`${this.props.name} logo`} className="w-16 h-16 rounded-xl block mb-4 bg-zinc-900 flex-initial"/>
              <div className="text-2xl font-bold flex-initial">{this.props.name}</div>
              <div className="text-zinc-400 flex-1">{this.props.description}</div>
              <div className="space-x-2 mt-4 flex-initial">
                {tags}
              </div>
            </div>
          </a>
        </>
      );
    }
  }

  const [tagsToBeFilteredBy, setTagsToBeFilteredBy] = useState<string[]>([]);
  function isTagInFilterList(tag: string) {
    return tagsToBeFilteredBy.find(e => e === tag);
  }

  function toggleTagFilter(tagName: string) {
    if (tagsToBeFilteredBy.includes(tagName)) {
      setTagsToBeFilteredBy(tagsToBeFilteredBy.filter(tag => tag !== tagName));
    } else {
      setTagsToBeFilteredBy(tagsToBeFilteredBy.concat(tagName));
    }
  }

  function Tag(props: { name: string }) {
    return <button onClick={() => toggleTagFilter(props.name)} className={"inline-block text-sm font-semibold px-1.5 py-0.5 rounded-md overflow-hidden transition-colors" + (isTagInFilterList(props.name) ? " bg-zinc-500 hover:bg-zinc-600" : " bg-zinc-800 hover:bg-zinc-700")}>{props.name}</button>
  }


  // Search and Filter
  const [searchText, setSearchText] = useState<string>("");
  
  let tags: string[] = [];
  dappsData.forEach((app) => {
    app.tags.forEach((tag) => {
      if (!tags.find(tagItem => tagItem === tag)) {
        tags.push(tag);
      }
    })
  });
  tags = tags.sort();

  function filteredDappsData() {
    var items = dappsData;
    if (searchText !== "") {
      items = dappsData.filter(app => app.name.toLowerCase().includes(searchText.toLowerCase()));
    }

    if (tagsToBeFilteredBy.length > 0) {
      items = items.filter(item => item.tags.find(tag => tagsToBeFilteredBy.includes(tag)));
    }
    return items;
  }

  const items = filteredDappsData().map((dapp) =>
    <DappItem name={dapp.name} description={dapp.description} tags={dapp.tags} image={dapp.image} url={dapp.url}/>
  )

  return (
    <>
      <div className="max-w-screen-2xl mx-auto px-6">
        <h1 className="text-center font-bold text-4xl mb-10">Applications</h1>
        {/* Search and Filter */}
        <div className="relative w-full sm:w-96 mx-auto mb-4">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <FontAwesomeIcon icon={faMagnifyingGlass} className=""/>
          </div>
          <input value={searchText} onChange={e => setSearchText(e.target.value)} type="text" id="search" className="block w-full p-4 pl-10 text-sm rounded-lg bg-zinc-800 text-white" placeholder="Search" />
        </div>

          {/* Filter */}
          <div className="space-x-2 text-center mb-8">
            {tags.map((tag) =>
              <Tag name={tag}/>
            )}
          </div>

        {/* items */}
        <div className="grid grid-cols-12 gap-4 auto-rows-auto">
            {items}
        </div>
      </div>
    </>
  )
}