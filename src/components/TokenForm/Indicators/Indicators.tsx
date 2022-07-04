import { StyledIndicators } from "./styled";
import { rootIcons } from "../../../assets/images";
import { formatNumber, usdString } from "../../Helpers/format";
import { Loader } from "../../Loader/Loader";

interface IndicatorsProps {
  marketCap: number;
  tokenPrice: number;
  priceChange: number;
  loadingTokenPrice: boolean;
  loadingMarketData: boolean;
}

export const Indicators = ({
  marketCap,
  tokenPrice,
  priceChange,
  loadingMarketData,
  loadingTokenPrice,
}: IndicatorsProps) => {
  const formattedPriceChange = formatNumber(priceChange);

  const PriceChangeHour = () => {
    if (formattedPriceChange > 0) {
      return (
        <>
          <span className="grow">{`${formattedPriceChange}%`}</span>
          <img className="grow-img" src={rootIcons.grow} alt="grow" />
        </>
      );
    }
    if (formattedPriceChange < 0) {
      return (
        <>
          <span className="fall">{`${formattedPriceChange}%`}</span>
          <img className="fall-img" src={rootIcons.fall} alt="grow" />
        </>
      );
    }

    return (
      <>
        <span>{`${formattedPriceChange}%`}</span>
      </>
    );
  };

  return (
    <StyledIndicators>
      <div className="indicator">
        <span className="title">Market Cap:</span>

        {loadingMarketData ? (
          <Loader />
        ) : (
          <span>{usdString.format(marketCap)}</span>
        )}
      </div>

      <div className="indicator">
        <span className="title">Price:</span>
        {loadingTokenPrice ? (
          <Loader />
        ) : (
          <span>{usdString.format(formatNumber(tokenPrice))}</span>
        )}
      </div>

      <div className="indicator">
        <span className="title">24H%:</span>
        {loadingMarketData ? <Loader /> : <PriceChangeHour />}
      </div>
    </StyledIndicators>
  );
};
