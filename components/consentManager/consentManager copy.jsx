/* eslint-disable */
import React, { useState, useEffect } from "react";
import { Link, graphql } from "gatsby";
import {
  getConsent,
  cancel,
  accept,
  name,
  setConsentPreferences,
} from "./consent";
import { getCookie, setCookie } from "./cookies";
import {
  ConsentContainer,
  ConsentSection,
  Col,
  Button,
} from "./consentManagerStyle";
import { filterPages } from "./consentFilterPages";

const ConsentManager = ({ consentData = false, uid = "", consentLocale }) => {
  const [show, setShow] = useState(false);
  const consent = (bool) => {
    setShow(false);
    if (bool) accept();
    else cancel();
  };

  const usLocale = consentLocale?.includes("-us");
  let riaConsent;
  let siteCookies;

  if (typeof window !== "undefined") {
    riaConsent = window.localStorage.getItem(name);
    siteCookies = document.cookie.split(";");
  }

  useEffect(() => {
    const hasCookies = getConsent();
    const isPageWithNoConsentManager = filterPages.some(
      (page) => page["uid"] === uid
    );

    if (!hasCookies && !isPageWithNoConsentManager && !usLocale) {
      setShow(true);
      localStorage.clear();
      sessionStorage.clear();
    }

    !usLocale & (riaConsent !== "true")
      ? typeof window !== "undefined"
        ? siteCookies.map((cookie) => {
            document.cookie = `${
              cookie.split("=")[0]
            }=; expires= Thu, 01 Jan 1970 00:00:01 GTM; domain= ${
              document.domain
            }; path= /;`;
          })
        : null
      : null;
  }, [show]);

  if (typeof window === "undefined") {
    return <></>;
  }

  return show ? (
    <ConsentContainer>
      <ConsentSection>
        <Col align="center">
          <h5>
            {consentData
              ? consentData.consent_title.text
              : "🍪 No title"}
              {/* : "🍪 Cookies preferences"} */}
          </h5>
          <p>
            {consentData
              ? consentData.consent_text.text
              : "By continuing to use this website, you consent to the use of cookies in accordance with our"}{" "}
            <Link to={consentData ? consentData.cookie_policy_link.url : "/"}>
              {consentData
                ? consentData.cookie_policy_text.text
                : "Cookie Policy"}
            </Link>
            .
          </p>
        </Col>
        <Col align="flex-end">
          <Button
            onClick={() => {
              setConsentPreferences(false, false);
              consent(false);
            }}
          >
            {consentData ? consentData.decline_button_text.text : "Reject"}
          </Button>
          <Button
            onClick={() => {
              setConsentPreferences(true, true);
              consent(true);
            }}
            primary
          >
            {consentData ? consentData.i_agree_button_text.text : "Accept"}
          </Button>
        </Col>
      </ConsentSection>
    </ConsentContainer>
  ) : null;
};

// export const query = graphql`
//   fragment ConsentManagerFragment on PrismicConsentManager {
//     lang
//     data {
//       consent_title {
//         text
//       }
//       consent_text {
//         text
//       }
//       cookie_policy_link {
//         url
//       }
//       cookie_policy_text {
//         text
//       }
//       decline_button_text {
//         text
//       }
//       i_agree_button_text {
//         text
//       }
//     }
//   }
// `;

export default ConsentManager;
