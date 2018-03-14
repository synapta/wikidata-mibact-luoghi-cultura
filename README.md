Il MiBACT pubblica in linked open data i cosiddetti “luoghi della cultura”, ovvero dati riguardanti i beni culturali immobili italiani e le manifestazioni culturali organizzate dal Ministero e dagli altri Istituti. Questo progetto ha lo scopo di sincronizzare la base dati italiana con Wikidata, per migliorare la fruibilità dei dati, anche in ottica Wiki Loves Monuments.

## Raccolta dati

Interrogando l’[endpoint SPARQL](http://dati.beniculturali.it/sparql), vengono estratte le informazioni delle entità di classe http://dati.beniculturali.it/cis/CulturalInstituteOrSite.
In particolare, dove presenti:
* label e label alternative
* descrizione
* identificativo MiBACT
* coordinate
* indirizzo
* tipo
* argomento
* dati di contatto (telefono, email, sito web)
* immagine

## Caricamento su Wikidata

Le entità raccolte vengono caricate su Wikidata, aggiornando gli item già presenti o creandone di nuovi, con uno schema dati in armonia con l'attuale ontologia per i beni culturali.

## Interfaccia di ricerca

L'interfaccia di ricerca, interrogando l'endpoint SPARQL di Wikidata, permette agli utenti di cercare tra i beni culturali italiani esistenti su Wikidata stessa al momento della ricerca.
