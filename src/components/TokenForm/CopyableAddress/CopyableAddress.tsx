import { useRef, useState } from "react";
import { StyledExchange } from "./styled";
import { handleCopyClick } from "../../Helpers/format";
import copy from "../../../assets/images/copy.svg";

interface ExchangeProps {
  title: string;
  address: string;
  prefix: string;
}

export const CopyableAddress = ({
  title,
  address,
  prefix = "",
}: ExchangeProps) => {
  const ref = useRef<HTMLSpanElement>(null);
  const [isCopied, setIsCopied] = useState(false);

  return (
    <StyledExchange>
      <span className="title">{title}:</span>
      <a href={`${prefix}${address}`} className="address" target={"_blank"}>
        {address}
      </a>
      <img
        src={copy}
        alt="copy"
        onClick={() => handleCopyClick(ref, setIsCopied)}
      />
      {isCopied && <p className="copied-msg">Copied</p>}
      <span className="copyable" ref={ref}>
        {address}
      </span>
    </StyledExchange>
  );
};
