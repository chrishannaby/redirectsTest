import React, { useEffect, useState } from "react";
import { useLocation } from "@reach/router";

import phone from "../../images/s6_cellphone.svg";
import { Section, Btn } from "../common";
import { PageContainer, SectionContainer } from "./VerifyEmailSliceStyle";
import { verifyEmail } from "../../services/verify-email";

const VerifyEmailSlice = ({ slice }) => {
  const {
    primary: { section_image_verified },
    primary: { section_image_error },
    primary: { section_title_verified },
    primary: { section_title_could_not_verified },
    primary: { section_title_link_expired },
    primary: { section_paragraph },
    primary: { button_url_back_app },
    primary: { button_text_back_app },
    primary: { button_text_resend_email },
  } = slice;

  const [typeResponseAPI, setTypeResponseAPI] = useState("caseNUll");
  const [getToken, setGetToken] = useState("");
  const location = useLocation();

  useEffect(() => {
    const fetchAPI = async () => {
      try {
        const searchToken = new URLSearchParams(location.search).get("token");
        setGetToken(searchToken);

        if (searchToken === null || searchToken === "") {
          setTypeResponseAPI("");
        } else {
          const request = await verifyEmail(`${searchToken}`);

          if (
            typeof request === "object" &&
            request.hasOwnProperty("error") &&
            request.error !== ""
          ) {
            const { data, status } = request.error.response;

            if (status === 400 && data.retVal === 20)
              setTypeResponseAPI("caseInvalidToken"); //'Invalid email code.'
            if (status === 400 && data.retVal === 30)
              setTypeResponseAPI("caseExpireToken"); //'Email code expired.
          } else if (
            typeof request === "object" &&
            request.hasOwnProperty("response")
          ) {
            setTypeResponseAPI("caseEmailVerify");
          } else {
            setTypeResponseAPI("");
          }
        }
      } catch (error) {
        console.error("error", error);
        setTypeResponseAPI("");
      }
    };

    fetchAPI();

    return function cleanup() {};
  }, []);

  const caseNUll = () => <></>;
  const caseEmailVerify = () => (
    <>
      <img
        src={section_image_verified.fixed.src || phone}
        alt="ria cellphone"
      />
      <h2 className="verified">{section_title_verified.text}</h2>
      <Btn
        url={button_url_back_app?.url}
        fullwidth={false}
        type="solid-orange"
        innerText={button_text_back_app.text}
        style={{ width: "206px" }}
      />
    </>
  );
  const caseInvalidToken = () => (
    <>
      <img src={section_image_error.fixed.src || phone} alt="Invalid token" />
      <h2 className="not-verified">{section_title_could_not_verified.text}</h2>
      <Btn
        url={button_url_back_app?.url}
        fullwidth={false}
        type="solid-orange"
        innerText={button_text_back_app.text}
        style={{ width: "206px" }}
      />
    </>
  );
  const caseExpireToken = () => (
    <>
      <img src={section_image_error.fixed.src || phone} alt="Expire token" />
      <h2 className="expired">{section_title_link_expired.text}</h2>
      <Section style={{ justifyContent: "center" }}>
        <Btn
          url={button_url_back_app?.url}
          fullwidth={false}
          type="solid-orange"
          innerText={button_text_back_app.text}
          style={{ width: "206px" }}
        />
      </Section>
    </>
  );

  return (
    <PageContainer>
      <SectionContainer>
        {typeResponseAPI === "" && caseNUll()}
        {typeResponseAPI === "caseNUll" && caseNUll()}
        {typeResponseAPI === "caseEmailVerify" && caseEmailVerify()}
        {typeResponseAPI === "caseInvalidToken" && caseInvalidToken()}
        {typeResponseAPI === "caseExpireToken" && caseExpireToken()}
      </SectionContainer>
    </PageContainer>
  );
};

export default VerifyEmailSlice;
