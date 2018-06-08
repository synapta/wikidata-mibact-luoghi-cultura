var credential = require('./credential.js');
var queries = require('./queries.js');
var datatypeMapping = require('./datatypeMapping.js');
var request = require('request');

var count = 0;

const config = {
  // One authorization mean is required

  // either a username and password
  username: credential.user,
  password: credential.password,

  summary: 'Import data from MiBACT endpoint for WLM #WLM-MIBACT-2018',

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
    }
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
    console.log('>>>>>>>> Counter: ', ++count);

    askWikidata(arr[index], arr, index, function () {
        setTimeout(function() {
            callWikidata(arr, ++index);
        }, 10000);
    });
}



var askWikidata = function(elem, arr, index, cb) {
    console.log("Asking Wikidata " + elem.label.value);

    let endpointWikidata = {
        url: "https://query.wikidata.org/sparql?query=" + encodeURIComponent(queries.queryWikidata(elem)),
        headers: {
          'Accept': 'application/json'
        },
        timeout: 10000
    };
    request(endpointWikidata, function (error, response, body) {
        if (error) {
            console.log('error:', error); // Print the error if one occurred
            console.log("Once again!");
            callWikidata(arr, index);
        } else {
            let arr = JSON.parse(body).results.bindings;

            //Nothing found
            if (arr.length === 0) {
                console.log("Nothing found: I choose to create new item!");
                createNewWikidataItem(elem, function (){
                    cb();
                });
            //Found exactly one
            } else if (arr.length === 1) {
                console.log("Only one item: I choose to update " + arr[0].item.value);
                updateWikidataItem(arr[0].item.value, elem, function() {
                    cb();
                })
            //Found more than one
            } else if (arr.length > 1) {
                //If one is predominant
                if (arr[0].c.value > arr[1].c.value) {
                    console.log("One item is predominant: I choose to update " + arr[0].item.value);
                    updateWikidataItem(arr[0].item.value, elem, function() {
                        cb();
                    })
                //If no consensus
                } else {
                    console.log("No consensus: I choose to create new item!");
                    createNewWikidataItem(elem, function (){
                        cb();
                    });
                }
            }
        }
    });
}

var getComuneQ = function(comune, cb) {
    console.log("Converting comune " + comune + " into Q...");
    let endpointWikidata = {
        url: "https://query.wikidata.org/sparql?query=" + encodeURIComponent(queries.queryComuneWikidata(comune)),
        headers: {
          'Accept': 'application/json'
        },
        timeout: 10000
    };
    request(endpointWikidata, function (error, response, body) {
        cb(error, response, body)
    })
}


