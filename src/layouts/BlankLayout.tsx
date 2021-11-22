import {ReactNode} from "react";

const BlankLayout: React.ReactNode = (props: { children: ReactNode; }) => {
  return (
    <>
      {props.children}
    </>
  )
}

export default BlankLayout;
