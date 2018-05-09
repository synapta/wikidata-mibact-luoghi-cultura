// alert('debug!');

$(document).ready( function () {

          /**var getData = function () {

      // Carica dati
      $.ajax ({
          type:'GET',
          url: "js/devel-results.json",
          error: function(e) {
              // console.log(e)
              alert('Error retrieving data');
              return {};
          },
          success: function(json) {
              // var newJson = enrichJson(json);
              return json;
          }
      });
    }; **/

    var emptyValue = '---';

    $('#appTable').DataTable({
        ajax: {
            // "url": "js/devel-results.json",
            "url": "https://query.wikidata.org/sparql?query=SELECT%20?idWLM%20?idWD%20?idWDLabel%20?comune%20?indirizzo%20?coord%20?commons%0AWHERE%20%7B%0A?idWD%20wdt:P131%20?comune%20.%20?comune%20wdt:P17%20wd:Q38%20.%0AOPTIONAL%20%7B%20?idWD%20wdt:P969%20?indirizzo%20.%20%7D%0AOPTIONAL%20%7B%20?idWD%20wdt:P625%20?coord%20.%20%7D%0AOPTIONAL%20%7B%20?idWD%20wdt:P373%20?commons%20.%20%7D%0A%0A%7B%20?idWD%20wdt:P2186%20?idWLM%20.%20%7D%20UNION%0A%7B%20?idWD%20wdt:P1435%20wd:Q26971668%20.%20%7D%0A%0ASERVICE%20wikibase:label%20%7B%20bd:serviceParam%20wikibase:language%20%22it,en%22.%20%7D%0A%7D%0ALIMIT%20100",
            // dataSrc: 'results.bindings',
            "dataSrc": function ( json ) {
                var customData = [];
                var headName = '';
                for ( var i=0, ien=json.results.bindings.length ; i < ien ; i++ ) {
                    customData[i] = {};
                    for (j=0; j < json.head.vars.length; j++) {
                        headName = json.head.vars[j];
                        try {
                            if (typeof json.results.bindings[i][headName] === 'undefined') {
                                throw "Value undefined";
                            }
                            customData[i][headName] = json.results.bindings[i][headName];
                        }
                        catch (e) {
                            // Fake element
                            customData[i][headName] = {'type':'literal', 'value': emptyValue};
                        }
                    }
                }
                return customData;
            }
        },
        columns: [
            {data: 'idWLM.value'},
            {data: 'comune.value'},
            {data: 'comune.value'},
            {data: 'indirizzo.value'},
            {data: 'comune.value'},
            {data: 'comune.value'},
            {data: 'comune.value'},
            {data: 'comune.value'}
        ]
    });
} );
