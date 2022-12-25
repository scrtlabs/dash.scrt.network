import React, { Component } from "react"

interface IHeaderProps {
  title?: string;
  text?: string;
}

class Header extends Component<IHeaderProps> {
  render() {
    return <>
      <div className="mb-8">
        <h1 className="inline text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-violet-500">
          {this.props.title}
        </h1>
      </div>
      {/* <span className="block mb-4">
        {this.props.text}
      </span> */}
    </>
  }
}

export { Header }