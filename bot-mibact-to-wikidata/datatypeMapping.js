var instanceOf = {
    "CHIESA": "Q16970",
    "MUSEO ARCHEOLOGICO": "Q3329412",
    "MUSEO": "Q33506",
    "PALAZZO": "Q16560",
    "ORATORIO": "Q580499",
    "CAPPELLA": "Q108325",
    "PIEVE": "Q1464870",
    "PINACOTECA": "Q740437",
    "TEATRO": "Q24354",
    "PORTA": "Q82117",
    "BIBLIOTECA": "Q7075",
    "BASILICA": "Q163687",
    "MONUMENTO": "Q4989906"
}

exports.mapTypeFromLabel = function (label) {
    let l = label.toUpperCase();

    for (let i = 0; i < Object.keys(instanceOf).length; i++) {
        let key = Object.keys(instanceOf)[i];
        if (l.startsWith(key)) {
            return instanceOf[key];
        }
    }

    return undefined;
}
