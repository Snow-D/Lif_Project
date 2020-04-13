var server = 'http://localhost:3030';

var results = [];


function showDetailIndeed(data_jk) {

    fetch(`${server}/api/detailsIndeed`, {
        method: 'post',
        mode: 'same-origin',
        body: JSON.stringify({ data_jk }),
        headers: {
            "Content-Type": "application/json"
        },
    })
        .then(res => res.text())
        .then(text => {

            var parser = new DOMParser();
            var htmlDoc = parser.parseFromString(text, 'text/html');
            var jobs = htmlDoc.getElementsByClassName('jobsearch-ViewJobLayout-jobDisplay');

            for (let i = 0; i < jobs.length; i++) {

                let result = {};

                result.title = $(jobs[i]).find('.jobsearch-JobInfoHeader-title').text();
                result.company = $(jobs[i]).find('.jobsearch-CompanyReview--heading').text();
                result.duration = $(jobs[i]).find('.jobsearch-JobMetadataHeader-iconLabel').text();
                result.summary = $(jobs[i]).find('.jobsearch-jobDescriptionText').text();

                results.push(result);

            };

            renderDetailsIndeed(results, details);
        });
}

function showDetailLinkedin(idOffer) {

    fetch(`${server}/api/detailsLinkedin`, {
        method: 'post',
        mode: 'same-origin',
        body: JSON.stringify({ idOffer }),
        headers: {
            "Content-Type": "application/json"
        },
    })
        .then(res => res.text())
        .then(text => {

            var parser = new DOMParser();
            var htmlDoc = parser.parseFromString(text, 'text/html');
            var jobs = htmlDoc.getElementsByClassName('core-rail');

            for (let i = 0; i < jobs.length; i++) {

                let result = {};

                result.title = $(jobs[i]).find('.topcard__title').text();
                result.company = $(jobs[i]).find('.topcard__flavor').text();
                result.summary = $(jobs[i]).find('.description__text').text();

                results.push(result);

            };

            renderDetailsLinkedin(results, details);
        });
}

function renderDetailsIndeed(results, details) {

    let test;

    details.innerHTML = "";

    for (let i = 0; i < results.length; i++) {

        test = `
            <div class="card" style="overflow:scroll; height: 75vh;">
            <h5 class="card-header" id="titreStage" >${results[i].title}</h5>
            <div class="card-body">
            <h6 class="card-subtitle mb-2 text-muted">${results[i].company}</h6>
            <h6 class="card-subtitle mb-2 text-muted">${results[i].duration}</h6>
            <p class="card-text">${results[i].summary}</p>
            </div>
            </div>
            `;

        details.innerHTML = test;
    }

    return details;
}

function renderDetailsLinkedin(results, details) {

    let test;

    details.innerHTML = "";

    for (let i = 0; i < results.length; i++) {

        test = `
            <div class="card" style="overflow:scroll; height: 75vh;">
            <h5 class="card-header" id="titreStage" >${results[i].title}</h5>
            <div class="card-body">
            <h6 class="card-subtitle mb-2 text-muted">${results[i].company}</h6>
            <p class="card-text">${results[i].summary}</p>
            </div>
            </div>
            `;

        details.innerHTML = test;
    }

    return details;
}

