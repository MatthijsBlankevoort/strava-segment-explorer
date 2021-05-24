import React from 'react';

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

export default Location;
