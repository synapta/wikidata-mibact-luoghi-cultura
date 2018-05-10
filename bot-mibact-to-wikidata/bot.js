var credential = require('./credential.js');
var queries = require('./queries.js');
var request = require('requestretry');

const config = {
  // One authorization mean is required

  // either a username and password
  username: credential.user,
  password: credential.password,

  // Optional
  verbose: false, // Default: false
  wikibaseInstance: 'https://www.wikidata.org/w/api.php',
  userAgent: `wikidata-edit (https://github.com/maxlath/wikidata-edit)`
}
const wdEdit = require('wikidata-edit')(config);

//ASK MiBACT
let endpointMibactStart = {
    url: "http://dati.beniculturali.it/sparql?query=" + encodeURIComponent(queries.queryMibact),
    headers: {
      'Accept': 'application/json'
    },
    retryDelay: 3000
};
console.log("Asking Mibact...");
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
        }, 10000);
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
        },
        retryDelay: 5000
    };
    request(endpointWikidata, function (error, response, body) {
        if (error) {
            console.log('error:', error); // Print the error if one occurred
        } else {
            let arr = JSON.parse(body).results.bindings;
            //console.log(arr);

            //Nothing found
            if (arr.length === 0) {
                createNewWikidataItem(elem, function (){
                    cb();
                });
            //Found exactly one
            } else if (arr.length === 1) {
                updateWikidataItem(arr[0].item.value, elem);
                cb();
            //Found more than one
            } else if (arr.length > 1) {
                //If one is predominant
                if (arr[0].c.value > arr[1].c.value) {
                    updateWikidataItem(arr[0].item.value, elem);
                    cb();
                //If no consensus
                } else {
                    createNewWikidataItem(elem, function (){
                        cb();
                    });
                }
            }
        }
    });
}

var createNewWikidataItem = function (elem, cb) {
    console.log("Creating new Wikidata item");
    //console.log(elem)

    let obj = schiacciaElem(elem);

    if (obj.comune !== undefined) {
        console.log("Converting comune into Q...");
        let endpointWikidata = {
            url: "https://query.wikidata.org/sparql?query=" + encodeURIComponent(queries.queryComuneWikidata(obj.comune)),
            headers: {
              'Accept': 'application/json'
            },
            retryDelay: 5000
        };
        request(endpointWikidata, function (error, response, body) {
            if (error) {
                console.log('error:', error);
            } else {
                let res = JSON.parse(body).results.bindings;
                if (res.length > 0) obj.comune = res[0].wdId.value.replace("http://www.wikidata.org/entity/","");

                createItem(obj, function () {
                    cb();
                });
            }
        });
    } else {
        createItem(obj, function () {
            cb();
        });
    }


    //TODO fai addon coordinate
    //P625: { value: obj.coord, references: { P143: 'Q52897564' } }, //coordinate


}

var updateWikidataItem = function (wd, elem) {
    console.log("Update Wikidata item " + wd);

    let obj = schiacciaElem(elem);

    //wdEdit.alias.add(wd.replace("http://www.wikidata.org/entity/", ""), 'it', obj.label);
    //TODO controlla che i dati non ci siano già
}

