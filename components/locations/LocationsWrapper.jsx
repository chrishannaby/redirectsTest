/* eslint-disable */
import React, { useState, useRef, useEffect, SetStateAction } from "react";
import Loader from "../common/Loader";
import moment from "moment";
import offsets from "./offsets";
import {
  LocationsContainer,
  LocationsSidePanel,
  LocationsMap,
  MobileMapList,
  LocationNotFound,
  NavbarDetails,
  HeaderDetails,
  DetailsContainer,
  HoursDetails,
  GetDirectionsBtn,
  InputContainer,
  OpenCloseTag,
  FilterContainer,
  FixedDetailsContainer,
} from "./locations-styles";
import { motion, AnimatePresence } from "framer-motion";
import RiaMap from "./mapbox";
import { token, markerIcon, markerIconXe } from "./variables";
import FetchRia from "../utils/axios";
import { CancelToken } from "axios";
import { LoaderMotion } from "./LoaderMotion";

const axios = new FetchRia({ requiredToken: true });

const source = CancelToken.source();

const variants = {
  enter: (direction) => {
    return {
      y: direction > 0 ? -1000 : 1000,
      opacity: 0,
      background: "#fff",
    };
  },
  center: {
    zIndex: 11,
    y: 0,
    opacity: 1,
    background: "#fff",
    position: "fixed",
    top: 50,
    bottom: 0,
    left: 0,
    right: 0,
  },
  exit: (direction) => {
    return {
      zIndex: 1,
      y: direction > 0 ? -1000 : 1000,
      opacity: 0,
    };
  },
};
const deskVariants = {
  enter: (direction) => {
    return {
      opacity: 0,
    };
  },
  center: {
    opacity: 1,
  },
  exit: (direction) => {
    return {
      zIndex: 1,
      opacity: 0,
    };
  },
};

