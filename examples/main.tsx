import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.scss";
import Holder from "../src";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Holder>
      <App />
    </Holder>
  </React.StrictMode>
);
