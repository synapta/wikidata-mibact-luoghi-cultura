// alert('debug!');
var emptyValue = '---';
// Elencare qui le intestazioni che necessitano di personalizzazioni
// da sdoppiare in el.custom
var customHeads = ['coord', 'commons', 'comune'];  // , 'comune'
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

/**
var prettify_comune = function (record, fieldName) {
  console.log(record);
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
**/

////////////////////////////////

// Funzioni di utlità
var wikidataUrl2id = function (record) {
    let els = record.split('/');
    return els[els.length - 1];
};

var appDataTableObj = '';

$(document).ready( function () {

    var doMonumentalSearch = function (comuneWdId, comuneLabel) {
        /**
        Ricerca i monumenti in base alla chiave di ricerca comune
        **/
        // Rendo visibile la colonna con i dati tabellari
        $('.search-comuni-results').removeClass('d-none');
        var monumentiQueryUrl = WIKIDATABASEQUERYURL + encodeURIComponent(
            QUERY_SPARQL_MONUMENTI_PATTERN.replace(/{{wd}}/g, comuneWdId)
        );
        if (appDataTableObj !== '') {
            appDataTableObj.destroy();
        }
        /**
        var table = '<div class="row search-comuni-results">' +
        $('.search-comuni-results-master').html() +
        'div';
        table.replace('appTableMaster', 'appTable');
        **/
        // /**
        appDataTableObj = $('#appTable').DataTable({
            "language": {
                "lengthMenu": "Mostra _MENU_ monumenti per pagina",
                "zeroRecords": "Nessun monumento trovato per questa ricerca",
                "info": "Pagina _PAGE_ di _PAGES_",
                "search": "Cerca",
                "paginate": {
                    "first":      "Primo",
                    "last":       "Ultimo",
                    "next":       "Succ.",
                    "previous":   "Prec."
                },
                "infoEmpty": "Nessun monumento",
                "infoFiltered": "(filtered from _MAX_ total records)"
            },
            ajax: {
                // "url": "js/devel-results.json",
                "url": monumentiQueryUrl,
                // dataSrc: 'results.bindings',
                "dataSrc": function ( json ) {
                    // console.log(json)
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
                            // Forzo un nuovo campo custom con label del comune / luogo
                            // che proviene dalla richiesta precedente
                            customData[i][customHeadsName]['comuneLabel'] = comuneLabel;
                        }
                        if (errcount == 0) { // debug
                            // record perfetto
                            // console.log(customData[i])
                            // console.log(json.results.bindings[i])
                        }
                    }
                    return customData;
                }
            },
            columns: [
                {data: 'idWLM.value'},  // 08C1450001
                {data: 'idWDLabel.value'},  // Fortezza di Sarzanello
                {data: 'customFields.comuneLabel'},  // http://www.wikidata.org/entity/Q160628
                {data: 'indirizzo.value'},  // Via alla Fortezza
                {data: 'customFields.coord.html'},  // Point(9.97152778 44.11510833) Long / Lat
                {data: 'customFields.commons.html'} // https://commons.wikimedia.org/w/index.php?title=Category:Santa_Maria_Maggiore_%28Avigliana%29
            ]
        });
        // **/
    };


    var initializeAutocomplete = function (comuni) {
        /**
            Avvio sistema di autocompletamento
        **/
        // Operazione preliminare: carico i risultati in una variabile
        // @see http://twitter.github.io/typeahead.js/examples/
        var comuniAutocomplete = new Bloodhound({
            // datumTokenizer: Bloodhound.tokenizers.whitespace,
            datumTokenizer: function(d) {
                // Quale elemento deve essere usato per la ricerca?
                return Bloodhound.tokenizers.whitespace(d.label);
            },
            queryTokenizer: Bloodhound.tokenizers.whitespace,
            // url points to a json file that contains an array of country names, see
            // https://github.com/twitter/typeahead.js/blob/gh-pages/data/countries.json
            // prefetch: '/comuni.json'
            local: comuni
        });

        // 1mo passo: ricerca del comune
        $('.search-comuni .typeahead').typeahead({
          hint: true,
          highlight: true,
          minLength: 1
        },
        {
          name: 'comuni',
          displayKey: 'label',  // quale campo compare nella tendina di selez?
          source: comuniAutocomplete
        });
    };


    // AVVIO al document ready
    // Carica dati per autocomplete
    $.ajax ({
        type:'GET',
        url: "/comuni.json",
        error: function(e) {
            // console.log(e)
            alert('Error retrieving data');
        },
        success: function(json) {
            // var newJson = enrichJson(json);
            initializeAutocomplete(json);
        }
    });


    $('.typeahead').bind('typeahead:select', function(ev, record) {
        // console.log('Selection: ' + search);
        // doMonumentalSearch(search);
        let id = wikidataUrl2id(record.wdid);
        // Effettua la ricerca tramite identificativo WikiData del luogo
        doMonumentalSearch(id, record.label);
        // console.log();
    });



});
