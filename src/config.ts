export type Token = {
  /** display name of the token */
  name: string;
  /** a snip20 token that's originated from Secret Network */
  is_snip20?: boolean;
  /** secret contract address of the token */
  address: string;
  /** secret contract code hash of the token */
  code_hash: string;
  /** logo of the token */
  image: string;
  /** decimals of the token */
  decimals: number;
  /** coingeck id to get usd price */
  coingecko_id: string;
  /** how to deposit this token into Secret Network */
  deposits: Deposit[];
  /** how to withdraw this token out of Secret Network */
  withdrawals: Withdraw[];
};

export type Deposit = {
  /** display name of the source chain */
  source_chain_name: string;
  /** denom on the other chain */
  from_denom: string;

  /** channel_id on the chain (snip20) */
  channel_id?: string;
  /** gas limit for ibc transfer from the chain to Secret Network (snip20) */
  gas?: number;
};

export type Withdraw = {
  /** display name of the target chain */
  target_chain_name: string;
  /** denom on Secret Network */
  from_denom: string;

  /** channel_id on Secret Network (snip20) */
  channel_id?: string;
  /** gas limit for ibc transfer from Secret Network to the chain (snip20) */
  gas?: number;
};

// Native tokens of chains (and tokens from external chains)
export const tokens: Token[] = [
  {
    name: "SCRT",
    address: "secret1k0jntykt7e4g3y88ltc60czgjuqdy4c9e8fzek",
    code_hash:
      "af74387e276be8874f07bec3a87023ee49b0e7ebe08178c49d0a49c3c98ed60e",
    image: "/scrt.svg",
    decimals: 6,
    coingecko_id: "secret",
    deposits: [
      {
        source_chain_name: "Akash",
        from_denom:
          "ibc/13BD0905CFB705ABF84B60209C44071878C9F07A0A2CAC5EDBE315AD3CFD1DF2", // SCRT denom on Akash
      },
      {
        source_chain_name: "Chihuahua",
        from_denom:
          "ibc/EB2CED20AB0466F18BE49285E56B31306D4C60438A022EA995BA65D5E3CF7E09", // SCRT denom on Chihuahua
      },
      {
        source_chain_name: "Cosmos Hub",
        from_denom:
          "ibc/1542F8DC70E7999691E991E1EDEB1B47E65E3A217B1649D347098EE48ACB580F", // SCRT denom on Cosmos
      },
      {
        source_chain_name: "Crescent",
        from_denom:
          "ibc/A358D7F19237777AF6D8AD0E0F53268F8B18AE8A53ED318095C14D6D7F3B2DB5", // SCRT denom on Crescent
      },
      {
        source_chain_name: "Evmos",
        from_denom:
          "ibc/DC74BE775F57FF32C3C6E14ACD86339DB50632246F6482C81CF5FCE64C0AC5C7", // SCRT denom on Evmos
      },
      {
        source_chain_name: "Gravity Bridge",
        from_denom:
          "ibc/7907EA1A11FD4FC2A815FCAA54948C42F08E3F3C874EE48861386286FEB80160", // SCRT denom on Gravity Bridge
      },
      {
        source_chain_name: "Injective",
        from_denom:
          "ibc/0954E1C28EB7AF5B72D24F3BC2B47BBB2FDF91BDDFD57B74B99E133AED40972A", // SCRT denom on Injective
      },
      {
        source_chain_name: "Juno",
        from_denom:
          "ibc/B55B08EF3667B0C6F029C2CC9CAA6B00788CF639EBB84B34818C85CBABA33ABD", // SCRT denom on Juno
      },
      {
        source_chain_name: "Kujira",
        from_denom:
          "ibc/A358D7F19237777AF6D8AD0E0F53268F8B18AE8A53ED318095C14D6D7F3B2DB5", // SCRT denom on Kujira
      },
      {
        source_chain_name: "Osmosis",
        from_denom:
          "ibc/0954E1C28EB7AF5B72D24F3BC2B47BBB2FDF91BDDFD57B74B99E133AED40972A", // SCRT denom on Osmosis
      },
      {
        source_chain_name: "Sentinel",
        from_denom:
          "ibc/31FEE1A2A9F9C01113F90BD0BBCCE8FD6BBB8585FAF109A2101827DD1D5B95B8", // SCRT denom on Sentinel
      },
      {
        source_chain_name: "Sifchain",
        from_denom:
          "ibc/345D30E8ED06B47FC538ED131D99D16126F07CD6F8B35DE96AAF4C1E445AF466", // SCRT denom on Sifchain
      },
      {
        source_chain_name: "Stargaze",
        from_denom:
          "ibc/B55B08EF3667B0C6F029C2CC9CAA6B00788CF639EBB84B34818C85CBABA33ABD", // SCRT denom on Stargaze
      },
      {
        source_chain_name: "Stride",
        from_denom:
          "ibc/563C6CB7E0423BE8B9FD1DAB9EAC201A6C2413D96F73618240B114CE4896734C", // SCRT denom on Stride
      },
      {
        source_chain_name: "Terra",
        from_denom:
          "ibc/10BD6ED30BA132AB96F146D71A23B46B2FC19E7D79F52707DC91F2F3A45040AD", // SCRT denom on Terra
      },
    ],
    withdrawals: [
      {
        target_chain_name: "Akash",
        from_denom: "uscrt",
      },
      {
        target_chain_name: "Chihuahua",
        from_denom: "uscrt",
      },
      {
        target_chain_name: "Cosmos Hub",
        from_denom: "uscrt",
      },
      {
        target_chain_name: "Crescent",
        from_denom: "uscrt",
      },
      {
        target_chain_name: "Evmos",
        from_denom: "uscrt",
      },
      {
        target_chain_name: "Gravity Bridge",
        from_denom: "uscrt",
      },
      {
        target_chain_name: "Injective",
        from_denom: "uscrt",
      },
      {
        target_chain_name: "Juno",
        from_denom: "uscrt",
      },
      {
        target_chain_name: "Kujira",
        from_denom: "uscrt",
      },
      {
        target_chain_name: "Osmosis",
        from_denom: "uscrt",
      },
      {
        target_chain_name: "Sentinel",
        from_denom: "uscrt",
      },
      {
        target_chain_name: "Sifchain",
        from_denom: "uscrt",
      },
      {
        target_chain_name: "Stargaze",
        from_denom: "uscrt",
      },
      {
        target_chain_name: "Stride",
        from_denom: "uscrt",
      },
      {
        target_chain_name: "Terra",
        from_denom: "uscrt",
      },
    ],
  },
  {
    name: "AKT",
    address: "secret168j5f78magfce5r2j4etaytyuy7ftjkh4cndqw",
    code_hash:
      "5a085bd8ed89de92b35134ddd12505a602c7759ea25fb5c089ba03c8535b3042",
    image: "/akt.svg",
    decimals: 6,
    coingecko_id: "akash-network",
    deposits: [
      {
        source_chain_name: "Akash",
        from_denom: "uakt",
      },
    ],
    withdrawals: [
      {
        target_chain_name: "Akash",
        from_denom:
          "ibc/448B29AB9766D29CC09944EDF6A08573B45A37C55746A45FA3CF53F1B58DF98D", // AKT denom on Secret
      },
    ],
  },
  {
    name: "ATOM",
    address: "secret14mzwd0ps5q277l20ly2q3aetqe3ev4m4260gf4",
    code_hash:
      "ad91060456344fc8d8e93c0600a3957b8158605c044b3bef7048510b3157b807",
    image: "/atom.jpg",
    decimals: 6,
    coingecko_id: "cosmos",
    deposits: [
      {
        source_chain_name: "Cosmos Hub",
        from_denom: "uatom",
      },
    ],
    withdrawals: [
      {
        target_chain_name: "Cosmos Hub",
        from_denom:
          "ibc/27394FB092D2ECCD56123C74F36E4C1F926001CEADA9CA97EA622B25F41E5EB2",
      },
    ],
  },
  {
    name: "CRE",
    address: "secret1tatdlkyznf00m3a7hftw5daaq2nk38ugfphuyr",
    code_hash:
      "5a085bd8ed89de92b35134ddd12505a602c7759ea25fb5c089ba03c8535b3042",
    image: "/cre.svg",
    decimals: 6,
    coingecko_id: "crescent-network",
    deposits: [
      {
        source_chain_name: "Crescent",
        from_denom: "ucre",
      },
    ],
    withdrawals: [
      {
        target_chain_name: "Crescent",
        from_denom:
          "ibc/34BFFD88FD2A4ED8C4D227A7A3CE966A4D514F5F07823FFABC4CC3DBC9D8CCDE",
      },
    ],
  },
  {
    name: "DVPN",
    address: "secret1k8cge73c3nh32d4u0dsd5dgtmk63shtlrfscj5",
    code_hash:
      "ad91060456344fc8d8e93c0600a3957b8158605c044b3bef7048510b3157b807",
    image: "/dvpn.jpeg",
    decimals: 6,
    coingecko_id: "sentinel",
    deposits: [
      {
        source_chain_name: "Sentinel",
        from_denom: "udvpn",
      },
    ],
    withdrawals: [
      {
        target_chain_name: "Sentinel",
        from_denom:
          "ibc/E83107E876FF194B54E9AC3099E49DBB7728156F250ABD3E997D2B7E89E0810B",
      },
    ],
  },
  {
    name: "EVMOS",
    address: "secret1grg9unv2ue8cf98t50ea45prce7gcrj2n232kq",
    code_hash:
      "5a085bd8ed89de92b35134ddd12505a602c7759ea25fb5c089ba03c8535b3042",
    image: "/evmos.jpg",
    decimals: 18,
    coingecko_id: "evmos",
    deposits: [
      {
        source_chain_name: "Evmos",
        from_denom: "aevmos",
      },
    ],
    withdrawals: [
      {
        target_chain_name: "Evmos",
        from_denom:
          "ibc/23A8E16C655512DD4AA83769BA695FB8CCA4D1CA220652B894FAB44E53462C59", // EVMOS denom on Secret
      },
    ],
  },
  {
    name: "GRAV",
    address: "secret1dtghxvrx35nznt8es3fwxrv4qh56tvxv22z79d",
    code_hash:
      "5a085bd8ed89de92b35134ddd12505a602c7759ea25fb5c089ba03c8535b3042",
    image: "/grav.svg",
    decimals: 6,
    coingecko_id: "graviton",
    deposits: [
      {
        source_chain_name: "Gravity Bridge",
        from_denom: "ugraviton",
      },
    ],
    withdrawals: [
      {
        target_chain_name: "Gravity Bridge",
        from_denom:
          "ibc/DEEF987757F80419CC651C8323ACD21D6C3D664E51B5E5A29B2663F5AD132A67", // GRAV denom on Secret
      },
    ],
  },
  {
    name: "HUAHUA",
    address: "secret1ntvxnf5hzhzv8g87wn76ch6yswdujqlgmjh32w",
    code_hash:
      "182d7230c396fa8f548220ff88c34cb0291a00046df9ff2686e407c3b55692e9",
    image: "/huahua.jpg",
    decimals: 6,
    coingecko_id: "chihuahua-chain",
    deposits: [
      {
        source_chain_name: "Chihuahua",
        from_denom: "uhuahua",
      },
    ],
    withdrawals: [
      {
        target_chain_name: "Chihuahua",
        from_denom:
          "ibc/630E7B10690ADEC9E9CEEE904CE78C522BBCDDC6A081B23FA26A55F6EF40E41E", // HUAHUA denom on Secret
      },
    ],
  },
  {
    name: "INJ",
    address: "secret16cwf53um7hgdvepfp3jwdzvwkt5qe2f9vfkuwv",
    code_hash:
      "5a085bd8ed89de92b35134ddd12505a602c7759ea25fb5c089ba03c8535b3042",
    image: "/inj.svg",
    decimals: 18,
    coingecko_id: "injective-protocol",
    deposits: [
      {
        source_chain_name: "Injective",
        from_denom: "inj",
      },
    ],
    withdrawals: [
      {
        target_chain_name: "Injective",
        from_denom:
          "ibc/5A76568E079A31FA12165E4559BA9F1E9D4C97F9C2060B538C84DCD503815E30", // INJ denom on Secret
      },
    ],
  },
  {
    name: "JUNO",
    address: "secret1smmc5k24lcn4j2j8f3w0yaeafga6wmzl0qct03",
    code_hash:
      "ad91060456344fc8d8e93c0600a3957b8158605c044b3bef7048510b3157b807",
    image: "/juno.svg",
    decimals: 6,
    coingecko_id: "juno-network",
    deposits: [
      {
        source_chain_name: "Juno",
        from_denom: "ujuno",
      },
    ],
    withdrawals: [
      {
        target_chain_name: "Juno",
        from_denom:
          "ibc/DF8D00B4B31B55AFCA9BAF192BC36C67AA06D9987DCB96490661BCAB63C27006", // JUNO denom on Secret
      },
    ],
  },
  {
    name: "KUJI",
    address: "secret1gaew7k9tv4hlx2f4wq4ta4utggj4ywpkjysqe8",
    code_hash:
      "5a085bd8ed89de92b35134ddd12505a602c7759ea25fb5c089ba03c8535b3042",
    image: "/kuji-token.webp",
    decimals: 6,
    coingecko_id: "kujira",
    deposits: [
      {
        source_chain_name: "Kujira",
        from_denom: "ukuji",
      },
    ],
    withdrawals: [
      {
        target_chain_name: "Kujira",
        from_denom:
          "ibc/FFA324A40F82EF430CF78D498CE04FF634D2091FCDC04EFEC8841B86011F307A", // KUJI denom on Secret
      },
    ],
  },
  {
    name: "LUNA",
    address: "secret1w8d0ntrhrys4yzcfxnwprts7gfg5gfw86ccdpf",
    code_hash:
      "5a085bd8ed89de92b35134ddd12505a602c7759ea25fb5c089ba03c8535b3042",
    image: "/luna2.svg",
    decimals: 6,
    coingecko_id: "terra-luna-2",
    deposits: [
      {
        source_chain_name: "Terra",
        from_denom: "uluna",
      },
    ],
    withdrawals: [
      {
        target_chain_name: "Terra",
        from_denom:
          "ibc/28DECFA7FB7E3AB58DC3B3AEA9B11C6C6B6E46356DCC26505205DAD3379984F5", // LUNA denom on Secret
      },
    ],
  },
  {
    name: "OSMO",
    address: "secret1zwwealwm0pcl9cul4nt6f38dsy6vzplw8lp3qg",
    code_hash:
      "ad91060456344fc8d8e93c0600a3957b8158605c044b3bef7048510b3157b807",
    image: "/osmo.jpeg",
    decimals: 6,
    coingecko_id: "osmosis",
    deposits: [
      {
        source_chain_name: "Osmosis",
        from_denom: "uosmo",
      },
    ],
    withdrawals: [
      {
        target_chain_name: "Osmosis",
        from_denom:
          "ibc/0471F1C4E7AFD3F07702BEF6DC365268D64570F7C1FDC98EA6098DD6DE59817B",
      },
    ],
  },
  {
    name: "ROWAN",
    address: "secret159p22zvq2wzsdtqhm2plp4wg33srxp2hf0qudc",
    code_hash:
      "5a085bd8ed89de92b35134ddd12505a602c7759ea25fb5c089ba03c8535b3042",
    image: "/rowan.svg",
    decimals: 18,
    coingecko_id: "sifchain",
    deposits: [
      {
        source_chain_name: "Sifchain",
        from_denom: "rowan",
      },
    ],
    withdrawals: [
      {
        target_chain_name: "Sifchain",
        from_denom:
          "ibc/901E9F1199A9EB947C83F2903B0B062888758D5853C6B762CD15B9FFD55FF1BC", // ROWAN denom on Secret
      },
    ],
  },
  {
    name: "STARS",
    address: "secret1x0dqckf2khtxyrjwhlkrx9lwwmz44k24vcv2vv",
    code_hash:
      "5a085bd8ed89de92b35134ddd12505a602c7759ea25fb5c089ba03c8535b3042",
    image: "/stars.webp",
    decimals: 6,
    coingecko_id: "stargaze",
    deposits: [
      {
        source_chain_name: "Stargaze",
        from_denom: "ustars",
      },
    ],
    withdrawals: [
      {
        target_chain_name: "Stargaze",
        from_denom:
          "ibc/7EAE5BEF3A26B64AFBD89828AFDDB1DC7024A0276D22745201632C40E6E634D0", // STARS denom on Secret
      },
    ],
  },
  {
    name: "STRD",
    address: "secret17gg8xcx04ldqkvkrd7r9w60rdae4ck8aslt9cf",
    code_hash:
      "5a085bd8ed89de92b35134ddd12505a602c7759ea25fb5c089ba03c8535b3042",
    image: "/stride.svg",
    decimals: 6,
    coingecko_id: "stride",
    deposits: [
      {
        source_chain_name: "Stride",
        from_denom: "ustrd",
      },
    ],
    withdrawals: [
      {
        target_chain_name: "Stride",
        from_denom:
          "ibc/CE591002C567BE4B8C4EC3F3F3D18AF7A1CA9FADBF5876C8413F8B2BD83CE8FF", // STRD denom on Secret
      },
    ],
  }
];

