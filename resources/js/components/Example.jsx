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

const Location = ({ setLocation, setHeading, map }) => {
  const options = {
    enableHighAccuracy: false,
    timeout: 5000,
    maximumAge: 2000,
  };

  function success(pos) {
    const crd = pos.coords;
    setLocation({ lat: crd.latitude, lng: crd.longitude, locationReceived: true });
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

    DeviceOrientationEvent.requestPermission().then((result) => {
      if (result === 'granted') {
        window.addEventListener('deviceorientation', (evt) => {
          let compassdir;

          if (evt.webkitCompassHeading) {
            // Apple works only with this, alpha doesn't work
            compassdir = evt.webkitCompassHeading;
          } else compassdir = evt.alpha;
          setHeading(compassdir);
        }, false);
      }
    });
  };

  return (
    <button className="btn btn-secondary" onClick={() => onClick()}>
      Get location
    </button>
  );
};

function Example() {
  const [location, setLocation] = useState({
    lat: 52.370216,
    lng: 4.895168,
    locationReceived: false,
  });

  const [segments, setSegments] = useState([]);
  const [map, setMap] = useState();
  const [segmentEfforts, setSegmentEfforts] = useState({});
  const [radius, setRadius] = useState(5 * 1000);
  useEffect(async () => {
    if (location.lat && location.lng && location.locationReceived) {
      map?.m?.flyTo({ lat: location.lat, lng: location.lng });
    }
  }, [location, exploreSegments, setSegments, radius]);

  const onMarkerClick = async (segment) => {
    setSegmentEfforts(await getSegmentEfforts(segment.id));
  };

  useEffect(async () => {
    if (location.locationReceived) {
      setSegments(await exploreSegments(location.lat, location.lng, radius));
    }
  }, [location.locationReceived, radius]);
  const [heading, setHeading] = useState(0);
  const iconMarkup = renderToStaticMarkup(
    <UserIconContainer rotation={heading} id="user-icon">
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

  const onExploreSegmentsClick = async () => {
    if (location.lat && location.lng && location.locationReceived) {
      map?.m?.flyTo({ lat: location.lat, lng: location.lng });
      setSegments(await exploreSegments(location.lat, location.lng, radius));
    }
  };

  const handleRadiusChange = async (e) => {
    setRadius(e.target.value * 1000);
  };

  return (
    <>

      <StyledContainer
        center={[location.lat ?? 0, location.lng ?? 0]}
        zoom={12}
        scrollWheelZoom={false}
        whenCreated={(m) => setMap({ m })}
      >
        <TileLayer
          attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
          url={`https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png?api_key=${process.env.MIX_STADIA_MAPS_API_KEY}`}
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
                  <strong>
                    {getTimeInMinutes(segmentEfforts?.athlete_segment_stats?.pr_elapsed_time)}
                  </strong>
                </p>

                <p>
                  Snelste tijd (KOM):
                  {' '}
                  <strong>
                    {segmentEfforts?.xoms?.kom}
                  </strong>
                </p>

                <p>
                  Pogingen:
                  {' '}
                  <strong>

                    {segmentEfforts?.athlete_segment_stats?.effort_count}
                  </strong>
                </p>

              </Popup>
            </Marker>
          </>
        ))}
        {location.lat && location.lng && (
          <Marker icon={customMarkerIcon} position={[location.lat, location.lng]} />
        )}
        {location.lat && location.lng && radius && (
          <Circle
            center={{ lat: location.lat, lng: location.lng }}
            color="dodgerblue"
            radius={radius}
          />
        )}
      </StyledContainer>
      <ConfigurationContainer className="container-sm">
        <div className="form-group">
          <label htmlFor="radius">
            Radius:
            {' '}
            {radius / 1000}
            km
            {' '}
          </label>
          <input onMouseUp={(e) => handleRadiusChange(e)} type="range" step="5" value={radius / 1000} className="custom-range" min="5" max="100" id="customRange2" />
        </div>

        <Location
          setLocation={setLocation}
          setHeading={setHeading}
        />
        <StyledExploreButton className="btn btn-primary" onClick={() => onExploreSegmentsClick()}>
          Explore segments
        </StyledExploreButton>
      </ConfigurationContainer>
    </>
  );
}

const StyledExploreButton = styled.button`
    position: absolute;
    right: 0;
    top: 0;
`;

const StyledContainer = styled(MapContainer)`
    height: 100vh;
    width: 100vw;
`;

const ConfigurationContainer = styled.div`
    background: white;
    position: absolute;
    height: 200px;
    z-index: 999;
    margin-left: auto;
    margin-right: auto;
    bottom: 0;
    display: flex;
    flex-flow: column;
    align-items: center;
    justify-content: center;

    left: 0;
    right: 0;
    margin-left: auto;
    margin-right: auto;
    padding-bottom: 80px;
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
    ${(props) => ` transform: rotate(${props.rotation}deg);`}


    display: flex;
    flex-flow: column;
    justify-content: center;
    align-items: center;
`;

export default Example;

if (document.getElementById('example')) {
  ReactDOM.render(<Example />, document.getElementById('example'));
}
