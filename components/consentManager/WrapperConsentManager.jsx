/* eslint-disable */
import React, { useState, useEffect, useReducer } from "react";
import { AnimateSharedLayout } from "framer-motion";

import { getConsent, setConsent } from "./consent";
import { ConsentContainer } from "./ConsentManagerStyle";
import { Reducer, initialState } from "./store/reducer";
import { step } from './store/constants';
import { Step01, Step02 } from "./index";
import { initGoogleTagManager } from "../../utils/gtm/gtm";
import { gdprCountryCodes } from "../../utils/gdprCountryCodes";

const WrapperConsentManager = (props) => {
  const { consentData, uid = "", consentLocale } = props;

  const [state, dispatch] = useReducer(Reducer, initialState);

  const changeStep = () => dispatch({ type: "CHANGE_STEP" });
  const changeState = (payload) =>
    dispatch({ type: "SET_STATE", payload: { ...payload } });

  const saveConsent = async () => {
    let dataLocalStorage = {
      isVisible: state.isVisible,
      essential: state.essential,
      analytics: state.analytics,
      advertising: state.advertising,
    };
    if (state.step === step.STEP_ONE) dataLocalStorage = { ...dataLocalStorage, analytics: true, advertising: true };

    await setConsent({ ...dataLocalStorage });
    await changeState({ isVisible: false });
    await initGoogleTagManager(null, state, consentLocale);
  };

  const gdprLocale =
    consentLocale !== undefined &&
    gdprCountryCodes.includes(consentLocale.split("-")[1]);

  if (!gdprLocale) {
    initGoogleTagManager(null, null, consentLocale);
  }

  console.log("--consentData-props-", props);

  useEffect(() => {
    const isVisibleConsent = getConsent() ? false : true;
    changeState({ isVisible: isVisibleConsent });
  }, [state.isVisible]);

  if (typeof window === "undefined") <></>;

  const typeOfStep = {
    ["STEP_ONE"]: Step01,
    ["STEP_TWO"]: Step02,
  };
  const TypeOfStepComponent = typeOfStep[state.step];

  return state.isVisible && gdprLocale ? (
    <AnimateSharedLayout>
      <ConsentContainer>
        <TypeOfStepComponent
          state={state}
          fnChangeStep={changeStep}
          fnChangeState={changeState}
          fnSaveConsent={saveConsent}
          consentData={consentData}
          consentLocale={consentLocale}
        />
      </ConsentContainer>
    </AnimateSharedLayout>
  ) : null;
};

export default WrapperConsentManager;
