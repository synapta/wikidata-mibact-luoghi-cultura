const WIKIDATABASEQUERYURL =  "https://query.wikidata.org/sparql?query=";
// Elenca i comuni da visualizzare nell'autocomplete
const QUERY_SPARQL_MONUMENTI_PATTERN = `SELECT ?idWLM ?idWD ?idWDLabel ?indirizzo ?coord ?commons
WHERE {
?idWD wdt:P131 wd:{{wd}} .
OPTIONAL { ?idWD wdt:P969 ?indirizzo . }
OPTIONAL { ?idWD wdt:P625 ?coord . }
OPTIONAL { ?idWD wdt:P373 ?commons . }

{ ?idWD wdt:P2186 ?idWLM . } UNION
{ ?idWD wdt:P1435 wd:Q26971668 . }

SERVICE wikibase:label { bd:serviceParam wikibase:language "it,en". }
}`;
// const QUERY_SPARQL_COMUNI_MONUMENTI_URL = WIKIDATABASEQUERYURL + encodeURIComponent(QUERY_SPARQL_MONUMENTI);
