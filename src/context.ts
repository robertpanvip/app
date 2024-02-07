import React from "react";

export type AppContextValue = {
    containerRef: React.RefObject<HTMLElement>;
    emitter: EventTarget;
    getPopupContainer?: () => Element;
    toggleRoot: (visible: boolean) => void
};

const AppContext = React.createContext<AppContextValue>({
    containerRef: { current: null },
    emitter: new EventTarget(),
    getPopupContainer: () => document.body,
    toggleRoot: () => undefined
});
export default AppContext;