const LocationsWrapper = ({
  textData,
  hideNavbar,
  theme,
  optOutState,
  ...rest
}) => {
  const [map, setMap] = useState({});
  const [locationsData, setLocationsData] = useState([]);
  const [dataMarker, setDataMarker] = useState([]);
  const [selectedStore, setSelectedStore] = useState(null);
  const [navToggle, setNavToggle] = useState(true);
  const [loading, setLoading] = useState(true);
  const [timeoutlimit, setTimeoutLimit] = useState(10000);
  const [requestFail, setRequestFail] = useState(false);
  const [sendLocationQuery, setSendLocation] = useState(false);
  const [payoutLocationQuery, setPayoutLocation] = useState(false);
  const [collectionLocationQuery, setCollectionLocation] = useState(false);
  const [showFilter, setShowFilter] = useState(false);
  const [hoursQuery, setHoursQuery] = useState(false);
  const [distanceType, setDistanceType] = useState(true);
  const [locationsTexts, setLocationsTexts] = useState(null);
  const [urlParams, setUrlParams] = useState(
    typeof window !== "undefined"
      ? {
          lat: new URLSearchParams(window.location.search).get("lat"),
          log: new URLSearchParams(window.location.search).get("lon"),
          code: new URLSearchParams(window.location.search).get("code"),
          agentId: new URLSearchParams(window.location.search).get("agentId"),
          zoom: new URLSearchParams(window.location.search).get("zoom"),
        }
      : ""
  );
  const [searchText, setSearchText] = useState(textData.search[0].text);
  const [requiredPayoutAgent, setRequiredPayoutAgent] = useState(false);

  const activeOptOut = optOutState;

  useEffect(() => {
    setLocationsTexts(textData);
    theme === "xe" && (setRequiredPayoutAgent(true), setPayoutLocation(true));
  }, []);

  var timeCancel;

  const days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];

  const center = [-104.993966, 39.738416];
  const mapQuery = (query) => ({
    countryTo: query.shortcode,
    findLocationType: "RMT",
    lat: "",
    latitude: query.latitude,
    long: "",
    longitude: query.longitude,
    PayAgentId: null,
    RequestCountry: "US",
    RequiredPayoutAgents: requiredPayoutAgent,
    RequiredReceivingAgents: false,
    RequiredReceivingAndPayoutAgents: false,
  });

  const cancelRequest = () => {
    timeCancel = setTimeout(() => {
      source.cancel("Timeout request");
      setRequestFail(true);
    }, timeoutlimit);
  };

  const notCancel = () => {
    clearTimeout(timeCancel);
  };

  const request = (query) => {
    setLoading(true);
    // cancelRequest()
    return new Promise((resolve, reject) => {
      document
        ?.querySelector(".mapboxgl-ctrl-geocoder--input")
        ?.setAttribute("placeholder", textData.search.text || "Search");

      document.querySelector(".search-this-area").innerHTML =
        textData.search_this_area[0].text || null;

      axios
        .put("/location/agent-locations", mapQuery(query), {
          cancelToken: source.token,
          headers: { CultureCode: "en-US", IsoCode: "US" },
        })
        .then((res) => {
          // notCancel()
          document.querySelector("#geo input").placeholder = searchText;
          document.querySelector(".search-this-area").innerHTML =
            textData.search_this_area[0].text;
          setSelectedStore(null);
          setTimeout((e) => setLoading(false), 1000);
          resolve(res.data);
        })
        .catch((err) => {
          setTimeout((e) => setLoading(false), 1000);
          reject(err);
        });
    });
  };

  const onLoad = (query) =>
    request(query).then((response) => setData(response));

  const dataResult = ({ query }) => {
    request(query)
      .then((response) => {
        setData(response);
      })
      .catch((err) => notResult(err));
  };

  const notResult = (err) => {
    notCancel();
    setLocationsData([]);
    map.clearAllMarkers();
  };

  const setData = (data) => {
    setLocationsData(data);
    setDataMarker(filter(data));
    map.moveByData(map.arrayToGeoJSON(filter(data)));
  };

  const filter = (data) => {
    let query = {};
    if (sendLocationQuery) query["sendLocation"] = sendLocationQuery;
    if (payoutLocationQuery) query["payoutLocation"] = payoutLocationQuery;
    if (collectionLocationQuery)
      query["collectionLocation"] = collectionLocationQuery;
    if (hoursQuery) query["open"] = hoursQuery;

    return data.filter((item, index) => {
      for (let key in query)
        if (item[key] !== query[key] || item[key] === undefined) {
          return false;
        }

      let current = moment(),
        open = false,
        obj = null;
      obj = item.businessHours.find((e) => e.dayOfWeek === days[current.day()]);
      // offsets
      if (obj != undefined) {
        let offset = offsets.find((e) => e.fTimeZoneName === obj.timeZoneName);
        let curr, shop;
        if (offset) {
          curr = moment().utcOffset(offset.fOffset);
          shop = moment().utcOffset(offset.fOffset);
        } else {
          curr = moment();
          shop = moment();
        }

        if (obj.timeClose == null) open = false;
        else {
          let hrs = obj.timeClose.split(":");
          let closed = shop
            .set({
              hour: hrs[0],
              minute: hrs[1],
              second: hrs[2],
            })
            .format("hh:mm A");
          if (shop.isSameOrAfter(curr)) open = true;
          // if (curr.isBefore(closed.format('HH:mm:ss'))) open = true
          else open = false;
        }

        item["open"] = open;
      }
      return true;
    });
  };

  const handler = (item) => {
    setSelectedStore(item);
  };

  const closeFilters = () => {
    setShowFilter(false);
    setSelectedStore(null);
  };

  const LayoutFilter = () => {
    return (
      <motion.div
        key="filter"
        variants={window.innerWidth > 960 ? deskVariants : variants}
        initial="enter"
        animate="center"
        exit="exit"
        transition={{
          duration: 0.3,
        }}
        className="details-wrapper"
      >
        <FilterContainer theme={theme}>
          <div className="cont-20">
            <div className="head-filter">
              <h2>
                {locationsTexts.filters[0].text
                  ? locationsTexts.filters[0].text
                  : "Filters"}
              </h2>
              <p onClick={() => closeFilters()} className="filter-closed">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M19.4244 5.63586L18.3638 4.5752L11.9998 10.9392L5.63588 4.5752L4.5752 5.63586L10.9392 11.9998L4.5752 18.3638L5.63586 19.4244L11.9998 13.0605L18.3638 19.4244L19.4244 18.3638L13.0605 11.9998L19.4244 5.63586Z"
                    fill="#001133"
                    fill-opacity="0.6"
                  />
                </svg>
              </p>
            </div>
            {theme === "xe" ? (
              <></>
            ) : (
              <>
                <h4>
                  {locationsTexts.services[0].text
                    ? locationsTexts.services[0].text
                    : "Services"}
                </h4>

                <div>
                  <input
                    id="send-lj"
                    className="checkbox-custom"
                    type="checkbox"
                    checked={sendLocationQuery}
                    onChange={(val) => {
                      setSendLocation(val.target.checked);
                    }}
                  />
                  <label htmlFor="send-lj" className="checkbox-custom-label">
                    <span>
                      {locationsTexts.send_money[0].text
                        ? locationsTexts.send_money[0].text
                        : "Send money"}
                    </span>
                  </label>
                </div>
                <div>
                  <input
                    id="pickup-kj"
                    className="checkbox-custom"
                    type="checkbox"
                    checked={payoutLocationQuery}
                    onChange={(val) => {
                      setPayoutLocation(val.target.checked);
                    }}
                  />
                  <label htmlFor="pickup-kj" className="checkbox-custom-label">
                    <span>
                      {locationsTexts.pickup_money[0].text
                        ? locationsTexts.pickup_money[0].text
                        : "Pickup money"}
                    </span>
                  </label>
                </div>
                <div>
                  <input
                    id="found-kg"
                    className="checkbox-custom"
                    type="checkbox"
                    checked={collectionLocationQuery}
                    onChange={(val) => {
                      setCollectionLocation(val.target.checked);
                    }}
                  />
                  <label htmlFor="found-kg" className="checkbox-custom-label">
                    <span>
                      {locationsTexts.fund_transfers[0].text
                        ? locationsTexts.fund_transfers[0].text
                        : "Fund transfers"}
                    </span>
                  </label>
                </div>
              </>
            )}
            <h4>
              {locationsTexts.hours[0].text
                ? locationsTexts.hours[0].text
                : "Hours"}
            </h4>
            <div className="InputGroup">
              <input
                type="radio"
                name="hours"
                id="hours_1"
                value="small"
                checked={!hoursQuery}
                onChange={() => setHoursQuery(false)}
              />
              <label htmlFor="hours_1" className="radius-left">
                {locationsTexts.any_time[0].text
                  ? locationsTexts.any_time[0].text
                  : "Any time"}
              </label>
              <input
                type="radio"
                name="hours"
                id="hours_2"
                value="small"
                checked={hoursQuery}
                onChange={() => setHoursQuery(true)}
              />
              <label htmlFor="hours_2" className="radius-right">
                {locationsTexts.open_now[0].text
                  ? locationsTexts.open_now[0].text
                  : "Open now"}
              </label>
            </div>

            <h4>
              {locationsTexts.distance_units[0].text
                ? locationsTexts.distance_units[0].text
                : "Distance units"}
            </h4>
            <div className="InputGroup">
              <input
                type="radio"
                name="distance"
                id="distance_1"
                value="small"
                checked={distanceType}
                onChange={() => setDistanceType(true)}
              />
              <label htmlFor="distance_1" className="radius-left">
                {locationsTexts.miles[0].text
                  ? locationsTexts.miles[0].text
                  : "Miles"}
              </label>
              <input
                type="radio"
                name="distance"
                id="distance_2"
                value="small"
                checked={!distanceType}
                onChange={() => setDistanceType(false)}
              />
              <label htmlFor="distance_2" className="radius-right">
                {locationsTexts.kilometers[0].text
                  ? locationsTexts.kilometers[0].text
                  : "Kilometers"}
              </label>
            </div>
          </div>

          <div className="buttons-group-filter">
            <button
              className="clear"
              onClick={() => {
                setSendLocation(false);
                theme === "xe"
                  ? setPayoutLocation(true)
                  : setPayoutLocation(false);
                setCollectionLocation(false);
                setHoursQuery(false);
                closeFilters();
              }}
            >
              {locationsTexts.clear[0].text
                ? locationsTexts.clear[0].text
                : "Clear"}
            </button>
            <button
              className="apply"
              onClick={() => {
                setData(locationsData);
                closeFilters();
              }}
            >
              {locationsTexts.apply[0].text
                ? locationsTexts.apply[0].text
                : "Apply"}
            </button>
          </div>
        </FilterContainer>
      </motion.div>
    );
  };

  const translateDays = (day) => {
    switch (day) {
      case "monday":
        return locationsTexts.monday[0].text
          ? locationsTexts.monday[0].text
          : "Monday";
      case "tuesday":
        return locationsTexts.tuesday[0].text
          ? locationsTexts.tuesday[0].text
          : "Tuesday";
      case "wednesday":
        return locationsTexts.wednesday[0].text
          ? locationsTexts.wednesday[0].text
          : "Wednesday";
      case "thursday":
        return locationsTexts.thursday[0].text
          ? locationsTexts.thursday[0].text
          : "Thursday";
      case "friday":
        return locationsTexts.friday[0].text
          ? locationsTexts.friday[0].text
          : "Friday";
      case "saturday":
        return locationsTexts.saturday[0].text
          ? locationsTexts.saturday[0].text
          : "Saturday";
      case "sunday":
        return locationsTexts.sunday[0].text
          ? locationsTexts.sunday[0].text
          : "Sunday";
      default:
        return day;
    }
  };

  const details = () => {
    if (selectedStore === "filter" && showFilter) {
      return LayoutFilter();
    } else if (selectedStore != null) {
      const {
        address,
        address2,
        businessHours,
        phone,
        name,
        distanceFromOriginMiles,
        distanceFromOriginKilometers,
        city,
      } = selectedStore.properties;
      return (
        <motion.div
          key="modal"
          variants={window.innerWidth > 960 ? deskVariants : variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{
            duration: 0.3,
          }}
          className="details-wrapper"
        >
          <DetailsContainer optOut={activeOptOut}>
            <NavbarDetails>
              <h2>{name}</h2>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  setSelectedStore(null);
                  setShowFilter(false);
                }}
              >
                <svg
                  width="48"
                  height="48"
                  viewBox="0 0 48 48"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M31.4244 17.6359L30.3638 16.5752L23.9998 22.9392L17.6359 16.5752L16.5752 17.6359L22.9392 23.9998L16.5752 30.3638L17.6359 31.4244L23.9998 25.0605L30.3638 31.4244L31.4244 30.3638L25.0605 23.9998L31.4244 17.6359Z"
                    fill="#001133"
                    fillOpacity="0.6"
                  />
                </svg>
              </button>
              <p>
                {distanceType
                  ? distanceFromOriginMiles.toFixed(1) + " mi"
                  : distanceFromOriginKilometers.toFixed(1) + " Km"}{" "}
                ·{" "}
                {`${address.toLowerCase()}${address2}${
                  city ? ", " + city : ""
                }`}
              </p>
              <p>
                {phone ||
                  (locationsTexts.unavailable[0].text
                    ? locationsTexts.unavailable[0].text
                    : "Unavailable")}
              </p>
              <h5>{legalItem(selectedStore.properties)}</h5>
            </NavbarDetails>
            {businessHours.length > 1 && (
              <HoursDetails>
                <table>
                  <thead></thead>
                  <tbody>
                    {businessHours.map((e, i) => {
                      let offset = offsets.find(
                        (r) => r.fTimeZoneName === e.timeZoneName
                      );
                      let current,
                        shop,
                        open = false,
                        today = false,
                        openFormat = "",
                        closedFormat = "";
                      if (offset) {
                        current = moment().utcOffset(offset.fOffset);
                        shop = moment().utcOffset(offset.fOffset);
                      } else {
                        current = moment();
                        shop = moment();
                      }

                      if (e.timeClose != null) {
                        if (e.dayOfWeek === days[current.day()]) {
                          today = true;
                          let hrs = e.timeClose.split(":");
                          let closed = shop.set({
                            hour: hrs[0],
                            minute: hrs[1],
                            second: hrs[2],
                          });

                          if (shop.isSameOrAfter(current)) {
                            open = true;
                          } else {
                            open = false;
                          }
                        }
                      }

                      if (e.timeOpen != null) {
                        let str = e.timeOpen.split(":");
                        let d = new Date();
                        d.setHours(
                          isNaN(str[0]) ? 0 : str[0],
                          isNaN(str[1]) ? 0 : str[1],
                          0,
                          0
                        );
                        openFormat = formatAMPM(d);
                      }

                      if (e.timeClose != null) {
                        let str = e.timeClose.split(":");
                        let d = new Date();
                        d.setHours(
                          isNaN(str[0]) ? 0 : str[0],
                          isNaN(str[1]) ? 0 : str[1],
                          0,
                          0
                        );
                        closedFormat = formatAMPM(d);
                      }

                      return (
                        <tr
                          key={i}
                          className={`${today ? "today" : ""} ${
                            today ? (open ? "today-green" : "today-red") : ""
                          }`}
                        >
                          <tr>
                            <td>{translateDays(e.dayOfWeek.toLowerCase())}</td>
                            <td>
                              {e.timeOpen == null ? "" : openFormat}
                              {e.timeOpen == null ? "" : " - "}
                              {e.timeClose == null
                                ? locationsTexts.closed[0].text
                                : closedFormat}
                            </td>
                          </tr>
                          {open ? (
                            <tr>
                              <td></td>
                              <td>
                                {locationsTexts.currently_open[0].text
                                  ? locationsTexts.currently_open[0].text
                                  : "Currently open"}
                              </td>
                            </tr>
                          ) : null}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </HoursDetails>
            )}
            <p>{`⚠ ${
              locationsTexts.opening_hours[0].text
                ? locationsTexts.opening_hours[0].text
                : "Opening hours may differ due to COVID-19"
            }`}</p>
            <FixedDetailsContainer>
              <GetDirectionsBtn
                theme={theme}
                target="_blank"
                href={travelGmaps(
                  [map.userPosition().lat, map.userPosition().lng],
                  [
                    selectedStore.geometry.coordinates[1],
                    selectedStore.geometry.coordinates[0],
                  ],
                  selectedStore
                )}
              >
                {locationsTexts.get_directions[0].text
                  ? locationsTexts.get_directions[0].text
                  : "Get directions"}
              </GetDirectionsBtn>
            </FixedDetailsContainer>
          </DetailsContainer>
        </motion.div>
      );
    }
  };

  const loader = (theme) => <LoaderMotion theme={theme} />;

  const notFoundComp = () => {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <LocationNotFound>
          <h4>
            {textData.no_location[0].text || "We couldn’t find any location 🤔"}
          </h4>
          <p>
            {textData.no_location_desc[0].text ||
              "We couldn't find a Ria Location in that area. Extend your search and try again."}
          </p>
        </LocationNotFound>
      </motion.div>
    );
  };

  const errRequest = () => {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <LocationNotFound>
          <h4>
            {textData.something_went_wrong[0].text ||
              "Something went wrong! 😵"}
          </h4>
          <p>
            {textData.taking_too_long[0].text ||
              "This is taking too long maybe you should try again."}
          </p>
        </LocationNotFound>
      </motion.div>
    );
  };

  const OpenStatus = (open, index, now, date) => {
    switch (index) {
      case 1:
        return (
          <OpenCloseTag>
            {" "}
            <span className="closed">
              {locationsTexts.closed[0].text
                ? locationsTexts.closed[0].text
                : "Closed"}
            </span>{" "}
            ·{" "}
            {locationsTexts.opens[0].text
              ? locationsTexts.opens[0].text
              : "Opens"}{" "}
            {locationsTexts.opens_at[0].text
              ? locationsTexts.opens_at[0].text
              : "at"}{" "}
            {open.timeOpen}
          </OpenCloseTag>
        );
      case 2:
        return (
          <OpenCloseTag>
            {" "}
            <span className="closed">
              {locationsTexts.closed[0].text
                ? locationsTexts.closed[0].text
                : "Closed"}
            </span>{" "}
            ·{" "}
            {locationsTexts.opens[0].text
              ? locationsTexts.opens[0].text
              : "Opens"}{" "}
            {locationsTexts.opens_on[0].text
              ? locationsTexts.opens_on[0].text
              : "on"}{" "}
            {open.dayOfWeek}{" "}
            {locationsTexts.opens_at[0].text
              ? locationsTexts.opens_at[0].text
              : "at"}{" "}
            {open.timeOpen}
          </OpenCloseTag>
        );
      default:
        let hrs = open.timeClose.split(":");
        let closed = date.set({ hour: hrs[0], minute: hrs[1], second: hrs[2] });
        if (date.isSameOrAfter(now))
          return (
            <OpenCloseTag>
              {" "}
              <span className="success">
                {locationsTexts.open_until[0].text
                  ? locationsTexts.open_until[0].text
                  : "Open until"}{" "}
                {open.timeClose.length === 5
                  ? open.timeClose
                  : open.timeClose.substr(0, 5)}
              </span>
            </OpenCloseTag>
          );
        else
          return (
            <OpenCloseTag>
              {" "}
              <span className="closed">
                {locationsTexts.closed[0].text
                  ? locationsTexts.closed[0].text
                  : "Closed"}
              </span>{" "}
              ·{" "}
              {locationsTexts.opens[0].text
                ? locationsTexts.opens[0].text
                : "Opens"}{" "}
              {locationsTexts.opens_at[0].text
                ? locationsTexts.opens_at[0].text
                : "at"}{" "}
              {open.timeOpen}
            </OpenCloseTag>
          );
    }
  };

  const openClosed = (item) => {
    const recursiveValidOpen = (index = 0) => {
      let offset = offsets.find(
        (r) => r.fTimeZoneName === item.businessHours[0].timeZoneName
      );
      let now, date;
      if (offset) {
        now = moment().utcOffset(offset.fOffset);
        date = moment().utcOffset(offset.fOffset);
      } else {
        now = moment();
        date = moment();
      }

      const open = item.businessHours.find(
        (e) => e.dayOfWeek === days[now.add({ days: index }).day()]
      );

      if (
        open == null ||
        open == undefined ||
        open.timeOpen == null ||
        open.timeClose == null
      ) {
        if (index < 3) return recursiveValidOpen(index + 1);
        return <></>;
      } else {
        return OpenStatus(open, index, now, date);
      }
    };

    return recursiveValidOpen();
  };

  const legalItem = (item) => {
    let services = [];
    if (item.collectionLocation)
      services.push(
        locationsTexts.fund_transfers[0].text
          ? locationsTexts.fund_transfers[0].text
          : "Fund transfers"
      );
    if (item.sendLocation)
      services.push(
        locationsTexts.send_money[0].text
          ? locationsTexts.send_money[0].text
          : "Send money"
      );
    if (item.payoutLocation)
      services.push(
        locationsTexts.pickup_money[0].text
          ? locationsTexts.pickup_money[0].text
          : "Pickup money"
      );
    return services.join(" · ");
  };

  const mapData = () => {
    return dataMarker.map((item, i) => {
      return (
        <motion.div
          key={i}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="header-item"
          onClick={(e) => {
            e.preventDefault();
            map.viewMarker(item, { zoom: 14 });
          }}
        >
          <h3>{item.name}</h3>
          <h4>{item.address}</h4>
          {openClosed(item)}
          <p>{legalItem(item)}</p>
          <div className="header-item-distance">
            {distanceType
              ? item.distanceFromOriginMiles.toFixed(1) + " mi"
              : item.distanceFromOriginKilometers.toFixed(1) + " Km"}
          </div>
        </motion.div>
      );
    });
  };

  const inputGeolocator = () => {
    return (
      <InputContainer optOut={activeOptOut} theme={theme}>
        <RiaMap.InputGeoCoder
          theme={theme}
          filterActive={[
            sendLocationQuery,
            payoutLocationQuery,
            collectionLocationQuery,
            hoursQuery,
            !distanceType,
          ].some((e) => e)}
          onClick={() => {
            setShowFilter(true);
            setSelectedStore("filter");
          }}
        />
      </InputContainer>
    );
  };

  if (typeof window === `undefined`) {
    return <></>;
  }

  return (
    <LocationsContainer
      optOut={activeOptOut}
      hideNavbar={hideNavbar}
      theme={theme}
    >
      {window.innerWidth > 960 ? (
        selectedStore === null ? (
          <LocationsSidePanel theme={theme}>
            {inputGeolocator()}
            <AnimatePresence transition={{ duration: 0.5 }} exitBeforeEnter>
              {loading
                ? loader(theme)
                : requestFail
                ? errRequest()
                : locationsData.length < 1
                ? notFoundComp()
                : mapData()}
            </AnimatePresence>
          </LocationsSidePanel>
        ) : (
          <LocationsSidePanel>
            {showFilter ? LayoutFilter() : details()}
          </LocationsSidePanel>
        )
      ) : null}
      {window.innerWidth <= 960 ? inputGeolocator() : null}
      <LocationsMap
        className={navToggle && "active"}
        optOut={activeOptOut}
        theme={theme}
      >
        <RiaMap.Maps
          urlQuery={urlParams}
          map={(e) => setMap(e)}
          load={onLoad}
          theme={theme}
          // loadMap={() => console.log('load map')}
          accessToken={token}
          geoCoderResult={dataResult}
          templateMarker={theme === "xe" ? markerIconXe : markerIcon}
          center={center}
          handlerLocation={handler}
          browserLoacion={true}
          zoomMarker={14}
        />
      </LocationsMap>
      {window.innerWidth < 960 ? (
        <MobileMapList
          className={navToggle && "active"}
          optOut={activeOptOut}
          theme={theme}
        >
          <div
            className="toggle-button"
            onClick={() => setNavToggle(!navToggle)}
          >
            <svg
              width="12"
              height="8"
              viewBox="0 0 12 8"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M6 7.37502L0.375 1.75002L1.1625 0.962524L6 5.80002L10.8375 0.962524L11.625 1.75002L6 7.37502Z"
                fillOpacity="0.6"
              />
            </svg>
          </div>

          <LocationsSidePanel>
            <AnimatePresence transition={{ duration: 0.5 }} exitBeforeEnter>
              {loading
                ? loader()
                : requestFail
                ? errRequest()
                : locationsData.length == 0
                ? notFoundComp()
                : showFilter
                ? LayoutFilter()
                : mapData()}
            </AnimatePresence>
          </LocationsSidePanel>
        </MobileMapList>
      ) : null}
      {window.innerWidth < 960 && (
        <AnimatePresence transition={{ duration: 0.5 }} exitBeforeEnter>
          {selectedStore && details()}
        </AnimatePresence>
      )}
    </LocationsContainer>
  );
};

