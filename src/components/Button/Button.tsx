import { StyledButton } from "./styled";
import { Loader } from "../Loader/Loader";

interface ButtonProps {
  text: string;
  action: any;
  isLoading?: boolean;
  errorClass?: string;
}

export const Button = ({
  text = "",
  action,
  isLoading = false,
  errorClass = "",
}: ButtonProps) => {
  return (
    <StyledButton onClick={action} isLoading={isLoading} className={errorClass}>
      {isLoading ? <Loader /> : <p>{text}</p>}
    </StyledButton>
  );
};
