/* eslint-disable no-tabs */
import React, {
  useCallback, useEffect, useRef, useState,
} from 'react';
import ReactDOM from 'react-dom';
import {
  MapContainer, TileLayer, useMap,
} from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import styled from 'styled-components';

const MyComponent = () => {
  const map = useMap();
  const options = {
    enableHighAccuracy: true,
    timeout: 2000,
    maximumAge: 2000,
  };

  function success(pos) {
    const crd = pos.coords;
    map.flyTo({ lat: crd.latitude, lng: crd.longitude });

    console.log('Your current position is:');
    console.log(`Latitude : ${crd.latitude}`);
    console.log(`Longitude: ${crd.longitude}`);
    console.log(`More or less ${crd.accuracy} meters.`);
  }

  function error(err) {
    console.warn(`ERROR(${err.code}): ${err.message}`);
  }
  const onClick = () => {
    console.log('click');

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
  return (
    <StyledContainer center={[59, 0]} zoom={13} scrollWheelZoom={false}>
      <MyComponent />
      <TileLayer
        attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
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

export default Example;

if (document.getElementById('example')) {
  ReactDOM.render(<Example />, document.getElementById('example'));
}