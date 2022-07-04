import { StyledHeader } from "./styled";
import { rootIcons } from "../../assets/images";
import { Keplr, KeplrProps } from "./Keplr/Keplr";

export function Header({
  secretjs,
  secretAddress,
  setSecretjs,
  setSecretAddress,
}: KeplrProps) {
  return (
    <StyledHeader>
      <img className="logo" src={rootIcons.logo} alt="logo" />
      <div className="wallet">
        <Keplr
          secretjs={secretjs}
          secretAddress={secretAddress}
          setSecretjs={setSecretjs}
          setSecretAddress={setSecretAddress}
        />
      </div>
    </StyledHeader>
  );
}