var createNewWikidataItem = function (elem, cb) {
    console.log("Creating new Wikidata item");

    let obj = schiacciaElem(elem);

    if (obj.comune !== undefined) {
        getComuneQ(obj.comune, function(error, response, body) {
            if (error) {
                console.log('error:', error);
                console.log("Once again!");
                createNewWikidataItem(elem, function (){
                    cb();
                });
            } else {
                let res = JSON.parse(body).results.bindings;
                if (res.length > 0) {
                    console.log("Found a matching comune");
                    obj.comune = res[0].wdId.value.replace("http://www.wikidata.org/entity/","");
                } else {
                    console.log("Didn't found any comune");
                }

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
}

var getPropValues = function(elem, prop) {
    let array = []
    elem.forEach(function(el){
        if (el.predicate.value.replace('http://www.wikidata.org/prop/direct/', '') === prop) {
            array.push(el.object.value)
        }
    })
    return array;
}

//Controllo se è un valore da aggiungere oppure no
var shouldAddNewStatement = function (elem, obj, prop, valueName) {
    var testVar = obj[valueName];
    if (prop === 'P31' || prop === 'P131') {
        testVar = 'http://www.wikidata.org/entity/' + obj[valueName];
    }

    if (prop === 'P625') {
        testVar = "Point(" + obj[valueName].longitude.toString() + " " + obj[valueName].latitude.toString() + ")";
    }

    let array = getPropValues(elem, prop);

    var statement = false;

    //Se non c'è ed è buona creo lo statement
    //console.log(array, testVar, array.indexOf(testVar));
    if (array.indexOf(testVar) < 0) {
        if (obj[valueName] !== undefined && obj[valueName] !== '')
            statement = { value: obj[valueName], references: { P143: 'Q52897564' } };
    }
    return statement;
}

var updateWikidataItem = function (wd, elem, cb) {
    let obj = schiacciaElem(elem);
    if (obj.comune !== undefined) {
        getComuneQ(obj.comune, function(error, response, body) {
            if (error) {
                console.log('error:', error);
                console.log("Once again!");
                updateWikidataItem(wd, elem, function() {
                    cb();
                })
            } else {
                let res = JSON.parse(body).results.bindings;
                if (res.length > 0) {
                    console.log("Found a matching comune");
                    obj.comune = res[0].wdId.value.replace("http://www.wikidata.org/entity/","");
                } else {
                    console.log("Didn't found any comune");
                }
                createWikidataStatements(wd, obj, elem, cb);
            }
        });
    } else {
        createWikidataStatements(wd, obj, elem, cb);
    }
}

var createWikidataStatements = function (wd, obj, elem, cb) {
    let endpointWikidata = {
        url: "https://query.wikidata.org/sparql?query=" + encodeURIComponent('DESCRIBE <' + wd + '>'),
        headers: {
          'Accept': 'application/json'
        },
        timeout: 10000
    };
    //Chiedo dati per il Q che voglio aggiornare
    request(endpointWikidata, function (error, response, body) {
        let wdObj = JSON.parse(body).results.bindings;
        let myClaims = {};

        //Se i comuni sono diversi creo nuovo item
        if (getPropValues(wdObj, 'P131').length === 0 || getPropValues(wdObj, 'P131')[0].replace("http://www.wikidata.org/entity/","") !== obj.comune) {
            console.log("Countermand! Different P131, I create new item");
            createNewWikidataItem(elem, function (){
                cb();
            });
            return;
        }

        //Se gli id mibact sono diversi creo nuovo item
        if (getPropValues(wdObj, 'P528').length > 0 && getPropValues(wdObj, 'P528')[0] !== obj.id) {
            console.log("Countermand! Different P528, I create new item");
            createNewWikidataItem(elem, function (){
                cb();
            });
            return;
        }

        let propDict = {
            "P31": 'type',
            "P131": 'comune',
            "P969": 'fullAddress',
            "P856": 'website',
            "P1329": 'telephone',
            "P968": 'email',
            "P2900": 'fax',
            "P625": 'coord',
            "P281": 'cap',
            "P528": 'id',
            "P973": 'uri'
        };

        if (obj.type === undefined )
            propDict.P31 = 'typeInf';

        let countries = getPropValues(wdObj, 'P17')
        if (countries.indexOf('http://www.wikidata.org/entity/Q38') < 0)
                myClaims['P17'] = { value: 'Q38', references: { P143: 'Q52897564' } }

        let types = getPropValues(wdObj, 'P1435');
        if (types.indexOf('http://www.wikidata.org/entity/Q26971668') < 0)
                myClaims['P1435'] = { value: 'Q26971668', references: { P143: 'Q52897564' } }

        Object.keys(propDict).forEach(function(key) {
            if (obj[propDict[key]] !== undefined) {
                let newItem = shouldAddNewStatement(wdObj, obj, key, propDict[key]);
                if (key === "P528" && newItem !== false) {
                    myClaims["P528"] = { value: obj.id, qualifiers: { P972: 'Q52896862', P2699 : obj.uri } ,
                                         references: { P143: 'Q52897564' } }
                } else if (newItem) {
                    myClaims[key] = newItem;
                }
            }
        });

        if (myClaims.P31bis !== undefined) {
            myClaims['P31'] = {value: myClaims.P31bis.value }
            delete myClaims.P31bis
        }

        if (Object.keys(myClaims).length > 0) {
            console.log("Updating Wikidata item " + wd + "...");
            wdEdit.entity.edit({
                id: wd.replace('http://www.wikidata.org/entity/', ''),
                claims: myClaims
            }).then(re => {
                if (re.success) {
                    console.log("Updated!");
                    cb();
                } else {
                    console.log(re);
                    process.exit(0);
                }
            }).catch(err => {
                console.log("Something wrong!");
                console.log(myClaims)
                console.log(JSON.stringify(err));
                process.exit(0);
            });
        } else {
            console.log("No Update for: " + wd + ". Skipping!");
            cb();
        }
    });
}

var schiacciaElem = function (elem) {
    let newelem = {};
    newelem.label = elem.label.value.replace(/\\"/, '"');
    if (elem.id !== undefined) newelem.id = elem.id.value;
    if (elem.s !== undefined) newelem.uri = elem.s.value;
    if (elem.lat !== undefined && elem.long !== undefined && !isNaN(parseFloat(elem.lat.value)) && !isNaN(parseFloat(elem.long.value)) )
        newelem.coord = {
            latitude: parseFloat(elem.lat.value),
            longitude: parseFloat(elem.long.value),
            altitude: null,
            precision: 0.00001,
            globe: 'http://www.wikidata.org/entity/Q2'
        };
    if (elem.comune !== undefined) newelem.comune = elem.comune.value;
    if (elem.fullAddress !== undefined) newelem.fullAddress = elem.fullAddress.value.replace(/^\s\s*/, '').replace(/\s\s*$/, '');
    if (elem.website !== undefined) newelem.website = elem.website.value.replace(/\s/g, '');
    if (elem.telephone !== undefined) {
        newelem.telephone = elem.telephone.value.replace(/\./g, '').replace(/Tel/ig, '');
        if (newelem.telephone.includes(";")) newelem.telephone = newelem.telephone.split(";")[0];
        if (newelem.telephone.includes(",")) newelem.telephone = newelem.telephone.split(",")[0];
        if (newelem.telephone.includes(" - ")) newelem.telephone = newelem.telephone.split(" - ")[0];
        if (newelem.telephone.includes('+ ')) newelem.telephone = newelem.telephone.replace("+ ", "+");

        newelem.telephone = newelem.telephone.replace(/[^0-9.]/g, "");
        if (!newelem.telephone.replace(/\s+/g, '').startsWith("+39")) {
            newelem.telephone = "+39 " + newelem.telephone.replace(/\s+/g, '');
        }
        newelem.telephone = newelem.telephone.replace(/\s+$/g, '').replace("/", '');
    }
    if (elem.fax !== undefined) {
        newelem.fax = elem.fax.value.replace(/\./g, '').replace(/Tel/ig, '');
        if (!newelem.fax.startsWith("+39")) newelem.fax = "+39 " + newelem.fax.replace(/\s+/g, '');
        newelem.fax = newelem.fax.replace(/\s+$/g, '');
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
    if (newelem.type === undefined) {
        elem.typeInf = datatypeMapping.mapTypeFromLabel(newelem.label)
        if (elem.typeInf !== undefined)
            newelem.typeInf = elem.typeInf;
    }

    console.log(newelem)
    return newelem;
}

var createItem = function (obj, created) {
    let myClaims = {
        P17: { value: 'Q38', references: { P143: 'Q52897564' } }, //paese
        P1435: { value: 'Q26971668', references: { P143: 'Q52897564' } } //stato patrimonio
    };
    if (obj.type !== undefined && obj.type !== '') {
        myClaims["P31"] = { value: obj.type, references: { P143: 'Q52897564' } } //tipo
    } else {
        if (obj.typeInf !== undefined && obj.typeInf !== '') {
            myClaims["P31"] = { value: obj.typeInf }
        }
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
    if (obj.coord !== undefined && obj.coord !== {}) {
        myClaims["P625"] = { value: obj.coord, references: { P143: 'Q52897564' } } // globcoordinates
    }
    if (obj.cap !== undefined && obj.cap !== '') {
        myClaims["P281"] = { value: obj.cap, references: { P143: 'Q52897564' } } //cap
    }
    if (obj.id !== undefined && obj.id !== '') {
        myClaims["P528"] = { value: obj.id, qualifiers: { P972: 'Q52896862', P2699 : obj.uri } ,
                               references: { P143: 'Q52897564' } } //catalogo
    }
    myClaims["P973"] = { value: obj.uri, references: { P143: 'Q52897564' } } //descritto nella fonte

    if (obj.uri === undefined) {
        console.log("Skipping, poor element!");
        created();
        return;
    }

    if (obj.label === '') {
        console.log("Skipping, poor element!");
        created();
        return;
    }

    console.log("Creating...")
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
