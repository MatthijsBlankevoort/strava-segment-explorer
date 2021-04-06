import axios from 'axios';
import CheapRuler from 'cheap-ruler';

const STRAVA_BASE_URL = 'https://www.strava.com/api/v3';

export const refreshAccessToken = async (type) => {
  const body = {
    client_id: process.env.MIX_STRAVA_CLIENT_ID,
    client_secret: process.env.MIX_STRAVA_CLIENT_SECRET,
    refresh_token: localStorage.getItem('refresh_token_strava') || '',
    grant_type: type,
  };

  const reauthorizeResponse = await axios.post('https://www.strava.com/oauth/token', body).then((response) => response.data).catch((err) => console.log(err));

  return reauthorizeResponse;
};

export const exploreSegments = async (lat, lng, radius) => {
  const ruler = new CheapRuler(53.0686472, 'meters');

  const bounds = ruler.bufferPoint([lat, lng], radius / 2);
  const segments = await axios.get(`${STRAVA_BASE_URL}/segments/explore?bounds=${bounds}&activity_type=riding`, {
    headers: { Authorization: `Bearer ${process.env.MIX_STRAVA_API_KEY}` },
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
    headers: { Authorization: `Bearer ${process.env.MIX_STRAVA_API_KEY}` },
  }).then((response) => response.data).catch((err) => {
    if (err.response && err.response.status === 401) {
      return refreshAccessToken('refresh_token').then(async (response) => axios.get(`${STRAVA_BASE_URL}/segments/${id}`, {
        headers: { Authorization: `Bearer ${response.access_token}` },
      }).then((res) => res.data));
    }
  });
  return segments;
};
