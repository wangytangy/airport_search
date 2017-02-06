
// window.callback = function(data) {
//   debugger
//   console.log(data);
// };
//
//
// function jsonpRequest() {
//
//   const API_KEY = "79de0bd544e7a4ab1e053051d5f4c875";
//   url = `https://airport.api.aero/airport?user_key=${API_KEY}`
//
//
//   var tag = document.createElement("script");
//   tag.setAttribute('src', `${url}?callback=callback`);
//   document.body.appendChild(tag);
// }
//
document.addEventListener("DOMContentLoaded", function(event) {
  // jsonpRequest();
  //
  // let id = "IAOGp45hV4fAWdZu9I5Ha";
  // let secret = "pZ2v6mM98V8M3ACwmpqLbvxD6oC16zR0eVNbFpB3";



  options = {
    url: "airports_us.csv"
  };

  fetchAirports();

});

function fetchAirports() {

  const ID = "IAOGp45hV4fAWdZu9I5Ha";
  const SECRET = "pZ2v6mM98V8M3ACwmpqLbvxD6oC16zR0eVNbFpB3"

  url = `https://api.aerisapi.com/places/airports/?client_id=${ID}&client_secret=${SECRET}`

  $.ajax(url, {
    dataType: "json",
    success: (res) => { console.log(res) }
  });

  // return new Promise(function(success, error) {
  //
  // let defaults = {
  //   method: 'GET',
  //   url: `https://airport.api.aero/airport?user_key=79de0bd544e7a4ab1e053051d5f4c875`,
  //   contentType: 'application/x-www-form-urlencoded; charset=UTF-8',
  //   // dataType: 'jsonp',
  //   success: (data) => {
  //     console.log(data);
  //    },
  //   error: (err) => { console.log(err) },
  //   data: {}
  // };
  // //
  // new_options = Object.assign({}, defaults, options);
  //
  // const xhr = new XMLHttpRequest();
  // xhr.open(new_options.method, new_options.url, true);
  // xhr.onload = (e) => {
  //   if (xhr.status === 200 || xhr.status === 0) {
  //     new_options.success(JSON.parse(xhr.response));
  //   } else {
  //     new_options.error(xhr.response);
  //   }
  // };
  // xhr.withCredentials = true;
  // xhr.send();
  // });
};
