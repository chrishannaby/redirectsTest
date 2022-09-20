/* eslint-disable */
import mapboxgl from "mapbox-gl";
import MapboxGeocoder from "@mapbox/mapbox-gl-geocoder";

class MapboxRia {
  constructor(container, opt = {}) {
    this.mapboxgl = mapboxgl;
    this.mapboxgl.accessToken = opt.accessToken || "";
    this.map = new this.mapboxgl.Map({
      container: container,
      style:
        opt.urlStyle ||
        "mapbox://styles/apiel-riafinancial/ck7oyreha010m1in8pq0rwz9u",
      zoom: Number.isInteger(opt.zoom) ? opt.zoom : 6,
      center: opt.center || [-9.1952226, 38.7436214],
    });
    this.bounds = new this.mapboxgl.LngLatBounds();
    this.allMarkers = [];
    this.zoomMarker = Number.isInteger(opt.zoomMarker) ? opt.zoomMarker : 16;
    this.classSelectMarker = isString(opt.classSelectMarker)
      ? opt.classSelectMarker
      : "select-marker-map";
    this.templateMarker = isString(opt.templateMarker)
      ? opt.templateMarker
      : "📌";
    this.handler = opt.handler != undefined ? opt.handler : () => {};
    this.userPos = opt.center || [-9.1952226, 38.7436214];
    let refresh = new ControlRefresh({ name: "Hola", callback: opt.research });
    this.map.addControl(refresh, "top-left");
  }

  userPosition() {
    return this.userPos;
  }

  setUserPosition(obj) {
    this.userPos = obj;
  }

  flyTo(e) {
    this.map.flyTo({
      center: [e.longitude, e.latitude],
      zoom: e.zoom || this.zoomMarker,
    });
    if (this.handler != undefined) this.handler(e);
  }

  initCenter(e) {
    this.map.flyTo({
      center: [e.longitude, e.latitude],
      zoom: e.zoom || this.zoomMarker,
    });
  }

  setTemplateMarker(template) {
    if (isString(template)) {
      this.templateMarker = template;
    }
  }

  setZoomMarker(zoom) {
    if (Number.isInteger(zoom)) this.zoomMarker = zoom;
  }

  geocoder(geo, container) {
    if (document.getElementById(container) != null && container) {
      geo.addTo("#" + container);
    } else {
      this.map.addControl(geo);
    }
  }

  fitBounds(
    bounds,
    opt = {
      maxZoom: 16,
      padding: { top: 50, bottom: 50, left: 50, right: 50 },
      speed: 8,
      easing(t) {
        return t * (2 - t);
      },
    }
  ) {
    this.map.fitBounds(bounds, opt);
  }

  on(event, callback) {
    this.map.on(event, callback);
  }

  viewMarker(data, opt = {}) {
    // this.allMarkers.map((m) => m._popup.remove())
    data = this.objectToJson(data);
    this.map.flyTo({ center: data.geometry.coordinates, ...opt });
    let mkr =
      this.allMarkers[
        this.allMarkers.findIndex(
          (e) => e.locationId == data.properties.locationId
        )
      ];

    this.selectMarker(mkr._id);
    // mkr.togglePopup()
    if (this.handler != undefined) this.handler(data);
  }

  addPositionMarker(marker) {
    const markerEl = document.createElement("div");
    markerEl.className = "position-marker";
    markerEl.innerHTML = `<svg width="104" height="104" viewBox="0 0 104 104" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g filter="url(#filter0_d)">
    <circle cx="52" cy="42" r="12" fill="#FBFDFA"/>
    <circle cx="52" cy="42" r="8" fill="#498BFB"/>
    </g>
    <defs>
    <filter id="filter0_d" x="0" y="0" width="104" height="104" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
    <feFlood flood-opacity="0" result="BackgroundImageFix"/>
    <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"/>
    <feOffset dy="10"/>
    <feGaussianBlur stdDeviation="20"/>
    <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0.0666667 0 0 0 0 0.2 0 0 0 0.15 0"/>
    <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow"/>
    <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow" result="shape"/>
    </filter>
    </defs>
    </svg>
    `;

    let mrk = new this.mapboxgl.Marker(markerEl, {});
    mrk.setLngLat(marker.geometry.coordinates);
    mrk.addTo(this.map);
  }