var schiacciaElem = function (elem) {
    let newelem = {};
    newelem.label = elem.label.value;
    if (elem.id !== undefined) newelem.id = elem.id.value;
    if (elem.s !== undefined) newelem.uri = elem.s.value;
    if (elem.lat !== undefined && elem.long !== undefined) newelem.coord = elem.lat.value + " " + elem.long.value;
    if (elem.comune !== undefined) newelem.comune = elem.comune.value;
    if (elem.fullAddress !== undefined) newelem.fullAddress = elem.fullAddress.value;
    if (elem.website !== undefined) newelem.website = elem.website.value.replace(/\s/g, '');
    if (elem.telephone !== undefined) {
        newelem.telephone = elem.telephone.value.replace(/\./g, '').replace(/Tel/ig, '');
        if (newelem.telephone.includes(";")) newelem.telephone = newelem.telephone.split(";")[0];
        if (!newelem.telephone.startsWith("+39")) newelem.telephone = "+39 " + newelem.telephone.replace(/\s+/g, '');
        newelem.telephone = newelem.telephone.replace(/\s+$/g, '');
    }
    if (elem.fax !== undefined) {
        newelem.fax = elem.fax.value.replace(/\./g, '').replace(/Tel/ig, '');
        if (!newelem.fax.startsWith("+39")) newelem.fax = "+39 " + newelem.fax.replace(/\s+/g, '');
        newelem.fax = newelem.fax.value.replace(/\s+$/g, '');
    }
    if (elem.email !== undefined) newelem.email = elem.email.value.replace(/\s+$/g, '');
    if (elem.cap !== undefined) newelem.cap = elem.cap.value;
    if (elem.disciplina !== undefined) {
        switch (elem.disciplina.value) {
            case 'http://dati.beniculturali.it/iccd/cf/resource/SubjectDiscipline/chiesa':
                newelem.type = 'Q16970';
                break;
            case 'http://dati.beniculturali.it/iccd/cf/resource/SubjectDiscipline/palazzo':
                newelem.type = 'Q16560';
                break;
            case 'http://dati.beniculturali.it/iccd/CG/resource/SubjectDiscipline/museo':
                newelem.type = 'Q33506';
                break;
            case 'http://dati.beniculturali.it/iccd/cf/resource/SubjectDiscipline/sito_archeologico':
                newelem.type = 'Q839954';
                break;
        }
    }
    return newelem;
}

var createItem = function (obj, created) {
    console.log("Publishing to Wikidata...")
    let myClaims = {
        P17: { value: 'Q38', references: { P143: 'Q52897564' } }, //paese
        P1435: { value: 'Q26971668', references: { P143: 'Q52897564' } } //stato patrimonio
    };
    if (obj.type !== undefined && obj.type !== '') {
        myClaims["P31"] = { value: obj.type, references: { P143: 'Q52897564' } } //comune
    }
    if (obj.comune !== undefined && obj.comune.startsWith('Q')) {
        myClaims["P131"] = { value: obj.comune, references: { P143: 'Q52897564' } } //comune
    }
    if (obj.fullAddress !== undefined && obj.fullAddress !== '') {
        myClaims["P969"] = { value: obj.fullAddress, references: { P143: 'Q52897564' } } //indirizzo
    }
    if (obj.website !== undefined && obj.website !== '') {
        myClaims["P856"] = { value: obj.website, references: { P143: 'Q52897564' } } //indirizzo
    }
    if (obj.telephone !== undefined && obj.telephone !== '') {
        myClaims["P1329"] = { value: obj.telephone, references: { P143: 'Q52897564' } } //telefono
    }
    if (obj.email !== undefined && obj.email !== '') {
        myClaims["P968"] = { value: obj.email, references: { P143: 'Q52897564' } } //email
    }
    if (obj.fax !== undefined && obj.fax !== '') {
        myClaims["P2900"] = { value: obj.fax, references: { P143: 'Q52897564' } } //fax
    }
    if (obj.cap !== undefined && obj.cap !== '') {
        myClaims["P281"] = { value: obj.cap, references: { P143: 'Q52897564' } } //cap
    }
    if (obj.id !== undefined && obj.id !== '') {
        myClaims["P528"] = { value: obj.id, qualifiers: { P972: 'Q52896862', P2699 : obj.uri } ,
                               references: { P143: 'Q52897564' } }
    }

    //console.log(myClaims)

    wdEdit.entity.create({
        labels: { it: obj.label},
        claims: myClaims
    }).then(re => {
        if (re.success) {
            console.log("Created!");
            created();
        } else {
            console.log(re);
            process.exit(0);
        }
    }).catch(err => {
        console.log("Something wrong!");
        console.log(err.body.error.messages);
        console.log(myClaims)
        process.exit(0);
    });
}
