import styled from "styled-components";

export const StyledToken = styled.div`
  width: 69.3333px;
  display: flex;
  justify-content: center;
  flex-direction: column;
  align-items: center;

  img {
    border-radius: 50%;
    width: 32px;
    height: 32px;
    transition: 0.1s;
    cursor: pointer;
    &:hover ~ .soon {
      visibility: visible;
    }
    &:hover ~ .name {
      visibility: visible;
    }
    &:hover {
      width: 48px;
      height: 48px;
      @media (max-width: 576px) {
        width: 32px;
        height: 32px;
      }
      @media (max-width: 576px) {
        width: 24px;
        height: 24px;
      }
    }
  }

  & .name {
    visibility: hidden;
    top: 15px;
    margin-top: 4px;
    font-size: 16px;
    line-height: 24px;
    font-family: ${({ theme }) => theme.fonts.hind_regular};
    @media (max-width: 576px) {
      font-size: 13px;
      margin-top: 6px;
    }
  }

  & .soon {
    visibility: hidden;
    white-space: nowrap;
    top: 30px;
    font-size: 12px;
    line-height: 12px;
    font-family: ${({ theme }) => theme.fonts.hind_regular};
    @media (max-width: 576px) {
      font-size: 13px;
      margin-top: 6px;
    }
  }

  &.coming-soon {
    cursor: not-allowed;
    & img {
      filter: brightness(0.5);
    }
  }

  &.token-wrap.active img {
    width: 48px;
    height: 48px;
    @media (max-width: 576px) {
      width: 32px;
      height: 32px;
    }
  }

  &.active span {
    visibility: visible;
  }
`;
