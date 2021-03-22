import axios from 'axios';
import { getBounds } from 'geolib';
import CheapRuler from 'cheap-ruler';

const STRAVA_BASE_URL = 'https://www.strava.com/api/v3';

const exploreSegments = async (lat, lng) => {
  const ruler = new CheapRuler(53.0686472, 'meters');

  const bounds = ruler.bufferPoint([lat, lng], 10000);
  console.log(bounds);
  const segments = await axios.get(`${STRAVA_BASE_URL}/segments/explore?bounds=${bounds}&activity_type=riding`, {
    headers: { Authorization: `Bearer ${process.env.MIX_STRAVA_API_KEY}` },
  }).then((response) => {
    console.log(response);
  });
};

export default exploreSegments;
