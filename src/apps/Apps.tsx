import { faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { dappsData } from "shared/utils/dapps";
import React, { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { websiteName } from "App";
import Header from "./components/Header";
import AppTile from "./components/AppTile";
import { shuffleArray } from "shared/utils/helpers";

export interface IDappData {
  id: number;
  name: string;
  description?: string;
  url?: string;
  image?: string;
  tags?: string[];
}

function Apps() {
  const [dappsDataShuffled, setDappsDataShuffled] = useState<IDappData[]>([]);

  useEffect(() => {
    setDappsDataShuffled(shuffleArray(dappsData));
  }, []);

  // Filter + Search
  const [tagsToBeFilteredBy, setTagsToBeFilteredBy] = useState<string[]>([]);
  function isTagInFilterList(tag: string) {
    return tagsToBeFilteredBy.find((e) => e === tag);
  }

  function toggleTagFilter(tagName: string) {
    if (tagsToBeFilteredBy.includes(tagName)) {
      setTagsToBeFilteredBy(
        tagsToBeFilteredBy.filter((tag) => tag !== tagName)
      );
    } else {
      setTagsToBeFilteredBy(tagsToBeFilteredBy.concat(tagName));
    }
  }

  function Tag(props: { name: string }) {
    return (
      <button
        onClick={() => toggleTagFilter(props.name)}
        className={
          "inline-block text-sm px-1.5 py-0.5 rounded-md overflow-hidden transition-colors" +
          (isTagInFilterList(props.name)
            ? " bg-neutral-500 dark:bg-neutral-500 text-white dark:text-white hover:bg-neutral-400 dark:hover:bg-neutral-600 font-semibold"
            : " bg-white dark:bg-neutral-800 hover:bg-neutral-300 dark:hover:bg-neutral-700 font-medium")
        }
      >
        {props.name}
      </button>
    );
  }

  // Search
  const [searchText, setSearchText] = useState<string>("");

  // Tag-Filter
  let tags: string[] = [];

  dappsData.forEach((app) => {
    app.tags?.forEach((tag) => {
      if (!tags.find((tagItem) => tagItem === tag)) {
        tags.push(tag);
      }
    });
  });
  tags = tags.sort();

  // results apps that match on the search input and chosen tags
  function filteredDappsData() {
    let items = dappsDataShuffled;
    if (searchText !== "") {
      items = dappsDataShuffled.filter((app) =>
        (app as any).name.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    if (tagsToBeFilteredBy.length > 0) {
      items = items.filter((item) =>
        (item as any).tags.find((tag) => tagsToBeFilteredBy.includes(tag))
      );
    }

    return items;
  }

  return (
    <>
      <Helmet>
        <title>{websiteName} | Apps</title>
      </Helmet>
      <div className='max-w-screen-2xl mx-auto px-6 pt-6 sm:pt-0'>
        <Header
          title='Apps'
          description='A curation of applications running on Secret Network Mainnet!'
        />

        {/* Search */}
        <div className='relative w-full sm:w-96 mx-auto mb-4'>
          <div className='absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none'>
            <FontAwesomeIcon icon={faMagnifyingGlass} className='' />
          </div>
          <input
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            type='text'
            id='search'
            className='block w-full p-4 pl-10 text-sm rounded-lg bg-white placeholder-neutral-400 text-neutral-800 dark:bg-neutral-800 dark:text-white'
            placeholder='Search'
          />
        </div>

        {/* Tag-Filter */}
        <div className='mb-4 sm:mb-8 flex gap-2 flex-wrap justify-center'>
          {tags.map((tag) => (
            <Tag name={tag} />
          ))}
        </div>

        {/* App-Items */}
        <div className='grid grid-cols-12 gap-4 auto-rows-auto'>
          {filteredDappsData().map((dapp) => (
            <AppTile
              name={(dapp as any).name as any}
              description={(dapp as any).description}
              tags={(dapp as any).tags}
              image={(dapp as any).image}
              url={(dapp as any).url}
            />
          ))}
        </div>
      </div>
    </>
  );
}

export default Apps;
