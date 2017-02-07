let airports = require("json!../data/airports_us.json");
let id;

function handleInputChange(e) {
  //loop through airports, filter by input
  //create <option> element, set it's value
  //append option to <datalist>
  clearTimeout(id);
  id = setTimeout(function() {

    let input = e.target.value.toLowerCase();
    let dataList = document.getElementById('airports');
    while (dataList.firstChild) dataList.removeChild(dataList.firstChild);
    let airportIDs = Object.keys(airports);

    let filteredList = airportIDs.filter((id) => {
      return (airports[id].IATA.toLowerCase().indexOf(input) !== -1 ||
      airports[id].city.toLowerCase().indexOf(input) !== -1 ||
      airports[id].name.toLowerCase().indexOf(input) !== -1)
    }).slice(0, 10);

    filteredList.forEach((id) => {
      let option = document.createElement('option');
      option.innerHTML = `(${airports[id].IATA})` + " " + `${airports[id].name}` + " - " + `${airports[id].city}`;
      dataList.appendChild(option);
    });

    console.log(filteredList);

  }, 200);
}

function handleSubmit() {
  let inputVal1 = document.getElementById('input1');
  let inputVal2 = document.getElementById('input2');
  debugger
}

function attachInputListeners() {
  let elements = document.getElementsByTagName('input');
  for (let i = 0; i < elements.length; i++) {
    elements[i].addEventListener("keyup", handleInputChange);
  }
}

function attachButtonListener() {
  document.getElementById('submit').addEventListener('click', handleSubmit);
}

function submitSearch(e) {
  console.log("Hey");
}

document.addEventListener("DOMContentLoaded", function() {
  attachInputListeners();
  attachButtonListener();
});
