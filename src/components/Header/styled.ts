import styled from 'styled-components';

export const StyledHeader = styled.div`
  display: flex;
  justify-content: space-between;
  margin: 60px 120px;
  padding: 12px;
  border-radius: 20px;
  background: ${({ theme }) => theme.colors.main_bg};

  @media (max-width: 768px) {
    margin: 30px;
  } 
  @media (max-width: 576px) {
    flex-direction: column;
    align-items: center;
    margin: 15px;
  }
  
  & .wallet{
    background: ${({ theme }) => theme.colors.bg};
    border-radius: 10px;
    display: flex;
    font-size: 14px;
    line-height: 150%;
    white-space: nowrap;
  } 
  
  & .logo{
    max-width: 140px;
    padding-left: 4px;
    @media (max-width: 576px) {
      padding-left: 0;
      margin-bottom: 1rem;
    }
  }
`