  addMarker(marker) {
    const popup = new this.mapboxgl.Popup({ offset: 2 })
      .setHTML(
        `<div class="marker-popup">
            <h4>${marker.properties.name}</h4>
            <span>${marker.properties.address}</span>
        </div>`
      )
      .setLngLat(marker.geometry.coordinates);
    const markerEl = document.createElement("div");
    markerEl.className = "marker-map";
    markerEl.innerHTML = this.templateMarker;
    let self = this;
    let _id = Math.random().toString(36).slice(-8);
    markerEl.addEventListener("click", function () {
      self.map.flyTo({
        center: marker.geometry.coordinates,
        zoom: self.zoomMarker,
      });

      self.selectMarker(_id);
      if (self.handler != undefined) self.handler(marker);
    });

    this.bounds.extend(marker.geometry.coordinates);

    let mrk = new this.mapboxgl.Marker(markerEl, { offset: [5, -5] });
    mrk.setLngLat(marker.geometry.coordinates);
    // mrk.setPopup(popup)
    mrk.addTo(this.map);
    mrk["_id"] = _id;
    mrk["locationId"] = marker.properties.locationId;
    this.allMarkers.push(mrk);
    return mrk;
  }

  arrayToGeoJSON(arrays) {
    var features = [];
    arrays.forEach(function (array) {
      const { latitude, longitude, ...rest } = array;
      var feature = {
        type: "Feature",
        properties: rest,
        geometry: {
          type: "Point",
          coordinates: [longitude, latitude],
        },
      };
      features.push(feature);
    });
    return {
      type: "FeatureCollection",
      features: features,
    };
  }

  objectToJson(obj) {
    const { latitude, longitude, ...rest } = obj;
    return {
      type: "Feature",
      properties: rest,
      geometry: {
        type: "Point",
        coordinates: [longitude, latitude],
      },
    };
  }

  markers(data) {
    let i = 0;
    var self = this;
    while (i < data.features.length) {
      self.addMarker(data.features[i]);
      i++;
    }
  }

  clearAllMarkers() {
    for (var i = this.allMarkers.length - 1; i >= 0; i--) {
      this.allMarkers[i].remove();
    }
  }

  moveByData(data) {
    this.clearAllMarkers();
    this.markers(data);
    let bounds = data.features.map((coords) => [
      coords.geometry.coordinates[0],
      coords.geometry.coordinates[1],
    ]);
    this.fitBounds(this.boundingBox(bounds));
  }

  moveByGeoJSON(data) {
    let arr1 = data.geometry.coordinates;
    let arr2 = [data.geometry.coordinates[0], data.geometry.coordinates[1] + 1];
    this.fitBounds([arr1, arr2]);
  }

  selectMarker(id) {
    let marker = this.allMarkers[this.allMarkers.findIndex((e) => e._id == id)];
    this.allMarkers.map((e) =>
      e._element.classList.remove(this.classSelectMarker)
    );
    marker._element.classList.add(this.classSelectMarker);
  }

  boundingBox(arr) {
    if (!Array.isArray(arr) || !arr.length) return undefined;

    let w, s, e, n;
    arr.forEach((point) => {
      if (w === undefined) {
        n = s = point[1];
        w = e = point[0];
      }

      if (point[1] > n) n = point[1];
      else if (point[1] < s) s = point[1];

      if (point[0] > e) e = point[0];
      else if (point[0] < w) w = point[0];
    });
    return [
      [w, s],
      [e, n],
    ];
  }
}

