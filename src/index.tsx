import { useCreation } from "./hooks";
import React from "react";
import { createPortal } from "react-dom";
import type { ModalProps, DrawerProps } from "antd";
import AppContext from "./context";
import styles from "./index.module.scss";
import { uuid } from "./utils";
import type { MountProps } from "./interface";
import useDrawer from "@hooks-plus/use-drawer";
import useModal from "@hooks-plus/use-modal";

export type AppProps = {
  mount?: MountProps;
  children: React.ReactNode;
  getPopupContainer?: () => Element;
};

export type MaskState = {
  children?: React.ReactElement;
  open: boolean;
};

export type UseReturn<S> = [
  (stateAction: React.SetStateAction<S>) => void,
  boolean
] & { open: () => void; close: () => void; getOpen: () => boolean };

function useFullMask(
  jsx?: React.ReactElement,
  config?: {
    getContainer?: () => Element;
    className?: string;
    style?: string;
  }
): UseReturn<MaskState> {
  const { emitter } = React.useContext(AppContext);
  const [state, setState] = React.useState<MaskState>({
    open: false,
    children: jsx,
  });
  const idRef = React.useRef<string>(uuid());
  const ref = React.useRef<HTMLDivElement>(null);
  const dispatchUpdate = (element: React.ReactNode) => {
    emitter.dispatchEvent(
      new CustomEvent("update", {
        detail: {
          id: idRef.current,
          element,
          type: "mask",
          open: state.open,
        },
      })
    );
  };

  React.useEffect(() => {
    const container = config?.getContainer?.();
    const className = config?.className;
    const style = config?.style || {};
    const ele = state.open && (
      <div
        ref={ref}
        className={className ? `${className} ${styles.full}` : styles.full}
        style={style}
      >
        {jsx || state.children}
      </div>
    );
    const mask = container ? createPortal(ele, container) : ele;
    dispatchUpdate(mask);
  });

  const updateMaskProps = React.useCallback(
    (stateAction: React.SetStateAction<MaskState>) => {
      if (typeof stateAction == "function") {
        setState((prevState) => {
          const _props = stateAction(prevState);
          return { ..._props };
        });
      } else {
        setState({ ...state, ...stateAction });
      }
    },
    []
  );
  const res: UseReturn<MaskState> = [
    updateMaskProps,
    state.open,
  ] as UseReturn<MaskState>;

  res.open = () => {
    setState((pre) => ({ ...pre, open: true }));
  };

  res.close = () => {
    setState((pre) => ({ ...pre, open: false }));
  };

  React.useLayoutEffect(() => {
    return () => {
      res.close();
      dispatchUpdate(null);
    };
  }, []);

  return res;
}

type Ele = {
  id: string;
  element: React.ReactNode;
  type: string;
  open: boolean;
};

function Elements() {
  const { emitter, toggleRoot } = React.useContext(AppContext);
  const [elements, setElements] = React.useState<{ [id: string]: Ele }>({});

  const masks = Object.values(elements)
    .filter((ele) => ele.open && ele.type === "mask")
    .map((ele) => ele.id);

  React.useEffect(() => {
    const onUpdate = (e: Event) => {
      const {
        detail: { id, element, type, open },
      } = e as CustomEvent<Ele>;
      if (element === null || element === undefined) {
        setElements((pre) => {
          const temp = { ...pre };
          delete temp[id];
          return temp;
        });
        return;
      }
      setElements((pre) => ({ ...pre, [id]: { id, element, type, open } }));
    };
    emitter.addEventListener("update", onUpdate);
    return () => {
      emitter.removeEventListener("update", onUpdate);
    };
  }, [emitter]);

  React.useEffect(() => {
    toggleRoot(!masks.length);
  }, [masks.length, toggleRoot]);

  return (
    <>
      {Object.entries(elements).map(([id, ele]) => (
        <React.Fragment key={id}>{ele.element}</React.Fragment>
      ))}
    </>
  );
}

function useOpen<S extends { open?: boolean }>([jsx, updateProps, open]: [
  React.ReactNode,
  (stateAction: React.SetStateAction<S>) => void,
  boolean
]) {
  const idRef = React.useRef<string>(uuid());
  const { emitter } = React.useContext(AppContext);

  React.useEffect(() => {
    emitter.dispatchEvent(
      new CustomEvent("update", {
        detail: {
          id: idRef.current,
          element: jsx,
        },
      })
    );
  });

  const res: UseReturn<S> = [updateProps, open] as UseReturn<S>;

  res.open = () => {
    updateProps((pre) => ({ ...pre, open: true }));
  };

  res.close = () => {
    updateProps((pre) => ({ ...pre, open: false }));
  };

  res.getOpen = () => {
    return open;
  };

  return res;
}

function useAppDrawer(children?: React.ReactNode, drawerProps?: DrawerProps) {
  const [jsx, update, state] = useDrawer(children, drawerProps);
  return useOpen<DrawerProps>([jsx, update, !!state.open]);
}

function useAppModal(children?: React.ReactNode, modalProps?: ModalProps) {
  const [jsx, update, state] = useModal(children, modalProps);
  return useOpen<ModalProps>([jsx, update, !!state.open]);
}

function App(props: AppProps) {
  const containerRef = React.useRef<HTMLElement>(null);
  const emitterRef = React.useRef<EventTarget>(new EventTarget());
  const [visible, setVisible] = React.useState<boolean>(true);
  const value = useCreation(
    () => ({
      containerRef,
      mount: props.mount,
      emitter: emitterRef.current,
      getPopupContainer: props.getPopupContainer || (() => document.body),
      toggleRoot: (visible: boolean) => setVisible(visible),
    }),
    [props.getPopupContainer]
  );
  return (
    <AppContext.Provider value={value}>
      <div style={{ display: visible ? "contents" : "none" }}>
        {props.children}
      </div>
      <Elements />
    </AppContext.Provider>
  );
}

App.AppContext = AppContext;
App.useDrawer = useAppDrawer;
App.useModal = useAppModal;
App.useFullMask = useFullMask;
export default App;
