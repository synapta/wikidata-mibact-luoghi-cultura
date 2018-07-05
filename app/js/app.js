// Valore usato quando il campo è assente nel record risultato
// Può essere testo o HTML
var emptyValue = '<span class="none">&mdash;</span>';
// i campi custom verranno inseriti in una proprietà chiamata:
var customHeadsName = 'customFields';
// Elencare qui i campi esistenti che necessitano di personalizzazioni
// da sdoppiare in el[CustomHeadsName]
var customHeads = ['coord', 'commons', 'idWDLabel', 'idCustodeLabel', 'immagine', 'email', 'sitoweb'];

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
    try {
        if (typeof record[fieldName] === 'undefined' || record[fieldName].value === emptyValue) {
            throw "Value undefined";
        }
        // modifico ciò che mi interessa
        var re = /Point\(([0-9\.]+) ([0-9\.]+)\)/;
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


var prettify_sitoweb = function (record, fieldName) {
  try {
      if (typeof record[fieldName] === 'undefined' || record[fieldName].value === emptyValue) {
          throw "Value undefined";
      }
      record[customHeadsName][fieldName] = {};
      record[customHeadsName][fieldName]['html'] = '<a target="_blank" href="{{sitoweb}}">URL</a>'
      .replace(/{{sitoweb}}/g, record[fieldName].value);
  }
  catch (e) {
      // Fake element
      record[customHeadsName][fieldName] = {
          'html': emptyValue
      };
  }
};


var prettify_email = function (record, fieldName) {
  try {
      if (typeof record[fieldName] === 'undefined' || record[fieldName].value === emptyValue) {
          throw "Value undefined";
      }
      record[customHeadsName][fieldName] = {};
      record[customHeadsName][fieldName]['html'] = '<a target="_blank" href="{{email}}">Email</a>'
      .replace(/{{email}}/g, record[fieldName].value);
  }
  catch (e) {
      // Fake element
      record[customHeadsName][fieldName] = {
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
      record[customHeadsName][fieldName]['html'] = '<a target="_blank" href="https://commons.wikimedia.org/w/index.php?title=Category:{{commons}}">Categoria</a>'
      .replace(/{{commons}}/g, record[fieldName].value);
  }
  catch (e) {
      // Fake element
      record[customHeadsName][fieldName] = {
          'html': emptyValue
      };
  }
};


var prettify_immagine = function (record, fieldName) {
  try {
      if (typeof record[fieldName] === 'undefined' || record[fieldName].value === emptyValue) {
          throw "Value undefined";
      }
      record[customHeadsName][fieldName] = {};
      record[customHeadsName][fieldName]['html'] = '<a target="_blank" href="{{immagine}}">Img</a>'
      .replace(/{{immagine}}/g, record[fieldName].value);
  }
  catch (e) {
      // Fake element
      record[customHeadsName][fieldName] = {
          'html': emptyValue
      };
  }
};


var prettify_idWDLabel = function (record, fieldName) {
  try {
      if (typeof record[fieldName] === 'undefined' || record[fieldName].value === emptyValue) {
          throw "Label undefined";
      }
      // Url della entità (monumento)
      var idName = 'idWD';
      if (typeof record[idName] === 'undefined' || record[idName].value === emptyValue) {
          throw "Cannot generate url, no WDid defined in record";
      }
      var entityUrl = record[idName].value;
      record[customHeadsName][fieldName] = {};
      record[customHeadsName][fieldName]['html'] = '<a target="_blank" href="{{url}}">{{label}}</a>'
      .replace(/{{url}}/g, entityUrl)
      .replace(/{{label}}/g, record[fieldName].value);
  }
  catch (e) {
      // Elemento fittizio
      record[customHeadsName][fieldName] = {
          'html': emptyValue
      };
  }
};


var prettify_idCustodeLabel = function (record, fieldName) {
  try {
      if (typeof record[fieldName] === 'undefined' || record[fieldName].value === emptyValue) {
          throw "Label undefined";
      }
      // Url della entità (monumento)
      var idName = 'idCustode';
      if (typeof record[idName] === 'undefined' || record[idName].value === emptyValue) {
          throw "Cannot generate url, no WDid defined in record";
      }
      var entityUrl = record[idName].value;
      record[customHeadsName][fieldName] = {};
      record[customHeadsName][fieldName]['html'] = '<a target="_blank" href="{{url}}">{{label}}</a>'
      .replace(/{{url}}/g, entityUrl)
      .replace(/{{label}}/g, record[fieldName].value);
  }
  catch (e) {
      // Elemento fittizio
      record[customHeadsName][fieldName] = {
          'html': emptyValue
      };
  }
};


// Funzione ora usata direttamente ma che potrebbe essere usata automaticamente
// nel caso il campo comuneLabel fosse presente nel record risultato
var prettify_comune = function (record, fieldNames) {
  // console.log(record);  // debug
  var fieldName = fieldNames[0];
  try {
      if (typeof record[fieldName] === 'undefined' || record[fieldName].value === emptyValue) {
          throw "Value undefined";
      }
      var comuneLabel = record[fieldNames[0]].value;
      var comuneWdId = record[fieldNames[1]].value;
      record[customHeadsName]['comuneLabel'] = {};
      record[customHeadsName][fieldName]['html'] = '<a target="_blank" href="{{url}}">{{nome}}</a>'
      .replace(/{{url}}/g, comuneWdId)  // url
      .replace(/{{nome}}/g, comuneLabel);  // solo codice es. Q13433
  }
  catch (e) {
      // Record fittizio
      record[customHeadsName][fieldName] = {
          'html': emptyValue
      };
  }
};

////////////////////////////////

// Funzioni di utlità
var wikidataUrl2id = function (record) {
    let els = record.split('/');
    return els[els.length - 1];
};

var appDataTableObj = '';

$(document).ready( function () {

    var doMonumentalSearch = function (comuneWdIdOnly, comuneWdId, comuneLabel) {
        /**
        Ricerca i monumenti in base alla chiave di ricerca comune
        comuneWdIdOnly: id del comune senza aurl
        comuneWdId: id del comune (url)
        comuneLabel: nome del comune
        **/
        // Rendo visibile la colonna con i dati tabellari
        $('.search-comuni-results').removeClass('d-none');
        var monumentiQueryUrl = WIKIDATABASEQUERYURL + encodeURIComponent(
            QUERY_SPARQL_MONUMENTI_PATTERN.replace(/{{wd}}/g, comuneWdIdOnly)
        );
        // Rigenero la tabella per una nuova richiesta DataTable
        if (appDataTableObj !== '') {
            appDataTableObj.destroy();
        }
        appDataTableObj = $('#appTable').DataTable({
            "language": {
                "lengthMenu": "Mostra _MENU_ monumenti per pagina",
                "zeroRecords": "Nessun monumento trovato per questa ricerca",
                "info": "Pagina _PAGE_ di _PAGES_",
                "search": "Cerca monumenti in questo luogo",
                "paginate": {
                    "first":      "Primo",
                    "last":       "Ultimo",
                    "next":       "Succ.",
                    "previous":   "Prec."
                },
                "infoEmpty": "Nessun monumento",
                "infoFiltered": "(trovati fra i _MAX_ monumenti del luogo)"
            },
            ajax: {
                // "url": "js/devel-results.json",
                "url": monumentiQueryUrl,
                // dataSrc: 'results.bindings',
                "dataSrc": function ( json ) {
                    console.log(json)
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
                        // Forzo un nuovo campo con label del comune / luogo
                        // che proviene dalla richiesta precedente
                        customData[i]['comuneLabel'] = {'type':'literal'};
                        customData[i]['comuneLabel']['value'] = comuneLabel;
                        customData[i]['comuneWdId'] = {'type':'literal'};
                        customData[i]['comuneWdId']['value'] = comuneWdId;
                        // stilizzo il campo
                        prettify_comune(customData[i], ['comuneLabel', 'comuneWdId']);
                         /*if (errcount == 0) { // debug
                            // record perfetto
                             console.log(customData[i])
                             console.log(json.results.bindings[i])
                         }*/
                    }
                    return customData;
                }
            },
            columns: [
                {data: 'idWLM.value'},  // 08C1450001
                {data: 'customFields.idWDLabel.html'},  // Fortezza di Sarzanello
                {data: 'customFields.idCustodeLabel.html'},  // Fortezza di Sarzanello
                {data: 'customFields.comuneLabel.html'},  // link al comune
                {data: 'indirizzo.value'},  // Via alla Fortezza
                {data: 'customFields.coord.html'},  // Point(9.97152778 44.11510833) Long / Lat
                {data: 'customFields.email.html'},
                {data: 'telefono.value'},
                {data: 'customFields.sitoweb.html'},
                {data: 'customFields.immagine.html'},
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
          'hint': true,
          'highlight': true,
          'minLength': 1
        },
        {
          'name': 'comuni',
          'displayKey': 'label',  // quale campo compare nella tendina di selez?
          'source': comuniAutocomplete,
          'limit': 10
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
            // Attiva box di ricerca ora che ha i risultati
            $('#comuniSearch').removeAttr('disabled');
            // var newJson = enrichJson(json);
            initializeAutocomplete(json);
        }
    });


    $('.typeahead').bind('typeahead:select', function(ev, record) {
        // console.log('Selection: ' + search);
        // doMonumentalSearch(search);
        let id = wikidataUrl2id(record.wdid);
        // Effettua la ricerca tramite identificativo WikiData del luogo
        doMonumentalSearch(id, record.wdid, record.label);
        // console.log();
    });
});
