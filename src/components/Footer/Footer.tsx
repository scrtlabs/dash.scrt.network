import { StyledFooter } from "./styled";
import { socialIcons } from "../../assets/images";

export function Footer() {
  return (
    <StyledFooter>
      <a href="https://scrt.network/" target="_blank">
        <img src={socialIcons.network} alt="network" />
      </a>
      <a href="https://twitter.com/SecretNetwork" target="_blank">
        <img src={socialIcons.twitter} alt="twitter" />
      </a>
      <a href="https://github.com/scrtlabs/wrap.scrt.network" target="_blank">
        <img src={socialIcons.git} alt="git" />
      </a>
    </StyledFooter>
  );
}
