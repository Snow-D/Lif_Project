## Recherche de stage /emploi /etc...
Application Web permettant d'avoir accès à un grand nombre d'offre de stage/emploi provenant de divers autres sites (Indeed & LinkedIn principalement).

## Fonctionnement
Notre plateforme reprend l'idée du regroupement de donnée d'un comparateur de vol c'est à dire qu'il se charge d'aller récuperer sur d'autre site les informations demander par l'utilisateur et affiche le tout.  

Les recherches peuvent être filtrées par provenance (Indeed, LinkedIn,...) mais aussi d'autre critère tel que les notes attribuées sur Google aux entreprises.  

**Ces informations sont récupérées par le biais du scraping**  :shipit:

## Langage & outils (Framework, etc...)
- Express JS
- JS
- Jquery
- Bootstrap
- API Google (Places API, Directions API, Maps JavaScript API)

## Installation
- Installer *NodeJs* puis :
```
npm install express
npm install cheerio
```
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
