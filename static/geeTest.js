const path = require("path");
const cryptoPath = path.join(process.cwd(), "static", "crypto");
const { Aes, CipherMode, PaddingMode } = require(path.join(cryptoPath, "symmetric", "AES.js"));
const { Md5 } = require(path.join(cryptoPath, "hash", "MD5.js"));
const jsEncrypt = require(path.join(cryptoPath, "jsEncrypt"));

function e() {
    return (65536 * (1 + Math.random()) | 0).toString(16).substring(1);
}

function guid() {
    return e() + e() + e() + e();
}

function gen_m(plaintext) {
    const key = guid();
    const _ = (new jsEncrypt.JsEncrypt()).encrypt(key);
    const iv = Buffer.from("0000000000000000", 'utf-8')
    plaintext = Buffer.from(plaintext, 'utf-8');
    const aes = new Aes(CipherMode.CBC, PaddingMode.PKCS7);
    const u = aes.encrypt(plaintext, Buffer.from(key, "utf-8"), iv).toString("hex");
    return u + _
}

function gen_w(captcha_id, datetime, lot_number, passtime, userresponse) {
    const md5 = new Md5();
    const pow_msg = `1|0|md5|${datetime}|${captcha_id}|${lot_number}||${guid()}`
    let track = {
        "passtime": passtime,
        "userresponse": userresponse,
        "device_id": "",
        "lot_number": lot_number,
        "pow_msg": pow_msg,
        "pow_sign": md5.hash(Buffer.from(pow_msg, 'utf-8')).toString("hex"),
        "geetest": "captcha",
        "lang": "zh",
        "ep": "123",
        "biht": "1426265548",
        "HufC": "hxdr",
        "d229": {
            "543fa0": "24e1b527"
        },
        "em": {
            "ph": 0,
            "cp": 0,
            "ek": "11",
            "wd": 1,
            "nt": 0,
            "si": 0,
            "sc": 0
        }
    }
    const m = gen_m(JSON.stringify(track));
    console.log("m ==>", m)
    return m
}
