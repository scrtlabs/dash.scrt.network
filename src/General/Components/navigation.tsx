import { faArrowUpRightFromSquare, faChartLine, faCheckToSlot, faCircleNodes, faClose, faCoins, faShuffle } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react";
import { NavLink } from "react-router-dom";

export function Navigation({
  showMobileMenu,
  setShowMobileMenu,
}: {
  showMobileMenu: boolean;
  setShowMobileMenu: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  return (
    <>
      <ul className="space-y-4 font-bold text-neutral-400">
        <li className="lg:hidden">
          <button onClick={() => setShowMobileMenu(false)} className="hover:text-white fixed top-0 right-0 float-right px-8 py-5 rounded-full transition-colors">
          <FontAwesomeIcon icon={faClose} className="mr-2" size="lg" />
          </button>
        </li>
        <li>
        <NavLink to="/" className={({ isActive }) => isActive ? "text-white bg-gradient-to-r from-zinc-700 via-zinc-700-700 to-zinc-700/5 block w-full px-8 py-5 rounded-full transition-colors" : "hover:text-white block w-full px-8 py-5 rounded-full transition-colors"}>
          <FontAwesomeIcon icon={faChartLine} className="mr-2" />Dashboard
          </NavLink>
        </li>
        <li>
        <NavLink to="/ibc" className={({ isActive }) => isActive ? "text-white bg-gradient-to-r from-zinc-700 via-zinc-700-700 to-zinc-700/5 block w-full px-8 py-5 rounded-full transition-colors" : "hover:text-white block w-full px-8 py-5 rounded-full transition-colors"}>
          <FontAwesomeIcon icon={faCircleNodes} className="mr-2" />IBC
          </NavLink>
        </li>
        <li>
        <NavLink to="/wrap" className={({ isActive }) => isActive ? "text-white bg-gradient-to-r from-zinc-700 via-zinc-700-700 to-zinc-700/5 block w-full px-8 py-5 rounded-full transition-colors" : "hover:text-white block w-full px-8 py-5 rounded-full transition-colors"}>
          <FontAwesomeIcon icon={faShuffle} className="mr-2" />Wrap
          </NavLink>
        </li>
        <li>
          <a href="https://wallet.keplr.app/chains/secret-network?tab=staking" target="_blank" className="hover:text-white block w-full px-8 py-5 rounded-full transition-colors">
          <FontAwesomeIcon icon={faCoins} className="mr-2" />Stake<FontAwesomeIcon icon={faArrowUpRightFromSquare} className="text-xs ml-2" />
          </a>
        </li>
        <li>
          <a href="https://wallet.keplr.app/chains/secret-network?tab=governance" target="_blank" className="hover:text-white block w-full px-8 py-5 rounded-full transition-colors">
          <FontAwesomeIcon icon={faCheckToSlot} className="mr-2" />Governance<FontAwesomeIcon icon={faArrowUpRightFromSquare} className="text-xs ml-2" />
          </a>
        </li>
        <li>
          <a href="https://secretnodes.com/" target="_blank" className="hover:text-white block w-full px-8 py-5 rounded-full transition-colors">
          <FontAwesomeIcon icon={faChartLine} className="mr-2" />Stats<FontAwesomeIcon icon={faArrowUpRightFromSquare} className="text-xs ml-2" />
          </a>
        </li>
      </ul>
    </>
  )
}