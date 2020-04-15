## Recherche de stage /emploi /etc...
Application Web permettant d'avoir accès à un grand nombre d'offre de stage/emploi provenant de divers autres sites (Indeed & LinkedIn principalement).

## Fonctionnement
Notre plateforme reprend l'idée du regroupement de donnée d'un comparateur de vol c'est à dire qu'il se charge d'aller récuperer sur d'autre site les informations demander par l'utilisateur et affiche le tout.  

Les recherches peuvent être filtrées par provenance (Indeed, LinkedIn,...) mais aussi d'autre critère comme par exemple les notes attribuées sur Google aux entreprises.  

**Ces informations sont récupérées par le biais du scraping**  :shipit:

Quelques informations au sujet des entreprises à l'origine de ces offres sont aussi disponibles.


## Langage & outils (Framework, etc...)
- JS
- Express JS
- Jquery
- Cheerio
- Bootstrap 4
- API Google (Places API, Directions API, Maps JavaScript API)

## Structure du code
1. **_server.js_**
   - Un côté serveur permettant de requêter & traiter les réponses (parsing, etc...)  
   
2. **_script.js_**
   - requête, filtrage, maps, affichage etc...  
   
3. **_index.html_**
   - Page HTML résultant des requêtes.

## Installation
- Installer *NodeJs* ainsi que *npm* (ubuntu) : 
```
sudo apt-get update
sudo apt-get install nodejs npm
```
- Pour [Windows](https://nodejs.org/en/download/).
## Démarrage
```
node server.js
```
Se rendre sur *http://localhost:3030*.  

Vous pouvez utiliser **_nodemon_** afin de ne pas avoir à redémarrer le serveur à chaque modification, **_nodemon_** s'en charge.
```
npm install -g nodemon
nodemon server.js
```

## Divers

[Cheerio](https://github.com/cheeriojs/cheerio)
