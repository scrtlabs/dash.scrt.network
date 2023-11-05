import {
  faArrowUpRightFromSquare,
  faBook,
  faBox,
  faBriefcase,
  faChartLine,
  faCheckToSlot,
  faChevronDown,
  faCircleNodes,
  faClose,
  faCoins,
  faCube,
  faShuffle,
  faCreditCard,
  faPaperPlane,
  faChartPie
} from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import React, { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { trackMixPanelEvent } from 'utils/commons'

export function Navigation({
  showMobileMenu,
  setShowMobileMenu
}: {
  showMobileMenu: boolean
  setShowMobileMenu: React.Dispatch<React.SetStateAction<boolean>>
}) {
  const [isExtendedMenuOpen, setIsExtendedMenuOpen] = useState<boolean>(false)

  function toggleIsExtendedMenuOpen() {
    setIsExtendedMenuOpen(!isExtendedMenuOpen)
  }

  function toggleIsWalletMenuOpen() {
    setIsWalletMenuOpen(!isWalletMenuOpen)
  }

  return (
    <>
      <NavLink to="/" className="block ml-4 mb-12" style={{ maxWidth: '9rem' }}>
        <svg
          className="w-full inline-block fill-black dark:fill-white"
          viewBox="0 0 1018 319"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M271.19 46.6798C241.171 16.6288 201.294 0.0927734 158.873 0.0927734C71.2638 0.0927734 0 71.4202 0 159.093C0 246.765 71.2638 318.093 158.873 318.093C201.294 318.093 241.203 301.557 271.19 271.506C301.21 241.455 317.714 201.546 317.714 159.093C317.714 116.64 301.21 76.699 271.19 46.6798ZM158.873 307.09C77.3376 307.09 11.0028 240.692 11.0028 159.093C11.0028 77.494 77.3376 11.0956 158.873 11.0956C240.408 11.0956 306.743 77.494 306.743 159.093C306.743 240.692 240.408 307.09 158.873 307.09Z" />
          <path d="M211.026 162.846C200.85 153.751 187.526 147.677 174.615 141.794L174.52 141.762C151.751 131.364 132.067 122.364 133.466 101.09C134.07 92.981 139.953 88.0838 144.787 85.4444C150.224 82.4552 157.443 80.6744 164.121 80.6744C164.916 80.6744 165.711 80.7062 166.474 80.738C185.904 82.0418 201.232 90.278 216.209 107.386L217.1 108.436L218.149 107.545L224 102.457L225.05 101.535L224.128 100.486C207.433 81.3422 189.307 71.7068 167.142 70.2122C166.188 70.1168 165.17 70.085 164.057 70.085C163.39 70.085 162.658 70.085 161.895 70.1168H160.941C146.408 70.1168 130.477 74.8868 118.361 82.9004C103.892 92.4722 95.7828 105.637 95.5602 119.979C94.9878 154.864 123.512 166.598 148.666 176.997L148.73 177.028L148.984 177.124C171.244 186.346 190.451 194.296 190.038 215.602C189.847 229.657 169.75 237.417 155.948 237.417H155.376H154.009V237.448C133.434 236.844 115.054 227.972 99.3762 211.15L98.4222 210.132L97.4046 211.054L91.7124 216.333L90.6948 217.287L91.6488 218.305C109.457 237.48 131.431 247.783 155.217 248.07H156.298C171.658 248.07 188.353 243.936 200.945 236.971C216.718 228.354 225.908 215.793 226.862 201.61C227.944 186.028 222.76 173.34 211.026 162.846ZM137.186 132.508C146.249 140.268 158.524 145.833 170.386 151.207L170.608 151.302C183.169 157.09 195.062 162.559 203.68 170.16C213.22 178.555 217.259 188.286 216.4 200.783C215.605 213.153 206.415 221.421 198.052 226.414C199.673 223.107 200.564 219.513 200.659 215.697C200.85 202.85 195.921 192.579 185.554 184.247C176.491 176.965 164.471 172.036 152.832 167.234C128.632 157.281 105.768 147.868 106.181 120.075C106.309 109.39 112.732 99.2774 124.276 91.6136C124.657 91.3592 125.039 91.1048 125.452 90.8504C124.085 93.8396 123.322 96.956 123.131 100.231C122.209 113.11 126.82 123.668 137.186 132.508Z" />
          <path d="M442.12 151.053V190.653C437.44 181.653 428.68 176.493 417.4 176.493C399.52 176.493 387.04 189.573 387.04 208.413C387.04 227.253 399.52 240.573 417.52 240.573C428.8 240.573 437.44 235.413 442.12 226.533V240.093H451.48V151.053H442.12ZM419.32 232.533C405.88 232.533 396.4 222.573 396.4 208.653C396.4 194.733 405.88 184.653 419.32 184.653C432.64 184.653 442.12 194.733 442.12 208.653C442.12 222.573 432.64 232.533 419.32 232.533ZM523.205 240.093L523.085 198.333C522.965 184.893 514.325 176.613 498.725 176.613C487.925 176.613 481.085 179.733 472.925 185.133L476.885 191.733C483.485 187.053 489.965 184.413 496.925 184.413C508.085 184.413 513.845 190.053 513.845 199.293V203.253H493.085C478.205 203.373 469.445 210.333 469.445 221.373C469.445 232.173 477.845 240.453 490.925 240.453C501.005 240.453 509.045 237.093 514.085 230.253V240.093H523.205ZM492.725 232.653C483.845 232.653 478.205 227.973 478.205 221.013C478.205 213.933 483.725 210.693 494.285 210.693H513.965V218.373C511.565 227.373 503.405 232.653 492.725 232.653ZM577.463 189.453L581.063 182.253C575.783 178.773 568.463 176.493 560.903 176.493C549.383 176.493 538.943 181.653 538.943 193.653C538.823 215.973 574.223 208.173 573.863 223.533C573.743 229.893 567.743 232.773 560.303 232.773C552.863 232.773 544.703 229.773 539.303 224.733L535.703 231.573C541.703 237.333 550.943 240.453 559.943 240.453C572.063 240.453 583.103 234.933 583.103 222.573C583.103 199.893 547.823 207.213 547.823 192.933C547.823 186.933 553.223 184.413 560.303 184.413C566.183 184.413 572.543 186.333 577.463 189.453ZM633.038 176.613C621.398 176.733 612.758 181.293 608.438 191.133V151.053H599.078V240.093H608.438V209.133C608.438 195.333 616.358 185.733 629.798 185.613C640.958 185.613 647.678 192.333 647.678 203.613V240.093H657.038V201.213C657.038 185.853 648.158 176.613 633.038 176.613ZM712.251 176.613C701.211 176.613 692.571 181.773 687.891 190.533V151.053H678.531V240.093H687.891V226.533C692.571 235.293 701.211 240.453 712.491 240.453C730.371 240.453 742.611 227.373 742.611 208.653C742.611 189.813 730.131 176.613 712.251 176.613ZM710.571 232.173C697.251 232.173 687.891 222.333 687.891 208.413C687.891 194.613 697.251 184.653 710.571 184.653C723.771 184.653 733.131 194.733 733.131 208.413C733.131 222.213 723.771 232.173 710.571 232.173ZM784.705 176.613C765.865 176.613 752.665 189.693 752.665 208.413C752.665 227.253 765.865 240.453 784.705 240.453C803.425 240.453 816.745 227.253 816.745 208.413C816.745 189.693 803.425 176.613 784.705 176.613ZM784.705 184.893C797.905 184.893 807.385 194.613 807.385 208.533C807.385 222.693 797.905 232.293 784.705 232.293C771.385 232.293 762.025 222.693 762.025 208.533C762.025 194.613 771.385 184.893 784.705 184.893ZM881.565 240.093L881.445 198.333C881.325 184.893 872.685 176.613 857.085 176.613C846.285 176.613 839.445 179.733 831.285 185.133L835.245 191.733C841.845 187.053 848.325 184.413 855.285 184.413C866.445 184.413 872.205 190.053 872.205 199.293V203.253H851.445C836.565 203.373 827.805 210.333 827.805 221.373C827.805 232.173 836.205 240.453 849.285 240.453C859.365 240.453 867.405 237.093 872.445 230.253V240.093H881.565ZM851.085 232.653C842.205 232.653 836.565 227.973 836.565 221.013C836.565 213.933 842.085 210.693 852.645 210.693H872.325V218.373C869.925 227.373 861.765 232.653 851.085 232.653ZM911.823 191.013V176.973H902.463V240.093H911.823V206.493C912.903 193.773 921.183 185.493 934.503 185.733V176.613C923.823 176.733 916.023 181.773 911.823 191.013ZM995.831 151.053V190.653C991.151 181.653 982.391 176.493 971.111 176.493C953.231 176.493 940.751 189.573 940.751 208.413C940.751 227.253 953.231 240.573 971.231 240.573C982.511 240.573 991.151 235.413 995.831 226.533V240.093H1005.19V151.053H995.831ZM973.031 232.533C959.591 232.533 950.111 222.573 950.111 208.653C950.111 194.733 959.591 184.653 973.031 184.653C986.351 184.653 995.831 194.733 995.831 208.653C995.831 222.573 986.351 232.533 973.031 232.533Z" />
          <path d="M428.172 88.7308L433.17 78.6158C427.458 74.5698 419.009 72.1898 411.036 72.1898C398.898 72.1898 387.712 77.6638 387.712 90.5158C387.593 113.364 420.913 106.105 420.913 119.076C420.913 123.836 416.391 125.859 410.56 125.859C403.658 125.859 394.852 122.884 389.378 118.005L384.499 127.763C390.806 133.475 400.683 136.569 409.965 136.569C422.698 136.569 434.241 130.738 434.241 117.767C434.36 94.7998 400.683 101.107 400.683 89.4448C400.683 84.9228 404.61 83.1378 409.965 83.1378C415.558 83.1378 422.579 85.2798 428.172 88.7308ZM474.073 72.3088C455.271 72.4278 442.062 85.3988 442.062 104.558C442.062 123.598 454.914 136.569 474.43 136.569C485.378 136.569 494.422 132.642 500.61 125.859L493.351 118.124C488.71 122.884 482.403 125.502 475.501 125.502C465.505 125.502 458.008 119.433 455.866 109.675H503.704C505.37 86.8268 496.326 72.3088 474.073 72.3088ZM455.628 99.6788C457.056 89.5638 464.196 83.2568 474.192 83.2568C484.545 83.2568 491.328 89.4448 491.804 99.6788H455.628ZM562.596 91.4678L570.093 82.6618C564.262 75.9978 555.337 72.3088 543.913 72.3088C525.111 72.3088 512.021 85.3988 512.021 104.558C512.021 123.598 525.111 136.569 543.913 136.569C555.932 136.569 565.095 132.285 570.807 124.788L563.191 117.172C558.907 122.17 552.481 124.788 544.508 124.788C533.56 124.788 525.706 116.577 525.706 104.558C525.706 92.5388 533.56 84.3278 544.508 84.3278C552.124 84.2088 558.193 86.9458 562.596 91.4678ZM598.826 85.3988V72.7848H585.141V136.093H598.826V103.011C599.897 92.1818 607.989 84.6848 620.722 85.3988V72.3088C610.726 72.3088 603.11 76.8308 598.826 85.3988ZM658.035 72.3088C639.233 72.4278 626.024 85.3988 626.024 104.558C626.024 123.598 638.876 136.569 658.392 136.569C669.34 136.569 678.384 132.642 684.572 125.859L677.313 118.124C672.672 122.884 666.365 125.502 659.463 125.502C649.467 125.502 641.97 119.433 639.828 109.675H687.666C689.332 86.8268 680.288 72.3088 658.035 72.3088ZM639.59 99.6788C641.018 89.5638 648.158 83.2568 658.154 83.2568C668.507 83.2568 675.29 89.4448 675.766 99.6788H639.59ZM734.301 121.575C730.612 123.36 727.637 124.312 724.781 124.312C720.497 124.312 717.998 122.289 717.998 115.744V85.3988H736.681V75.1648H717.998V57.7908H704.432V75.1648H695.507V85.3988H704.432V118.243C704.432 131.214 712.643 136.688 722.163 136.688C727.518 136.688 732.754 135.022 737.752 132.047L734.301 121.575Z" />
        </svg>
      </NavLink>

      <ul className="space-y-4 font-semibold text-neutral-600 dark:text-neutral-400 text-center lg:text-left">
        <li className="lg:hidden">
          <button
            onClick={() => setShowMobileMenu(false)}
            className="hover:text-black dark:hover:text-white fixed top-0 right-0 float-right px-8 py-5 rounded-full transition-colors"
          >
            <FontAwesomeIcon icon={faClose} className="mr-2" size="lg" />
          </button>
        </li>
        <li>
          <NavLink
            to="/"
            className={({ isActive }) =>
              isActive
                ? 'text-black dark:text-white bg-gradient-to-r from-neutral-200 via-neutral-200 to-neutral-200/10 dark:from-neutral-700 dark:via-neutral-700 dark:to-neutral-700/10 block w-full px-8 py-3 rounded-xl transition-colors font-semibold cursor-default'
                : 'text-neutral-700 dark:text-neutral-300 cursor-pointer hover:text-black dark:hover:text-white block w-full px-8 py-3 rounded-xl transition-colors'
            }
          >
            <FontAwesomeIcon icon={faChartLine} className="mr-2" />
            Dashboard
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/ibc"
            className={({ isActive }) =>
              isActive
                ? 'text-black dark:text-white bg-gradient-to-r from-neutral-200 via-neutral-200 to-neutral-200/10 dark:from-neutral-700 dark:via-neutral-700 dark:to-neutral-700/10 block w-full px-8 py-3 rounded-xl transition-colors font-semibold cursor-default'
                : 'text-neutral-700 dark:text-neutral-300 cursor-pointer hover:text-black dark:hover:text-white block w-full px-8 py-3 rounded-xl transition-colors'
            }
          >
            <FontAwesomeIcon icon={faCircleNodes} className="mr-2" />
            IBC
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/wrap"
            className={({ isActive }) =>
              isActive
                ? 'text-black dark:text-white bg-gradient-to-r from-neutral-200 via-neutral-200 to-neutral-200/10 dark:from-neutral-700 dark:via-neutral-700 dark:to-neutral-700/10 block w-full px-8 py-3 rounded-xl transition-colors font-semibold cursor-default'
                : 'text-neutral-700 dark:text-neutral-300 cursor-pointer hover:text-black dark:hover:text-white block w-full px-8 py-3 rounded-xl transition-colors'
            }
          >
            <FontAwesomeIcon icon={faShuffle} className="mr-2" />
            Wrap
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/bridge"
            className={({ isActive }) =>
              isActive
                ? 'isActiveNavLink text-black dark:text-white bg-gradient-to-r from-neutral-200 via-neutral-200 to-neutral-200/10 dark:from-neutral-700 dark:via-neutral-700 dark:to-neutral-700/10 block w-full px-8 py-3 rounded-xl transition-colors font-semibold cursor-default'
                : 'isInactiveNavLink text-neutral-700 dark:text-neutral-300 cursor-pointer hover:text-black dark:hover:text-white block w-full px-8 py-3 rounded-xl transition-colors'
            }
          >
            <svg
              className="transition-colors h-[1.15em] mb-[.1em] inline-block mr-2"
              version="1.0"
              viewBox="0 0 512 512"
              xmlns="http://www.w3.org/2000/svg"
            >
              <g transform="translate(0 512) scale(.1 -.1)">
                <path d="m4155 4896c-131-26-230-74-320-157-49-45-120-148-150-216l-18-42-1226-4c-1345-4-1250 1-1446-64-318-105-569-314-690-576-151-326-111-729 99-1014 134-183 353-333 598-412 198-63 149-61 1504-61 820 0 1259-4 1311-11 102-14 275-71 354-118 187-108 294-276 306-476 17-293-147-514-462-622-160-55-113-53-1385-53h-1179l-27 61c-75 167-232 296-419 344-84 21-225 19-319-5-309-79-509-377-466-696 21-160 75-271 184-379 121-119 268-178 446-178 218-1 410 99 523 271 24 37 51 85 59 107l16 40 1228 6c1113 5 1236 7 1299 22 660 161 1012 635 914 1232-60 368-358 682-771 814-199 63-150 61-1504 61-820 0-1259 4-1311 11-102 14-275 71-354 118-187 108-294 276-306 476-10 180 42 321 162 440 83 82 153 126 275 172 177 66 111 63 1410 63h1178l30-62c82-175 230-295 422-344 87-22 259-15 350 15 202 65 360 233 416 441 22 85 23 243 1 330-57 220-234 400-449 454-87 22-204 27-283 12zm186-428c57-19 90-49 115-102 42-91 27-185-40-252-97-98-275-73-336 46-60 120-10 264 106 305 48 17 110 19 155 3zm-3387-3425c88-44 128-137 105-244-28-131-175-196-305-135-125 58-154 230-57 337 60 66 173 85 257 42z" />
              </g>
            </svg>
            <span>Bridge</span>
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/get-scrt"
            className={({ isActive }) =>
              isActive
                ? 'isActiveNavLink text-black dark:text-white bg-gradient-to-r from-neutral-200 via-neutral-200 to-neutral-200/10 dark:from-neutral-700 dark:via-neutral-700 dark:to-neutral-700/10 block w-full px-8 py-3 rounded-xl transition-colors font-semibold cursor-default'
                : 'isInactiveNavLink text-neutral-700 dark:text-neutral-300 cursor-pointer hover:text-black dark:hover:text-white block w-full px-8 py-3 rounded-xl transition-colors'
            }
          >
            <FontAwesomeIcon icon={faCreditCard} className="mr-2" />
            <span>Get SCRT</span>
          </NavLink>
        </li>
        <ul className="space-y-6 font-medium">
          <li>
            <NavLink
              to="/staking"
              className={({ isActive }) =>
                isActive
                  ? 'text-black dark:text-white bg-gradient-to-r from-neutral-200 via-neutral-200 to-neutral-200/10 dark:from-neutral-700 dark:via-neutral-700 dark:to-neutral-700/10 block w-full px-8 py-3 rounded-xl transition-colors font-semibold cursor-default'
                  : 'text-neutral-700 dark:text-neutral-300 cursor-pointer hover:text-black dark:hover:text-white block w-full px-8 py-3 rounded-xl transition-colors'
              }
            >
              <FontAwesomeIcon icon={faCoins} className="mr-2" />
              <span>Staking</span>
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/send"
              className={({ isActive }) =>
                isActive
                  ? 'text-black dark:text-white bg-gradient-to-r from-neutral-200 via-neutral-200 to-neutral-200/10 dark:from-neutral-700 dark:via-neutral-700 dark:to-neutral-700/10 block w-full px-8 py-3 rounded-xl transition-colors font-semibold cursor-default'
                  : 'text-neutral-700 dark:text-neutral-300 cursor-pointer hover:text-black dark:hover:text-white block w-full px-8 py-3 rounded-xl transition-colors'
              }
            >
              <FontAwesomeIcon icon={faPaperPlane} className="mr-2" />
              <span>Send</span>
            </NavLink>
          </li>
        </ul>
        <li>
          <NavLink
            to="/apps"
            className={({ isActive }) =>
              isActive
                ? 'isActiveNavLink text-black dark:text-white bg-gradient-to-r from-neutral-200 via-neutral-200 to-neutral-200/10 dark:from-neutral-700 dark:via-neutral-700 dark:to-neutral-700/10 block w-full px-8 py-3 rounded-xl transition-colors font-semibold cursor-default'
                : 'isInactiveNavLink text-neutral-700 dark:text-neutral-300 cursor-pointer hover:text-black dark:hover:text-white block w-full px-8 py-3 rounded-xl transition-colors'
            }
          >
            <svg
              className="transition-colors h-[1.15em] mb-[.1em] inline-block mr-2"
              width="18"
              height="18"
              viewBox="0 0 18 18"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M3.0001 0.600098C1.67461 0.600098 0.600098 1.67461 0.600098 3.0001V5.4001C0.600098 6.72558 1.67461 7.8001 3.0001 7.8001H5.4001C6.72558 7.8001 7.8001 6.72558 7.8001 5.4001V3.0001C7.8001 1.67461 6.72558 0.600098 5.4001 0.600098H3.0001Z" />
              <path d="M3.0001 10.2001C1.67461 10.2001 0.600098 11.2746 0.600098 12.6001V15.0001C0.600098 16.3256 1.67461 17.4001 3.0001 17.4001H5.4001C6.72558 17.4001 7.8001 16.3256 7.8001 15.0001V12.6001C7.8001 11.2746 6.72558 10.2001 5.4001 10.2001H3.0001Z" />
              <path d="M10.2001 3.0001C10.2001 1.67461 11.2746 0.600098 12.6001 0.600098H15.0001C16.3256 0.600098 17.4001 1.67461 17.4001 3.0001V5.4001C17.4001 6.72558 16.3256 7.8001 15.0001 7.8001H12.6001C11.2746 7.8001 10.2001 6.72558 10.2001 5.4001V3.0001Z" />
              <path d="M13.8001 10.2001C14.4628 10.2001 15.0001 10.7374 15.0001 11.4001V12.6001H16.2001C16.8628 12.6001 17.4001 13.1374 17.4001 13.8001C17.4001 14.4628 16.8628 15.0001 16.2001 15.0001H15.0001V16.2001C15.0001 16.8628 14.4628 17.4001 13.8001 17.4001C13.1374 17.4001 12.6001 16.8628 12.6001 16.2001V15.0001H11.4001C10.7374 15.0001 10.2001 14.4628 10.2001 13.8001C10.2001 13.1374 10.7374 12.6001 11.4001 12.6001H12.6001V11.4001C12.6001 10.7374 13.1374 10.2001 13.8001 10.2001Z" />
            </svg>
            Apps
          </NavLink>
        </li>
      </ul>

      <div className="mt-12 text-center lg:text-left">
        <button
          onClick={() => toggleIsExtendedMenuOpen()}
          className="px-8 py-3 w-full font-semibold text-neutral-700 dark:text-neutral-300 hover:text-black dark:hover:text-white transition-colors mb-4 flex items-center"
        >
          <div className="flex-1 lg:flex-initial">
            <span>More</span>
            <FontAwesomeIcon
              icon={faChevronDown}
              className={'flex-initial ml-4' + (isExtendedMenuOpen ? ' fa-rotate-180' : '')}
            />
          </div>
        </button>

        <div className={`text-sm font-semibold ${isExtendedMenuOpen ? 'block' : 'hidden'}`} id="extended-menu">
          <ul className="space-y-6 font-medium">
            <li>
              <a
                href="https://wallet.keplr.app/chains/secret-network?tab=governance"
                target="_blank"
                className="cursor-pointer dark:hover:text-white w-full lg:mx-8 rounded-xl transition-colors text-neutral-600 dark:text-neutral-300 hover:text-black block lg:flex lg:items-center"
                onClick={() => {
                  trackMixPanelEvent('Clicked external Governance')
                }}
              >
                <svg
                  className="mr-2 fill-current h-4"
                  viewBox="0 0 22 19"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <g clipPath="url(#clip0_8623_40851)">
                    <path d="M14.6002 4.2001C14.6002 6.18832 12.9884 7.8001 11.0002 7.8001C9.01196 7.8001 7.40019 6.18832 7.40019 4.2001C7.40019 2.21187 9.01196 0.600098 11.0002 0.600098C12.9884 0.600098 14.6002 2.21187 14.6002 4.2001Z" />
                    <path d="M20.6002 6.6001C20.6002 7.92558 19.5257 9.0001 18.2002 9.0001C16.8747 9.0001 15.8002 7.92558 15.8002 6.6001C15.8002 5.27461 16.8747 4.2001 18.2002 4.2001C19.5257 4.2001 20.6002 5.27461 20.6002 6.6001Z" />
                    <path d="M15.8002 15.0001C15.8002 12.3491 13.6512 10.2001 11.0002 10.2001C8.34922 10.2001 6.20019 12.3491 6.20019 15.0001V18.6001H15.8002V15.0001Z" />
                    <path d="M6.20019 6.6001C6.20019 7.92558 5.12567 9.0001 3.80019 9.0001C2.47471 9.0001 1.40019 7.92558 1.40019 6.6001C1.40019 5.27461 2.47471 4.2001 3.80019 4.2001C5.12567 4.2001 6.20019 5.27461 6.20019 6.6001Z" />
                    <path d="M18.2002 18.6001V15.0001C18.2002 13.7351 17.874 12.5463 17.3011 11.5133C17.5885 11.4394 17.8897 11.4001 18.2002 11.4001C20.1884 11.4001 21.8002 13.0119 21.8002 15.0001V18.6001H18.2002Z" />
                    <path d="M4.69931 11.5133C4.12641 12.5463 3.80019 13.7351 3.80019 15.0001V18.6001H0.200195V15.0001C0.200195 13.0119 1.81197 11.4001 3.80019 11.4001C4.11064 11.4001 4.41192 11.4394 4.69931 11.5133Z" />
                  </g>
                  <defs>
                    <clipPath id="clip0_8623_40851">
                      <rect width="22" height="19" fill="white" />
                    </clipPath>
                  </defs>
                </svg>

                {/* <FontAwesomeIcon icon={faCheckToSlot} className="mr-2" /> */}
                <span>Governance</span>
                <FontAwesomeIcon icon={faArrowUpRightFromSquare} className="text-xs ml-2" size={'xs'} />
              </a>
            </li>
            {/*  <li>
              <a
                href="https://secretanalytics.xyz"
                target="_blank"
                className="cursor-pointer dark:hover:text-white w-full lg:mx-8 rounded-xl transition-colors text-neutral-600 dark:text-neutral-300 hover:text-black block lg:flex lg:items-center"
                onClick={() => {
                  trackMixPanelEvent('Clicked external Analytics')
                }}
              >
                <FontAwesomeIcon icon={faChartLine} className="mr-2" />
                <span>Stats</span>
                <FontAwesomeIcon
                  icon={faArrowUpRightFromSquare}
                  className="text-xs ml-2"
                  size={'xs'}
                />
              </a>
            </li> */}
            <li>
              <a
                href="https://www.mintscan.io/secret"
                target="_blank"
                className="cursor-pointer dark:hover:text-white w-full lg:mx-8 rounded-xl transition-colors text-neutral-600 dark:text-neutral-300 hover:text-black block lg:flex lg:items-center"
                onClick={() => {
                  trackMixPanelEvent('Clicked external Block Explorer')
                }}
              >
                <FontAwesomeIcon icon={faCube} className="mr-2" />
                <span>Block Explorer</span>
                <FontAwesomeIcon icon={faArrowUpRightFromSquare} className="text-xs ml-2" size={'xs'} />
              </a>
            </li>
            <li>
              <a
                href="https://docs.scrt.network/"
                target="_blank"
                className="cursor-pointer dark:hover:text-white w-full lg:mx-8 rounded-xl transition-colors text-neutral-600 dark:text-neutral-300 hover:text-black block lg:flex lg:items-center"
                onClick={() => {
                  trackMixPanelEvent('Clicked external docs')
                }}
              >
                <FontAwesomeIcon icon={faBook} className="mr-2" />
                <span>Documentation</span>
                <FontAwesomeIcon icon={faArrowUpRightFromSquare} className="text-xs ml-2" size={'xs'} />
              </a>
            </li>
            <li>
              <a
                href="https://cryptoclerk.xyz/"
                target="_blank"
                className="cursor-pointer dark:hover:text-white w-full lg:mx-8 rounded-xl transition-colors text-neutral-600 dark:text-neutral-300 hover:text-black block lg:flex lg:items-center"
                onClick={() => {
                  trackMixPanelEvent('Clicked external Cryptoclerk')
                }}
              >
                <FontAwesomeIcon icon={faBriefcase} className="mr-2" />
                Crypto Clerk
                <FontAwesomeIcon icon={faArrowUpRightFromSquare} className="text-xs ml-2" size={'xs'} />
              </a>
            </li>
          </ul>
        </div>
      </div>
    </>
  )
}
