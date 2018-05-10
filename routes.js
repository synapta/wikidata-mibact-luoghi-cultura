var express = require('express');
var request = require('request');
// Interrogazioni SPARQL effettuate lato server
const WIKIDATABASEQUERYURL =  "https://query.wikidata.org/sparql?query=";
// Elenca i comuni da visualizzare nell'autocomplete
const QUERY_SPARQL_COMUNI_AUTOCOMPLETE = `SELECT DISTINCT ?comune ?comuneLabel
WHERE {
?idWD wdt:P131 ?comune . ?comune wdt:P17 wd:Q38 .
{ ?idWD wdt:P2186 ?idWLM . } UNION
{ ?idWD wdt:P1435 wd:Q26971668 . }

SERVICE wikibase:label { bd:serviceParam wikibase:language "it". }
}
ORDER BY ASC (?comuneLabel)`;
const QUERY_SPARQL_COMUNI_AUTOCOMPLETE_URL = WIKIDATABASEQUERYURL + encodeURIComponent(QUERY_SPARQL_COMUNI_AUTOCOMPLETE);

module.exports = function(app, apicache, passport) {
    // file statici e index.html in app/
    app.use('/', express.static('./app'));
    // app.get(/comuni\/(.+)$/, apicache('2 seconds'), function(req, res) {
    app.get(/comuni\.json$/, apicache('1 second'), function(req, res) {
        try {
            let querypara = req.params[0];
            let jsonRes = [];
            let options = {
                url: QUERY_SPARQL_COMUNI_AUTOCOMPLETE_URL,
                headers: {
                    'Accept': 'application/json'
                }
            };

            request(options, function (error, response, body) {
                if (error) {
                    console.log('errore richiesta comuni');
                }
                else {
                    // return JSON.parse(body).results.bindings;
                    var results = [];
                    // Elaboro i risultati in modo da renderli consumabili
                    // da typeahead
                    var parsed = JSON.parse(body).results.bindings;
                    for (var i = 0; i < parsed.length; i++) {
                        results.push({
                          'wdid':parsed[i].comune.value,
                          'label':parsed[i].comuneLabel.value
                        });
                    }
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
