import styled from "styled-components";

export const StyledFooter = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 64px;
  margin-bottom: 48px;
  @media (max-width: 768px) {
    margin-top: 93px;
    margin-bottom: 40px;
  }
  @media (max-width: 576px) {
    margin: 30px 0;
  }

  & a:nth-child(2) {
    margin: 0 20px;
  }
`;
