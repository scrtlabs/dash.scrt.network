import React from "react";

interface ITagProps {
  name: string;
}

class AppTileTag extends React.Component<ITagProps> {
  render() {
    return (
      <div className='bg-neutral-200 dark:bg-neutral-900 text-xs font-semibold px-2 py-1 rounded-md inline-block transition-colors'>
        {this.props.name}
      </div>
    );
  }
}

export default AppTileTag;
