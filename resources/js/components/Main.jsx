/* eslint-disable no-tabs */
import React, {
  useCallback, useEffect, useRef, useState,
} from 'react';
import ReactStars from 'react-rating-stars-component';

import Leaflet, { divIcon } from 'leaflet';
import ReactDOM from 'react-dom';
import {
  MapContainer, Polyline, TileLayer, useMap, Marker, Circle, Popup,
} from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import styled from 'styled-components';
import polyline from '@mapbox/polyline';
import { renderToStaticMarkup } from 'react-dom/server';
import axios from 'axios';
import FileModal from './FileModal';
import LocationButton from './LocationButton';
import {
  ACCESS_TOKEN_KEY, exploreSegments, getAuthenticatedAthlete, getSegmentEfforts, REFRESH_TOKEN_KEY,
} from '../services/strava';

function getQueryStringValue(key) {
  return decodeURIComponent(window.location.search.replace(new RegExp(`^(?:.*[&\\?]${encodeURIComponent(key).replace(/[\.\+\*]/g, '\\$&')}(?:\\=([^&]*))?)?.*$`, 'i'), '$1'));
}
function Main() {
  const [location, setLocation] = useState({
    lat: 52.370216,
    lng: 4.895168,
    locationReceived: false,
  });

  const [segments, setSegments] = useState([]);
  const [map, setMap] = useState();
  const [rating, setSelectedSegmentRating] = useState();
  const [authenticatedAthlete, setAuthenticatedAthlete] = useState();
  const [segmentEfforts, setSegmentEfforts] = useState({});
  const [selectedSegment, setSelectedSegment] = useState({});
  const [radius, setRadius] = useState(5 * 1000);
  useEffect(async () => {
    if (location.lat && location.lng && location.locationReceived) {
      map?.m?.flyTo({ lat: location.lat, lng: location.lng });
    }
  }, [location, exploreSegments, setSegments, radius]);

  const onMarkerClick = async (segment) => {
    const segmentRating = await axios.get(`/api/rating?segmentId=${segment.id}&athleteId=${authenticatedAthlete.id}`).then((res) => res.data);
    setSegmentEfforts(await getSegmentEfforts(segment.id));
    setSelectedSegmentRating(segmentRating);
    setSelectedSegment(segment);
  };

  useEffect(async () => {
    const code = getQueryStringValue('code');
    if (code) {
      const body = {
        client_id: process.env.MIX_STRAVA_CLIENT_ID,
        client_secret: process.env.MIX_STRAVA_CLIENT_SECRET,
        code,
        grant_type: 'authorization_code',
      };

      const reauthorizeResponse = await axios.post('https://www.strava.com/oauth/token', body).then((response) => response.data).catch((err) => console.log(err));
      localStorage.setItem(REFRESH_TOKEN_KEY, reauthorizeResponse.refresh_token);
      localStorage.setItem(ACCESS_TOKEN_KEY, reauthorizeResponse.access_token);
    }
  }, [window.location.search]);

  useEffect(async () => {
    setAuthenticatedAthlete(await getAuthenticatedAthlete());
  }, []);

  useEffect(async () => {
    if (location.locationReceived) {
      setSegments(await exploreSegments(location.lat, location.lng, radius));
    }
  }, [location.locationReceived, radius, localStorage.getItem(REFRESH_TOKEN_KEY), localStorage.getItem(ACCESS_TOKEN_KEY)]);

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
  const ratingChanged = async (newRating) => {
    await axios.post(`/api/rating?segmentId=${selectedSegment.id}&athleteId=${authenticatedAthlete.id}&rating=${newRating}`).then((res) => setSelectedSegmentRating(res.data));
  };
  const [modalIsOpen, toggleModal] = useState(false);

  return (
    <>

      <StyledContainer
        style={{ height: '100vh' }}
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
                <h5>{segment.name}</h5>
                {rating && (
                <>

                  <ReactStars
                    count={5}
                    value={rating.user_rating}
                    onChange={ratingChanged}
                    size={24}
                    activeColor="#ffd700"
                  />
                  <span>
                    Avg:
                    {' '}
                    {parseFloat(rating?.avg_rating)?.toFixed(2)}
                    {' '}
                    (
                    {rating?.rating_count}
                    )
                  </span>
                </>
                )}
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

                <div>
                  <button
                    className="btn btn-secondary mt-2"
                    onClick={() => {
                      toggleModal(true);
                      console.log(modalIsOpen);
                      console.log('asdf');
                    }}
                  >
                    View images

                  </button>
                </div>
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

      <FileModal
        modalIsOpen={modalIsOpen}
        athlete={authenticatedAthlete}
        segment={selectedSegment}
        toggleModal={toggleModal}
      />

      <ConfigurationContainer className="container-sm">
        <div className="form-group">
          <label htmlFor="radius">
            Radius:
            {' '}
            {radius / 1000}
            km
            {' '}
          </label>
          <input onChange={(e) => handleRadiusChange(e)} type="range" step="5" value={radius / 1000} className="custom-range" min="5" max="100" id="customRange2" />
        </div>

        <LocationButton
          setLocation={setLocation}
          setHeading={setHeading}
        />
        <StyledExploreButton className="btn btn-primary" onClick={() => onExploreSegmentsClick()}>
          Explore segments
        </StyledExploreButton>
        <StyledConnectStravaButton
          className="btn btn-warning"
          onClick={
            () => { window.location.href = `https://www.strava.com/oauth/authorize?client_id=${process.env.MIX_STRAVA_CLIENT_ID}&redirect_uri=${process.env.MIX_APP_URL}&response_type=code&activity=read_all`; }
            }
        >
          Connect Strava
        </StyledConnectStravaButton>
      </ConfigurationContainer>
    </>
  );
}

const StyledExploreButton = styled.button`
    position: absolute;
    left: 0;
    bottom: 0;
`;

const StyledConnectStravaButton = styled.button`
    position: absolute;
    right: 0;
    bottom: 0;
`;

const StyledContainer = styled(MapContainer)`
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

export default Main;

if (document.getElementById('main')) {
  ReactDOM.render(<Main />, document.getElementById('main'));
}
