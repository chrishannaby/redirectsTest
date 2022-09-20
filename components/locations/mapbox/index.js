/* eslint-disable */
import React from "react";
import { Map, GeoCoder } from "./lib";
var mapbpx = null;
var geocoder = null;
var _this = null;
class Maps extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      success: false,
    };
    this.mapbox = null;
    this.map = null;
    this.geocoder = null;
    this.location = null;
    this.mapContainer = React.createRef();
  }

  componentDidMount() {
    _this = this;
    const { accessToken, zoom, center, urlQuery } = this.props;
    const self = this;
    this.mapbox = new Map(this.mapContainer, {
      accessToken: accessToken,
      zoom: zoom != undefined ? zoom : 11,
      zoomMarker: this.props.zoomMarker,
      center: center != undefined ? center : [-9.1952226, 38.7436214],
      templateLoading: this.props.templateLoading,
      handler: this.props.handlerLocation,
      research: this.research,
    });
    mapbpx = this.mapbox;

    this.mapLoad();
    this.objectMap();
    this.templateMarker();
    // this.setZoom()
    // this.setZoomMarker()
    this.geo();

    const URLlatitude = urlQuery.hasOwnProperty("lat") ? urlQuery.lat : null;
    const URLlongitude = urlQuery.hasOwnProperty("log") ? urlQuery.log : null;
    const URLshortcode = urlQuery.hasOwnProperty("code") ? urlQuery.code : null;
    const URLagentId = urlQuery.hasOwnProperty("agentId")
      ? urlQuery.agentId
      : null;
    let URLzoom = urlQuery.hasOwnProperty("zoom") ? urlQuery.zoom : null;

    if (URLlatitude && URLlongitude && URLshortcode) {
      self.setState({ success: true });

      window.requestAnimationFrame(() => {
        let query = {
          latitude: URLlatitude,
          longitude: URLlongitude,
          shortcode: URLshortcode,
          agentId: URLagentId,
        };

        if (!URLzoom) URLzoom = 13;

        self.location = query;
        self.mapbox.setUserPosition({
          lat: URLlatitude,
          lng: URLlongitude,
        });
        self.mapbox.initCenter({ zoom: URLzoom, ...query });
        self.mapbox.addPositionMarker({
          geometry: { coordinates: [URLlongitude, URLlatitude] },
        });
        self.props.load(query);
      });
    } else {
      if (this.props.browserLoacion) {
        if ("geolocation" in navigator) {
          navigator.geolocation.getCurrentPosition(
            function (position) {
              const { latitude, longitude } = position.coords;
              setTimeout(function () {
                geocoder.geocoderService
                  .reverseGeocode({
                    query: [longitude, latitude],
                    types: ["postcode"],
                    reverseMode: "score",
                  })
                  .send()
                  .then(({ body }) => {
                    self.setState({ success: true });
                    const { context } = body.features[0];
                    let query = {
                      latitude: latitude,
                      longitude: longitude,
                      shortcode:
                        context[context.length - 1].short_code.toUpperCase(),
                    };

                    self.location = query;
                    self.mapbox.setUserPosition({
                      lat: latitude,
                      lng: longitude,
                    });
                    self.mapbox.initCenter({ zoom: 6, ...query });
                    self.mapbox.addPositionMarker({
                      geometry: { coordinates: [longitude, latitude] },
                    });
                    self.props.load(query);
                  });
              }, 1);
            },
            function () {
              self.defaultLocation();
            }
          );
        } else {
          self.defaultLocation();
        }
      } else {
        self.defaultLocation();
      }
    }
  }

  loading() {
    if (this.props.loading) {
      this.mapbox.loading(true);
    }
  }

  defaultLocation() {
    var self = this;
    self.setState({ success: true });
    let query = self.mapQuery(self.mapbox.map.getCenter());
    this.location = query;
    self.mapbox.initCenter({ zoom: 6, ...query });
    self.props.load(query);
  }

  getLocation() {
    return this.location;
  }

  mapLoad() {
    const self = this;
    this.mapbox.on("load", async () => {
      if (self.props.loadMap != undefined) {
        self.props.loadMap();
      }
    });
  }

  mapQuery(obj) {
    return {
      latitude: obj.lat,
      longitude: obj.lng,
      shortcode: obj.shortcode || "US",
    };
  }

  objectMap() {
    if (this.props.map != undefined) {
      this.props.map(this.mapbox);
    }
  }

  templateMarker() {
    if (this.props.templateMarker != undefined) {
      this.mapbox.setTemplateMarker(this.props.templateMarker);
    }
  }

  // // setZoom() {
  // //   if (this.props.zoom != undefined) {
  // //     this.mapbox.setZoom(this.props.zoom)
  // //   }
  // // }

  // setZoomMarker() {
  //   if (this.props.zoomMaker != undefined) {
  //     this.mapbox.setZoomMarker(this.props.zoomMaker)
  //   }
  // }

  research(position) {
    var self = _this;
    const { lat, lng } = position;
    setTimeout(function () {
      geocoder.geocoderService
        .reverseGeocode({
          query: [lng, lat],
          types: ["postcode"],
          reverseMode: "score",
        })
        .send()
        .then(({ body }) => {
          self.setState({ success: true });
          let context;
          if (body.features[0] != undefined) {
            context = body.features[0].context;
            context = context[context.length - 1].short_code.toUpperCase();
          } else {
            context = "US";
          }
          let query = {
            latitude: lat,
            longitude: lng,
            shortcode: context,
          };

          self.location = query;
          self.mapbox.setUserPosition({ lat: lat, lng: lng });
          self.mapbox.map.flyTo({ center: [lng, lat] });
          self.props.load(query);
        });
    }, 1);
  }

  geo() {
    const self = this;
    this.geocoder = new GeoCoder({
      templateCustomGeoCoder: `
       <div style="padding:10px">
          <h2 style="color:#001133; opacity:.8;font-size:16px;line-height:24px;letter-spacing:0.15px;font-weight:400;font-family: 'Nunito Sans', sans-serif;padding:0;margin:0;">{{text}}</h2>
          <p style="color:#001133; opacity:.6;font-size:12px;line-height:16px;letter-spacing:0.25px;font-family: 'Nunito Sans', sans-serif;font-weight:600;padding:0;margin:0;">{{place_name}}</p>
       </div>
      `,
    });

    this.geocoder.on("result", (result) => {
      if (this.props.loading) self.mapbox.loading(true);
      if (self.props.geoCoderResult != undefined) {
        const { geometry, context, properties } = result.result;
        result["query"] = {
          latitude: geometry.coordinates[1],
          longitude: geometry.coordinates[0],
          shortcode: self.validShortCode(context, properties),
        };
        self.props.geoCoderResult(result);
      }
    });
    geocoder = this.geocoder;
  }

  validShortCode(context, properties) {
    if (context != undefined) {
      if (context[context.length - 1] != undefined) {
        if (context[context.length - 1].short_code != undefined) {
          return context[context.length - 1].short_code.toUpperCase();
        }
      }
    }

    if (properties != undefined) {
      if (properties["short_code"] != undefined) {
        return properties["short_code"].toUpperCase();
      }
    }

    return "US";
  }

  render() {
    return (
      <div ref={(el) => (this.mapContainer = el)} className="container-map" />
    );
  }
}

