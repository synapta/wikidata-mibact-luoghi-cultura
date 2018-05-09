var credential = require('./credential.js');
var queries = require('./queries.js');
var request = require('request');

const config = {
  // One authorization mean is required

  // either a username and password
  username: credential.user,
  password: credential.password,

  // Optional
  verbose: true, // Default: false
  wikibaseInstance: 'https://www.wikidata.org/w/api.php',
  userAgent: `wikidata-edit (https://github.com/maxlath/wikidata-edit)`
}
const wdEdit = require('wikidata-edit')(config);

//ASK MiBACT
let endpointMibactStart = {
    url: "http://dati.beniculturali.it/sparql?query=" + encodeURIComponent(queries.queryMibact),
    headers: {
      'Accept': 'application/json'
    }
};
request(endpointMibactStart, function (error, response, body) {
    if (error) {
        console.log('error:', error); // Print the error if one occurred
    } else {
        let arr = JSON.parse(body).results.bindings;
        callWikidata(arr, 0);
    }
});

var callWikidata = function (arr, index) {
    askWikidata(arr[index], function () {
        setTimeout(function() {
            callWikidata(arr, ++index);
        }, 2000);
    });
}


var askWikidata = function(elem, cb) {
    console.log("Asking Wikidata " + elem.label.value);
    //console.log(elem)
    //console.log(queries.queryWikidata(elem))

    let endpointWikidata = {
        url: "https://query.wikidata.org/sparql?query=" + encodeURIComponent(queries.queryWikidata(elem)),
        headers: {
          'Accept': 'application/json'
        }
    };
    request(endpointWikidata, function (error, response, body) {
        if (error) {
            console.log('error:', error); // Print the error if one occurred
        } else {
            let arr = JSON.parse(body).results.bindings;
            //console.log(arr);

            //Nothing found
            if (arr.length === 0) {
                createNewWikidataItem(elem);
            //Found exactly one
            } else if (arr.length === 1) {
                updateWikidataItem(arr[0].item.value, elem);
            //Found more than one
            } else if (arr.length > 1) {
                //If one is predominant
                if (arr[0].c.value > arr[1].c.value) {
                    updateWikidataItem(arr[0].item.value, elem);
                //If no consensus
                } else {
                    createNewWikidataItem(elem);
                }
            }
            cb();
        }
    });
}

var createNewWikidataItem = function (elem) {
    console.log("Creating new Wikidata item");

    /*let obj = schiacciaElem(elem);

    wdEdit.entity.create({
      labels: { it: obj.label},
      claims: {
        //P31: { value: obj.type, references: { P143: 'Q52897564' } }, //tipo
        P17: 'Q38', //paese
        //P131: { value: obj.comune, references: { P143: 'Q52897564' } }, //comune
        P625: { value: obj.coord, references: { P143: 'Q52897564' } }, //coordinate
        P969: { value: obj.fullAddress, references: { P143: 'Q52897564' } }, //indirizzo
        P1435: 'Q26971668'//, //stato patrimonio
        P856: { value: obj.website, references: { P143: 'Q52897564' } }, //sitoweb
        P1329: { value: obj.telephone, references: { P143: 'Q52897564' } }, //telefono
        P968: { value: obj.email, references: { P143: 'Q52897564' } }, //mail
        P2900: { value: obj.fax, references: { P143: 'Q52897564' } }, //fax
        P281: { value: obj.cap, references: { P143: 'Q52897564' } }, //cap
        P528: { value: obj.id, qualifiers: { P972: 'Q52896862', P2699 : obj.uri } ,
                               references: { P143: 'Q52897564' } }
      }
    })*/
}

var updateWikidataItem = function (wd, elem) {
    console.log("Update Wikidata item " + wd);
}

var schiacciaElem = function (elem) {
    let newelem = {};
    newelem.label = elem.label.value;
    if (elem.id !== undefined) newelem.id = elem.id.value;
    //TODO if (elem.type !== undefined) newelem.type = elem.type.value;
    if (elem.s !== undefined) newelem.uri = elem.s.value;
    if (elem.lat !== undefined && elem.long !== undefined) newelem.coord = elem.lat.value + " " + elem.long.value;
    //TODO if (elem.comune !== undefined) newelem.comune = elem.comune.value;
    if (elem.fullAddress !== undefined) newelem.fullAddress = elem.fullAddress.value;
    if (elem.website !== undefined) newelem.website = elem.website.value;
    if (elem.telephone !== undefined) newelem.telephone = elem.telephone.value;
    if (elem.email !== undefined) newelem.email = elem.email.value;
    if (elem.fax !== undefined) newelem.fax = elem.fax.value;
    if (elem.cap !== undefined) newelem.cap = elem.cap.value;
    return newelem;
}
