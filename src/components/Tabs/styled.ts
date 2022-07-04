import styled from "styled-components";

export const StyledTabs = styled.div`
  width: 100%;
  position: relative;

  & .divider {
    width: 100%;
    height: 2px;
    background: white;
    opacity: 0.2;
    position: absolute;
    top: 50px;
    @media (max-width: 576px) {
      top: 40px;
    }
  }

  & .tab-list {
    width: 100%;
    background: ${({ theme }) => theme.colors.bg};
    padding: 4px;
    border-radius: 10px;
    text-transform: uppercase;
    white-space: nowrap;
    display: flex;
    font-family: ${({ theme }) => theme.fonts.hind_regular};
    margin-bottom: 12px;
    @media (max-width: 576px) {
      margin-bottom: 15px;
    }

    &[data-type="wrap"] {
      margin-bottom: 18px;
    }

    & .tab-list-item {
      display: inline-flex;
      justify-content: center;
      font-size: 12px;
      line-height: 19px;
      padding: 2px 0;
      border-radius: 10px;
      cursor: pointer;
      width: 50%;
      transition: 0.3s;

      & span {
        margin-top: 2px;
      }
    }

    & .tab-list-active {
      background: ${({ theme }) => theme.colors.active_bg};
      height: 100%;
    }
  }

  .tab-content {
    width: 100%;
  }
`;
