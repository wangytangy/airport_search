let airports = require("json!../data/airports_us.json");
let id;

function handleInputChange(e) {
  //loop through airports, filter by input
  //create <option> element, set it's value
  //append option to <datalist>
  clearTimeout(id);
  id = setTimeout(function() {

    let input = e.target.value.toLowerCase();
    console.log(input);
    let dataList = document.getElementById('airports');
    while (dataList.firstChild) dataList.removeChild(dataList.firstChild);

    let filteredList = airports.filter((port) => {
      return (port.IATA.toLowerCase().indexOf(input) !== -1 ||
      port.city.toLowerCase().indexOf(input) !== -1 ||
      port.name.toLowerCase().indexOf(input) !== -1)
    }).slice(0, 10);

    filteredList.forEach((item) => {
      let option = document.createElement('option');
      option.value = `${item.IATA}` + " " + `${item.name}` + " - " + `${item.city}`;
      dataList.appendChild(option);
    });

    console.log(filteredList);

  }, 200);
}

function attachInputListeners() {
  let elements = document.getElementsByTagName('input');
  for (let i = 0; i < elements.length; i++) {
    elements[i].addEventListener("keyup", handleInputChange);
  }
}

document.addEventListener("DOMContentLoaded", function() {
  attachInputListeners();
});
