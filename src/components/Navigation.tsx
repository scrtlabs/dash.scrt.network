import { faReact } from '@fortawesome/free-brands-svg-icons'
import {
  faArrowUpRightFromSquare,
  faBook,
  faBriefcase,
  faChartLine,
  faChevronDown,
  faCircleNodes,
  faClose,
  faCoins,
  faCube,
  faShuffle,
  faCreditCard,
  faPaperPlane,
  faPieChart,
  faSeedling,
  faArrowTrendUp,
  faHouse
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

  return (
    <div>
      <NavLink to="/" className="block ml-4 mb-10 max-w-[10rem]">
        <svg viewBox="0 0 1252 394" className="w-full inline-block" xmlns="http://www.w3.org/2000/svg">
          <g clip-path="url(#clip0_14564_34633)">
            <path
              d="M360.247 209.61L360.578 208.952C371.772 208.621 389.556 200.718 397.13 192.486H397.788C401.742 221.465 423.146 239.249 451.138 239.249C476.165 239.249 490.655 223.77 490.655 204.671C490.655 185.899 477.153 177.338 454.103 171.739L434.343 167.129C393.837 157.908 370.784 136.832 370.784 102.583C370.784 65.041 403.388 36.062 446.199 36.062C487.363 36.062 517.99 58.785 525.892 95.009L525.565 95.667C515.025 94.68 497.573 100.608 489.668 108.182L489.01 107.853C484.401 83.482 466.618 70.969 445.211 70.969C423.804 70.969 410.306 83.153 410.306 99.619C410.306 116.085 426.439 125.305 446.858 130.245L465.961 134.526C505.806 143.747 530.175 163.176 530.175 203.353C530.175 243.53 498.232 276.131 449.825 276.131C405.696 276.131 368.813 252.422 360.25 209.61H360.247Z"
              fill="#FF3912"
            />
            <path
              d="M547.952 191.827C547.952 145.393 581.542 107.853 627.975 107.853C680.336 107.853 712.61 149.675 705.694 203.025H583.188C587.469 228.383 606.241 244.189 630.941 244.189C652.344 244.189 668.154 232.005 674.082 215.539L674.74 215.21C680.668 223.113 695.158 230.029 704.706 229.699L705.037 230.359C690.877 261.973 662.554 276.133 630.284 276.133C582.204 276.133 547.953 238.591 547.953 191.828L547.952 191.827ZM670.786 173.057C666.177 151.981 650.698 138.808 627.649 138.808C605.254 138.808 590.105 151.981 584.508 173.057H670.786Z"
              fill="#FF3912"
            />
            <path
              d="M723.471 191.827C723.471 145.064 758.707 107.522 806.129 107.522C841.038 107.522 867.38 123.001 880.224 151.321L879.897 151.981C869.357 151.652 853.22 158.567 846.635 166.47L845.977 166.141C837.745 149.346 823.254 142.101 806.129 142.101C778.798 142.101 760.026 164.495 760.026 191.827C760.026 219.159 778.798 241.884 806.129 241.884C823.912 241.884 838.73 234.31 847.293 215.538L847.954 215.209C854.867 222.783 871.004 229.698 881.544 229.04L881.871 229.698C867.38 261.643 841.696 276.132 806.129 276.132C758.707 276.132 723.471 238.261 723.471 191.827Z"
              fill="#FF3912"
            />
            <path
              d="M898.993 112.463H934.556V139.465C941.803 122.341 955.963 109.828 976.05 109.828C990.21 109.828 1000.75 114.109 1006.68 121.024L1007.01 121.684C998.445 127.281 990.21 142.101 989.552 152.31H988.894C985.271 149.346 978.358 147.371 970.453 147.371C943.78 147.371 935.544 173.057 935.544 200.719V271.193H898.992L898.993 112.463Z"
              fill="#FF3912"
            />
            <path
              d="M1000.09 191.827C1000.09 145.393 1033.68 107.853 1080.12 107.853C1132.48 107.853 1164.75 149.675 1157.83 203.025H1035.33C1039.61 228.383 1058.38 244.189 1083.08 244.189C1104.48 244.189 1120.29 232.005 1126.22 215.539L1126.88 215.21C1132.81 223.113 1147.3 230.029 1156.85 229.699L1157.18 230.359C1143.02 261.973 1114.69 276.133 1082.42 276.133C1034.34 276.133 1000.09 238.591 1000.09 191.828L1000.09 191.827ZM1122.93 173.057C1118.32 151.981 1102.84 138.808 1079.79 138.808C1057.39 138.808 1042.25 151.981 1036.65 173.057H1122.93Z"
              fill="#FF3912"
            />
            <path
              d="M1169.36 112.463H1190.77V57.138H1227.65V112.463H1251.03V145.393H1227.65V271.192H1190.77V145.393H1169.36V112.463Z"
              fill="#FF3912"
            />
            <path
              d="M308.156 94.509C308.156 89.712 305.689 85.382 301.568 82.926L169.465 4.246C164.719 1.415 159.399 0 154.078 0C148.757 0 143.436 1.415 138.69 4.246L6.58798 82.927C2.51398 85.355 0.0669823 89.613 0.000982336 94.345C0.00298234 100.13 0.00598234 109.594 0.00698234 115.38C-0.158018 120.362 2.33298 124.894 6.58698 127.429L53.027 155.098C53.405 155.323 53.595 155.709 53.597 156.096C53.599 156.486 53.409 156.877 53.027 157.104L6.58698 184.763C2.47398 187.216 0.00798234 191.535 -1.76638e-05 196.323C-1.76638e-05 202.195 -1.76638e-05 211.802 -1.76638e-05 217.674C-1.76638e-05 222.482 2.46698 226.811 6.58798 229.257L138.69 307.948C143.436 310.779 148.754 312.194 154.083 312.194C159.412 312.194 164.719 310.779 169.465 307.948L301.567 229.257C305.688 226.811 308.155 222.482 308.155 217.674C308.155 211.802 308.155 202.195 308.155 196.323C308.147 191.535 305.681 187.216 301.567 184.764L255.127 157.105C254.747 156.879 254.557 156.49 254.557 156.102C254.557 155.714 254.747 155.325 255.127 155.099L301.567 127.43C305.688 124.974 308.155 120.645 308.155 115.847V94.51L308.156 94.509ZM144.935 137.889C147.755 136.214 150.919 135.37 154.083 135.37C157.247 135.37 160.4 136.213 163.221 137.889L193.788 156.102L163.221 174.305C157.58 177.667 150.576 177.667 144.935 174.305L114.368 156.102L144.935 137.889ZM277.58 206.012C278.34 206.465 278.34 207.566 277.58 208.019L163.221 276.132C160.401 277.813 157.239 278.653 154.078 278.653C150.917 278.653 147.755 277.813 144.935 276.132L30.575 208.018C29.815 207.565 29.815 206.464 30.575 206.012L52.006 193.243C56.194 190.747 58.76 186.232 58.76 181.356V161.278C58.76 160.096 60.047 159.364 61.063 159.968L138.69 206.119C143.436 208.939 148.754 210.355 154.083 210.355C159.412 210.355 164.719 208.939 169.465 206.119L192.116 192.624C196.33 190.113 198.9 185.559 198.871 180.654L198.758 161.756C198.751 160.57 200.042 159.83 201.062 160.438L277.58 206.012ZM249.145 150.749C249.145 151.931 247.858 152.663 246.842 152.059L169.465 106.073C159.973 100.422 148.182 100.422 138.69 106.073L115.894 119.651C111.679 122.162 109.109 126.716 109.138 131.622L109.255 150.963C109.26 151.872 108.271 152.438 107.49 151.973L30.576 106.181C29.816 105.728 29.815 104.627 30.576 104.174L144.935 36.061C147.755 34.375 150.919 33.532 154.083 33.532C157.247 33.532 160.4 34.375 163.221 36.061L277.58 104.174C278.34 104.627 278.34 105.728 277.58 106.181L255.9 119.096C251.711 121.591 249.145 126.107 249.145 130.983V150.749Z"
              fill="#FF3912"
            />
            <path
              d="M415.25 390C415.25 386.36 415.12 382.72 415.12 378.95C410.83 387.01 401.73 391.69 392.63 391.69C375.08 391.69 362.86 377.26 362.86 358.93C362.86 340.86 375.08 326.43 392.63 326.43C401.6 326.43 410.31 330.72 414.86 338.65V299H426.82V376.22V390H415.25ZM374.95 358.93C374.95 370.89 383.4 380.38 395.1 380.38C406.93 380.38 415.25 370.89 415.25 358.93C415.25 347.1 407.06 337.61 395.1 337.61C383.14 337.61 374.95 347.1 374.95 358.93ZM466.136 391.56C448.586 391.56 436.366 377.13 436.366 358.93C436.366 340.86 448.586 326.43 466.136 326.43C475.236 326.43 484.596 330.98 488.756 339.43V327.99H500.326V376.22V390H488.756V378.43C484.466 387.01 475.106 391.56 466.136 391.56ZM448.456 358.93C448.456 370.89 456.776 380.38 468.606 380.38C480.566 380.38 488.756 370.89 488.756 358.93C488.756 347.23 480.566 337.61 468.606 337.61C456.646 337.61 448.456 347.1 448.456 358.93ZM534.312 391.95C520.662 391.95 510.652 384.41 508.572 372.84L508.702 372.58C511.952 373.1 517.022 371.28 519.232 368.81L519.362 368.94C520.402 375.83 525.992 381.42 534.572 381.42C541.462 381.42 545.622 377.65 545.622 372.19C545.622 366.86 540.942 365.04 535.742 363.74L529.892 362.31C517.932 359.32 511.822 354.12 511.822 344.63C511.822 334.62 520.922 326.04 533.662 326.04C545.882 326.04 553.942 332.93 556.282 341.51L556.152 341.77C552.902 341.38 547.962 343.33 545.882 345.8L545.622 345.67C544.062 339.43 539.252 336.18 533.142 336.18C527.162 336.18 523.522 339.56 523.522 343.72C523.522 348.53 527.942 350.22 533.792 351.65L539.252 352.95C548.742 355.16 557.322 360.1 557.322 371.54C557.322 382.85 547.962 391.95 534.312 391.95ZM566.708 390V299H578.668V337.35C582.698 330.07 590.368 326.3 598.558 326.3C611.688 326.3 621.828 335.66 621.828 348.92V390H609.868V353.34C609.868 343.85 604.668 337.61 594.788 337.61C585.428 337.61 578.668 344.37 578.668 353.99V390H566.708ZM669.329 391.69C659.839 391.69 650.739 386.88 646.449 378.43V390H635.009V299H646.969V338.65C651.519 330.85 660.229 326.43 669.329 326.43C686.749 326.43 698.969 340.86 698.969 358.93C698.969 377.26 686.749 391.69 669.329 391.69ZM646.579 358.93C646.579 370.89 655.029 380.38 666.859 380.38C678.689 380.38 687.009 370.89 687.009 358.93C687.009 347.1 678.689 337.61 666.859 337.61C654.769 337.61 646.579 347.1 646.579 358.93ZM738.387 391.95C720.057 391.95 705.887 377.39 705.887 358.93C705.887 340.6 719.927 326.04 738.387 326.04C756.587 326.04 770.497 340.6 770.497 358.93C770.497 377.39 756.717 391.95 738.387 391.95ZM717.977 358.93C717.977 370.76 726.557 380.38 738.387 380.38C749.827 380.38 758.537 370.89 758.537 358.93C758.537 346.97 749.957 337.48 738.387 337.48C726.427 337.48 717.977 346.97 717.977 358.93ZM807.259 391.56C789.709 391.56 777.489 377.13 777.489 358.93C777.489 340.86 789.709 326.43 807.259 326.43C816.359 326.43 825.719 330.98 829.879 339.43V327.99H841.449V376.22V390H829.879V378.43C825.589 387.01 816.229 391.56 807.259 391.56ZM789.579 358.93C789.579 370.89 797.899 380.38 809.729 380.38C821.689 380.38 829.879 370.89 829.879 358.93C829.879 347.23 821.689 337.61 809.729 337.61C797.769 337.61 789.579 347.1 789.579 358.93ZM854.765 344.11V327.99H866.335V338.65C869.065 331.76 874.785 326.95 882.715 326.95C888.175 326.95 891.945 328.64 894.155 331.11L894.285 331.24C891.425 333.06 888.695 337.87 888.435 341.12L888.175 341.25C886.875 340.08 884.145 339.17 881.025 339.17C870.235 339.17 866.725 349.83 866.725 361.27V390H854.765V344.11ZM944.518 390C944.518 386.36 944.388 382.72 944.388 378.95C940.098 387.01 930.998 391.69 921.898 391.69C904.348 391.69 892.128 377.26 892.128 358.93C892.128 340.86 904.348 326.43 921.898 326.43C930.868 326.43 939.578 330.72 944.128 338.65V299H956.088V376.22V390H944.518ZM904.218 358.93C904.218 370.89 912.668 380.38 924.368 380.38C936.198 380.38 944.518 370.89 944.518 358.93C944.518 347.1 936.328 337.61 924.368 337.61C912.408 337.61 904.218 347.1 904.218 358.93Z"
              fill="#FF3912"
            />
          </g>
        </svg>
      </NavLink>

      <ul className="space-y-3 font-semibold text-neutral-600 dark:text-neutral-400 text-center lg:text-left">
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
                ? 'isActiveNavLink dark:bg-neutral-800 text-black dark:text-white block w-full px-5 py-3 rounded-lg transition-colors font-semibold cursor-default'
                : 'isInactiveNavLink text-black dark:text-white dark:hover:bg-neutral-800 block w-full px-5 py-3 rounded-lg transition-colors font-normal'
            }
          >
            <FontAwesomeIcon icon={faHouse} className="mr-2" />
            Dashboard
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/analytics"
            className={({ isActive }) =>
              isActive
                ? 'isActiveNavLink dark:bg-neutral-800 text-black dark:text-white block w-full px-5 py-3 rounded-lg transition-colors font-semibold cursor-default'
                : 'isInactiveNavLink text-black dark:text-white dark:hover:bg-neutral-800 block w-full px-5 py-3 rounded-lg transition-colors font-normal'
            }
          >
            <FontAwesomeIcon icon={faChartLine} className="mr-2" />
            Analytics
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/ibc"
            className={({ isActive }) =>
              isActive
                ? 'isActiveNavLink dark:bg-neutral-800 text-black dark:text-white block w-full px-5 py-3 rounded-lg transition-colors font-semibold cursor-default'
                : 'isInactiveNavLink text-black dark:text-white dark:hover:bg-neutral-800 block w-full px-5 py-3 rounded-lg transition-colors font-normal'
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
                ? 'isActiveNavLink dark:bg-neutral-800 text-black dark:text-white block w-full px-5 py-3 rounded-lg transition-colors font-semibold cursor-default'
                : 'isInactiveNavLink text-black dark:text-white dark:hover:bg-neutral-800 block w-full px-5 py-3 rounded-lg transition-colors font-normal'
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
                ? 'isActiveNavLink dark:bg-neutral-800 text-black dark:text-white block w-full px-5 py-3 rounded-lg transition-colors font-semibold cursor-default'
                : 'isInactiveNavLink text-black dark:text-white dark:hover:bg-neutral-800 block w-full px-5 py-3 rounded-lg transition-colors font-normal'
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
                ? 'isActiveNavLink dark:bg-neutral-800 text-black dark:text-white block w-full px-5 py-3 rounded-lg transition-colors font-semibold cursor-default'
                : 'isInactiveNavLink text-black dark:text-white dark:hover:bg-neutral-800 block w-full px-5 py-3 rounded-lg transition-colors font-normal'
            }
          >
            <FontAwesomeIcon icon={faCreditCard} className="mr-2" />
            <span>Get SCRT</span>
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/staking"
            className={({ isActive }) =>
              isActive
                ? 'isActiveNavLink dark:bg-neutral-800 text-black dark:text-white block w-full px-5 py-3 rounded-lg transition-colors font-semibold cursor-default'
                : 'isInactiveNavLink text-black dark:text-white dark:hover:bg-neutral-800 block w-full px-5 py-3 rounded-lg transition-colors font-normal'
            }
          >
            <FontAwesomeIcon icon={faCoins} className="mr-2" />
            <span>Staking</span>
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/portfolio"
            className={({ isActive }) =>
              isActive
                ? 'isActiveNavLink dark:bg-neutral-800 text-black dark:text-white block w-full px-5 py-3 rounded-lg transition-colors font-semibold cursor-default'
                : 'isInactiveNavLink text-black dark:text-white dark:hover:bg-neutral-800 block w-full px-5 py-3 rounded-lg transition-colors font-normal'
            }
          >
            <FontAwesomeIcon icon={faPieChart} className="mr-2" />
            <span>Portfolio</span>
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/powertools"
            className={({ isActive }) =>
              isActive
                ? 'isActiveNavLink dark:bg-neutral-800 text-black dark:text-white block w-full px-5 py-3 rounded-lg transition-colors font-semibold cursor-default'
                : 'isInactiveNavLink text-black dark:text-white dark:hover:bg-neutral-800 block w-full px-5 py-3 rounded-lg transition-colors font-normal'
            }
          >
            <FontAwesomeIcon icon={faReact} className="mr-2" />
            <span>Power Tools</span>
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/send"
            className={({ isActive }) =>
              isActive
                ? 'isActiveNavLink dark:bg-neutral-800 text-black dark:text-white block w-full px-5 py-3 rounded-lg transition-colors font-semibold cursor-default'
                : 'isInactiveNavLink text-black dark:text-white dark:hover:bg-neutral-800 block w-full px-5 py-3 rounded-lg transition-colors font-normal'
            }
          >
            <FontAwesomeIcon icon={faPaperPlane} className="mr-2" />
            <span>Send</span>
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/apps"
            className={({ isActive }) =>
              isActive
                ? 'isActiveNavLink dark:bg-neutral-800 text-black dark:text-white block w-full px-5 py-3 rounded-lg transition-colors font-semibold cursor-default'
                : 'isInactiveNavLink text-black dark:text-white dark:hover:bg-neutral-800 block w-full px-5 py-3 rounded-lg transition-colors font-normal'
            }
          >
            <svg
              className="fill-red-500 transition-colors h-[1.15em] mb-[.1em] inline-block mr-2"
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
          className="px-5 py-3 w-full font-semibold text-neutral-700 dark:text-neutral-300 hover:text-black dark:hover:text-white transition-colors mb-4 flex items-center"
        >
          <div className="flex-1 lg:flex-initial">
            <span>More</span>
            <FontAwesomeIcon
              icon={faChevronDown}
              className={'flex-initial ml-4' + (isExtendedMenuOpen ? ' fa-rotate-180' : '')}
            />
          </div>
        </button>

        <div className={`text-sm font-semibold ${isExtendedMenuOpen ? 'block' : 'hidden'}`}>
          <ul className="space-y-4 font-medium">
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
            <li>
              <a
                href="https://tokengarden.secretsaturn.net"
                target="_blank"
                className="cursor-pointer dark:hover:text-white w-full lg:mx-8 rounded-xl transition-colors text-neutral-600 dark:text-neutral-300 hover:text-black block lg:flex lg:items-center"
                onClick={() => {
                  trackMixPanelEvent('Clicked external Token Garden')
                }}
              >
                <FontAwesomeIcon icon={faSeedling} className="mr-2" />
                <span>Token Garden</span>
                {/*span className="ml-2 bg-purple-100 text-purple-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded dark:bg-purple-900 dark:text-purple-300">
                  New
                </span>*/}
                <FontAwesomeIcon icon={faArrowUpRightFromSquare} className="text-xs ml-2" size={'xs'} />
              </a>
            </li>
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
    </div>
  )
}
