import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.scss";
import Holder from "../src";
import Button from "antd/es/button";

function App() {
  const [count, setCount] = useState(0);
  const [updateProps] = Holder.useFullMask(<div>
    <Button onClick={()=>{updateProps({open:false})}}>关闭mask</Button>
    <div>mask</div>
  </div>);
  const [updateModalProps] = Holder.useModal(<div>Modal</div>);
  const [updateDrawerProps] = Holder.useDrawer(<div>Drawer</div>);
  const { open: openModal } = Holder.useModal(<div>Modal</div>);
  const { open: openDrawer } = Holder.useDrawer(<div>Drawer</div>);
  return (
    <>
      <div>
        <a href="https://vitejs.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="card">
        <Button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </Button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
      <Button onClick={() => updateProps({ open: true })}>打开蒙层</Button>
      <Button onClick={() => updateModalProps({ open: true, title: "xxx" })}>
        打开模态框
      </Button>
      <Button onClick={() => updateDrawerProps({ open: true })}>
        打开抽屉
      </Button>
      <Button onClick={() => openModal()}>打开模态框2</Button>
      <Button onClick={() => openDrawer()}>打开抽屉2</Button>
    </>
  );
}

export default App;
