import React from "react";

export function Header(props: { title: string; text: string; }) {
  return <>
    <div className="mb-4">
      <h1 className="inline text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-violet-500">
        {props.title}
      </h1>
    </div>
    <div className="mb-4">
      {props.text}
    </div>
  </>
}