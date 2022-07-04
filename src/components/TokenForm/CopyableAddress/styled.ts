import styled from "styled-components";

export const StyledExchange = styled.div`
  && {
    margin-bottom: 6px;
    display: flex;
    align-items: center;
    position: relative;

    & .title {
      font-family: ${({ theme }) => theme.fonts.hind_regular};
      color: ${({ theme }) => theme.colors.grey};
      font-size: 16px;
      line-height: 24px;
    }

    & .address {
      font-family: ${({ theme }) => theme.fonts.monsterRat_regular};
      margin: 0 12px;
      font-size: 14px;
      line-height: 150%;
      text-decoration: none;
    }

    & img {
      cursor: pointer;
    }

    & .copied-msg {
      position: absolute;
      right: 0;
      color: ${({ theme }) => theme.colors.grow};
      font-family: ${({ theme }) => theme.fonts.monsterRat_regular};
    }

    & .copyable {
      display: none;
    }
  }
`;
