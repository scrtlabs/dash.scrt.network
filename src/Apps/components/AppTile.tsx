import React from "react";
import AppItemTag from "./AppItemTag";

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
        className='col-span-12 sm:col-span-6 md:col-span-4 xl:col-span-3'
      >
        <div className='bg-neutral-800 hover:bg-neutral-700 transition-colors p-4 flex flex-col h-full rounded-xl overflow-hidden text-center sm:text-left'>
          {/* Image */}
          {this.props.image && (
            <img
              src={"/img/dapps/" + this.props.image}
              alt={`${this.props.name} logo`}
              className='w-16 h-16 rounded-xl block mb-4 bg-neutral-900 flex-initial mx-auto sm:mx-0'
            />
          )}

          {/* Name */}
          <div className='text-xl font-semibold flex-initial mb-1'>
            {this.props.name}
          </div>

          {/* Description */}
          <div className='text-neutral-400 flex-1'>
            {this.props.description}
          </div>

          {/* Tags */}
          {this.props.tags?.length! > 0 && (
            // <div className='space-x-2 mt-4 flex-initial'>{tagsHtml}</div>
            <div className='space-x-2 mt-4 flex-initial'>
              {this.props.tags?.map((tag) => (
                <AppItemTag name={tag} />
              ))}
            </div>
          )}
        </div>
      </a>
    );
  }
}

export default AppTile;
