import React from "react";
import AppTileTag from "./AppItemTag";
import mixpanel from "mixpanel-browser";

interface IAppItemProps {
  name: string;
  description: string;
  image?: string;
  tags?: string[];
  url?: string;
}

const AppTile = (props: IAppItemProps) => {
  const handleClick = () => {
    if (import.meta.env.VITE_MIXPANEL_ENABLED === "true") {
      mixpanel.init(import.meta.env.VITE_MIXPANEL_PROJECT_TOKEN, {
        debug: true,
      });
      mixpanel.identify("Dashboard-App");
      mixpanel.track("dApp opened", {
        "dApp name": props.name,
      });
    }
  };

  return (
    <a
      href={props.url || "#"}
      target={props.url ? "_blank" : "_self"}
      onClick={handleClick}
      className="group col-span-12 sm:col-span-6 lg:col-span-6 xl:col-span-4 2xl:col-span-3 hover:bg-gradient-to-r from-cyan-500 to-purple-500 p-0.5 rounded-xl hover:shadow-2xl hover:shadow-cyan-500/40"
    >
      <div className="bg-white group-hover:bg-white/95 dark:bg-neutral-800 group-hover:dark:bg-neutral-800/95 border border-neutral-200 dark:border-neutral-700 p-4 flex flex-col h-full rounded-xl overflow-hidden text-center sm:text-left">
        {/* Image */}
        {props.image && (
          <img
            src={props.image}
            alt={`${props.name} logo`}
            className="w-16 h-16 rounded-xl block mb-4 bg-neutral-100 dark:bg-neutral-900 flex-initial mx-auto sm:mx-0"
          />
        )}

        {/* Name */}
        <div className="text-xl font-semibold flex-initial mb-1">
          {props.name}
        </div>

        {/* Description */}
        <div className="text-neutral-400 flex-1">{props.description}</div>

        {/* Tags */}
        {props.tags?.length! > 0 && (
          <div className="space-x-2 mt-4 flex-initial">
            {props.tags?.map((tag) => (
              <AppTileTag key={tag} name={tag} />
            ))}
          </div>
        )}
      </div>
    </a>
  );
};

export default AppTile;
