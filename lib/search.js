



document.addEventListener("DOMContentLoaded", function(event) {

  const API_KEY = "79de0bd544e7a4ab1e053051d5f4c875";
  options = {
    url: `https://airport.api.aero/airport?user_key=${API_KEY}`
  }

  fetchAirports(options).then((res, err) => {
    debugger
  })
 });


function fetchAirports(options) {
   return new Promise(function(success, error) {

     const defaults = {
       method: 'GET',
       url: '',
       contentType: 'application/x-www-form-urlencoded; charset=UTF-8',
       dataType: 'jsonp',
       success: () => {},
       error: () => {},
       data: {}
     };

     options = Object.assign({}, defaults, options);

     const xhr = new XMLHttpRequest();
     xhr.withCredentials = true;
     xhr.open(options.method, options.url);
     xhr.onload = (e) => {
       if (xhr.status === 200) {
         options.success(JSON.parse(xhr.response));
       } else {
         options.error(xhr.response);
       }
     };

     xhr.send(JSON.stringify(options.data));
   });
 };