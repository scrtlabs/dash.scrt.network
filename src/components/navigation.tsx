import { faArrowUpRightFromSquare, faChartLine, faCheckToSlot, faCircleNodes, faCoins, faShuffle } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react";
import { Link, NavLink } from "react-router-dom";

export function Navigation() {
  return (
    <>
      <ul className="space-y-4 font-bold text-neutral-400">
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