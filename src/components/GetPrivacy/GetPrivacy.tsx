import { StyleGetPrivacy } from "./styled";
import { Accordion } from "../Accordion/Accordion";
import { faqList } from "./questions";
import { useState } from "react";

export function GetPrivacy() {
  const [accordion, setAccordion] = useState(faqList);

  const toggleAccordion = (idx: number) => {
    setAccordion((prevState) => {
      const newState = [...faqList];
      const newStateObj = { ...prevState[idx] };
      newStateObj.isOpen = !prevState[idx].isOpen;
      newState[idx] = newStateObj;
      return newState;
    });
  };

  return (
    <StyleGetPrivacy>
      <div className="title-section">
        <h1>Get Privacy</h1>
        <p className="description">
          Wrapping Coins as Secret Tokens immediately supercharges them with
          private balances and private transfers.
        </p>
      </div>

      <div className="questions-list">
        {accordion.map(({ question, answer, isOpen, link }, idx) => (
          <Accordion
            question={question}
            answer={answer}
            isOpen={isOpen}
            key={idx}
            idx={idx}
            link={link}
            toggleAccordion={toggleAccordion}
          />
        ))}
      </div>
    </StyleGetPrivacy>
  );
}
