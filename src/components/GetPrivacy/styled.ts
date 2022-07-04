import styled from "styled-components";

export const StyleGetPrivacy = styled.div`
  display: inline-flex;
  flex-direction: column;
  background: ${({ theme }) => theme.colors.main_bg};
  padding: 32px;
  max-width: 360px;
  margin-right: 48px;
  border-radius: 10px;
  max-height: 568px;
  overflow: auto;
  @media (max-width: 992px) {
    margin-right: 0;
    margin-top: 60px;
    padding: 30px 30px 6px 30px;
    flex-direction: row;
    max-width: 100%;
    width: 100%;
  }
  @media (max-width: 820px) {
    flex-direction: column;
    padding: 30px;
  }
  @media (max-width: 768px) {
    margin-top: 30px;
  }
  @media (max-width: 576px) {
    padding: 15px;
    margin-top: 15px;
  }
  & .title-section {
    @media (max-width: 992px) {
      max-width: 296px;
    }
    & h1 {
      font-family: ${({ theme }) => theme.fonts.monsterRat_Bold};
      color: ${({ theme }) => theme.colors.orange};
      font-size: 48px;
      line-height: 58px;
      margin-bottom: 8px;
      white-space: nowrap;
      @media (max-width: 992px) {
        font-size: 40px;
        color: ${({ theme }) => theme.colors.white};
      }
      @media (max-width: 992px) {
        font-size: 32px;
        line-height: 58px;
      }
    }

    & .description {
      font-family: ${({ theme }) => theme.fonts.hind_regular};
      font-size: 16px;
      line-height: 24px;
      margin-bottom: 38px;
      @media (max-width: 992px) {
        color: ${({ theme }) => theme.colors.grey};
        margin-bottom: 0;
      }
    }
  }

  & .questions-list {
    &::-webkit-scrollbar {
      height: 6px;
    }

    &::-webkit-scrollbar-track {
      background: ${({ theme }) => theme.colors.active_bg};
      border-radius: 10px;
    }

    &::-webkit-scrollbar-thumb {
      background: ${({ theme }) => theme.colors.orange};
      border-radius: 10px;
    }
    @media (max-width: 992px) {
      display: flex;
      flex-wrap: wrap;
    }
    @media (max-width: 820px) {
      flex-wrap: nowrap;
      overflow-x: scroll;
      margin-top: 24px;
    }
    & > div {
      margin-bottom: 24px;
      @media (max-width: 992px) {
        max-width: 250px;
        margin-right: 24px;
      }
      @media (max-width: 820px) {
        flex-shrink: 0;
      }
    }
    & > div:last-child {
      margin-bottom: 0;
      @media (max-width: 820px) {
        margin-bottom: 24px;
      }
    }
  }
`;
