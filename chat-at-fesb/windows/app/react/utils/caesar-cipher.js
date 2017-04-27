function encryption(text, cypherNumber) {
    var lowerCaseAlphabet = "abcdefghijklmnopqrstuvwxyz";
    var upperCaseAlphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    var cypherText = "";
    var regex = /[a-zA-Z]/;

    cypherNumber = parseInt(cypherNumber);

    console.log("PlainText ---> ", text)
    for (var i = 0; i < text.length; i++) {
        for (var j = 0; j < 26; j++) {
            if (text[i] == lowerCaseAlphabet[j])
                cypherText += lowerCaseAlphabet[((j + cypherNumber) % 26)];
            else if (text[i] == upperCaseAlphabet[j])
                cypherText += upperCaseAlphabet[((j + cypherNumber) % 26)];
        }

        // If not alphabet character copy as is
        if (!regex.test(text[i]))
            cypherText += text[i];
    }

    return cypherText;
}

function decryption(text, cypherNumber) {
    var lowerCaseAlphabet = "abcdefghijklmnopqrstuvwxyz"
    var upperCaseAlphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
    var decipherText = "";
    var regex = /[a-zA-Z]/;

    cypherNumber = parseInt(cypherNumber);

    for (var i = 0; i < text.length; i++) {
        for (var j = 0; j < 26; j++) {
            if (text[i] == lowerCaseAlphabet[j])
                decipherText += lowerCaseAlphabet[((j - cypherNumber) % 26)];
            else if (text[i] == upperCaseAlphabet[j])
                decipherText += upperCaseAlphabet[((j - cypherNumber) % 26)];
        }
        // If not alphabet character copy as is
        if (!regex.test(text[i]))
            decipherText += text[i];
    }

    return decipherText;
}

exports.encryption = encryption;
exports.decryption = decryption;
