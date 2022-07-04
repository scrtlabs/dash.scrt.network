import styled from 'styled-components';

export const StyledButton = styled.button<{
  isLoading: boolean
}>`
  max-width: 220px;
  width: 220px;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 10px 11px;
  text-transform: uppercase;
  background: ${({ isLoading, theme }) => (isLoading ? theme.colors.bg : theme.colors.orange )};
  font-family: ${({ theme }) => theme.fonts.monsterRat_semiBold};
  font-size: 16px;
  line-height: 24px;
  border-radius: 10px;
  margin: 24px auto 0 auto;
  cursor: pointer;
  opacity: .9;
  border: none;
  transition: .3s;
  @media (max-width: 576px) {
    width: 100%;
    max-width: 100%;
    margin: 12px auto 0 auto;
  }
  &.error{
    animation: shake-it .5s;
  }
  @keyframes shake-it {
    0% {
      transform: translateX(-5px);
    }
    20% {
      transform: translateX(5px);
    }
    40% {
      transform: translateX(-5px);
    }
    60% {
      transform: translateX(5px);
    }
    80% {
      transform: translateX(-5px);
    }
    100% {
      transform: translateX(0);
    }
  }
  
  &:hover {
    opacity: 1;
  }
`