import React from "react";

interface ITagProps {
  name: string;
}

class AppItemTag extends React.Component<ITagProps> {
  render() {
    return (
      <div className='bg-neutral-900 text-xs font-semibold px-2 py-1 rounded-md inline-block'>
        {this.props.name}
      </div>
    );
  }
}

export default AppItemTag;
