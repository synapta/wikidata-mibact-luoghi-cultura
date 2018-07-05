// url base per le query SPARQL su Wikidata
const WIKIDATABASEQUERYURL =  "https://query.wikidata.org/sparql?query=";
// Elenca i comuni da visualizzare nell'autocomplete
const QUERY_SPARQL_MONUMENTI_PATTERN = `
    SELECT ?idWD ?idWDLabel
        (MAX(?idWLM) as ?idWLM)
        (MAX(?idCustode) as ?idCustode)
        (MAX(?idCustodeLabel) as ?idCustodeLabel)
        (MAX(?indirizzo) as ?indirizzo)
        (MAX(?coord) as ?coord)
        (MAX(?telefono) as ?telefono)
        (MAX(?email) as ?email)
        (MAX(?sitoweb) as ?sitoweb)
        (MAX(?immagine) as ?immagine)
        (MAX(?commons) as ?commons)
    WHERE {
        ?idWD wdt:P131 wd:{{wd}} .
        OPTIONAL { ?idWD wdt:P969 ?indirizzo . }
        OPTIONAL { ?idWD wdt:P625 ?coord . }
        OPTIONAL { ?idWD wdt:P1329 ?telefono . }
        OPTIONAL { ?idWD wdt:P968 ?email . }
        OPTIONAL { ?idWD wdt:P856 ?sitoweb . }
        OPTIONAL { ?idWD wdt:P18 ?immagine . }
        OPTIONAL { ?idWD wdt:P373 ?commons . }

        OPTIONAL {
            VALUES ?custode { wdt:P708 wdt:127 }
            ?idWD ?custode ?idCustode
        }

        { ?idWD wdt:P2186 ?idWLM . } UNION
        { ?idWD wdt:P1435 wd:Q26971668 .
            MINUS { ?idWD wdt:P2186 ?idWLM . }
        }

        SERVICE wikibase:label { bd:serviceParam wikibase:language "it,en". }
    }
    GROUP BY ?idWD ?idWDLabel
`;
