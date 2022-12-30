import React from "react";

const AppItem = (props: { tags?: string[]; url?: string; image?: string; name?: string; description?: string; }) => {

  const tagsHtml = props.tags?.map((tag) =>
    <span className="bg-neutral-900 text-xs font-semibold px-2 py-1 rounded-md inline-block">{tag}</span>
  );

  return (
    <a href={props.url || "#"} target={props.url ? "_blank" : "_self"} className="col-span-12 sm:col-span-6 md:col-span-4 xl:col-span-3">
      <div className="bg-neutral-800 hover:bg-neutral-700 transition-colors p-4 flex flex-col h-full rounded-xl overflow-hidden">

        {/* Image */}
        {props.image && (
          <img src={"/img/dapps/" + props.image} alt={`${props.name} logo`} className="w-16 h-16 rounded-xl block mb-4 bg-neutral-900 flex-initial"/>
        )}

        {/* Name */}
        {props.name && (
          <div className="text-xl font-semibold flex-initial mb-1">{props.name}</div>
        )}

        {/* Description */}
        {props.description && (
          <div className="text-neutral-400 flex-1">{props.description}</div>
        )}

        {/* Tags */}
        {props.tags?.length! > 0 && (
          <div className="space-x-2 mt-4 flex-initial">
            {tagsHtml}
          </div>
        )}

      </div>
    </a>
  );
}

export default AppItem;