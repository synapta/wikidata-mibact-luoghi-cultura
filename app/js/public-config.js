// url base per le query SPARQL su Wikidata
const WIKIDATABASEQUERYURL =  "https://query.wikidata.org/sparql?query=";
// Elenca i comuni da visualizzare nell'autocomplete
const QUERY_SPARQL_MONUMENTI_PATTERN = `
SELECT ?idWD ?idWDLabel
        (SAMPLE(?xidWLM) as ?idWLM)
        (SAMPLE(?xidCustode) as ?idCustode)
        (SAMPLE(?xidCustodeLabel) as ?idCustodeLabel)
        (SAMPLE(?xindirizzo) as ?indirizzo)
        (SAMPLE(?xcoord) as ?coord)
        (SAMPLE(?xtelefono) as ?telefono)
        (SAMPLE(?xemail) as ?email)
        (SAMPLE(?xsitoweb) as ?sitoweb)
        (SAMPLE(?ximmagine) as ?immagine)
        (SAMPLE(?xcommons) as ?commons)
    WHERE {
        ?idWD wdt:P131 wd:{{wd}} .
        OPTIONAL { ?idWD wdt:P6375 ?xindirizzo . }
        OPTIONAL { ?idWD wdt:P625 ?xcoord . }
        OPTIONAL { ?idWD wdt:P1329 ?xtelefono . }
        OPTIONAL { ?idWD wdt:P968 ?xemail . }
        OPTIONAL { ?idWD wdt:P856 ?xsitoweb . }
        OPTIONAL { ?idWD wdt:P18 ?ximmagine . }
        OPTIONAL { ?idWD wdt:P373 ?xcommons . }

        OPTIONAL {
            VALUES ?custode { wdt:P127 wdt:P708 }
            ?idWD ?custode ?xidCustode
            SERVICE wikibase:label {
              bd:serviceParam wikibase:language "it,en".
              ?xidCustode schema:name ?xidCustodeLabel
            }
        }

        { ?idWD wdt:P2186 ?xidWLM . } UNION
        { ?idWD wdt:P1435 wd:Q26971668 .
            MINUS { ?idWD wdt:P2186 ?xidWLM . }
        }

        SERVICE wikibase:label { bd:serviceParam wikibase:language "it,en". }
    }
    GROUP BY ?idWD ?idWDLabel
`;
