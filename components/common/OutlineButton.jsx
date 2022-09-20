// ############################################
// DEPRECADO NO USAR
// Usar src/components/common/_button
// ############################################
import React from "react";
import styled from "styled-components";

const ButtonContainer = styled.button`
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  padding: 12px 24px;
  font-weight: bold;
  border-radius: 24px;
  font-size: 16px;
  line-height: 24px;
  border: none;
  background: transparent;
  color: var(--Ria-orange);
  border: 1px solid rgba(255, 119, 51, 0.3);
  font-family: "Nunito Sans";
  cursor: pointer;
  transition: all 0.3s ease;
  height: 48px;
  width: 170px;
  @media(max-width: 1000px) {
    width: 165px;
  }
  svg {
    margin-right: 8px;
    path {
      transition: fill 0.3s ease;
    }
  }
  :hover {
    background: var(--Ria-orange);
    color: white;
    svg {
      path {
        fill: white;
      }
    }
  }
`;

const OutlineButton = ({
  url = "/",
  text = "Button",
  type = "",
  device = "",
}) => {
  return (
    <a href={url} className={device === "mobile" ? "mobile" : "desktop"}>
      <ButtonContainer>
        {type === "google" && (
          <svg
            width="18"
            height="18"
            viewBox="0 0 18 18"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M3.76232 0.960279C3.32478 0.704398 2.80332 0.681517 2.34854 0.894537L9.97374 8.31832L12.4669 5.88487L3.76232 0.960279ZM1.64795 1.58161C1.55175 1.77949 1.5 1.9996 1.5 2.22615V15.8059C1.5 16.0334 1.55208 16.2503 1.64927 16.444L9.2715 9.00379L1.64795 1.58161ZM9.97477 9.68829L2.36184 17.1195C2.56385 17.2104 2.77881 17.25 2.99343 17.25C3.25847 17.25 3.52285 17.1884 3.76235 17.0486L12.4686 12.1166L9.97477 9.68829ZM15.7822 7.76047C15.7792 7.75854 15.7759 7.75661 15.7729 7.75499L13.356 6.38761L10.6767 9.00282L13.3576 11.6129C13.3576 11.6129 15.7792 10.2413 15.7822 10.2397C16.2316 9.97446 16.5 9.51104 16.5 8.99992C16.5 8.4888 16.2316 8.02538 15.7822 7.76047Z"
              fill="#FF6100"
            />
          </svg>
        )}
        {type === "apple" && (
          <svg
            width="18"
            height="18"
            viewBox="0 0 18 18"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M11.5058 3.61327C11.1332 3.61327 10.7832 3.67109 10.4556 3.78671C10.128 3.89591 9.83249 4.00832 9.56912 4.12395C9.30576 4.23957 9.07452 4.29739 8.87539 4.29739C8.66984 4.29739 8.43859 4.24279 8.18165 4.13358C7.93114 4.02438 7.66135 3.91839 7.3723 3.81562C7.08324 3.70642 6.77491 3.65182 6.44732 3.65182C5.83066 3.65182 5.23328 3.82204 4.65517 4.16249C4.08348 4.49652 3.61456 4.99435 3.24843 5.65598C2.88229 6.31118 2.69922 7.12377 2.69922 8.09373C2.69922 8.99946 2.85017 9.89876 3.15207 10.7916C3.4604 11.6781 3.82975 12.4297 4.26012 13.0463C4.63268 13.5666 4.99561 14.0131 5.3489 14.3856C5.70219 14.7582 6.11329 14.9445 6.58221 14.9445C6.89054 14.9445 7.15711 14.8931 7.38193 14.7903C7.61318 14.6876 7.85406 14.5848 8.10457 14.482C8.36151 14.3792 8.67947 14.3278 9.05846 14.3278C9.45029 14.3278 9.76183 14.3792 9.99307 14.482C10.2243 14.5784 10.4491 14.6779 10.6675 14.7807C10.8859 14.8771 11.1654 14.9252 11.5058 14.9252C12.0133 14.9252 12.4468 14.7325 12.8066 14.3471C13.1727 13.9617 13.5131 13.5409 13.8279 13.0849C14.1876 12.5581 14.4445 12.0796 14.5987 11.6492C14.7593 11.2188 14.8428 10.9908 14.8492 10.9651C14.8364 10.9587 14.7272 10.9008 14.5216 10.7916C14.3225 10.6824 14.0912 10.5122 13.8279 10.281C13.5709 10.0433 13.3429 9.73175 13.1438 9.34633C12.9511 8.96092 12.8547 8.492 12.8547 7.93957C12.8547 7.4578 12.9318 7.04347 13.086 6.6966C13.2401 6.3433 13.42 6.05424 13.6255 5.82941C13.8311 5.59816 14.0174 5.42473 14.1844 5.3091C14.3514 5.18705 14.4445 5.1164 14.4638 5.09712C14.1298 4.61535 13.7572 4.27169 13.3461 4.06614C12.9414 3.85416 12.5689 3.72569 12.2284 3.68072C11.888 3.63576 11.6471 3.61327 11.5058 3.61327ZM10.9759 2.38958C11.2071 2.10694 11.3966 1.78576 11.5443 1.42604C11.6921 1.05989 11.766 0.684113 11.766 0.298697C11.766 0.183073 11.7563 0.0835068 11.737 0C11.3645 0.0128472 10.9727 0.12526 10.5616 0.337239C10.1504 0.549218 9.81 0.815797 9.54022 1.13698C9.32824 1.37465 9.13875 1.67656 8.97174 2.0427C8.80473 2.40243 8.72123 2.77499 8.72123 3.16041C8.72123 3.21822 8.72444 3.27282 8.73086 3.32421C8.73728 3.3756 8.74371 3.41093 8.75013 3.4302C8.81437 3.44305 8.88181 3.44947 8.95247 3.44947C9.29291 3.44947 9.65263 3.34991 10.0316 3.15077C10.4106 2.94522 10.7253 2.69149 10.9759 2.38958Z"
              fill="#FF6100"
            />
          </svg>
        )}

        {text}
      </ButtonContainer>
    </a>
  );
};

export default OutlineButton;
