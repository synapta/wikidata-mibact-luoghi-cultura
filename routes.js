var express = require('express');
var request = require('request');
const wikiDataBaseQueryUrl =  "https://query.wikidata.org/sparql?query=";
// Elenca i comuni da visualizzare nell'autocomplete
const querySPARQLComuniAutocomplete = `SELECT DISTINCT ?comune ?comuneLabel
WHERE {
?idWD wdt:P131 ?comune . ?comune wdt:P17 wd:Q38 .
{ ?idWD wdt:P2186 ?idWLM . } UNION
{ ?idWD wdt:P1435 wd:Q26971668 . }

SERVICE wikibase:label { bd:serviceParam wikibase:language "it". }
}`;
const querySPARQLComuniAutocompleteEncoded = wikiDataBaseQueryUrl + encodeURIComponent(querySPARQLComuniAutocomplete);

module.exports = function(app, apicache, passport) {
    // app.get(/comuni\/(.+)$/, apicache('2 seconds'), function(req, res) {
    app.get(/comuni\.json$/, apicache('1 day'), function(req, res) {
        try {
            let querypara = req.params[0];
            let jsonRes = [];
            let options = {
                url: querySPARQLComuniAutocompleteEncoded,
                headers: {
                  'Accept': 'application/json'
                }
            };

            request(options, function (error, response, body) {
                if (error) {
                    console.log('errore richiesta comuni');
                }
                else {
                    var results = JSON.parse(body).results.bindings;
                    // console.log(results);
                    res.send(results);
                }
            });
        }
        catch (e) {
            console.log("Errore nella richiesta autocomplete sui Comuni");
            console.log(e);
        }
    });
};
