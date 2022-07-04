import styled from "styled-components";

export const StyledContent = styled.div`
  position: absolute;
  width: 100%;

  @media (max-height: 768px) {
    height: 100%;
    overflow: hidden scroll;
  }

  & .content-wrap {
    display: flex;
    justify-content: center;

    @media (max-width: 992px) {
      flex-direction: column-reverse;
      align-items: center;
    }
  }
`;
