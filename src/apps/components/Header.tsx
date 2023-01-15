import React from "react";

interface IHeaderProps {
  title: string;
  description?: string;
}

class Header extends React.Component<IHeaderProps> {
  render() {
    return (
      <>
        {/* Title */}
        <h1 className='text-center font-bold text-4xl mb-4'>
          {this.props.title}
        </h1>

        {/* Description */}
        {this.props.description && (
          <p className='sm:max-w-lg mx-auto mb-6 text-center'>
            {this.props.description}
          </p>
        )}
      </>
    );
  }
}

export default Header;
