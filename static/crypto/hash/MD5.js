const { Buffer } = require("node:buffer");
const { Hash } = require("./HASH")
// 计算函数

//循环左移
function rol_32(value, bits) {
    return ((value << bits) | (value >>> (32 - bits))) >>> 0
}

function F(x, y, z) {
    return (x & y) | (~x & z);
}

function G(x, y, z) {
    return (x & z) | (y & ~z)
}

function H(x, y, z) {
    return x ^ y ^ z
}

function I(x, y, z) {
    return y ^ (x | ~z)
}

function FF(a, b, c, d, x, s, ac) {
    a = (a + F(b, c, d) + x + ac) >>> 0
    a = rol_32(a, s)
    a = (a + b) >>> 0
    return a
}

function GG(a, b, c, d, x, s, ac) {
    a = (a + G(b, c, d) + x + ac) >>> 0
    a = rol_32(a, s)
    a = (a + b) >>> 0
    return a
}

function HH(a, b, c, d, x, s, ac) {
    a = (a + H(b, c, d) + x + ac) >>> 0
    a = rol_32(a, s)
    a = (a + b) >>> 0
    return a
}

function II(a, b, c, d, x, s, ac) {
    a = (a + I(b, c, d) + x + ac) >>> 0
    a = rol_32(a, s)
    a = (a + b) >>> 0
    return a
}

/**
 * 明文填充
 * @param {Buffer} plain_text 明文
 * @returns {Buffer}
 */
function pad_plain_text(plain_text) {
    // 计算bit长度
    const bit_len = plain_text.length * 8;
    plain_text = Buffer.concat([plain_text, Buffer.from([0x80])]);

    // 因为尾部要增加8字节的message长度,所以计算的时候先+8
    // 64字节 * 8bit = 512bit
    while ((plain_text.length + 8) % 64 !== 0) {
        plain_text = Buffer.concat([plain_text, Buffer.from([0])]);
    }
    const bit_buffer = Buffer.alloc(8);
    bit_buffer.writeUInt32LE(bit_len, 0);
    return Buffer.concat([plain_text, bit_buffer])
}

class Md5 extends Hash {
    constructor() {
        super(64);
    }