export default LocationsWrapper;

function formatAMPM(date) {
  var hours = date.getHours();
  var minutes = date.getMinutes();
  var ampm = hours >= 12 ? "pm" : "am";
  hours = hours % 12;
  hours = hours ? hours : 12; // the hour '0' should be '12'
  minutes = minutes < 10 ? "0" + minutes : minutes;
  var strTime = hours + ":" + minutes + ampm;
  return strTime;
}

function travelGmaps(origin, dest, selectedStore) {
  // console.log('@d',origin,dest,selectedStore,encodeURI(selectedStore.properties.address))
  return (
    "https://www.google.com/maps/dir/?api=1&origin=" +
    origin.toString() +
    "&destination=" +
    dest.toString()
  );
}

// https://www.google.com/maps/@-33.449336,-70.673668
// https://www.google.com/maps/search/?api=1&&query=6136+Beach+Blvd+Buena+Park+CA+United+States
// https://www.google.com/maps/search/?api=1&&query=Av.%20Libertador%20Bernardo%20O%E2%80%99Higgins%20Nro%201449%20Torre%204%20Oficina%201502
// https://www.google.com/maps/search/?api=1&&query=Av+Libertador+Bernardo+OHiggins+Nro+1449+Torre+4+Oficina+1502
// https://maps.googleapis.com/maps/api/geocode/json?place_id=ChIJd8BlQ2BZwokRAFUEcm_qrcA&key=YOUR_API_KEY
// Av. Libertador Bernardo O’Higgins Nro 1449
// https://maps.googleapis.com/maps/api/geocode/json?latlng=51.5055%2C-0.0754&language=en&key=AIzaSyA2ZabNZuGPwg5zLwvaRdR31etdHod_rSA
