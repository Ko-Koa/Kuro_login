const GF128 = {
    multy: function (a, b) {
        let p = 0;
        while (b > 0) {
            if (b & 1) {
                p ^= a;
            }
            b >>= 1;
            if ((a <<= 1) & 0x100) {
                a ^= 0x1B;
            }
        }
        return p & 0xFF
    }
}

module.exports = {
    GF128
}
