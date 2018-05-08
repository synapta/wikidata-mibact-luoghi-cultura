var credential = require('./credential.js');
var queries = require('./queries.js');
var request = require('request');

/*const config = {
  // One authorization mean is required

  // either a username and password
  username: credential.user,
  password: credential.password,

  // Optional
  verbose: true, // Default: false
  wikibaseInstance: 'https://www.wikidata.org/w/api.php',
  userAgent: `wikidata-edit (https://github.com/maxlath/wikidata-edit)`
}
const wdEdit = require('wikidata-edit')(config);*/

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
    console.log(queries.queryWikidata(elem))

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
}

var updateWikidataItem = function (wd, elem) {
    console.log("Update Wikidata item " + wd);
}