$(function () {

    var input = $("#mot-cle");
    var place = $('#place');
    var search = $("#search");

    var pagination = $(".page-link");
    var pageNumber = 0;
    var pageNumberLinkedin = 0;

    var trieIndeed = $("#trieIndeed");
    var trieLinkedin = $('#trieLinkedin');
    var trieRating = $('#trieRating');

    var map;


    var borderColor = input.css('border-color');

    const resIndeed = document.getElementById('indeed');
    const resLinkedin = document.getElementById('linkedin');


    function validateInput() {
        var inputText = input.val();

        if (!inputText) {
            input.css('border-color', 'red');
            return false;
        }

        var placeText = place.val();
        if (!placeText) {
            place.css('border-color', 'red');
            return false;
        }

        inputText = inputText.replace(' ', '+');

        return { inputText, placeText, pageNumber, pageNumberLinkedin };
    }

    var inputs = validateInput();


    function initialRequestShowed(inputs) {

        fetch(`${server}/api/id`, {
            method: 'post',
            mode: 'same-origin',
            body: JSON.stringify(inputs),
            headers: {
                "Content-Type": "application/json"
            },
        })
            .then(res => res.json())
            .then(json => {
                map = vueMapLocation(json);
            });


        fetch(`${server}/api/search`, {
            method: 'post',
            mode: 'same-origin',
            body: JSON.stringify(inputs),
            headers: {
                "Content-Type": "application/json"
            },
        })
            .then(res => res.json())
            .then(json => {
                console.log(json);

                renderSearchIndeed(json, resIndeed);
                renderSearchLinkedin(json, resLinkedin);

                json = json.filter(element => element.hasOwnProperty("position"));

                json.forEach(marker => {
                    infoWindow(map, addMarker(marker.position.lat, marker.position.lng, map, "green"), json, marker.placeID, marker);
                });
            });

    }


    search.on('click', function () {

        if (!inputs) return;

        initialRequestShowed(inputs);

    });

    pagination.on('click', function () {

        if (!inputs) return;

        inputs.pageNumber = parseInt($(this).text()) * 10;
        inputs.pageNumberLinkedin = parseInt($(this).text()) * 25;

        initialRequestShowed(inputs);

    });


    /******  Fonctions de filtrage      *****/

    function filterBySite(filtre) {

        if (!inputs) return;

        fetch(`${server}/api/id`, {
            method: 'post',
            mode: 'same-origin',
            body: JSON.stringify(inputs),
            headers: {
                "Content-Type": "application/json"
            },
        })
            .then(res => res.json())
            .then(json => {
                map = vueMapLocation(json);
            })
            .then(
                fetch(`${server}/api/search`, {
                    method: 'post',
                    mode: 'same-origin',
                    body: JSON.stringify(inputs),
                    headers: {
                        "Content-Type": "application/json"
                    },
                })
                    .then(r => r.json())
                    .then(json => {
                        json = json.filter(e => e.site == filtre && e.hasOwnProperty("position"));

                        json.forEach(marker => {

                            var mapMarker = addMarker(marker.position.lat, marker.position.lng, map, "green");
                            infoWindow(map, mapMarker, json, marker.placeID, marker);
                        });

                    })
            );
    }

    function filterByRating() {

        if (!inputs) return;

        fetch(`${server}/api/id`, {
            method: 'post',
            mode: 'same-origin',
            body: JSON.stringify(inputs),
            headers: {
                "Content-Type": "application/json"
            },
        })
            .then(res => res.json())
            .then(json => {
                map = vueMapLocation(json);
            })
            .then(
                fetch(`${server}/api/search`, {
                    method: 'post',
                    mode: 'same-origin',
                    body: JSON.stringify(inputs),
                    headers: {
                        "Content-Type": "application/json"
                    },
                })
                    .then(r => r.json())
                    .then(json => {
                        json = json.filter(e => e.rating < 4 && e.hasOwnProperty("position"));

                        json.forEach(marker => {

                            var mapMarker = addMarker(marker.position.lat, marker.position.lng, map, "green");
                            infoWindow(map, mapMarker, json, marker.placeID, marker);
                        });

                    })
            );
    }

    trieIndeed.on('click', function () {
        var I = "indeed";
        filterBySite(I);
    });

    trieLinkedin.on('click', function () {
        var L = "linkedin";
        filterBySite(L);
    });

    trieRating.on('click', function () {
        filterByRating();
    });




    /******  Vérification des inputs   *****/

    input.keyup(function () {
        input.css('border-color', borderColor);
    });

    place.keyup(function () {
        place.css('border-color', borderColor);
    });


    /******  Fonctions d'affichage des Offres, de la Map ainsi que des Markers     *****/


    function renderSearchIndeed(results, resSite) {

        let rendu;
        resSite.innerHTML = "";

        for (let i = 0; i < results.length; i++) {

            if (results[i].site == "indeed") {

                rendu = `
                        <div class="card">
                        <h5 class="card-header" id="titreStage" >${results[i].title}</h5>
                        <div class="card-body">
                        <h6 class="card-subtitle mb-2 text-muted">${results[i].company}</h6>
                        <p class="card-text">${results[i].summary}</p>
                        <a href="https://www.indeed.fr/voir-emploi?jk=${results[i].data_jk}" target="_blank" class="btn btn-outline-info">Accèder au site</a> 
                        <button type="button" class="btn btn-outline-primary" data-toggle="popover" title="Details de l'annonce" onclick="showDetailIndeed('${results[i].data_jk}')">Détail de l'annonce</button>
                        </div>
                        <div class="card-footer text-muted">
                        Posté : ${results[i].date}
                        </div>
                        </div>
                        <br>
                        `;

                resSite.innerHTML += rendu;
            }
        }

        return resSite;
    }

    function renderSearchLinkedin(results, resSite) {

        let rendu;

        resSite.innerHTML = "";

        for (let i = 0; i < results.length; i++) {

            if (results[i].site == "linkedin") {


                rendu = `
                        <div class="card">
                        <h5 class="card-header" id="titreStage" >${results[i].title}</h5>
                        <div class="card-body">
                        <h6 class="card-subtitle mb-2 text-muted">${results[i].company}</h6>
                        <p class="card-text">${results[i].summary}</p>
                        <a href="https://fr.linkedin.com/jobs/view/${results[i].idOffer}" target="_blank" class="btn btn-outline-info">Accèder au détail de l'annonce</a> 
                        <button type="button" class="btn btn-outline-primary" data-toggle="popover" title="Details de l'annonce" onclick="showDetailLinkedin('${results[i].idOffer}')">Détail de l'annonce</button>
                        </div>
                        <div class="card-footer text-muted">
                        Posté : ${results[i].date}
                        </div>
                        </div>
                        <br>
                        `;

                resSite.innerHTML += rendu;
            }
        }

        return resSite;
    }

    function addMarker(x, y, map, color) {

        let url = "http://maps.google.com/mapfiles/ms/icons/";
        url += color + "-dot.png";

        var marker = new google.maps.Marker({
            position: { lat: x, lng: y },
            map: map,
            // icon: { url }
        });

        return marker;
    }

    function infoWindow(map, marker, parametreInfos, place_id) {

        var contentMarker = "";
        var Info = parametreInfos.find(element => element.placeID == place_id);

        if (Info.rating == undefined) {

            Info.rating = 'Non renseignée';
        };

        if (Info.phone == undefined) {

            Info.phone = 'Non renseignée';
        };

        contentMarker += `
                <p>${Info.company} & ${Info.site}</p>
                <ul>
                    <li><p class="card-text">Adresse : ${Info.adress}</p> </li>
                    <li><p class="card-text">Numéro : ${Info.phone} </p> </li>
                    <li><p class="card-text">Note google : ${Info.rating} / 5</p> </li>
                </ul>`;


        var infoMarker = new google.maps.InfoWindow({
            content: contentMarker
        });

        marker.addListener('click', function () {
            infoMarker.open(map, marker);
        });

        return infoMarker;
    }

    function initMap() {

        new google.maps.Map(document.getElementById('map'), {
            center: { lat: 46.227638, lng: 2.213749 },
            zoom: 6,
            styles: [
                { elementType: 'geometry', stylers: [{ color: '#242f3e' }] },
                { elementType: 'labels.text.stroke', stylers: [{ color: '#242f3e' }] },
                { elementType: 'labels.text.fill', stylers: [{ color: '#746855' }] },
                {
                    featureType: 'administrative.locality',
                    elementType: 'labels.text.fill',
                    stylers: [{ color: '#d59563' }]
                },
                {
                    featureType: 'poi',
                    elementType: 'labels.text.fill',
                    stylers: [{ color: '#d59563' }]
                },
                {
                    featureType: 'poi.park',
                    elementType: 'geometry',
                    stylers: [{ color: '#263c3f' }]
                },
                {
                    featureType: 'poi.park',
                    elementType: 'labels.text.fill',
                    stylers: [{ color: '#6b9a76' }]
                },
                {
                    featureType: 'road',
                    elementType: 'geometry',
                    stylers: [{ color: '#38414e' }]
                },
                {
                    featureType: 'road',
                    elementType: 'geometry.stroke',
                    stylers: [{ color: '#212a37' }]
                },
                {
                    featureType: 'road',
                    elementType: 'labels.text.fill',
                    stylers: [{ color: '#9ca5b3' }]
                },
                {
                    featureType: 'road.highway',
                    elementType: 'geometry',
                    stylers: [{ color: '#746855' }]
                },
                {
                    featureType: 'road.highway',
                    elementType: 'geometry.stroke',
                    stylers: [{ color: '#1f2835' }]
                },
                {
                    featureType: 'road.highway',
                    elementType: 'labels.text.fill',
                    stylers: [{ color: '#f3d19c' }]
                },
                {
                    featureType: 'transit',
                    elementType: 'geometry',
                    stylers: [{ color: '#2f3948' }]
                },
                {
                    featureType: 'transit.station',
                    elementType: 'labels.text.fill',
                    stylers: [{ color: '#d59563' }]
                },
                {
                    featureType: 'water',
                    elementType: 'geometry',
                    stylers: [{ color: '#17263c' }]
                },
                {
                    featureType: 'water',
                    elementType: 'labels.text.fill',
                    stylers: [{ color: '#515c6d' }]
                },
                {
                    featureType: 'water',
                    elementType: 'labels.text.stroke',
                    stylers: [{ color: '#17263c' }]
                }
            ]
        });
    }

    function vueMapLocation(pos) {

        var map = new google.maps.Map(document.getElementById('map'), {
            center: { lat: parseFloat(pos.lat), lng: parseFloat(pos.lng) },
            zoom: 12,
            styles: [
                { elementType: 'geometry', stylers: [{ color: '#242f3e' }] },
                { elementType: 'labels.text.stroke', stylers: [{ color: '#242f3e' }] },
                { elementType: 'labels.text.fill', stylers: [{ color: '#746855' }] },
                {
                    featureType: 'administrative.locality',
                    elementType: 'labels.text.fill',
                    stylers: [{ color: '#d59563' }]
                },
                {
                    featureType: 'poi',
                    elementType: 'labels.text.fill',
                    stylers: [{ color: '#d59563' }]
                },
                {
                    featureType: 'poi.park',
                    elementType: 'geometry',
                    stylers: [{ color: '#263c3f' }]
                },
                {
                    featureType: 'poi.park',
                    elementType: 'labels.text.fill',
                    stylers: [{ color: '#6b9a76' }]
                },
                {
                    featureType: 'road',
                    elementType: 'geometry',
                    stylers: [{ color: '#38414e' }]
                },
                {
                    featureType: 'road',
                    elementType: 'geometry.stroke',
                    stylers: [{ color: '#212a37' }]
                },
                {
                    featureType: 'road',
                    elementType: 'labels.text.fill',
                    stylers: [{ color: '#9ca5b3' }]
                },
                {
                    featureType: 'road.highway',
                    elementType: 'geometry',
                    stylers: [{ color: '#746855' }]
                },
                {
                    featureType: 'road.highway',
                    elementType: 'geometry.stroke',
                    stylers: [{ color: '#1f2835' }]
                },
                {
                    featureType: 'road.highway',
                    elementType: 'labels.text.fill',
                    stylers: [{ color: '#f3d19c' }]
                },
                {
                    featureType: 'transit',
                    elementType: 'geometry',
                    stylers: [{ color: '#2f3948' }]
                },
                {
                    featureType: 'transit.station',
                    elementType: 'labels.text.fill',
                    stylers: [{ color: '#d59563' }]
                },
                {
                    featureType: 'water',
                    elementType: 'geometry',
                    stylers: [{ color: '#17263c' }]
                },
                {
                    featureType: 'water',
                    elementType: 'labels.text.fill',
                    stylers: [{ color: '#515c6d' }]
                },
                {
                    featureType: 'water',
                    elementType: 'labels.text.stroke',
                    stylers: [{ color: '#17263c' }]
                }
            ]
        });

        return map;
    }

    initMap();
});