class GeoCoderRia {
  constructor(opt = {}) {
    this.options = {};
    this.options["accessToken"] = mapboxgl.accessToken;
    this.options["mapboxgl"] = mapboxgl;
    this.options["types"] =
      opt.type != undefined
        ? opt.type
        : "region, country, address, locality, place";
    var self = this;
    if (opt.localGeocoder != null || opt.localGeocoder != undefined)
      this.options["localGeocoder"] = this.forwardGeocoder;

    if (
      opt.templateCustomGeoCoder != null ||
      opt.templateCustomGeoCoder != undefined
    ) {
      this.options["s"] = function (item) {
        item["icon"] = item.properties.maki || "marker";
        return self.tmp(opt.templateCustomGeoCoder, item);
      };
    }

    this.geocoder = new MapboxGeocoder(this.options);
    return this.geocoder;
  }

  on(event, callback) {
    this.geocoder.on(event, callback);
  }

  forwardGeocoder(query) {
    var matchingFeatures = [];
    for (var i = 0; i < this.options.localGeocoder.features.length; i++) {
      var feature = this.options.localGeocoder.features[i];
      if (
        feature.properties.title.toLowerCase().search(query.toLowerCase()) !==
        -1
      ) {
        feature["place_name"] = feature.properties.title;
        feature["center"] = feature.geometry.coordinates;
        feature["place_type"] = ["park"];
        matchingFeatures.push(feature);
      }
    }
    return matchingFeatures;
  }

  // `
  //      <div style="padding:10px">
  //         <h2 style="color:#001133; opacity:.8;font-size:16px;line-height:24px;letter-spacing:0.15px;font-weight:400;font-family: 'Nunito Sans', sans-serif;padding:0;margin:0;">{{text}}</h2>
  //         <p style="color:#001133; opacity:.6;font-size:12px;line-height:16px;letter-spacing:0.25px;font-family: 'Nunito Sans', sans-serif;font-weight:600;padding:0;margin:0;">{{place_name}}</p>
  //      </div>
  //     `

  tmp(template, data) {
    const pattern = /{{\s*(\w+?)\s*}}/g;
    return template.replace(pattern, (_, token) => data[token] || "");
  }
}

const isString = (str) => (typeof str === "string" ? true : false);

class ControlRefresh {
  constructor({ template = "Search this area", callback = null }) {
    this.template = template;
    this.callback = callback;
  }

  onAdd(map) {
    this.container = document.createElement("button");
    this.container.className = "btn-refresh";
    this.container.type = "button";
    this.container["aria-label"] = this.template;
    this.container.innerHTML = `<svg width="19" height="18" viewBox="0 0 19 18" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path fill-rule="evenodd" clip-rule="evenodd" d="M10.625 15.75C14.3529 15.75 17.375 12.7279 17.375 9C17.375 5.27208 14.3529 2.25 10.625 2.25C6.89708 2.25 3.875 5.27208 3.875 9V12.4875L1.85 10.4625L1.0625 11.25L4.4375 14.625L7.8125 11.25L7.025 10.4625L5 12.4875V9C5 5.8934 7.5184 3.375 10.625 3.375C13.7316 3.375 16.25 5.8934 16.25 9C16.25 12.1066 13.7316 14.625 10.625 14.625V15.75Z" fill="#001133" fill-opacity="0.6"/>
    </svg> <div class="search-this-area">${this.template}</div>`;
    var self = this;
    this.container.onclick = function () {
      if (self.callback != undefined) self.callback(map.getCenter());
    };

    this._container = document.createElement("div");
    this._container.className = "mapboxgl-ctrl";
    this._container.appendChild(this.container);
    return this._container;
  }

  onRemove() {
    setTimeout(() => {
      this.container.parentNode.removeChild(this.container);
      this.map = undefined;
    }, 100);
  }
}

export const Map = MapboxRia;
export const GeoCoder = GeoCoderRia;
