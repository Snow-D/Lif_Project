const express = require('express')
const app = express()
const bodyParser = require('body-parser');
global.fetch = require("node-fetch");

const cheerio = require('cheerio');

// var session = require('express-session');
// var CASAuthentication = require('cas-authentication');

const indeeed = 'https://www.indeed.fr/emplois';
const apiKEY = "AIzaSyDqiQ4P9aYAR_FJFOlCJud3wlh9GKh8bA8"; 

app.use('/', express.static('front'));
app.use(bodyParser.json());

async function LatLngOffers(offers) {

  var companiesPosition = offers.map(async element => {

    element.company = unescape(encodeURIComponent(element.company.split('.')[0]));
    element.location = encodeURIComponent(element.location.replace(" ", "+"));

    /*****   Requete pour récuper le 'place_id' des villes || Pour rappel : { company: '\n\nArmatis-lc', location: 'Caen' }   *****/

    let url_PlaceId_Company = `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?key=${apiKEY}&input=${element.location}&inputtype=textquery`;
    var id = await fetch(url_PlaceId_Company)
      .then(r => r.json());

    /*****   Requete pour récuper les Latitudes/Longitudes des villes des entreprises  *****/

    if (id.status != "OK") {
      return;
    }

    let url_Position_City = `https://maps.googleapis.com/maps/api/place/details/json?key=${apiKEY}&placeid=${id.candidates[0].place_id}`;
    var latLng = await fetch(url_Position_City)
      .then(r => r.json());

    /*****   Requete pour récuper les Latitudes/Longitudes des compagnies pour ensuite les placer sur la MAP || Ex : Lat/Long pour Armatis dans la ville de Caen  *****/

    let lat = latLng.result.geometry.location.lat;
    let lng = latLng.result.geometry.location.lng;

    let url_Position_Company = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=8000&keyword=${element.company}&key=${apiKEY}`;
    var position = await fetch(url_Position_Company)
      .then(r => r.json());

    if (position.status == "OK") {
      element.position = position.results[0].geometry.location;
      element.placeID = position.results[0].place_id;
      element.adress = position.results[0].vicinity;
    }

    /*****   Requete pour récuper les infos d'une entreprise numéro & note sur Google || Ex : result: { formatted_phone_number: '02 99 73 45 17', rating: 3.5 }  *****/

    let url_Details_Company = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${element.placeID}&fields=rating,formatted_phone_number&key=${apiKEY}`;
    var details = await fetch(url_Details_Company)
      .then(r => r.json());

    if (details.status == "OK") {
      element.phone = details.result.formatted_phone_number;
      element.rating = details.result.rating;
    }

  });

  await Promise.all(companiesPosition);

  return offers;

}


function parseIndeed($) { // $ = cheerio.load(request);

  const jobs = $('.result');

  const results = [];

  for (let i = 0; i < jobs.length; i++) {
    const element = jobs[i];

    let result = {};

    result.title = $(element).find('.jobtitle').text();
    result.company = $(element).find('.company').text();
    result.location = $(element).find('.location').text();
    result.summary = $(element).find('.summary').text();
    result.date = $(element).find('.date').text();

    /***   Besoin de l'ID jk & empn pour pouvoir redirigé vers la page détaillé de Indeed   ***/

    result.data_jk = $(element).data('jk');
    result.data_empn = $(element).data('empn');

    result.site = "indeed";

    results.push(result);

  }
  
  return results;
}


async function indeed(req) {

  let url = "";

  url = `${indeeed}?q=${req.body.inputText}&l=${req.body.placeText}&sort=date&start=${req.body.pageNumber}`;

  var request = await fetch(url)
    .then(r => r.text());

  var indeedHtml = cheerio.load(request);

  var offers = parseIndeed(indeedHtml);

  var offers = LatLngOffers(offers);

  return offers;

}

function parseLinkdIn($) { // $ = cheerio.load(request);

  const jobs = $('.result-card--with-hover-state');

  const results = [];

  for (let i = 0; i < jobs.length; i++) {
    const element = jobs[i];

    let result = {};

    result.title = $(element).find('.screen-reader-text').text();
    result.company = $(element).find('.result-card__subtitle').text();
    result.location = $(element).find('.job-result-card__location').text();
    result.summary = $(element).find('.job-result-card__snippet').text();
    result.date = $(element).find('.job-result-card__listdate').text();
    result.logo = $(element).find('.artdeco-entity-image').data('src');

    result.idOffer = $(element).data('id');

    /***   Besoin de du 'data-id' pour pouvoir redirigé vers l'annonce détaillée de Linkedin   ***/

    result.site = "linkedin";
    
    results.push(result);

  }

  return results;

}

async function linkedIn(req) {

  var input1 = req.body.inputText;
  input1 = input1.replace("+", "%20");

  let url = "";

  // url = `https://fr.linkedin.com/jobs/search?keywords=${input1}&location=${req.body.placeText}`; // start=X affiche à partir de la X ème annonce donc 1ère requete => 25 annonces
  url = `https://fr.linkedin.com/jobs/api/seeMoreJobPostings/search?keywords=${input1}&location=${req.body.placeText}&position=1&pageNum=0&start=${req.body.pageNumberLinkedin}`;

  var request = await fetch(url)
    .then(r => r.text());

  var linkedInHtml = cheerio.load(request);

  var offers = parseLinkdIn(linkedInHtml);

  var offers = LatLngOffers(offers);

  return offers;

}


app.post('/api/search', async function (req, res) {

  var ind = await indeed(req);
  var link = await linkedIn(req);
  var result = ind.concat(link);

  console.log(result);

  res.send(result);

});

app.post('/api/id', function (req, res) {

  let url = `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?key=${apiKEY}&input=${req.body.placeText}&inputtype=textquery`;

  fetch(url)
    .then(r => r.json())
    .then(json => {
      // console.log(json.candidates[0].place_id);

      let url_ID = `https://maps.googleapis.com/maps/api/place/details/json?key=${apiKEY}&placeid=${json.candidates[0].place_id}`;
      fetch(url_ID)
        .then(r => r.json())
        .then(json => {
          var location = json.result.geometry.location;
          res.send(location);
          // console.log(location);

        });

    });

});

app.post('/api/detailsIndeed', function (req, res) {

  var url = `https://www.indeed.fr/voir-emploi?jk=${req.body.data_jk}`;

  fetch(url)
    .then(r => r.text())
    .then(text => {
      res.send(text);
    });

});

app.post('/api/detailsLinkedin', function (req, res) {

  var url = `https://fr.linkedin.com/jobs/view/${req.body.idOffer}`;

  fetch(url)
    .then(r => r.text())
    .then(text => {
      res.send(text);
    });

})


app.listen(3030, function () {

  console.log('Example app listening on port 3030!')

});

