const crypto = require('crypto');

export default class Aes {
    encryption_128_ecb(data, password) {
        let algorithm = 'aes-128-ecb';
        let inputEncoding = 'utf8';
        let outputEncoding = 'hex';

        try {
            const cipher = crypto.createCipher(algorithm, password);
            let encrypted = cipher.update(data, inputEncoding, outputEncoding);
            encrypted += cipher.final(outputEncoding);
            return encrypted;
        } catch (error) {
            console.log(error);
            return data;
        }
    }

    decryption_128_ecb(data, password) {
        let algorithm = 'aes-128-ecb';
        let inputEncoding = 'hex';
        let outputEncoding = 'utf8';

        try {
            const decipher = crypto.createDecipher(algorithm, password);
            const encrypted = data;
            let decrypted = decipher.update(encrypted, inputEncoding, outputEncoding);
            decrypted += decipher.final(outputEncoding);
            return decrypted;
        } catch (error) {
            console.log(error);
            return data;
        }

    }

    encryption_128_cbc(data, password, iv) {
        let algorithm = 'aes-128-cbc';
        let inputEncoding = 'utf8';
        let outputEncoding = 'hex';

        try {
            const cipher = crypto.createCipheriv(algorithm, password, Buffer.from(iv));
            let encrypted = cipher.update(data, inputEncoding, outputEncoding);
            encrypted += cipher.final(outputEncoding);
            return encrypted;
        } catch (error) {
            console.log(error);
            return data;
        }
    }

    decryption_128_cbc(data, password, iv) {
        let algorithm = 'aes-128-cbc';
        let inputEncoding = 'hex';
        let outputEncoding = 'utf8';

        try {
            const decipher = crypto.createDecipheriv(algorithm, password, Buffer.from(iv));
            const encrypted = data;
            let decrypted = decipher.update(encrypted, inputEncoding, outputEncoding);
            decrypted += decipher.final(outputEncoding);
            return decrypted;
        } catch (error) {
            console.log(error);
            return data;
        }
    }

    encryption_128_ctr(data, password, iv) {
        let algorithm = 'aes-128-ctr';
        let inputEncoding = 'utf8';
        let outputEncoding = 'hex';

        try {
            const cipher = crypto.createCipheriv(algorithm, password, Buffer.from(iv));
            let encrypted = cipher.update(data, inputEncoding, outputEncoding);
            encrypted += cipher.final(outputEncoding);
            return encrypted;
        } catch (error) {
            console.log(error);
            return data;
        }
    }

    decryption_128_ctr(data, password, iv) {
        let algorithm = 'aes-128-ctr';
        let inputEncoding = 'hex';
        let outputEncoding = 'utf8';

        try {
            const decipher = crypto.createDecipheriv(algorithm, password, Buffer.from(iv));
            const encrypted = data;
            let decrypted = decipher.update(encrypted, inputEncoding, outputEncoding);
            decrypted += decipher.final(outputEncoding);
            return decrypted;
        } catch (error) {
            console.log(error);
            return data;
        }
    }
}