    /**
     * 对数据进行Hash计算
     * @param {Buffer} plain_text 明文
     * @returns {Buffer}
     */
    hash(plain_text) {
        // magic
        let a0 = 0x67452301,
            b0 = 0xEFCDAB89,
            c0 = 0x98BADCFE,
            d0 = 0x10325476;

        plain_text = pad_plain_text(plain_text);
        const chunks = [];
        for (let i = 0; i < plain_text.length; i += 64) {
            chunks.push(plain_text.slice(i, i + 64));
        }
        chunks.forEach((chunk) => {
            // 将64字节分成16份,每一份I就是四字节, 小端序
            const words = [];
            for (let i = 0; i < 16; i++) {
                words.push(chunk.readUint32LE(i * 4))
            }
            let a = a0, b = b0, c = c0, d = d0;
            // md5 64轮都是不一样的计算
            // Round1 使用的都是原始的魔数
            a = FF(a, b, c, d, words[0], 7, 0xD76AA478)
            d = FF(d, a, b, c, words[1], 12, 0xE8C7B756)
            c = FF(c, d, a, b, words[2], 17, 0x242070DB)
            b = FF(b, c, d, a, words[3], 22, 0xC1BDCEEE)
            a = FF(a, b, c, d, words[4], 7, 0xF57C0FAF)
            d = FF(d, a, b, c, words[5], 12, 0x4787C62A)
            c = FF(c, d, a, b, words[6], 17, 0xA8304613)
            b = FF(b, c, d, a, words[7], 22, 0xFD469501)
            a = FF(a, b, c, d, words[8], 7, 0x698098D8)
            d = FF(d, a, b, c, words[9], 12, 0x8B44F7AF)
            c = FF(c, d, a, b, words[10], 17, 0xFFFF5BB1)
            b = FF(b, c, d, a, words[11], 22, 0x895CD7BE)
            a = FF(a, b, c, d, words[12], 7, 0x6B901122)
            d = FF(d, a, b, c, words[13], 12, 0xFD987193)
            c = FF(c, d, a, b, words[14], 17, 0xA679438E)
            b = FF(b, c, d, a, words[15], 22, 0x49B40821)

            // Round2
            a = GG(a, b, c, d, words[1], 5, 0xF61E2562)
            d = GG(d, a, b, c, words[6], 9, 0xC040B340)
            c = GG(c, d, a, b, words[11], 14, 0x265E5A51)
            b = GG(b, c, d, a, words[0], 20, 0xE9B6C7AA)
            a = GG(a, b, c, d, words[5], 5, 0xD62F105D)
            d = GG(d, a, b, c, words[10], 9, 0x02441453)
            c = GG(c, d, a, b, words[15], 14, 0xD8A1E681)
            b = GG(b, c, d, a, words[4], 20, 0xE7D3FBC8)
            a = GG(a, b, c, d, words[9], 5, 0x21E1CDE6)
            d = GG(d, a, b, c, words[14], 9, 0xC33707D6)
            c = GG(c, d, a, b, words[3], 14, 0xF4D50D87)
            b = GG(b, c, d, a, words[8], 20, 0x455A14ED)
            a = GG(a, b, c, d, words[13], 5, 0xA9E3E905)
            d = GG(d, a, b, c, words[2], 9, 0xFCEFA3F8)
            c = GG(c, d, a, b, words[7], 14, 0x676F02D9)
            b = GG(b, c, d, a, words[12], 20, 0x8D2A4C8A)

            // Round3
            a = HH(a, b, c, d, words[5], 4, 0xFFFA3942)
            d = HH(d, a, b, c, words[8], 11, 0x8771F681)
            c = HH(c, d, a, b, words[11], 16, 0x6D9D6122)
            b = HH(b, c, d, a, words[14], 23, 0xFDE5380C)
            a = HH(a, b, c, d, words[1], 4, 0xA4BEEA44)
            d = HH(d, a, b, c, words[4], 11, 0x4BDECFA9)
            c = HH(c, d, a, b, words[7], 16, 0xF6BB4B60)
            b = HH(b, c, d, a, words[10], 23, 0xBEBFBC70)
            a = HH(a, b, c, d, words[13], 4, 0x289B7EC6)
            d = HH(d, a, b, c, words[0], 11, 0xEAA127FA)
            c = HH(c, d, a, b, words[3], 16, 0xD4EF3085)
            b = HH(b, c, d, a, words[6], 23, 0x04881D05)
            a = HH(a, b, c, d, words[9], 4, 0xD9D4D039)
            d = HH(d, a, b, c, words[12], 11, 0xE6DB99E5)
            c = HH(c, d, a, b, words[15], 16, 0x1FA27CF8)
            b = HH(b, c, d, a, words[2], 23, 0xC4AC5665)

            // Round4
            a = II(a, b, c, d, words[0], 6, 0xF4292244)
            d = II(d, a, b, c, words[7], 10, 0x432AFF97)
            c = II(c, d, a, b, words[14], 15, 0xAB9423A7)
            b = II(b, c, d, a, words[5], 21, 0xFC93A039)
            a = II(a, b, c, d, words[12], 6, 0x655B59C3)
            d = II(d, a, b, c, words[3], 10, 0x8F0CCC92)
            c = II(c, d, a, b, words[10], 15, 0xFFEFF47D)
            b = II(b, c, d, a, words[1], 21, 0x85845DD1)
            a = II(a, b, c, d, words[8], 6, 0x6FA87E4F)
            d = II(d, a, b, c, words[15], 10, 0xFE2CE6E0)
            c = II(c, d, a, b, words[6], 15, 0xA3014314)
            b = II(b, c, d, a, words[13], 21, 0x4E0811A1)
            a = II(a, b, c, d, words[4], 6, 0xF7537E82)
            d = II(d, a, b, c, words[11], 10, 0xBD3AF235)
            c = II(c, d, a, b, words[2], 15, 0x2AD7D2BB)
            b = II(b, c, d, a, words[9], 21, 0xEB86D391)

            a0 = (a0 + a) >>> 0
            b0 = (b0 + b) >>> 0
            c0 = (c0 + c) >>> 0
            d0 = (d0 + d) >>> 0
        })
        const update_buffer = Buffer.alloc(16);
        const update_data = [a0, b0, c0, d0]
        for (let i = 0; i < 4; i++) {
            update_buffer.writeUInt32LE(update_data[i], i * 4)
        }
        return update_buffer
    }


}

module.exports = {
    Md5
}
