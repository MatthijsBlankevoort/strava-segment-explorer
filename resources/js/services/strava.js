import axios from 'axios';
import CheapRuler from 'cheap-ruler';

const STRAVA_BASE_URL = 'https://www.strava.com/api/v3';
export const REFRESH_TOKEN_KEY = 'refresh_token_strava';
export const ACCESS_TOKEN_KEY = 'access_token_strava';

const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
const accessToken = localStorage.getItem(ACCESS_TOKEN_KEY);

export const refreshAccessToken = async (type) => {
  const body = {
    client_id: process.env.MIX_STRAVA_CLIENT_ID,
    client_secret: process.env.MIX_STRAVA_CLIENT_SECRET,
    refresh_token: refreshToken || '',
    grant_type: type,
  };

  const reauthorizeResponse = await axios.post('https://www.strava.com/oauth/token', body).then((response) => response.data).catch((err) => console.log(err));
  localStorage.setItem(ACCESS_TOKEN_KEY, reauthorizeResponse.access_token);
  return reauthorizeResponse;
};

export const exploreSegments = async (lat, lng, radius) => {
  const ruler = new CheapRuler(lat, 'meters');

  const bounds = ruler.bufferPoint([lat, lng], radius / 2);
  const segments = await axios.get(`${STRAVA_BASE_URL}/segments/explore?bounds=${bounds}&activity_type=riding`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  }).then((response) => response.data.segments).catch((err) => {
    if (err.response && err.response.status === 401) {
      return refreshAccessToken('refresh_token').then(async (response) => axios.get(`${STRAVA_BASE_URL}/segments/explore?bounds=${bounds}&activity_type=riding`, {
        headers: { Authorization: `Bearer ${response.access_token}` },
      })).then((response) => response.data.segments);
    }
  });
  return segments;
};

export const getSegmentEfforts = async (id) => {
  const segments = await axios.get(`${STRAVA_BASE_URL}/segments/${id}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  }).then((response) => response.data).catch((err) => {
    if (err.response && err.response.status === 401) {
      return refreshAccessToken('refresh_token').then(async (response) => axios.get(`${STRAVA_BASE_URL}/segments/${id}`, {
        headers: { Authorization: `Bearer ${response.access_token}` },
      }).then((res) => res.data));
    }
  });
  return segments;
};

export const getAuthenticatedAthlete = async () => {
  const athlete = await axios.get(`${STRAVA_BASE_URL}/athlete`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  }).then((response) => response.data).catch((err) => {
    if (err.response && err.response.status === 401) {
      return refreshAccessToken('refresh_token').then(async (response) => axios.get(`${STRAVA_BASE_URL}/athlete`, {
        headers: { Authorization: `Bearer ${response.access_token}` },
      }).then((res) => res.data));
    }
  });
  return athlete;
};
