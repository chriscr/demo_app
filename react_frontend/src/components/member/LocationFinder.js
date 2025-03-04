import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import AxiosApiClient from '../utils/AxiosApiClient';
import AuthUtility from '../frontend/auth/AuthUtility';
import LoadingSpinner from '../frontend/LoadingSpinner';

import { GoogleMap, LoadScript, Marker, InfoWindow, OverlayView } from '@react-google-maps/api';

//import './Search.css';

import swal from 'sweetalert';

import location_icon from '../../assets/frontend/images/location_icon.png';
import search_icon from '../../assets/frontend/images/search_icon.png';
import copy_link_icon from '../../assets/frontend/images/copy_link_icon.png';
import facebook_icon from '../../assets/frontend/images/facebook_icon.png';
import whats_app_icon from '../../assets/frontend/images/whats_app_icon.png';
import email_icon from '../../assets/frontend/images/email_icon.png';

const error_style = 'font-source-sans font-size-12 font-weight-500 txt-000 bg-light-red p-5';

const libraries = ["places"];

const containerStyle = {
  width: '100%',
  height: '500px'
};

const centerCR = {
  lat: 37.319070,
  lng: -121.923430
};

const typeMapping = {
  cafe: "cafe",
  airport: "airport",
  library: "library",
  museum: "museum",
  park: "park",
  lodging: "hotel",
  night_club: "lounge",
  bar: "lounge",
  food: "food",
  restaurant: "food",
  bakery: "food",
};

