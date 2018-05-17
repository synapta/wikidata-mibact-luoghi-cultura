// url base per le query SPARQL su Wikidata
const WIKIDATABASEQUERYURL =  "https://query.wikidata.org/sparql?query=";
// Elenca i comuni da visualizzare nell'autocomplete
const QUERY_SPARQL_MONUMENTI_PATTERN = `
    SELECT ?idWLM ?idWD ?idWDLabel ?idCustode ?idCustodeLabel ?indirizzo ?coord ?immagine ?commons
    WHERE {
        ?idWD wdt:P131 wd:{{wd}} .
        OPTIONAL { ?idWD wdt:P969 ?indirizzo . }
        OPTIONAL { ?idWD wdt:P625 ?coord . }
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
`;
