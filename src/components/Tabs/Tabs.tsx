import React, { useState } from "react";
import { StyledTabs } from "./styled";

interface TabsProps {
  children: JSX.Element[];
  currentTab?: string;
  isDivider?: boolean;
  disableTabsOnchange?: boolean;
  setErrorBtnClass?: (er: string) => void;
}

export const Tabs = ({
  children,
  currentTab,
  isDivider = false,
  disableTabsOnchange = false,
  setErrorBtnClass = () => {},
}: TabsProps) => {
  const [activeTab, setActiveTab] = useState<string>(
    currentTab || children[0].props.tabKey
  );
  const onClickTabItem = (tab: string) => {
    if (disableTabsOnchange) {
      setErrorBtnClass("error");
      setTimeout(() => {
        setErrorBtnClass("");
      }, 500);
      return;
    }
    setActiveTab(tab);
  };

  return (
    <StyledTabs>
      <ul className="tab-list" data-type={currentTab}>
        {children.map(({ props: { tabKey, title } }) => (
          <li
            className={`tab-list-item ${
              activeTab === tabKey ? "tab-list-active" : ""
            }`}
            key={tabKey}
            onClick={() => onClickTabItem(tabKey)}
          >
            <span>{title}</span>
          </li>
        ))}
      </ul>

      {isDivider && <div className="divider" />}

      <div className="tab-content">
        {children.map((child) => {
          if (activeTab === child.props.tabKey) return child;
        })}
      </div>
    </StyledTabs>
  );
};

interface TabProps {
  children: JSX.Element | JSX.Element[];
  tabKey: string;
  title: string;
}

export const Tab = ({ children, tabKey, title }: TabProps) => <>{children}</>;