const LocationFinder = () => {

  const navHistory = useNavigate();

  //initial call for saved list
  const auth_api = 'phpLaravel';
  if (localStorage.getItem('auth_api') && localStorage.getItem('auth_api') !== '') {
    auth_api = localStorage.getItem('auth_api');
  }

  const [isLoading, setIsLoading] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [isGoogleMapsLoaded, setIsGoogleMapsLoaded] = useState(false);
  const [map, setMap] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [userLocationError, setUserLocationError] = useState(null);
  const [places, setPlaces] = useState([]);
  const [selectedPlace, setSelectedPlace] = useState(null);
  const searchInputRef = useRef(null);
  const [savedLists, setSavedLists] = useState([]);
  const [saveLocationInput, setSaveLocationInput] = useState({
    wifi_speed: '',
    noise_level: '',
    free_internet: '',
    details: '',
    saved_list_random_id: '',

    errorList: [],
    errorStyle: [],
  });

  useEffect(() => {
    if (!AuthUtility.isLoggedIn()) {
      //user not authenticated on server so remove from local storage
      AuthUtility.clearAuthData();
      navHistory('/');
    }

		setIsLoading(true);

    if (isMounted) {
      console.log('LocationFiner.useEffect: mounted');

      const fetchApiDataSavedLists = async () => {
        try {
          const { apiClient, getBearerToken, makeRequestWithHeaders } = AxiosApiClient({ apiBackend: auth_api, token: localStorage.getItem('auth_token') });
          await getBearerToken();
          const response = await makeRequestWithHeaders('get', '/api/read_saved_lists', null, {});

          setApiDataSavedLists(response, "LocationFinder.useEffect");
        } catch (error) {
          handleApiErrorSavedLists(error, "LocationFinder.useEffect");
        }
      };

      fetchApiDataSavedLists();

      setTimeout(() => {

        loadGoogleMaps();

        setUserLocation({ lat: centerCR.lat, lng: centerCR.lng }); //temporary until we figure out the navigator geolocation

        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              setUserLocation({ lat: position.coords.latitude, lng: position.coords.longitude });
            },
            (err) => setUserLocationError(err.message)
          );
        } else {
          console.log("LocationFinder.useEffect: Geolocation is not supported by this browser.");
          console.log("LocationFinder.useEffect: Using alternative geolocation (" + centerCR.lat + ", " + centerCR.lng + ")");

          setUserLocationError("LocationFinder.useEffect: Geolocation is not supported by this browser.");
          setUserLocation({ lat: centerCR.lat, lng: centerCR.lng }); //temporary until we figure out the navigator geolocation
        }

      }, "500");

    } else {
      setIsMounted(true);
    }
    return () => {
      unloadGoogleMaps();
    };
  }, [isMounted]);

  function setApiDataSavedLists(response, theFunction) {
    if (response && response.data) {
      if (response.data.status === 200) {//HTTP_OK
        console.log(theFunction + ': ', response.data.message);

        //set data
        if (response.data.saved_lists) {
          setSavedLists(response.data.saved_lists);
        }

      } else if (response.data.status === 401) {//HTTP_UNAUTHORIZED
        console.log(theFunction + ' error: ', response.data.message + ' back-end api call error');

        //user not authenticated on server so remove from local storage
        AuthUtility.clearAuthData();
        swal("Warning", response.data.message, "warning");
        navHistory('/login');
      } else if (response.data.status === 800) {//HTTP_FORM_VALIDATION_FAILED
        console.log(theFunction + ': ', response.data.message + ' HTTP_FORM_VALIDATION_FAILED');
      } else {//more errors
      }
    }
		setIsLoading(false);
  }

  function handleApiErrorSavedLists(error, theFunction) {
    console.log(theFunction + ' error: ', error + ' back-end api call error');

    //user not authenticated on server so remove from local storage
    AuthUtility.clearAuthData();
    setIsLoading(false);
    swal("Error", error, "error");
  }

  const loadGoogleMaps = () => {

    if (!window.google) {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyAMPJ8NFRAnAV2vU2R2jjS0kapoOK41-f4&libraries=${libraries.join(',')}`;
      script.defer = true;
      script.async = true;
      script.onload = () => {
        setIsGoogleMapsLoaded(true);
      };
      document.head.appendChild(script);
    } else {
      setIsGoogleMapsLoaded(true);
    }
  };

  const unloadGoogleMaps = () => {
    // Cleanup code to remove the Google Maps API script
    const scripts = document.getElementsByTagName('script');
    for (let i = scripts.length - 1; i >= 0; i--) {
      if (scripts[i].src.includes('maps.googleapis.com')) {
        scripts[i].parentNode.removeChild(scripts[i]);
      }
    }
    setIsGoogleMapsLoaded(false);
  };

  const haversineDistance = (lat1, lon1, lat2, lon2) => {
    const toRad = angle => (angle * Math.PI) / 180;
    const R = 6371;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const onLoad = mapInstance => {
    setMap(mapInstance);
  };

  const handlePlaceSelect = () => {
    const autocomplete = new window.google.maps.places.Autocomplete(searchInputRef.current);
    autocomplete.addListener("place_changed", () => {
      const place = autocomplete.getPlace();
      if (place.geometry) {
        const location = place.geometry.location;
        const placePosition = { lat: location.lat(), lng: location.lng() };
        map.panTo(placePosition);

        const customTypes = [...new Set(place.types
          .filter(type => typeMapping[type])
          .map(type => typeMapping[type])
        )];

        const photos = place.photos
          .map(photo => (photo.getUrl ? photo.getUrl({ maxWidth: 400 }) : null))
          .filter(url => url !== null);

        const distanceFromUser = haversineDistance(userLocation.lat, userLocation.lng, placePosition.lat, placePosition.lng);

        const placeSelected = {
          name: place.name,
          address: place.formatted_address,
          phone_number: place.formatted_phone_number,
          photos: photos || [],
          reviews: place.reviews || [],
          types: place.types || [],
          customTypes,
          rating: place.rating,
          website: place.website,
          opening_hours: place.opening_hours,
          open_now: place.current_opening_hours ? place.current_opening_hours.open_now : false,
          position: placePosition,
          distance_from_user: distanceFromUser,
          place_id: place.place_id,
          isChosen: true,
          isSaving: false //needed to display for saving this place
        };

        setPlaces([placeSelected]);
        setSelectedPlace(placeSelected);
      }
    });
  };

  const handleGenericSearch = () => {
    const query = searchInputRef.current.value;
    const service = new window.google.maps.places.PlacesService(map);

    const request = {
      query,
      location: userLocation,
      radius: '8000'
    };

    service.textSearch(request, (results, status) => {
      if (status === window.google.maps.places.PlacesServiceStatus.OK) {
        const places = results.map(result => ({
          name: result.name,
          address: result.formatted_address,
          phone_number: result.formatted_phone_number || null,
          photos: result.photos.map(photo => (photo.getUrl ? photo.getUrl({ maxWidth: 400 }) : null)).filter(url => url !== null) || [],
          reviews: result.reviews || [],
          types: result.types || [],
          customTypes: [...new Set(result.types.filter(type => typeMapping[type]).map(type => typeMapping[type]))],
          rating: result.rating,
          website: result.website || null,
          opening_hours: result.opening_hours,
          open_now: result.opening_hours ? result.opening_hours.open_now : false,
          position: { lat: result.geometry.location.lat(), lng: result.geometry.location.lng() },
          distance_from_user: haversineDistance(userLocation.lat, userLocation.lng, result.geometry.location.lat(), result.geometry.location.lng()),
          place_id: result.place_id,
          isChosen: false,
          isSaving: false //needed for saving this location
        }));
        const sortedPlaces = [...places].sort((a, b) => a.distance_from_user - b.distance_from_user);
        setPlaces(sortedPlaces);
        setSelectedPlace(null);
      }
    });
  };

  const handleChoosePlace = (chosenPlace) => {
    setPlaces(prevPlaces =>
      prevPlaces.map(place => ({
        ...place,
        isChosen: place.place_id === chosenPlace.place_id
      }))
    );

    chosenPlace.isChosen = true;

    setSelectedPlace(chosenPlace);
  };

  const handleDirections = (address) => {
    if (address) {
      window.open(`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`, '_blank');
    }
  };

  const handleCall = (phoneNumber) => {
    if (phoneNumber) {
      window.location.href = `tel:${phoneNumber}`;
    }
  };

  const handleWebsite = (website) => {
    if (website) {
      window.open(website, '_blank');
    }
  };

  const handleKeyPress = event => {
    if (event.key === 'Enter') {
      event.preventDefault();
      const query = searchInputRef.current.value;
      if (query) {
        const autocomplete = new window.google.maps.places.Autocomplete(searchInputRef.current);
        if (autocomplete.getPlace()) {
          handlePlaceSelect();
        } else {
          handleGenericSearch();
        }
      }
      if (searchInputRef.current) {
        searchInputRef.current.blur();
      }
    }
  };

  const handleCheckIn = (event, place) => {
    event.preventDefault();

    if (AuthUtility.isLoggedIn()) {
      swal("Info", "Check Ins coming soon.", "info");
    } else {
      swal("Warning", "You must be signed in to Check In " + place.name, "warning");
    }
  };

  const handleSave = (event, place_to_save) => {
    event.preventDefault();

    if (AuthUtility.isLoggedIn()) {
      //swal("Info", "Save coming soon.", "info");

      if (!place_to_save.isSaving) {
        setPlaces(prevPlaces =>
          prevPlaces.map(place => ({
            ...place,
            isSaving: place_to_save.place_id === place.place_id
          }))
        );

        place_to_save.isSaving = true;

        handleChoosePlace(place_to_save);
      } else {
        setPlaces(prevPlaces =>
          prevPlaces.map(place => ({
            ...place,
            isSaving: place_to_save.place_id === place.place_id ? false : place.isSaving
          }))
        );
      }
    } else {
      swal("Warning", "You must be signed in to Save " + place_to_save.name, "warning");
    }
  };

  const handleOpenShareView = (event, place) => {
    event.preventDefault();

    const shareContent = `
      <div class="font-source-sans font-size-20 font-weight-400 text-center">${place.name}</div>
      <div class="font-source-sans font-size-16l-14s font-weight-400 text-center ptb-20">${place.address}</div>
      <div class="share-buttons text-center">
        <button class="swal-button swal-button--confirm no-color" onclick="copyToClipboard('${place.name + ', ' + place.address}')"><img src="${copy_link_icon}" width="50"><br>Copy Link</button>
        <button class="swal-button swal-button--confirm no-color" onclick="shareOnFacebook('${place.name + ', ' + place.address}')"><img src="${facebook_icon}" width="50"><br>Facebook</button>
        <button class="swal-button swal-button--confirm no-color" onclick="shareOnWhatsapp('${place.name + ', ' + place.address}')"><img src="${whats_app_icon}" width="50"><br>WhatsApp</button>
        <button class="swal-button swal-button--confirm no-color" onclick="sendEmail('${place.name + ', ' + place.address}')"><img src="${email_icon}" width="50"><br>Email</button>
      </div>
    `;

    swal({
      title: `Share Location`,
      content: {
        element: 'div',
        attributes: {
          innerHTML: shareContent
        }
      }
    });
  };

  // Define share functions globally so they can be called from SweetAlert
  window.copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      swal('Copied to clipboard!', text, 'success');
    });
  };

  window.shareOnFacebook = (text) => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(text)}`, '_blank');
  };

  window.shareOnInstagram = (text) => {
    swal('Instagram does not support direct sharing via URL. Please use the Instagram app.', '', 'info');
  };

  window.shareOnWhatsapp = (text) => {
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
  };

  window.sendEmail = (text) => {
    window.location.href = `mailto:?subject=FlexSpace%20-%20Check%20this%20location&body=${encodeURIComponent(text)}`;
  };

  const handleSaveLocationInput = (event) => {
    event.persist();

    if (event.target.name !== 'rememberMe') {
      setSaveLocationInput({ ...saveLocationInput, [event.target.name]: event.target.value });
    }

    //remove the target error message no matter the new input, it will be validated on the server
    if (saveLocationInput.errorList.hasOwnProperty(event.target.name)) {
      delete saveLocationInput.errorList[event.target.name];
      delete saveLocationInput.errorStyle[event.target.name];
    }
  }
  const saveLocation = (event) => {
    event.preventDefault();

    setIsLoading(true);

    //values sent to api
    const payload = {
      saved_location_name: selectedPlace.name,
      google_place_id: selectedPlace.place_id,
      address: selectedPlace.address,
      phone: selectedPlace.phone_number,

      wifi_speed: saveLocationInput.wifi_speed,
      noise_level: saveLocationInput.noise_level,
      free_internet: saveLocationInput.free_internet,
      details: saveLocationInput.details,
      saved_list_random_id: saveLocationInput.saved_list_random_id
    }

    const fetchApiDataSaveLocation = async () => {
      try {
        const { apiClient, getBearerToken, makeRequestWithHeaders } = AxiosApiClient({ apiBackend: auth_api, token: localStorage.getItem('auth_token') });
        await getBearerToken();
        const response = await makeRequestWithHeaders('post', '/api/save_location', payload, {});

        setApiDataSaveLocation(response, "LocationFinder.saveLocation");
      } catch (error) {
        handleApiErrorSaveLocation(error, "LocationFinder.saveLocation");
      }
    };

    fetchApiDataSaveLocation();

  }
  function setApiDataSaveLocation(response, theFunction) {
    if (response && response.data) {
      if (response.data.status === 200) {//HTTP_OK
        console.log(theFunction + ': ', response.data.message);

        setPlaces(prevPlaces =>
          prevPlaces.map(place => ({
            ...place,
            isSaving: response.data.save_location.google_place_id === place.place_id ? false : place.isSaving
          }))
        );

        setSaveLocationInput({ ...saveLocationInput, wifi_speed: '', noise_level: '', free_internet: '', details: '', saved_list_random_id: '', errorList: [], errorStyle: [] });

        swal("Info", response.data.message + ' - ' + response.data.saved_list_name, "info");

      } else if (response.data.status === 401) {//HTTP_UNAUTHORIZED
        console.log('loginSubmit error: ', response.data.message + ' back-end api call error');

        //user not authenticated on server so remove from local storage
        AuthUtility.clearAuthData();

        swal("Warning", response.data.message, "warning");

      } else if (response.data.status === 404 || response.data.status === 422) {//HTTP_NOT_FOUND or HTTP_UNPROCESSABLE_ENTITY
        console.log(theFunction + ' error: ', response.data.message + ' back-end api call error');

        //user not authenticated on server so remove from local storage
        AuthUtility.clearAuthData();
        swal("Warning", response.data.message, "warning");
        navHistory('/login');
      } else if (response.data.status === 800) {//HTTP_FORM_VALIDATION_FAILED
        console.log(theFunction + ': ', response.data.message + ' HTTP_FORM_VALIDATION_FAILED');

        var errorStyleTemp = JSON.parse(JSON.stringify(response.data.validation_errors));
        Object.keys(errorStyleTemp).map((key) => (
          errorStyleTemp[key] = error_style
        ));

        //validation errors mapped to input fields
        setSaveLocationInput({ ...saveLocationInput, errorList: response.data.validation_errors, errorStyle: errorStyleTemp });

      } else {//more errors
      }
    }

    setIsLoading(false);
  }
  function handleApiErrorSaveLocation(error, theFunction) {
    console.log(theFunction + ' error: ', error + ' back-end api call error');

    //user not authenticated on server so remove from local storage
    AuthUtility.clearAuthData();
    setIsLoading(false);
    swal("Error", error, "error");
  }

  return (
    <div className="body-content bg-fff pt-70l-110m-50s pb-40">

      <div className="panel large pt-20l-10s">
        <div className="grid-x">
          <div className="large-12 medium-12 small-12 cell text-left">
            <div className="font-source-sans font-size-20 font-weight-800 txt-dark-blue bb1-dark-blue uppercase pb-5">Location Finder</div>
          </div>
        </div>
      </div>

      <div className="panel large pt-10">
        <div className="grid-x">
          <div className="large-12 medium-12 small-12 cell">
            {isGoogleMapsLoaded && (
              <div className="map-container" style={{ position: 'relative', zIndex: 1 }}>
                <div className="horizontal-container float-right" style={{ position: 'absolute', top: '0', right: '0', zIndex: 2 }}>
                  <span className="right">
                    <input
                      className="tiny-medium"
                      ref={searchInputRef}
                      type="text"
                      placeholder="Search locations or address"
                      onFocus={handlePlaceSelect}
                      onKeyUp={handleKeyPress}
                    />
                  </span>
                  <span className="right pl-5">
                    <Link onClick={handleGenericSearch} className="button icon red"><img src={search_icon} width="25" alt="search" /></Link>
                  </span>
                </div>
                <GoogleMap
                  mapContainerClassName="map-container"
                  center={userLocation}
                  zoom={13}
                  onLoad={onLoad}
                  options={{
                    mapTypeControl: false,
                    fullscreenControl: false,
                    streetViewControl: false,
                    zoomControl: true,
                  }}
                >
                  {userLocation && (
                    <Marker
                      position={userLocation}
                      icon={{
                        url: 'http://maps.google.com/mapfiles/ms/icons/green-dot.png'
                      }}
                      label={{
                        text: "Your Location",
                        className: 'marker-label',
                      }}
                    />
                  )}
                  {places.map((place, index) => (
                    <Marker
                      key={index}
                      position={place.position}
                      icon={{
                        url: selectedPlace && selectedPlace.place_id === place.place_id && selectedPlace.isChosen
                          ? 'http://maps.google.com/mapfiles/ms/icons/red-dot.png'
                          : 'http://maps.google.com/mapfiles/ms/icons/yellow-dot.png'
                      }}
                    />
                  ))}
                </GoogleMap>
              </div>
            )}
            
					{isLoading &&
						<div className="large-12 medium-12 small-12 cell text-center">
							<LoadingSpinner paddingClass="p-20l-10s" />
									<div className="text-center p-20 b1-ccc bg-fafafa mt-20">
										<span className="font-source-sans font-size-16l-14s font-weight-600 txt-333">Data Provided by Google Maps API  Google Places API</span>
									</div>
						</div>
					}
          </div>
        </div>
      </div>
      {places.length > 0 && (
        <div className="panel large ">
          <div className="grid-x scrollable scrollable-500px">
            <div className="large-12 medium-12 small-12 cell">
              <div className="places-list">
                {places.map((place, index) => (
                  <div key={index} className={`place-item ${place.isChosen ? 'bg-eee b1-ccc p-10 mt-10' : 'b1-ccc p-10 mt-10'}`}>
                    <div className="horizontal-container">
                      {!place.isChosen ? (
                        <div className="left text-left pr-10">
                          <Link onClick={() => handleChoosePlace(place)} className="button icon red">
                            <img src={location_icon} className="" alt="view saved list" />
                          </Link>
                        </div>
                      ) : (
                        <div className="left text-left pr-10">
                          <Link className="button icon red">
                            <img src={location_icon} className="" alt="view saved list" />
                          </Link>
                        </div>
                      )}
                      <div className="left pr-20">
                        <div className="font-source-sans font-size-18 font-weight-600 text-left hide-for-small-only">{place.name}</div>
                        <div className="font-source-sans font-size-16 font-weight-600 text-left show-for-small-only">{place.name}</div>
                        <div className="text-left pt-5">
                          {place.position.lat && place.position.lng ? (
                            <span className="font-source-sans font-size-16l-14s font-weight-400">{haversineDistance(userLocation.lat, userLocation.lng, place.position.lat, place.position.lng).toFixed(2)} mi</span>
                          ) : (
                            <span className="font-source-sans font-size-16l-14s font-weight-400">{haversineDistance(userLocation.lat, userLocation.lng, place.position.lat(), place.position.lng()).toFixed(2)} mi</span>
                          )}
                          {place.rating && (
                            <span className="font-source-sans font-size-16l-14s font-weight-400 pl-20">Google Rating: {place.rating}</span>
                          )}
                        </div>
                      </div>

                      {place.customTypes.length > 0 && (
                        <div className="left text-center bg-eee br-5 p-5 pt-10">
                          {place.customTypes.map((type, typeIndex) => (
                            <span key={typeIndex} className="font-source-sans font-size-16l-14s font-weight-400 plr-5">{type}</span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="horizontal-container">
                      {place.address && (
                        <div className="left text-left pt-10 pr-10">
                          <span className="hide-for-small-only">
                            <span className="hide-for-780px">
                              <Link to="" onClick={() => handleDirections(place.address)} className="button medium width-100px">directions</Link>
                            </span>
                            <span className="show-for-780px">
                              <Link to="" onClick={() => handleDirections(place.address)} className="button medium width-80px">directions</Link>
                            </span>
                          </span>
                          <span className="show-for-small-only"><Link to="" onClick={() => handleDirections(place.address)} className="font-source-sans font-size-14 font-weight-500 pr-5">directions</Link></span>
                        </div>
                      )}
                      {place.phone_number && (
                        <div className="left text-left pt-10 pr-10">
                          <span className="hide-for-small-only">
                            <span className="hide-for-780px">
                              <Link to="" onClick={() => handleCall(place.phone_number)} className="button medium width-100px p-5">call</Link>
                            </span>
                            <span className="show-for-780px">
                              <Link to="" onClick={() => handleCall(place.phone_number)} className="button medium width-80px p-5">call</Link>
                            </span>
                          </span>
                          <span className="show-for-small-only"><Link to="" onClick={() => handleCall(place.phone_number)} className="font-source-sans font-size-14 font-weight-500 pr-5">call</Link></span>
                        </div>
                      )}
                      {place.website && (
                        <div className="left text-left pt-10 pr-10">
                          <span className="hide-for-small-only">
                            <span className="hide-for-780px">
                              <Link to="" onClick={() => handleWebsite(place.website)} className="button medium width-100px p-5">website</Link>
                            </span>
                            <span className="show-for-780px">
                              <Link to="" onClick={() => handleWebsite(place.website)} className="button medium width-80px p-5">website</Link>
                            </span>
                          </span>
                          <span className="show-for-small-only"><Link to="" onClick={() => handleWebsite(place.website)} className="font-source-sans font-size-14 font-weight-500 pr-5">website</Link></span>
                        </div>
                      )}
                      {place.opening_hours && place.opening_hours.length > 0 && (
                        <div className="left text-left pt-10 pr-10">
                          <span className="hide-for-small-only">
                            <span className="hide-for-780px">
                              <Link className="button medium width-100px p-5">hours</Link>
                            </span>
                            <span className="show-for-780px">
                              <Link className="button medium width-80px p-5">hours</Link>
                            </span>
                          </span>
                          <span className="show-for-small-only"><Link className="font-source-sans font-size-14 font-weight-500 pr-5">hours</Link></span>
                        </div>
                      )}
                      <div className="left text-left pt-10 pr-10">
                        <span className="hide-for-small-only">
                          <span className="hide-for-780px">
                            <Link to="" onClick={(e) => handleCheckIn(e, place)} className="button medium width-100px p-5">check-in</Link>
                          </span>
                          <span className="show-for-780px">
                            <Link to="" onClick={(e) => handleCheckIn(e, place)} className="button medium width-80px p-5">check-in</Link>
                          </span>
                        </span>
                        <span className="show-for-small-only"><Link to="" onClick={(e) => handleCheckIn(e, place)} className="font-source-sans font-size-14 font-weight-500 pr-5">check-in</Link></span>
                      </div>
                      <div className="left text-left pt-10 pr-10">
                        <span className="hide-for-small-only">
                          <span className="hide-for-780px">
                            <Link to="" onClick={(e) => handleSave(e, place)} className="button medium width-100px p-5">save</Link>
                          </span>
                          <span className="show-for-780px">
                            <Link to="" onClick={(e) => handleSave(e, place)} className="button medium width-80px p-5">save</Link>
                          </span>
                        </span>
                        <span className="show-for-small-only"><Link to="" onClick={(e) => handleSave(e, place)} className="font-source-sans font-size-14 font-weight-500 pr-5">save</Link>
                        </span>
                      </div>
                      <div className="left text-left pt-10 pr-10">
                        <span className="hide-for-small-only">
                          <span className="hide-for-780px">
                            <Link to="" onClick={(e) => handleOpenShareView(e, place)} className="button medium width-100px p-5">share</Link>
                          </span>
                          <span className="show-for-780px">
                            <Link to="" onClick={(e) => handleOpenShareView(e, place)} className="button medium width-80px p-5">share</Link>
                          </span>
                        </span>
                        <span className="show-for-small-only"><Link to="" onClick={(e) => handleOpenShareView(e, place)} className="font-source-sans font-size-14 font-weight-500 pr-5">share</Link>
                        </span>
                      </div>
                    </div>
                    {place.photos && place.photos.length > 0 && place.photos.length == 1 && (
                        <div className="photos right pt-10">
                          <div className="photo-gallery">
                            {place.photos.map((url, index) => (
                              <img key={index} src={url} className="br-5" alt={`Place photo ${index}`} />
                            ))}
                          </div>
                        </div>
                      )}

                    {place.isSaving && (
                        <form key={'form_' + place.random_id} onSubmit={saveLocation} className="mt-10">
                          <div className="grid-x bg-fff b1-aaa p-10">
                            <div className="large-6 medium-6 small-12 cell text-left pr-5l-0s">
                              <div className={saveLocationInput.errorStyle.wifi_speed}>{saveLocationInput.errorList.wifi_speed}</div>
                                <select name="wifi_speed" onChange={handleSaveLocationInput} value={saveLocationInput.wifi_speed}>
                                  <option value="" disabled>Select Wifi Speed</option>
                                  <option value="very slow">Very Slow</option>
                                  <option value="slow">Slow</option>
                                  <option value="medium">Medium</option>
                                  <option value="fast">Fast</option>
                                  <option value="very fast">Very Fast</option>
                                </select>
                            </div>
                            <div className="large-6 medium-6 small-12 cell text-left pl-5l-0s">
                              <div className={saveLocationInput.errorStyle.noise_level}>{saveLocationInput.errorList.noise_level}</div>
                                <select name="noise_level" onChange={handleSaveLocationInput} value={saveLocationInput.noise_level}>
                                  <option value="" disabled>Select Noise Level</option>
                                  <option value="very high">Very High</option>
                                  <option value="high">High</option>
                                  <option value="medium">Medium</option>
                                  <option value="low">Low</option>
                                  <option value="very low">Very Low</option>
                                </select>
                            </div>
                            <div className="large-6 medium-6 small-12 cell text-left pr-5l-0s">
                              <div className={saveLocationInput.errorStyle.free_internet}>{saveLocationInput.errorList.free_internet}</div>
                                <select name="free_internet" onChange={handleSaveLocationInput} value={saveLocationInput.free_internet}>
                                  <option value="" disabled>Select Free Internet</option>
                                  <option value="yes">Yes</option>
                                  <option value="no">No</option>
                                </select>
                            </div>
                            <div className="large-6 medium-6 small-12 cell text-left pl-5l-0s">
                              <div className={saveLocationInput.errorStyle.saved_list}>{saveLocationInput.errorList.saved_list}</div>
                                {savedLists && savedLists.length > 0 &&
                                  <select name="saved_list_random_id" onChange={handleSaveLocationInput} value={saveLocationInput.saved_list_random_id}>
                                    <option value="" disabled>Saved to List</option>
                                    {savedLists.map((list, i) => (
                                      <option key={i} value={list.random_id}>{list.name}</option>
                                    ))}
                                  </select>
                                }
                            </div>
                            <div className="large-12 medium-12 small-12 cell text-left">
                              <div className={saveLocationInput.errorStyle.details}>{saveLocationInput.errorList.details}</div>
                              <div className="input-group">
                                <textarea name="details" onChange={handleSaveLocationInput} value={saveLocationInput.details} placeholder="Additional Details"></textarea>
                              </div>
                            </div>
                            <div className="large-12 medium-12 small-12 cell text-left">
                              <button type="submit" className="button width-125px-90px right">Save</button>
                              {isLoading &&
                                <span className="pr-10 right">
                                  <LoadingSpinner />
                                </span>
                              }
                            </div>
                          </div>
                        </form>
                      )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div >
      )}
    </div >
  );
};

export default LocationFinder;
