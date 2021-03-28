/* eslint-disable no-tabs */
import React, {
  useCallback, useEffect, useRef, useState,
} from 'react';
import Leaflet, { divIcon } from 'leaflet';
import ReactDOM from 'react-dom';
import {
  MapContainer, Polyline, TileLayer, useMap, Marker, Circle, Popup,
} from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import styled from 'styled-components';
import polyline from '@mapbox/polyline';
import { renderToStaticMarkup } from 'react-dom/server';
import { exploreSegments, getSegmentEfforts } from '../services/strava';

export const SEGMENT_EXPLORE_RADIUS = 10000;
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
  const [segmentEfforts, setSegmentEfforts] = useState({});

  useEffect(async () => {
    if (location.lat && location.lng) {
      setSegments(await exploreSegments(location.lat, location.lng));
    }
  }, [location, exploreSegments, setSegments]);

  const onMarkerClick = async (segment) => {
    setSegmentEfforts(await getSegmentEfforts(segment.id));
  };
  const iconMarkup = renderToStaticMarkup(
    <UserIconContainer id="user-icon">
      <StyledIcon className="fas fa-angle-up" />
      <StyledIcon className="fas fa-circle" />
    </UserIconContainer>,
  );

  const segmentIconMarkup = renderToStaticMarkup(<StyledIcon className="fas fa-map-marker-alt" />);
  const customMarkerIcon = divIcon({
    html: iconMarkup,
    className: 'user-icon',
  });

  const segmentMarker = divIcon({
    html: segmentIconMarkup,
    className: 'segment-icon',
  });

  const getTimeInMinutes = (timeInSeconds) => {
    const minutes = Math.floor(timeInSeconds / 60);
    let seconds = (timeInSeconds - minutes * 60);
    if (seconds < 10) {
      seconds = `0${seconds}`;
    }
    if (timeInSeconds < 60) {
      return `${seconds}s`;
    }
    return `${minutes}:${seconds}`;
  };

  return (
    <StyledContainer
      center={[location.lat ?? 0, location.lng ?? 0]}
      zoom={13}
      scrollWheelZoom={false}
    >
      <MyComponent setLocation={setLocation} />
      <TileLayer
        attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
        url="https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png"

      />
      {segments?.map((segment) => (
        <>

          <Polyline color="orange" positions={polyline.decode(segment.points)} />
          <Marker
            key={segment.id}
            eventHandlers={{ click: () => onMarkerClick(segment) }}
            icon={segmentMarker}
            position={segment.start_latlng}
          >
            <Popup>
              <h3>{segment.name}</h3>
              <p>
                Afstand:
                {' '}
                <strong>
                  {(segment.distance / 1000).toFixed(2)}
                  {' '}
                  km
                </strong>
              </p>

              <p>
                Persoonlijk Record (PR):
                {' '}
                {getTimeInMinutes(segmentEfforts?.athlete_segment_stats?.pr_elapsed_time)}
                <strong />
              </p>

              <p>
                Snelste tijd (KOM):
                {' '}
                {segmentEfforts?.xoms?.kom}
                <strong />
              </p>

              <p>
                Pogingen:
                {' '}
                {segmentEfforts?.athlete_segment_stats?.effort_count}
              </p>

            </Popup>
          </Marker>
        </>
      ))}
      {location.lat && location.lng && (
        <Marker icon={customMarkerIcon} position={[location.lat, location.lng]} />
      )}
      {location.lat && location.lng && (
      <Circle
        center={{ lat: location.lat, lng: location.lng }}
        color="dodgerblue"
        radius={SEGMENT_EXPLORE_RADIUS * 2}
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
    &.fa-map-marker-alt {
        color: orange;
        font-size: 1.5rem;
        position: absolute;
        right: 0;
        bottom: 0;
    }

    &.fa-circle, &.fa-angle-up {
        color: dodgerblue;
        position: relative;
    }

`;

const UserIconContainer = styled.div`
    display: flex;
    flex-flow: column;
    justify-content: space-between;
    align-items: center;
`;

export default Example;

if (document.getElementById('example')) {
  ReactDOM.render(<Example />, document.getElementById('example'));
}
