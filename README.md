Il MiBACT pubblica in linked open data i cosiddetti “luoghi della cultura”, ovvero dati riguardanti i beni culturali immobili italiani e le manifestazioni culturali organizzate dal Ministero e dagli altri Istituti. Questo progetto ha lo scopo di sincronizzare la base dati italiana con Wikidata, per migliorare la fruibilità dei dati, anche in ottica Wiki Loves Monuments.

## Raccolta dati

Interrogando l’[endpoint SPARQL](http://dati.beniculturali.it/sparql), vengono estratte le informazioni delle entità di classe http://dati.beniculturali.it/cis/CulturalInstituteOrSite.

## Caricamento su Wikidata

Le entità raccolte vengono caricate su Wikidata, aggiornando gli item già presenti o creandone di nuovi, con uno schema dati in armonia con l'attuale ontologia per i beni culturali.

## Interfaccia di ricerca

L'interfaccia di ricerca, interrogando l'endpoint SPARQL di Wikidata, permette agli utenti di cercare tra i beni culturali italiani esistenti su Wikidata stessa al momento della ricerca.

## Documentazione

Nella cartella `docs` di questo repository è presente la documentazione relativa gli endpoint, i dati e le query utilizzati durante
il progetto.

### Interfaccia Web

Lanciare i seguenti comandi per esporre sulla porta `8080` di `localhost` il servizio Web:

```
npm install
npm start
```

### Bot

Per caricare/aggiornare i dati su Wikidata invece occorre lanciare un bot con delle credenziali valide (si consiglia un'utenza con 100+ edit per non incorrere in restrizioni).

Il contenuto di `credential.js` dovrà essere:
```
exports.user = "MyUsername";
exports.password = "MyPassword";
```
Poi lanciare:

```
cd bot-mibact-to-wikidata
npm install
node bot.js
```

N.B. il bot può essere lanciato più volte per controllare eventuali nuovi dati da creare o aggiungere. Tuttavia fare attenzione alla
data di aggiornamento dell'endpoint di Wikidata, che potrebbe non essere perfettamente sincronizzato col DB di Wikibase.
