import React from "react";
import AppTileTag from "./AppItemTag";

interface IAppItemProps {
  name: string;
  description: string;
  image?: string;
  tags?: string[];
  url?: string;
}

class AppTile extends React.Component<IAppItemProps> {
  render() {
    return (
      <a
        href={this.props.url || "#"}
        target={this.props.url ? "_blank" : "_self"}
        className="block group col-span-12 sm:col-span-6 lg:col-span-6 xl:col-span-4 2xl:col-span-3"
      >
        <div className="group-hover:bg-gradient-to-r from-cyan-600 to-purple-600 p-0.5 h-full rounded-xl overflow-hidden">
          <div className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700  group-hover:bg-neutral-100 dark:group-hover:bg-neutral-700 p-4 flex flex-col h-full rounded-xl overflow-hidden text-center sm:text-left">
            {/* Image */}
            {this.props.image && (
              <img
                src={this.props.image}
                alt={`${this.props.name} logo`}
                className="w-16 h-16 rounded-xl block mb-4 bg-neutral-100 dark:bg-neutral-900 flex-initial mx-auto sm:mx-0"
              />
            )}

            {/* Name */}
            <div className="text-xl font-semibold flex-initial mb-1">
              {this.props.name}
            </div>

            {/* Description */}
            <div className="text-neutral-400 flex-1">
              {this.props.description}
            </div>

            {/* Tags */}
            {this.props.tags?.length! > 0 && (
              <div className="space-x-2 mt-4 flex-initial">
                {this.props.tags?.map((tag) => (
                  <AppTileTag key={tag} name={tag} />
                ))}
              </div>
            )}
          </div>
        </div>
      </a>
    );
  }
}

export default AppTile;
