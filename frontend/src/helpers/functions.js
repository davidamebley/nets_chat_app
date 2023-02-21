const getCurrentLocation = () =>{
  let location = 'Unknown location';
    if (navigator.geolocation) {
        // Get the user's current position
        navigator.geolocation.getCurrentPosition((position) => {
          const { latitude, longitude } = position.coords;
          console.log(`Latitude: ${latitude}, Longitude: ${longitude}`);
          location = `${latitude}, ${longitude}`;
        }, (error) => {
          switch (error.code) {
            case error.PERMISSION_DENIED:
              console.error("User denied the request for Geolocation.");
              break;
            case error.POSITION_UNAVAILABLE:
              console.error("Location information is unavailable.");
              break;
            case error.TIMEOUT:
              console.error("The request to get user location timed out.");
              break;
            case error.UNKNOWN_ERROR:
              console.error("An unknown error occurred.");
              break;
            default:
              console.error("An unknown error occurred.");
          }
        });
      } else {
        console.error("Geolocation is not supported by this browser.");
      }
      return location;
}

export {getCurrentLocation}