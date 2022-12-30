import React from "react";

interface IHeaderProps {
  title: string,
  description?: string,
}

const Header = (props: IHeaderProps) => {
  return (
    <>
      {/* Title */}
      {props.title && (
        <h1 className="text-left sm:text-center font-bold text-4xl mb-4">{props.title}</h1>
      )}

      {/* Description */}
      {props.description && (
        <p className="sm:max-w-lg mx-auto mb-6 text-left sm:text-center">{props.description}</p>
      )}
    </>
  );
}

export default Header;