// These are snip 20 tokens that are IBC compatible (no need to wrap them manually)
export const snips: Token[] = [
  {
    name: "ALTER",
    is_snip20: true,
    address: "secret12rcvz0umvk875kd6a803txhtlu7y0pnd73kcej",
    code_hash:
      "d4f32c1bca133f15f69d557bd0722da10f45e31e5475a12900ca1e62e63e8f76",
    image: "/alter.jpg",
    decimals: 6,
    coingecko_id: "alter",
    deposits: [
      {
        source_chain_name: "Osmosis",
        from_denom:
          "ibc/A6383B6CF5EA23E067666C06BC34E2A96869927BD9744DC0C1643E589C710AA3", // ALTER denom on Osmosis
        channel_id: "channel-476",
        gas: 130_000,
      },
      {
        source_chain_name: "Kujira",
        from_denom:
          "ibc/7D366323A7EE9B278763F78734FDE3F6309CCC132707A85EA1C0C31617EF63D8", // ALTER denom on Kujira
        channel_id: "channel-44",
        gas: 130_000,
      },
      {
        source_chain_name: "Juno",
        from_denom:
          "ibc/8301F2E358BBCBF0E44DFFCA61889BF21B086B57AC39D48BE3164E68E443CCEF", // ALTER denom on Juno
        channel_id: "channel-163",
        gas: 130_000,
      }
    ],
    withdrawals: [
      {
        target_chain_name: "Osmosis",
        from_denom: "secret12rcvz0umvk875kd6a803txhtlu7y0pnd73kcej",
        channel_id: "channel-44",
        gas: 350_000,
      },
      {
        target_chain_name: "Kujira",
        from_denom: "secret12rcvz0umvk875kd6a803txhtlu7y0pnd73kcej",
        channel_id: "channel-46",
        gas: 350_000,
      },
      {
        target_chain_name: "Juno",
        from_denom: "secret12rcvz0umvk875kd6a803txhtlu7y0pnd73kcej",
        channel_id: "channel-45",
        gas: 350_000,
      },

    ],
  },
  {
    name: "BUTT",
    is_snip20: true,
    address: "secret1yxcexylwyxlq58umhgsjgstgcg2a0ytfy4d9lt",
    code_hash:
      "f8b27343ff08290827560a1ba358eece600c9ea7f403b02684ad87ae7af0f288",
    image: "/butt.png",
    decimals: 6,
    coingecko_id: "button",
    deposits: [
      {
        source_chain_name: "Osmosis",
        from_denom:
          "ibc/1FBA9E763B8679BEF7BAAAF2D16BCA78C3B297D226C3F31312C769D7B8F992D8", // BUTT denom on Osmosis
        channel_id: "channel-476",
        gas: 130_000,
      },
      {
        source_chain_name: "Kujira",
        from_denom:
          "ibc/115373976C7BA066D7612C0FBFB64504D807770FF8248DE005942B7FDD4DAADC", // BUTT denom on Kujira
        channel_id: "channel-44",
        gas: 130_000,
      },
      {
        source_chain_name: "Juno",
        from_denom:
          "ibc/15996DE9D2D6B5DFB9A01C2095320D96FB5A3A2D5ACCC1E773338D748CA9C175", // BUTT denom on Juno
        channel_id: "channel-163",
        gas: 130_000,
      },
      
    ],
    withdrawals: [
      {
        target_chain_name: "Osmosis",
        from_denom: "secret1yxcexylwyxlq58umhgsjgstgcg2a0ytfy4d9lt",
        channel_id: "channel-44",
        gas: 350_000,
      },
      {
        target_chain_name: "Kujira",
        from_denom: "secret1yxcexylwyxlq58umhgsjgstgcg2a0ytfy4d9lt",
        channel_id: "channel-46",
        gas: 350_000,
      },
      {
        target_chain_name: "Juno",
        from_denom: "secret1yxcexylwyxlq58umhgsjgstgcg2a0ytfy4d9lt",
        channel_id: "channel-45",
        gas: 350_000,
      },
    ],
  },
  {
    name: "SHD",
    is_snip20: true,
    address: "secret1qfql357amn448duf5gvp9gr48sxx9tsnhupu3d",
    code_hash:
      "fa824c4504f21fc59250da0cdf549dd392fd862baf2689d246a07b9e941f04a9",
    image: "/shd.jpg",
    decimals: 8,
    coingecko_id: "shade-protocol",
    deposits: [
      {
        source_chain_name: "Osmosis",
        from_denom:
          "ibc/71055835C7639739EAE03AACD1324FE162DBA41D09F197CB72D966D014225B1C", // SHD denom on Osmosis
        channel_id: "channel-476",
        gas: 130_000,
      },
      {
        source_chain_name: "Kujira",
        from_denom:
          "ibc/21038E447A2D4A1183628C0EC366FE79C2E0B0BD91F9A85E6C906CD911FD676E", // SHD denom on Kujira
        channel_id: "channel-44",
        gas: 130_000,
      },
      {
        source_chain_name: "Juno",
        from_denom:
          "ibc/8D34BDDD6C534FEABA8BBAD7894E1793D3097E9147E94FC516FAB464AA598C23", // SHD denom on Juno
        channel_id: "channel-163",
        gas: 130_000,
      },
      
    ],
    withdrawals: [
      {
        target_chain_name: "Osmosis",
        from_denom: "secret1qfql357amn448duf5gvp9gr48sxx9tsnhupu3d",
        channel_id: "channel-44",
        gas: 350_000,
      },
      {
        target_chain_name: "Kujira",
        from_denom: "secret1qfql357amn448duf5gvp9gr48sxx9tsnhupu3d",
        channel_id: "channel-46",
        gas: 350_000,
      },
      {
        target_chain_name: "Juno",
        from_denom: "secret1qfql357amn448duf5gvp9gr48sxx9tsnhupu3d",
        channel_id: "channel-45",
        gas: 350_000,
      },
    ],
  },
  {
    name: "stkd-SCRT",
    is_snip20: true,
    address: "secret1k6u0cy4feepm6pehnz804zmwakuwdapm69tuc4",
    code_hash:
      "f6be719b3c6feb498d3554ca0398eb6b7e7db262acb33f84a8f12106da6bbb09",
    image: "/stkd-scrt.svg",
    decimals: 8,
    coingecko_id: "stkd-scrt",
    deposits: [
      {
        source_chain_name: "Osmosis",
        from_denom:
          "ibc/D0E5BF2940FB58D9B283A339032DE88111407AAD7D94A7F1F3EB78874F8616D4", // stkd-SCRT denom on Osmosis
        channel_id: "channel-476",
        gas: 130_000,
      },
      {
        source_chain_name: "Kujira",
        from_denom:
          "ibc/A81564DE9A1F0D66D715B508601E27AB89E0FADDE6A3706FC15F8C80BB774563", // stkd-scrt denom on Kujira
        channel_id: "channel-44",
        gas: 130_000,
      },
      {
        source_chain_name: "Juno",
        from_denom:
          "ibc/D16A9D5D85BCF482A389BA74C5B6E71B9E731CD5C97885C343DC0D64037FE688", // stkd-scrt denom on Juno
        channel_id: "channel-163",
        gas: 130_000,
      },
      
    ],
    withdrawals: [
      {
        target_chain_name: "Osmosis",
        from_denom: "secret1k6u0cy4feepm6pehnz804zmwakuwdapm69tuc4",
        channel_id: "channel-44",
        gas: 350_000,
      },
      {
        target_chain_name: "Kujira",
        from_denom: "secret1k6u0cy4feepm6pehnz804zmwakuwdapm69tuc4",
        channel_id: "channel-46",
        gas: 350_000,
      },
      {
        target_chain_name: "Juno",
        from_denom: "secret1k6u0cy4feepm6pehnz804zmwakuwdapm69tuc4",
        channel_id: "channel-45",
        gas: 350_000,
      },
    ],
  },
  {
    name: "SIENNA",
    is_snip20: true,
    address: "secret1rgm2m5t530tdzyd99775n6vzumxa5luxcllml4",
    code_hash:
      "c1dc8261059fee1de9f1873cd1359ccd7a6bc5623772661fa3d55332eb652084",
    image: "/sienna.jpg",
    decimals: 18,
    coingecko_id: "sienna",
    deposits: [
      {
        source_chain_name: "Osmosis",
        from_denom:
          "ibc/9A8A93D04917A149C8AC7C16D3DA8F470D59E8D867499C4DA97450E1D7363213", // SIENNA denom on Osmosis
        channel_id: "channel-476",
        gas: 130_000,
      },
      {
        source_chain_name: "Kujira",
        from_denom:
          "ibc/ED487C9513A933BECB5ABA64CAE441C15E5AF66C3383061FB5A8BC0F671B933F", // SIENNA denom on Kujira
        channel_id: "channel-44",
        gas: 130_000,
      },
      {
        source_chain_name: "Juno",
        from_denom:
          "ibc/C1197A19D70157ABE9E7058D5494CA9317E3BA374A2720FDAAAFF6F9548FF084", // SIENNA denom on Juno
        channel_id: "channel-163",
        gas: 130_000,
      },
    ],
    withdrawals: [
      {
        target_chain_name: "Osmosis",
        from_denom: "secret1rgm2m5t530tdzyd99775n6vzumxa5luxcllml4",
        channel_id: "channel-44",
        gas: 350_000,
      },
      {
        target_chain_name: "Kujira",
        from_denom: "secret1rgm2m5t530tdzyd99775n6vzumxa5luxcllml4",
        channel_id: "channel-46",
        gas: 350_000,
      },
      {
        target_chain_name: "Juno",
        from_denom: "secret1rgm2m5t530tdzyd99775n6vzumxa5luxcllml4",
        channel_id: "channel-45",
        gas: 350_000,
      },
    ],
  }
];

