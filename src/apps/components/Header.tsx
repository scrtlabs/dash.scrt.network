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
        <div className="text-center mb-4">
          <h1 className="font-semibold text-4xl inline text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-purple-500">
            {this.props.title}
          </h1>
        </div>
        {/* Description */}
        {this.props.description && (
          <p className="sm:max-w-lg mx-auto mb-6 text-center">
            {this.props.description}
          </p>
        )}
      </>
    );
  }
}

export default Header;
