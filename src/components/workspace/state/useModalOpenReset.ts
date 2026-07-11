import { useState } from "react";

// Resets a modal's local draft state each time it transitions to open — adjusting state during
// render (rather than in an effect) avoids an extra render pass and the react-hooks/set-state-
// in-effect lint error. Shared by SurveyModal and IprCalcModal, which both need this exact idiom.
export const useModalOpenReset = (isOpen: boolean, onOpen: () => void) => {
  const [wasOpen, setWasOpen] = useState(false);
  if (isOpen !== wasOpen) {
    setWasOpen(isOpen);
    if (isOpen) onOpen();
  }
};