export type Chain = {
  /** display name of the chain */
  chain_name: string;
  /** channel_id on the chain */
  deposit_channel_id: string;
  /** gas limit for ibc transfer from the chain to Secret Network */
  deposit_gas: number;
  /** channel_id on Secret Network */
  withdraw_channel_id: string;
  /** gas limit for ibc transfer from Secret Network to the chain */
  withdraw_gas: number;
  /** bech32 prefix of addresses on the chain */
  bech32_prefix: string;
  /** logo of the chain */
  chain_image: string;
  /** chain-id of the chain */
  chain_id: string;
  /** lcd url of the chain */
  lcd: string;
  /** rpc url of the chain */
  rpc: string;
  /** explorer link for accounts */
  explorer_account: string;
  /** explorer link for txs */
  explorer_tx?: string;
};

export const chains: { [chain_name: string]: Chain } = {
  "Secret Network": {
    chain_name: "Secret Network",
    deposit_channel_id: "",
    deposit_gas: 0,
    withdraw_channel_id: "",
    withdraw_gas: 0,
    chain_id: "secret-4",
    bech32_prefix: "secret",
    lcd: "https://secret-4.api.trivium.network:1317",
    rpc: "https://secret-4.api.trivium.network:9091", // gRPC-web
    chain_image: "/scrt.svg",
    explorer_account: "https://www.mintscan.io/secret/account/",
  },
  Akash: {
    chain_name: "Akash",
    deposit_channel_id: "channel-43",
    deposit_gas: 110_000,
    withdraw_channel_id: "channel-21",
    withdraw_gas: 30_000,
    chain_id: "akashnet-2",
    bech32_prefix: "akash",
    lcd: "https://akash-api.lavenderfive.com:443",
    rpc: "https://rpc.akash.forbole.com",
    chain_image: "/akt.svg",
    explorer_account: "https://www.mintscan.io/akash/account/",
  },
  Chihuahua: {
    chain_name: "Chihuahua",
    deposit_channel_id: "channel-16",
    deposit_gas: 110_000,
    withdraw_channel_id: "channel-11",
    withdraw_gas: 30_000,
    chain_id: "chihuahua-1",
    bech32_prefix: "chihuahua",
    lcd: "https://api.chihuahua.wtf",
    rpc: "https://rpc.chihuahua.wtf",
    chain_image: "/huahua.jpg",
    explorer_account: "https://ping.pub/chihuahua/account/",
  },
  "Cosmos Hub": {
    chain_name: "Cosmos Hub",
    deposit_channel_id: "channel-235",
    deposit_gas: 110_000,
    withdraw_channel_id: "channel-0",
    withdraw_gas: 30_000,
    chain_id: "cosmoshub-4",
    bech32_prefix: "cosmos",
    lcd: "https://lcd-cosmoshub.keplr.app",
    rpc: "https://rpc.cosmoshub.strange.love",
    chain_image: "/atom.jpg",
    explorer_account: "https://www.mintscan.io/cosmos/account/",
  },
  Crescent: {
    chain_name: "Crescent",
    deposit_channel_id: "channel-10",
    deposit_gas: 110_000,
    withdraw_channel_id: "channel-24",
    withdraw_gas: 30_000,
    chain_id: "crescent-1",
    bech32_prefix: "cre",
    lcd: "https://mainnet.crescent.network:1317",
    rpc: "https://mainnet.crescent.network:26657",
    chain_image: "/cre.svg",
    explorer_account: "https://www.mintscan.io/crescent/account/",
  },
  Evmos: {
    chain_name: "Evmos",
    deposit_channel_id: "channel-15",
    deposit_gas: 350_000,
    withdraw_channel_id: "channel-18",
    withdraw_gas: 30_000,
    chain_id: "evmos_9001-2",
    bech32_prefix: "evmos",
    lcd: "https://rest.bd.evmos.org:1317",
    rpc: "https://tendermint.bd.evmos.org:26657",
    chain_image: "/evmos.jpg",
    explorer_account: "https://www.mintscan.io/evmos/account/",
  },
  "Gravity Bridge": {
    chain_name: "Gravity Bridge",
    deposit_channel_id: "channel-79",
    deposit_gas: 110_000,
    withdraw_channel_id: "channel-17",
    withdraw_gas: 30_000,
    chain_id: "gravity-bridge-3",
    bech32_prefix: "gravity",
    lcd: "https://lcd.gravity-bridge.ezstaking.io",
    rpc: "https://rpc.gravity-bridge.ezstaking.io",
    chain_image: "/grav.svg",
    explorer_account: "https://www.mintscan.io/gravity-bridge/account/",
  },
  Injective: {
    chain_name: "Injective",
    deposit_channel_id: "channel-88",
    deposit_gas: 350_000,
    withdraw_channel_id: "channel-23",
    withdraw_gas: 30_000,
    chain_id: "injective-1",
    bech32_prefix: "inj",
    lcd: "https://public.lcd.injective.network",
    rpc: "https://tm.injective.network",
    chain_image: "/inj.svg",
    explorer_account: "https://www.mintscan.io/injective/account/",
  },
  Juno: {
    chain_name: "Juno",
    deposit_channel_id: "channel-48",
    deposit_gas: 110_000,
    withdraw_channel_id: "channel-8",
    withdraw_gas: 30_000,
    chain_id: "juno-1",
    bech32_prefix: "juno",
    lcd: "https://lcd-juno.itastakers.com",
    rpc: "https://rpc-juno.itastakers.com",
    chain_image: "/juno.svg",
    explorer_account: "https://www.mintscan.io/juno/account/",
  },
  Kujira: {
    chain_name: "Kujira",
    deposit_channel_id: "channel-10",
    deposit_gas: 110_000,
    withdraw_channel_id: "channel-22",
    withdraw_gas: 30_000,
    chain_id: "kaiyo-1",
    bech32_prefix: "kujira",
    lcd: "https://lcd.kaiyo.kujira.setten.io",
    rpc: "https://rpc.kaiyo.kujira.setten.io",
    chain_image: "/kuji.png",
    explorer_account: "https://kujira.explorers.guru/account/",
  },
  Osmosis: {
    chain_name: "Osmosis",
    deposit_channel_id: "channel-88",
    deposit_gas: 1_500_000,
    withdraw_channel_id: "channel-1",
    withdraw_gas: 30_000,
    chain_id: "osmosis-1",
    bech32_prefix: "osmo",
    lcd: "https://lcd.osmosis.zone",
    rpc: "https://rpc.osmosis.zone",
    chain_image: "/osmo.jpeg",
    explorer_account: "https://www.mintscan.io/osmosis/account/",
  },
  Sentinel: {
    chain_name: "Sentinel",
    deposit_channel_id: "channel-50",
    deposit_gas: 110_000,
    withdraw_channel_id: "channel-3",
    withdraw_gas: 30_000,
    chain_id: "sentinelhub-2",
    bech32_prefix: "sent",
    lcd: "https://api-sentinel-ia.cosmosia.notional.ventures",
    rpc: "https://rpc-sentinel-ia.cosmosia.notional.ventures",
    chain_image: "/dvpn.jpeg",
    explorer_account: "https://www.mintscan.io/sentinel/account/",
  },
  Sifchain: {
    chain_name: "Sifchain",
    deposit_channel_id: "channel-65",
    deposit_gas: 150_000,
    withdraw_channel_id: "channel-15",
    withdraw_gas: 30_000,
    chain_id: "sifchain-1",
    bech32_prefix: "sif",
    lcd: "https://api.sifchain.finance",
    rpc: "https://rpc.sifchain.finance",
    chain_image: "/rowan.svg",
    explorer_account: "https://www.mintscan.io/sifchain/account/",
  },
  Stargaze: {
    chain_name: "Stargaze",
    deposit_channel_id: "channel-48",
    deposit_gas: 110_000,
    withdraw_channel_id: "channel-19",
    withdraw_gas: 30_000,
    chain_id: "stargaze-1",
    bech32_prefix: "stars",
    lcd: "https://rest.stargaze-apis.com",
    rpc: "https://rpc.stargaze-apis.com",
    chain_image: "/stars.webp",
    explorer_account: "https://www.mintscan.io/stargaze/account/",
  },
  Stride: {
    chain_name: "Stride",
    deposit_channel_id: "channel-40",
    deposit_gas: 150_000,
    withdraw_channel_id: "channel-37",
    withdraw_gas: 30_000,
    chain_id: "stride-1",
    bech32_prefix: "stride",
    lcd: "https://stride-api.lavenderfive.com",
    rpc: "https://stride-rpc.lavenderfive.com",
    chain_image: "/stride.svg",
    explorer_account: "https://www.mintscan.io/stride/account/",
  },
  Terra: {
    chain_name: "Terra",
    deposit_channel_id: "channel-3",
    deposit_gas: 110_000,
    withdraw_channel_id: "channel-16",
    withdraw_gas: 30_000,
    chain_id: "phoenix-1",
    bech32_prefix: "terra",
    lcd: "https://phoenix-lcd.terra.dev",
    rpc: "https://terra-rpc.lavenderfive.com",
    chain_image: "/luna2.svg",
    explorer_account: "https://finder.terra.money/mainnet/address/",
  },
};
