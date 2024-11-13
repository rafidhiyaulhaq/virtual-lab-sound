// src/components/tutorial/TutorialProvider.jsx
import React, { createContext, useContext, useState } from 'react';
import Joyride, { STATUS } from 'react-joyride';

const TutorialContext = createContext();

export const useTutorial = () => useContext(TutorialContext);

export const TutorialProvider = ({ children }) => {
  const [runTutorial, setRunTutorial] = useState(false);
  const [steps, setSteps] = useState([]);

  const startTutorial = (tutorialSteps) => {
    setSteps(tutorialSteps);
    setRunTutorial(true);
  };

  const handleJoyrideCallback = (data) => {
    const { status } = data;
    if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status)) {
      setRunTutorial(false);
    }
  };

  return (
    <TutorialContext.Provider value={{ startTutorial }}>
      <Joyride
        steps={steps}
        run={runTutorial}
        continuous
        showSkipButton
        showProgress
        styles={{
          options: {
            primaryColor: '#2196f3',
            zIndex: 10000,
          },
        }}
        callback={handleJoyrideCallback}
      />
      {children}
    </TutorialContext.Provider>
  );
};