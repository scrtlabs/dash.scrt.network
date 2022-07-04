import styled from 'styled-components';

export const StyledKeplr = styled.button`
  display: flex;
  align-items: center;
  padding: 10px 8px;
  cursor: pointer;
  border-radius: 10px;
  background: ${({ theme }) => theme.colors.active_bg};
  font-family: ${({ theme }) => theme.fonts.monsterRat_semiBold};
  border: none;

  & .keplr {
    width: 24px;
    height: 24px;
    margin-right: 7px;
  }

  & .keplr-title {
    text-transform: uppercase;
    position: relative;
    & span{
      position: absolute;
      left: 50%;
      transform: translateX(-50%);
      top: -35px;
      color: ${({ theme }) => theme.colors.grow};
      font-family: ${({ theme }) => theme.fonts.monsterRat_regular};
      text-transform: capitalize;
    }
  }
  
  & .copy{
    width: 16px;
    height: 16px;
    margin-left: 7px;
  }
`