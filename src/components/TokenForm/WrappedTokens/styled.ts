import styled from "styled-components";

export const StyledWrapElem = styled.div`
  padding: 16px;
  background: ${({ theme }) => theme.colors.bg};
  border-radius: 10px;
  display: flex;
  flex-grow: 1;
  max-width: 196px;
  min-height: 100px;
  @media (max-width: 576px) {
    flex-wrap: wrap;
  }

  & .img-wrap {
    width: 45px;
    height: 45px;
    position: relative;
    @media (max-width: 576px) {
      width: 32px;
      height: 32px;
    }

    & .big-img {
      border-radius: 50%;
      width: 45px;
      height: 45px;
      @media (max-width: 576px) {
        width: 32px;
        height: 32px;
      }
    }

    & .small-img {
      height: 19px;
      width: 19px;
      position: absolute;
      right: 0;
      bottom: 0;
      border-radius: 50%;
      outline: 2px solid ${({ theme }) => theme.colors.orange};
      @media (max-width: 576px) {
        width: 12px;
        height: 12px;
      }
    }
  }

  & .cash-wrap {
    display: flex;
    width: 100%;
    flex-direction: column;
    justify-content: space-between;
    margin-left: 14px;
    font-family: ${({ theme }) => theme.fonts.hind_regular};
    position: relative;
    @media (max-width: 576px) {
      margin-left: 0;
      margin-top: 10px;
    }

    & .scrt {
      font-size: 16px;
      line-height: 24px;
      @media (max-width: 576px) {
        font-size: 14px;
      }

      & span {
        text-transform: uppercase;
      }
    }

    & .content {
      font-size: 14px;
      line-height: 22px;
      color: ${({ theme }) => theme.colors.grey};

      @media (max-width: 576px) {
        font-size: 12px;
      }
    }

    & .refresh {
      position: absolute;
      right: 0;
      top: 0;
      width: 16px;
      height: 16px;
      margin-left: auto;
      cursor: pointer;
    }

    & .set-key {
      color: #ba363c;
      cursor: pointer;
    }
    & .wrong-key {
      color: #ba363c;
    }
  }
`;
