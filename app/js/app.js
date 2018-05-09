// alert('debug!');
var emptyValue = '---';
// Elencare qui le intestazioni che necessitano di personalizzazioni
// da sdoppiare in el.custom
var customHeads = ['coord', 'commons', 'comune'];
// i campi custom verranno inseriti in una proprietà chiamata:
var customHeadsName = 'customFields';

var prettify = function (record, fieldName) {
    /**
    Richiama una funzione prettify_NOMECAMPO

    field.name: nome del campo come compare nel record
    field.value: valore del campo
    **/
    window["prettify_" + fieldName](record, fieldName);
};

// Funzioni di abbellimento: solitamente aggiungono campi e non modificano
// gli esistenti ma essendo passato by reference possono anche alterarlo
// al bisogno
var prettify_coord = function (record, fieldName) {
    // Trasformo coordinate in link cliccabile
    // replico intero record
    //// record[customHeadsName][fieldName] = record[fieldName];
    try {
        if (typeof record[fieldName] === 'undefined' || record[fieldName].value === emptyValue) {
            throw "Value undefined";
        }
        // modifico ciò che mi interessa
        var re = /Point\(([01234567890.]+) ([01234567890.]+)\)/;
        // es. Point(9.675583 45.703861)
        // formato Long / Lat
        var newValueMatch = record[fieldName].value.match(re);
        record[customHeadsName][fieldName] = {
            'long': newValueMatch[1],
            'lat': newValueMatch[2]
        };
        record[customHeadsName][fieldName]['html'] = '<a target="_blank" href="http://tools.wmflabs.org/geohack/geohack.php?language=it&params={{lat}}_N_{{long}}_E_dim:1000">{{lat}} N {{long}} E</a>'
        .replace(/{{lat}}/g, record[customHeadsName][fieldName].lat)
        .replace(/{{long}}/g, record[customHeadsName][fieldName].long);
    }
    catch (e) {
        // Fake element
        record[customHeadsName][fieldName] = {
            'long': emptyValue,
            'lat': emptyValue,
            'html': emptyValue
        };
    }
};


var prettify_commons = function (record, fieldName) {
  try {
      if (typeof record[fieldName] === 'undefined' || record[fieldName].value === emptyValue) {
          throw "Value undefined";
      }
      record[customHeadsName][fieldName] = {};
      record[customHeadsName][fieldName]['html'] = '<a target="_blank" href="https://commons.wikimedia.org/w/index.php?title=Category:{{commons}}">Monumento</a>'
      .replace(/{{commons}}/g, record[fieldName].value);
  }
  catch (e) {
      // Fake element
      record[customHeadsName][fieldName] = {
          'html': emptyValue
      };
  }
};


var prettify_comune = function (record, fieldName) {
  try {
      if (typeof record[fieldName] === 'undefined' || record[fieldName].value === emptyValue) {
          throw "Value undefined";
      }
      record[customHeadsName][fieldName] = {};
      var zurl = record[fieldName].value;
      var aurl =  zurl.split('/');
      record[customHeadsName][fieldName]['html'] = '<a target="_blank" href="{{url}}">{{nome}}</a>'
      .replace(/{{url}}/g, zurl)  // url
      .replace(/{{nome}}/g, aurl[aurl.length -1]);  // solo codice es. Q13433
  }
  catch (e) {
      // Fake element
      record[customHeadsName][fieldName] = {
          'html': emptyValue
      };
  }
};



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

    $('#appTable').DataTable({
        ajax: {
            // "url": "js/devel-results.json",
            "url": "https://query.wikidata.org/sparql?query=SELECT%20?idWLM%20?idWD%20?idWDLabel%20?comune%20?indirizzo%20?coord%20?commons%0AWHERE%20%7B%0A?idWD%20wdt:P131%20?comune%20.%20?comune%20wdt:P17%20wd:Q38%20.%0AOPTIONAL%20%7B%20?idWD%20wdt:P969%20?indirizzo%20.%20%7D%0AOPTIONAL%20%7B%20?idWD%20wdt:P625%20?coord%20.%20%7D%0AOPTIONAL%20%7B%20?idWD%20wdt:P373%20?commons%20.%20%7D%0A%0A%7B%20?idWD%20wdt:P2186%20?idWLM%20.%20%7D%20UNION%0A%7B%20?idWD%20wdt:P1435%20wd:Q26971668%20.%20%7D%0A%0ASERVICE%20wikibase:label%20%7B%20bd:serviceParam%20wikibase:language%20%22it,en%22.%20%7D%0A%7D%0ALIMIT%20500",
            // dataSrc: 'results.bindings',
            "dataSrc": function ( json ) {
                var customData = [];
                var headName = '';
                var errcount = 0;  // debug
                var record = {};
                var isCustomHead = false;
                for ( var i=0, ien=json.results.bindings.length ; i < ien ; i++ ) {
                    customData[i] = {};
                    // campi custom, solitamente elaborazioni di altri campi
                    customData[i][customHeadsName] = {};
                    // Per ogni singolo campo (come letto da json.head.vars)
                    // ricava i valori come da query e ne aggiunge altri
                    // in json[customHeadsName]
                    for (j=0; j < json.head.vars.length; j++) {
                        errcount = 0;  // debug
                        headName = json.head.vars[j];
                        isCustomHead = customHeads.indexOf(headName) != -1;
                        try {
                            if (typeof json.results.bindings[i][headName] === 'undefined') {
                                throw "Value undefined";
                            }
                            record = json.results.bindings[i][headName];
                            customData[i][headName] = record;
                        }
                        catch (e) {
                            // Fake element
                            customData[i][headName] = {'type':'literal', 'value': emptyValue};
                            errcount++;
                        }
                        // Eventuali campi customizzati aggiuntivi
                        if (isCustomHead) {
                            prettify(customData[i], headName);
                        }
                    }
                    // j=0; j < json.head.vars.length; j++
                    if (errcount > 0) {
                        console.log(customData[i])
                    }
                }
                return customData;
            }
        },
        columns: [
            {data: 'idWLM.value'},  // 08C1450001
            {data: 'idWDLabel.value'},  // Fortezza di Sarzanello
            {data: 'customFields.comune.html'},  // http://www.wikidata.org/entity/Q160628
            {data: 'indirizzo.value'},  // Via alla Fortezza
            {data: 'customFields.coord.html'},  // Point(9.97152778 44.11510833) Long / Lat
            {data: 'customFields.commons.html'} // https://commons.wikimedia.org/w/index.php?title=Category:Santa_Maria_Maggiore_%28Avigliana%29
        ]
    });
} );
