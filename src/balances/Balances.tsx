import { useEffect, useState, useContext, createContext } from "react";
import { MsgExecuteContract, BroadcastMode } from "secretjs";
import { Token, tokens } from "shared/utils/config";
import {
  sleep,
  faucetURL,
  faucetAddress,
  viewingKeyErrorString,
  usdString,
  randomPadding,
} from "shared/utils/commons";
import BigNumber from "bignumber.js";
import { toast } from "react-toastify";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faKey,
  faArrowRightArrowLeft,
  faRightLeft,
  faInfoCircle,
  faCheckCircle,
  faXmarkCircle,
} from "@fortawesome/free-solid-svg-icons";
import { Link } from "react-router-dom";
import Select from "react-select";
import Tooltip from "@mui/material/Tooltip";
import { Helmet } from "react-helmet-async";
import {
  getWalletViewingKey,
  SecretjsContext,
} from "shared/context/SecretjsContext";
import mixpanel from "mixpanel-browser";
import { useSearchParams } from "react-router-dom";
import { APIContext } from "shared/context/APIContext";
import FeeGrant from "shared/components/FeeGrant";

function Balances() {
  const {
    feeGrantStatus,
    setFeeGrantStatus,
    requestFeeGrant,
    loadingTokenBalance,
    setLoadingTokenBalance,
    setViewingKey,
    secretjs,
    secretAddress,
    connectWallet,
  } = useContext(SecretjsContext);

  const { prices } = useContext(APIContext);

  return <></>;
}

export default Balances;
