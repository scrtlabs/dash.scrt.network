import styled from "styled-components";

export const StyledAccordionWrapper = styled.div<{
  isOpenAccordion: boolean;
}>`
  && {
    max-width: 800px;
    border-radius: 5px;
    overflow: hidden;

    & .accordion {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 20px;
      cursor: pointer;
      white-space: nowrap;
      background: ${({ theme }) => theme.colors.bg};

      & .question-wrapper {
        display: flex;
        flex-direction: column;

        & .question {
          font-family: ${({ theme }) => theme.fonts.hind_regular};
          font-size: 16px;
          line-height: 24px;
        }
      }

      & .accordion__icon {
        user-select: none;
        display: flex;

        & .arrow-icon {
          width: 15px;
          height: 15px;
          cursor: pointer;
          margin-left: 5px;
          transition: 0.35s ease-out;
          transform: ${({ isOpenAccordion }) =>
            isOpenAccordion ? "rotate(0deg)" : "rotate(-90deg)"};
        }
      }
    }

    & .content {
      transition: max-height 0.35s ease-out;
      cursor: pointer;
      overflow: hidden;
      max-height: ${({ isOpenAccordion }) => (isOpenAccordion ? "325px" : "0")};
      background: ${({ theme }) => theme.colors.bg};
      @media (max-width: 992px) {
        transition: height 0s;
      }

      & .divider {
        display: block;
        height: 1px;
        max-width: calc(100% - 80px);
        background: ${({ theme }) =>
          `linear-gradient(90deg, #232042 0%, ${theme.colors.orange} 50%, #232042 100%)`};
        margin: 0 auto;
      }

      & .answer {
        padding: 20px 20px 10px 20px;
        font-family: ${({ theme }) => theme.fonts.hind_regular};
        font-size: 16px;
        line-height: 24px;
      }

      & a {
        color: ${({ theme }) => theme.colors.orange};
        padding: 10px 20px 20px 20px;
        font-family: Hind Regular;
        font-size: 16px;
        line-height: 24px;
        display: block;
      }
    }
  }
`;
