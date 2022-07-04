import styled from "styled-components";

export const StyledIndicators = styled.div`
  background: ${({ theme }) => theme.colors.bg};
  padding: 10px 20px;
  border-radius: 10px;
  margin-top: 24px;
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;

  & .indicator {
    font-size: 16px;
    line-height: 24px;
    font-family: ${({ theme }) => theme.fonts.hind_regular};
    white-space: nowrap;
    margin-right: 10px;

    @media (max-width: 576px) {
      font-size: 14px;
    }

    & .title {
      opacity: 0.5;
      margin-right: 5px;
    }

    & .grow {
      color: ${({ theme }) => theme.colors.grow};
    }

    & .grow-img {
      margin-bottom: 1px;
      margin-left: 5px;
      width: 12px;
      height: 8px;
      border-radius: 0;
    }

    & .fall {
      color: ${({ theme }) => theme.colors.alert};
    }

    & .fall-img {
      margin-bottom: 1px;
      margin-left: 5px;
      transform: rotate(180deg);
    }
  }
`;
