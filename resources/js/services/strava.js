import axios from 'axios';
import CheapRuler from 'cheap-ruler';
import { SEGMENT_EXPLORE_RADIUS } from '../components/Example';

const STRAVA_BASE_URL = 'https://www.strava.com/api/v3';

export const exploreSegments = async (lat, lng) => {
  const ruler = new CheapRuler(53.0686472, 'meters');

  const bounds = ruler.bufferPoint([lat, lng], SEGMENT_EXPLORE_RADIUS);
  const segments = await axios.get(`${STRAVA_BASE_URL}/segments/explore?bounds=${bounds}&activity_type=riding`, {
    headers: { Authorization: `Bearer ${process.env.MIX_STRAVA_API_KEY}` },
  }).then((response) => response.data.segments);
  return segments;
};

export const getSegmentEfforts = async (id) => {
  const segments = await axios.get(`${STRAVA_BASE_URL}/segments/${id}`, {
    headers: { Authorization: `Bearer ${process.env.MIX_STRAVA_API_KEY}` },
  }).then((response) => response.data);
  return segments;
};
