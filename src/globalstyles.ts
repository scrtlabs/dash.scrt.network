import { createGlobalStyle } from "styled-components";
import MonsterRatRegular from "./assets/fonts/Montserrat-Regular.ttf";
import MonsterRatSemiBold from "./assets/fonts/Montserrat-SemiBold.ttf";
import MonsterRatBold from "./assets/fonts/Montserrat-Bold.ttf";
import Hind from "./assets/fonts/Hind-Regular.ttf";

export const theme = {
  colors: {
    main_bg: "#040506",
    bg: "#1A2128",
    active_bg: "#303C4A",
    grey: "#B2BFCD",
    white: "#FFFFFF",
    orange: "#EB8045",
    grow: "#3CDC68",
    alert: "#BA363C",
    blue: "#60A0DC",
  },
  fonts: {
    hind_regular: "Hind Regular",
    monsterRat_regular: "Montserrat Regular",
    monsterRat_semiBold: "Montserrat SemiBold",
    monsterRat_Bold: "Montserrat Bold",
  },
};

export const GlobalStyle = createGlobalStyle`
  @font-face {
    font-family: 'Montserrat Regular';
    src: local('Montserrat Regular'), url(${MonsterRatRegular}) format('woff2');
    font-style: normal;
  }

  @font-face {
    font-family: 'Montserrat SemiBold';
    src: local('Montserrat SemiBold'), url(${MonsterRatSemiBold}) format('woff2');
    font-style: normal;
  }

  @font-face {
    font-family: 'Montserrat Bold';
    src: local('Montserrat Bold'), url(${MonsterRatBold}) format('woff2');
    font-style: normal;
  }

  @font-face {
    font-family: 'Hind Regular';
    src: local('Hind Regular'), url(${Hind}) format('woff2');
    font-style: normal;
  }

  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
    color: white;
  }

  html{
    background: ${theme.colors.main_bg};
  }
  
  body {
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    min-height: 100vh;
  }

  #root {
    background: ${theme.colors.main_bg};
  }

  & .App {
    height: 100vh;
    position: relative;
    background: ${theme.colors.main_bg};
    overflow: hidden;
    @media (min-width: 1440px) {
      margin: 0 auto;
    }
  }
  
  & ::-webkit-scrollbar {
    width: 10px;
  }

  /* Track */
  & ::-webkit-scrollbar-track {
    background: ${theme.colors.bg};
    border-radius: 10px;
  }

  /* Handle */
  & ::-webkit-scrollbar-thumb {
    background: ${theme.colors.active_bg};
    border-radius: 10px;
  }
  
  :root{
    --toastify-color-info: ${theme.colors.active_bg};
    --toastify-color-success: ${theme.colors.blue};
    --toastify-color-error: ${theme.colors.orange};
    --swiper-navigation-color: ${theme.colors.orange}
  }

  p.toastify-err{
    background: ${theme.colors.white}
    color: ${theme.colors.active_bg}

  }
`;
