/* eslint-disable no-tabs */
import React, {
  useCallback, useEffect, useRef, useState,
} from 'react';
import Leaflet, { divIcon } from 'leaflet';
import ReactDOM from 'react-dom';
import {
  MapContainer, Polyline, TileLayer, useMap, Marker, Circle,
} from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import styled from 'styled-components';
import polyline from '@mapbox/polyline';
import { renderToStaticMarkup } from 'react-dom/server';
import exploreSegments from '../services/strava';

const MyComponent = ({ setLocation }) => {
  const map = useMap();
  const options = {
    enableHighAccuracy: false,
    timeout: 5000,
    maximumAge: 2000,
  };

  function success(pos) {
    const crd = pos.coords;
    map.flyTo({ lat: crd.latitude, lng: crd.longitude, radius: crd.accuracy });
    setLocation({ lat: crd.latitude, lng: crd.longitude, radius: crd.accuracy });
    console.log('Your current position is:');
    console.log(`Latitude : ${crd.latitude}`);
    console.log(`Longitude: ${crd.longitude}`);
    console.log(`More or less ${crd.accuracy} meters.`);
  }

  function error(err) {
    console.warn(`ERROR(${err.code}): ${err.message}`);
  }
  const onClick = () => {
    if (navigator.geolocation) {
      navigator.geolocation.watchPosition(success, error, options);
    } else {
      alert('Sorry, your browser does not support geolocation services.');
    }
  };

  return (
    <StyledButton onClick={() => onClick()}>
      Get location
    </StyledButton>
  );
};
function Example() {
  const [location, setLocation] = useState({ lat: 53.0686489, lng: 4.824401, radius: 20 });
  const [segments, setSegments] = useState([]);
  useEffect(async () => {
    if (location.lat && location.lng) {
      setSegments(await exploreSegments(location.lat, location.lng));
    }
  }, [location, exploreSegments, setSegments]);

  const iconMarkup = renderToStaticMarkup(<StyledIcon className="fas fa-circle" />);
  const customMarkerIcon = divIcon({
    html: iconMarkup,
    className: 'user-icon',
  });

  return (
    <StyledContainer
      center={[location.lat ?? 0, location.lng ?? 0]}
      zoom={20}
      scrollWheelZoom={false}
    >
      <MyComponent setLocation={setLocation} />
      <TileLayer
        attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {segments?.map((segment) => (
        <Polyline positions={polyline.decode(segment.points)} />
      ))}
      {location.lat && location.lng && (
        <Marker icon={customMarkerIcon} position={[location.lat, location.lng]} />
      )}
      {location.lat && location.lng && (
      <Circle
        center={{ lat: location.lat, lng: location.lng }}
        color="orange"
        radius={location.radius}
      />
      )}
    </StyledContainer>
  );
}

const StyledContainer = styled(MapContainer)`
    height: 100vh;
    width: 100vw;
`;

const StyledButton = styled.button`
    position: absolute;
    top: 0;
    right: 0;
    z-index: 999;
`;

const StyledIcon = styled.i`
    color: orange;
`;
export default Example;

if (document.getElementById('example')) {
  ReactDOM.render(<Example />, document.getElementById('example'));
}
