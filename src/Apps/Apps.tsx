import { faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { dappsData } from "General/Utils/dapps";
import React, { useState } from "react";
import AppItem from "./components/AppItem";
import Header from "./components/Header";

export function Apps() {
  // Filter + Search
  const [tagsToBeFilteredBy, setTagsToBeFilteredBy] = useState<string[]>([]);
  function isTagInFilterList(tag: string) {
    return tagsToBeFilteredBy.find(e => e === tag);
  }

  function toggleTagFilter(tagName: string) {
    if (tagsToBeFilteredBy.includes(tagName)) {
      setTagsToBeFilteredBy(tagsToBeFilteredBy.filter(tag => tag !== tagName));
    } else {
      setTagsToBeFilteredBy(tagsToBeFilteredBy.concat(tagName));
    }
  }

  function Tag(props: { name: string }) {
    return <button onClick={() => toggleTagFilter(props.name)} className={"inline-block text-sm px-1.5 py-0.5 rounded-md overflow-hidden transition-colors" + (isTagInFilterList(props.name) ? " bg-neutral-500 hover:bg-neutral-600 font-semibold" : " bg-neutral-800 hover:bg-neutral-700 font-medium")}>{props.name}</button>
  }

  // Search
  const [searchText, setSearchText] = useState<string>("");
  
  // Tag-Filter
  let tags: string[] = [];

  dappsData.forEach((app) => {
    app.tags?.forEach((tag) => {
      if (!tags.find(tagItem => tagItem === tag)) {
        tags.push(tag);
      }
    })
  });
  tags = tags.sort();

  function shuffleArray(array: object[]) {
    let currentIndex = array.length,  randomIndex;
  
    // While there remain elements to shuffle.
    while (currentIndex != 0) {
  
      // Pick a remaining element.
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;
  
      // And swap it with the current element.
      [array[currentIndex], array[randomIndex]] = [
        array[randomIndex], array[currentIndex]];
    }
  
    return array;
  }

  // results apps that match on the search input and chosen tags
  function filteredDappsData() {
    var items = dappsData;
    if (searchText !== "") {
      items = dappsData.filter(app => app.name.toLowerCase().includes(searchText.toLowerCase()));
    }

    if (tagsToBeFilteredBy.length > 0) {
      items = items.filter(item => item.tags?.find(tag => tagsToBeFilteredBy.includes(tag)));
    }

    // randomize series
    items = shuffleArray(items);
    return items;
  }

  return (
    <>
      <div className="max-w-screen-2xl mx-auto px-6">

        {/* Header */}
        <Header title="Apps" description="A curation of applications running on Secret Network Mainnet!"/>

        {/* Search */}
        <div className="relative w-full sm:w-96 mx-auto mb-4">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <FontAwesomeIcon icon={faMagnifyingGlass} className=""/>
          </div>
          <input value={searchText} onChange={e => setSearchText(e.target.value)} type="text" id="search" className="block w-full p-4 pl-10 text-sm rounded-lg bg-neutral-800 text-white" placeholder="Search" />
        </div>

        {/* Tag-Filter */}
        <div className="text-left sm:text-center mb-8 space-x-2 space-y-2">
          {tags.map((tag) =>
            <Tag name={tag}/>
          )}
        </div>

        {/* App-Items */}
        <div className="grid grid-cols-12 gap-4 auto-rows-auto">
          {filteredDappsData().map((dapp) =>
            <AppItem name={dapp.name} description={dapp.description} tags={dapp.tags} image={dapp.image} url={dapp.url}/>
          )}
        </div>
      </div>
    </>
  )
}