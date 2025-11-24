import { useState } from "react";

export default function useTogglePassword(initialState = false) {
    const [isVisible, setIsVisible] = useState(initialState);

    const toggle = () => setIsVisible((prev) => !prev);

    return {
        isVisible,
        toggle,
    };
}
