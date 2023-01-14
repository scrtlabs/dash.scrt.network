import {
  faArrowUpRightFromSquare,
  faBox,
  faChartLine,
  faCheckToSlot,
  faChevronDown,
  faCircleNodes,
  faClose,
  faCoins,
  faCube,
  faEllipsis,
  faShuffle,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";

export function Navigation({
  showMobileMenu,
  setShowMobileMenu,
}: {
  showMobileMenu: boolean;
  setShowMobileMenu: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const [isExtendedMenuOpen, setIsExtendedMenuOpen] = useState<boolean>(false);

  function toggleIsExtendedMenuOpen() {
    setIsExtendedMenuOpen(!isExtendedMenuOpen);
  }

  return (
    <>
      <NavLink to='/' className='block ml-4 mb-12' style={{ maxWidth: "9rem" }}>
        <img
          src={"/img/secret_dashboard_logo.svg"}
          alt='Secret Network Logo'
          className='w-full inline-block'
        />
      </NavLink>

      <ul className='space-y-4 font-semibold text-neutral-400'>
        <li className='lg:hidden'>
          <button
            onClick={() => setShowMobileMenu(false)}
            className='hover:text-white fixed top-0 right-0 float-right px-8 py-5 rounded-full transition-colors'
          >
            <FontAwesomeIcon icon={faClose} className='mr-2' size='lg' />
          </button>
        </li>
        <li>
          <NavLink
            to='/'
            className={({ isActive }) =>
              isActive
                ? "text-white bg-gradient-to-r from-neutral-700 via-neutral-700 to-neutral-700/10 block w-full px-8 py-3 rounded-xl transition-colors font-bold cursor-default"
                : "cursor-pointer hover:text-white block w-full px-8 py-3 rounded-xl transition-colors"
            }
          >
            <FontAwesomeIcon icon={faChartLine} className='mr-2' />
            Dashboard
          </NavLink>
        </li>
        <li>
          <NavLink
            to='/ibc'
            className={({ isActive }) =>
              isActive
                ? "text-white bg-gradient-to-r from-neutral-700 via-neutral-700 to-neutral-700/10 block w-full px-8 py-3 rounded-xl transition-colors font-bold cursor-default"
                : "cursor-pointer hover:text-white block w-full px-8 py-3 rounded-xl transition-colors"
            }
          >
            <FontAwesomeIcon icon={faCircleNodes} className='mr-2' />
            IBC
          </NavLink>
        </li>
        <li>
          <NavLink
            to='/wrap'
            className={({ isActive }) =>
              isActive
                ? "text-white bg-gradient-to-r from-neutral-700 via-neutral-700 to-neutral-700/10 block w-full px-8 py-3 rounded-xl transition-colors font-bold cursor-default"
                : "cursor-pointer hover:text-white block w-full px-8 py-3 rounded-xl transition-colors"
            }
          >
            <FontAwesomeIcon icon={faShuffle} className='mr-2' />
            Wrap
          </NavLink>
        </li>
        <li>
          <NavLink
            to='/bridge'
            className={({ isActive }) =>
              isActive
                ? "isActiveNavLink block text-white bg-gradient-to-r from-neutral-700 via-neutral-700 to-neutral-700/10 w-full px-8 py-3 rounded-xl transition-colors font-bold cursor-default"
                : "isInactiveNavLink cursor-pointer hover:text-white block w-full px-8 py-3 rounded-xl transition-colors group"
            }
          >
            <svg
              className='transition-colors h-[1.15em] mb-[.1em] inline-block mr-2'
              version='1.0'
              viewBox='0 0 512 512'
              xmlns='http://www.w3.org/2000/svg'
            >
              <g transform='translate(0 512) scale(.1 -.1)'>
                <path d='m4155 4896c-131-26-230-74-320-157-49-45-120-148-150-216l-18-42-1226-4c-1345-4-1250 1-1446-64-318-105-569-314-690-576-151-326-111-729 99-1014 134-183 353-333 598-412 198-63 149-61 1504-61 820 0 1259-4 1311-11 102-14 275-71 354-118 187-108 294-276 306-476 17-293-147-514-462-622-160-55-113-53-1385-53h-1179l-27 61c-75 167-232 296-419 344-84 21-225 19-319-5-309-79-509-377-466-696 21-160 75-271 184-379 121-119 268-178 446-178 218-1 410 99 523 271 24 37 51 85 59 107l16 40 1228 6c1113 5 1236 7 1299 22 660 161 1012 635 914 1232-60 368-358 682-771 814-199 63-150 61-1504 61-820 0-1259 4-1311 11-102 14-275 71-354 118-187 108-294 276-306 476-10 180 42 321 162 440 83 82 153 126 275 172 177 66 111 63 1410 63h1178l30-62c82-175 230-295 422-344 87-22 259-15 350 15 202 65 360 233 416 441 22 85 23 243 1 330-57 220-234 400-449 454-87 22-204 27-283 12zm186-428c57-19 90-49 115-102 42-91 27-185-40-252-97-98-275-73-336 46-60 120-10 264 106 305 48 17 110 19 155 3zm-3387-3425c88-44 128-137 105-244-28-131-175-196-305-135-125 58-154 230-57 337 60 66 173 85 257 42z' />
              </g>
            </svg>
            <span>Bridge</span>
          </NavLink>
        </li>
        <li>
          <NavLink
            to='/apps'
            className={({ isActive }) =>
              isActive
                ? "text-white bg-gradient-to-r from-neutral-700 via-neutral-700 to-neutral-700/10 block w-full px-8 py-3 rounded-xl transition-colors font-bold cursor-default"
                : "cursor-pointer hover:text-white block w-full px-8 py-3 rounded-xl transition-colors"
            }
          >
            <FontAwesomeIcon icon={faBox} className='mr-2' />
            Apps
          </NavLink>
        </li>
      </ul>

      <div className='mt-12'>
        <button
          onClick={() => toggleIsExtendedMenuOpen()}
          className='px-8 py-3 w-full text-left font-semibold text-neutral-400 hover:text-white transition-colors mb-4 flex items-center'
        >
          <span className='flex-intial'>More</span>
          <FontAwesomeIcon
            icon={faChevronDown}
            className={
              "flex-initial ml-4" + (isExtendedMenuOpen ? " fa-rotate-180" : "")
            }
          />
        </button>

        <div
          className={isExtendedMenuOpen ? "block" : "hidden"}
          id='extended-menu'
        >
          <ul className='space-y-6 font-medium text-neutral-400'>
            <li>
              <a
                href='https://wallet.keplr.app/chains/secret-network?tab=staking'
                target='_blank'
                className='cursor-pointer hover:text-white block w-full mx-8 rounded-xl transition-colors'
              >
                <FontAwesomeIcon icon={faCoins} className='mr-2' />
                Stake
                <FontAwesomeIcon
                  icon={faArrowUpRightFromSquare}
                  className='text-xs ml-2'
                />
              </a>
            </li>
            <li>
              <a
                href='https://wallet.keplr.app/chains/secret-network?tab=governance'
                target='_blank'
                className='cursor-pointer hover:text-white block w-full mx-8 rounded-xl transition-colors'
              >
                <FontAwesomeIcon icon={faCheckToSlot} className='mr-2' />
                Governance
                <FontAwesomeIcon
                  icon={faArrowUpRightFromSquare}
                  className='text-xs ml-2'
                />
              </a>
            </li>
            <li>
              <a
                href='https://secretanalytics.xyz'
                target='_blank'
                className='cursor-pointer hover:text-white block w-full mx-8 rounded-xl transition-colors'
              >
                <FontAwesomeIcon icon={faChartLine} className='mr-2' />
                Stats
                <FontAwesomeIcon
                  icon={faArrowUpRightFromSquare}
                  className='text-xs ml-2'
                />
              </a>
            </li>
            <li>
              <a
                href='https://secretnodes.com/'
                target='_blank'
                className='cursor-pointer hover:text-white block w-full mx-8 rounded-xl transition-colors'
              >
                <FontAwesomeIcon icon={faCube} className='mr-2' />
                Block Explorer
                <FontAwesomeIcon
                  icon={faArrowUpRightFromSquare}
                  className='text-xs ml-2'
                />
              </a>
            </li>
          </ul>
        </div>
      </div>

      {/* <div className='mt-12'>
        <div className='mx-4 mb-6 font-semibold text-neutral-600'>More</div>
        <ul className='space-y-6 font-medium text-neutral-400'>
          <li>
              <a href='https://wallet.keplr.app/chains/secret-network?tab=staking' target='_blank' className='cursor-pointer hover:text-white block w-full mx-8 rounded-xl transition-colors'>
              <FontAwesomeIcon icon={faCoins} className='mr-2' />Stake<FontAwesomeIcon icon={faArrowUpRightFromSquare} className='text-xs ml-2' />
              </a>
            </li>
            <li>
              <a href='https://wallet.keplr.app/chains/secret-network?tab=governance' target='_blank' className='cursor-pointer hover:text-white block w-full mx-8 rounded-xl transition-colors'>
              <FontAwesomeIcon icon={faCheckToSlot} className='mr-2' />Governance<FontAwesomeIcon icon={faArrowUpRightFromSquare} className='text-xs ml-2' />
              </a>
            </li>
            <li>
              <a href='https://secretanalytics.xyz' target='_blank' className='cursor-pointer hover:text-white block w-full mx-8 rounded-xl transition-colors'>
              <FontAwesomeIcon icon={faChartLine} className='mr-2' />Stats<FontAwesomeIcon icon={faArrowUpRightFromSquare} className='text-xs ml-2' />
              </a>
            </li>
            <li>
              <a href='https://secretnodes.com/' target='_blank' className='cursor-pointer hover:text-white block w-full mx-8 rounded-xl transition-colors'>
              <FontAwesomeIcon icon={faCube} className='mr-2' />Block Explorer<FontAwesomeIcon icon={faArrowUpRightFromSquare} className='text-xs ml-2' />
              </a>
            </li>
        </ul>
      </div> */}
    </>
  );
}