class InputGeoCoder extends React.Component {
  componentDidMount() {
    let interval = setInterval(() => {
      if (geocoder != undefined) {
        clearInterval(interval);
        mapbpx.geocoder(geocoder, "geo");
      }
    }, 1);
  }
  render() {
    return (
      <div
        style={{ position: "relative" }}
        id="geo"
        className="search-box"
        onKeyUp={(e) => this.enterkey(e)}
      >
        <span
          onClick={() => this.openFilter()}
          style={{
            position: "absolute",
            top: "15px",
            right: "15px",
            zIndex: "10",
            cursor: "pointer",
          }}
        >
          {!this.props.filterActive ? (
            <svg
              ref={this.filter}
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M22.5 5.24985H18.675C18.3201 3.50211 16.7834 2.24609 15 2.24609C13.2166 2.24609 11.6799 3.50211 11.325 5.24985H1.5V6.74985H11.325C11.6799 8.4976 13.2166 9.75361 15 9.75361C16.7834 9.75361 18.3201 8.4976 18.675 6.74985H22.5V5.24985ZM15 8.24985C13.7574 8.24985 12.75 7.24249 12.75 5.99985C12.75 4.75721 13.7574 3.74985 15 3.74985C16.2426 3.74985 17.25 4.75721 17.25 5.99985C17.25 7.24249 16.2426 8.24985 15 8.24985ZM1.5 18.7499H5.325C5.67989 20.4976 7.21659 21.7536 9 21.7536C10.7834 21.7536 12.3201 20.4976 12.675 18.7499H22.5V17.2499H12.675C12.3201 15.5021 10.7834 14.2461 9 14.2461C7.21659 14.2461 5.67989 15.5021 5.325 17.2499H1.5V18.7499ZM6.75 17.9999C6.75 16.7572 7.75736 15.7499 9 15.7499C10.2426 15.7499 11.25 16.7572 11.25 17.9999C11.25 19.2425 10.2426 20.2499 9 20.2499C7.75736 20.2499 6.75 19.2425 6.75 17.9999Z"
                fill="#001133"
                fillOpacity="0.6"
              />
            </svg>
          ) : this.props.theme === "xe" ? (
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fill-rule="evenodd"
                clip-rule="evenodd"
                d="M22.5 5.24985H18.675C18.3201 3.50211 16.7834 2.24609 15 2.24609C13.2166 2.24609 11.6799 3.50211 11.325 5.24985H1.5V6.74985H11.325C11.6799 8.4976 13.2166 9.75361 15 9.75361C16.7834 9.75361 18.3201 8.4976 18.675 6.74985H22.5V5.24985ZM1.5 18.7499H5.325C5.67989 20.4976 7.21659 21.7536 9 21.7536C10.7834 21.7536 12.3201 20.4976 12.675 18.7499H22.5V17.2499H12.675C12.3201 15.5021 10.7834 14.2461 9 14.2461C7.21659 14.2461 5.67989 15.5021 5.325 17.2499H1.5V18.7499Z"
                fill="rgba(0, 113, 235, 1)"
              ></path>
            </svg>
          ) : (
            <svg
              ref={this.filter}
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M22.5 5.24985H18.675C18.3201 3.50211 16.7834 2.24609 15 2.24609C13.2166 2.24609 11.6799 3.50211 11.325 5.24985H1.5V6.74985H11.325C11.6799 8.4976 13.2166 9.75361 15 9.75361C16.7834 9.75361 18.3201 8.4976 18.675 6.74985H22.5V5.24985ZM1.5 18.7499H5.325C5.67989 20.4976 7.21659 21.7536 9 21.7536C10.7834 21.7536 12.3201 20.4976 12.675 18.7499H22.5V17.2499H12.675C12.3201 15.5021 10.7834 14.2461 9 14.2461C7.21659 14.2461 5.67989 15.5021 5.325 17.2499H1.5V18.7499Z"
                fill="#FF6100"
              />
            </svg>
          )}
        </span>
      </div>
    );
  }

  openFilter() {
    if (this.props.onClick != undefined) this.props.onClick();
  }

  enterkey(e) {
    if (e.keyCode == 13) {
      document.activeElement.blur();
      return false;
    }
  }
}

const RiaMap = {
  Maps,
  InputGeoCoder,
};

export default RiaMap;
