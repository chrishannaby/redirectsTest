import React from "react";
// import { Link } from "gatsby";
import { AnimatePresence } from "framer-motion";

import { ConsentSection, Col, Button } from "./ConsentManagerStyle";
import { validateValueofObject } from "../../utils/objectHandling";

export const Step01 = ({
  fnChangeStep,
  fnChangeState,
  fnSaveConsent,
  state,
  consentLocale,
  consentData = {},
}) => {
  const {
    consent_text,
    consent_title,
    cookie_policy_link,
    cookie_policy_text,
    manage_button_text,
    save_settiing_button_text,
  } = consentData;

  console.log("--consentData--".consentData);

  return (
    <ConsentSection
      layout
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <AnimatePresence>
        <Col align="center" key={"title"}>
          <h5>
            {validateValueofObject(
              { text: consent_title ? consent_title[0]?.text : "" },
              "text",
              "🍪 Cookies give you a personalized experience"
            )}
          </h5>
        </Col>
        <Col align="center" key={"description"}>
          <p>
            {validateValueofObject(
              { text: consent_text ? consent_text[0]?.text : "" },
              "text",
              "We use our own and third-party cookies to analyze our services and to show you advertising related to your preferences based on your browsing habits. Learn more by reading our"
            ) + " "}
            <a
              href={validateValueofObject(
                {
                  url: cookie_policy_link
                    ? `/${consentLocale}/${cookie_policy_link.uid}`
                    : "",
                },
                "url",
                "/cookies"
              )}
              target="_blank"
              rel="noreferrer"
            >
              {validateValueofObject(
                { text: cookie_policy_text ? cookie_policy_text[0]?.text : "" },
                "text",
                "Cookie Notice"
              )}
            </a>
            .
          </p>
        </Col>
        <Col align="flex-end" key={"ctas"}>
          <Button onClick={fnChangeStep}>
            {validateValueofObject(
              { text: manage_button_text ? manage_button_text[0]?.text : "" },
              "text",
              "Manage cookies"
            )}
          </Button>
          <Button onClick={() => fnSaveConsent()} primary>
            {validateValueofObject(
              {
                text: save_settiing_button_text
                  ? save_settiing_button_text[0]?.text
                  : "",
              },
              "text",
              "Allow all cookies"
            )}
          </Button>
        </Col>
      </AnimatePresence>
    </ConsentSection>
  );
};

export default Step01;
