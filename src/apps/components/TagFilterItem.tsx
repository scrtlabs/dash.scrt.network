import React from "react";

interface ITagProps {
  name: string;
}

class TagFilterItem extends React.Component<ITagProps> {
  render() {
    return (
      <button
        className={
          "inline-block text-sm px-1.5 py-0.5 rounded-md overflow-hidden transition-colors" +
          (false
            ? " bg-white-500 hover:bg-neutral-600 font-semibold"
            : " bg-neutral-800 hover:bg-neutral-700 font-medium")
        }
      >
        {this.props.name}
      </button>
    );
  }
}

export default TagFilterItem;
