import { createContext, useEffect, useRef, useState } from "react";
import { SecretNetworkClient } from "secretjs";
import { dAppsURL, shuffleArray } from "shared/utils/commons";

const APIContext = createContext(null);

const APIContextProvider = ({ children }) => {
  const [dappsData, setDappsData] = useState<any[]>([]);
  const [dappsDataShuffled, setDappsDataShuffled] = useState<any[]>([]);
  const [tags, setTags] = useState<string[]>([]);

  useEffect(() => {
    fetch(dAppsURL)
      .then((response) => response.json())
      .then((jsonData) => setDappsData(jsonData.data))
      .catch((error) => console.error(error));
  }, []);

  useEffect(() => {
    if (
      dappsData &&
      dappsDataShuffled.length === 0 &&
      dappsData?.length !== 0
    ) {
      setDappsDataShuffled(shuffleArray(dappsData));
      // Tag-Filter
      let allTags: string[] = [];

      dappsData.forEach((dapp) => {
        dapp.attributes.type
          .map((item) => item.name)
          .forEach((tag) => {
            if (!allTags.find((tagItem) => tagItem === tag)) {
              allTags.push(tag);
            }
          });
      });
      setTags(allTags.sort());
    }
  }, [dappsData]);

  const providerValue = {
    dappsData,
    setDappsData,
    dappsDataShuffled,
    setDappsDataShuffled,
    tags,
    setTags,
  };

  return (
    <APIContext.Provider value={providerValue}>{children}</APIContext.Provider>
  );
};

export { APIContext, APIContextProvider };
