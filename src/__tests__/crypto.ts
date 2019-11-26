import { Crypto } from "../index";

describe("Crypto", () => {
	describe("isHex", () => {
		it("Empty", () => expect(Crypto.isHex("")).toBe(true));
		it("Hex characters", () => expect(Crypto.isHex("1234567890abcdefABCDEF")).toBe(true));
		it("Uneven length", () => expect(Crypto.isHex("a")).toBe(false));
		it("Non-hex characters", () => expect(Crypto.isHex("fg")).toBe(false));
	});
	describe("isBase64", () => {
		it("base64 characters", () => expect(Crypto.isBase64("1234567890qwertyuiopasdfghjklzxcvbnmQWERTYUIOPASDFGHJKLZXCVBNM+/")).toBe(true));
		it("Empty", () => expect(Crypto.isBase64("")).toBe(true));
		it("Ending on double ==", () => expect(Crypto.isBase64("ab==")).toBe(true));
		it("Ending on single =", () => expect(Crypto.isBase64("abc=")).toBe(true));
		it("Single character", () => expect(Crypto.isBase64("a")).toBe(false));
		it("Two length", () => expect(Crypto.isBase64("ab")).toBe(false));
		it("Three length", () => expect(Crypto.isBase64("abc")).toBe(false));
		it("Invalid character", () => expect(Crypto.isBase64("abc-")).toBe(false));
		it("Tripple ===", () => expect(Crypto.isBase64("a===")).toBe(false));
	});
	describe("isBase64url", () => {
		it("base64url characters", () => expect(Crypto.isBase64Url("1234567890qwertyuiopasdfghjklzxcvbnmQWERTYUIOPASDFGHJKLZXCVBNM-_")).toBe(true));
		it("Empty", () => expect(Crypto.isBase64Url("")).toBe(true));
		it("Single character", () => expect(Crypto.isBase64Url("a")).toBe(false));
		it("Double character", () => expect(Crypto.isBase64Url("ab")).toBe(true));
		it("Triple character", () => expect(Crypto.isBase64Url("abc")).toBe(true));
		it("Invalid character", () => expect(Crypto.isBase64Url("abc+")).toBe(false));
		it("Invalid character", () => expect(Crypto.isBase64Url("abc/")).toBe(false));
	});
	describe("isBase58", () => {
		it("Empty", () => expect(Crypto.isBase58("")).toBe(true));
		it("Base58 characters", () => expect(Crypto.isBase58("123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz")).toBe(true));
		it("Base58 string", () => expect(Crypto.isBase58("11")).toBe(true));
		it("Invalid character 0", () => expect(Crypto.isBase58("10345")).toBe(false));
		it("Invalid character O", () => expect(Crypto.isBase58("1O345")).toBe(false));
		it("Invalid character l", () => expect(Crypto.isBase58("1l345")).toBe(false));
		it("Invalid character I", () => expect(Crypto.isBase58("1I345")).toBe(false));
		it("Invalid character +", () => expect(Crypto.isBase58("1+345")).toBe(false));
	});
	describe("isUtf8Postgres", () => {
		it("Valid string", () => expect(Crypto.isUtf8Postgres("1234567890-=qwertyuiop[]asdfghjkl;'zxcvbnm,./!@#$%^&*()_+{}:\"<>?`~")).toBe(true));
		it("Empty string", () => expect(Crypto.isUtf8Postgres("")).toBe(true));
		it("Null character", () => expect(Crypto.isUtf8Postgres("\0")).toBe(false));
		it("Null character in middle ", () => expect(Crypto.isUtf8Postgres("asdfjaklj\0asdfalkjsdklf")).toBe(false));
	});
	describe("makeuf8postgres", () => {
		it("makeuf8postgres changed character without reason", () => expect(Crypto.makeUtf8Postgres("1234567890-=qwertyuiop[]asdfghjkl;'zxcvbnm,./!@#$%^&*()_+{}:\"<>?`~"))
			.toBe("1234567890-=qwertyuiop[]asdfghjkl;'zxcvbnm,./!@#$%^&*()_+{}:\"<>?`~"));
		it("makeuf8postgres failed to remove character", () => expect(Crypto.makeUtf8Postgres("\0a1234567890-=qwertyuiop[]asdfghjkl;'zxcvbnm,./!@\0#$%^&*()_+{}:\"<>?`~\0"))
			.toBe("a1234567890-=qwertyuiop[]asdfghjkl;'zxcvbnm,./!@#$%^&*()_+{}:\"<>?`~"));
	});

	describe("uIntXToBinary", () => {
		it("uInt8ToBinary 0", () => expect(Crypto.uInt8ToBinary(0).equals(Buffer.alloc(1, 0))).toBe(true));
		it("uInt8ToBinary max", () => expect(Crypto.uInt8ToBinary(Math.pow(2, 8) - 1).equals(Buffer.alloc(1, 255))).toBe(true));
		it("uInt8ToBinary negative numbers", () => expect(() => Crypto.uInt8ToBinary(-1)).toThrow());
		it("uInt8ToBinary too large numbers", () => expect(() => Crypto.uInt8ToBinary(Math.pow(2, 8))).toThrow());
		it("uInt16ToBinary 0", () => expect(Crypto.uInt16ToBinary(0).equals(Buffer.alloc(2, 0))).toBe(true));
		it("uInt16ToBinary max", () => expect(Crypto.uInt16ToBinary(Math.pow(2, 16) - 1).equals(Buffer.alloc(2, 255))).toBe(true));
		it("uInt16ToBinary", () => expect(Crypto.uInt16ToBinary(123 * 256 + 132).equals(Buffer.from([132, 123]))).toBe(true));
		it("uInt16ToBinary negative numbers", () => expect(() => Crypto.uInt16ToBinary(-1)).toThrow());
		it("uInt16ToBinary too large numbers", () => expect(() => Crypto.uInt16ToBinary(Math.pow(2, 16))).toThrow());
		it("uInt32ToBinary 0", () => expect(Crypto.uInt32ToBinary(0).equals(Buffer.alloc(4, 0))).toBe(true));
		it("uInt32ToBinary max", () => expect(Crypto.uInt32ToBinary(Math.pow(2, 32) - 1).equals(Buffer.alloc(4, 255))).toBe(true));
		it("uInt32ToBinary", () => expect(Crypto.uInt32ToBinary(4 * 256 * 256 * 256 + 123 * 256).equals(Buffer.from([0, 123, 0, 4]))).toBe(true));
		it("uInt32ToBinary negative numbers", () => expect(() => Crypto.uInt32ToBinary(-1)).toThrow());
		it("uInt32ToBinary too large numbers", () => expect(() => Crypto.uInt32ToBinary(Math.pow(2, 32))).toThrow());
	});
	describe("uLongToBinary", () => {
		it("uLongToBinary 0", () => expect(Crypto.uLongToBinary(0).equals(Buffer.alloc(8, 0))).toBe(true));
		it("uLongToBinary max", () => expect(Crypto.uLongToBinary(Math.pow(2, 53) - 1).equals(Buffer.from([255, 255, 255, 255, 255, 255, 31, 0]))).toBe(true));
		it("uLongToBinary", () => expect(Crypto.uLongToBinary(4 * 256 * 256 * 256 * 256 * 256 + 123 * 256).equals(Buffer.from([0, 123, 0, 0, 0, 4, 0, 0]))).toBe(true));
		it("uLongToBinary NaN", () => expect(() => Crypto.uLongToBinary(NaN)).toThrow());
		it("uLongToBinary Infinity", () => expect(() => Crypto.uLongToBinary(Infinity)).toThrow());
		it("uLongToBinary negative numbers", () => expect(() => Crypto.uLongToBinary(-1)).toThrow());
		it("uLongToBinary fractions", () => expect(() => Crypto.uLongToBinary(1.2)).toThrow());
		it("uLongToBinary too large numbers", () => expect(() => Crypto.uLongToBinary(Math.pow(2, 53))).toThrow());
	});
	describe("binaryToUIntX", () => {
		it("binaryToUInt8 0", () => expect(Crypto.binaryToUInt8(Buffer.alloc(1, 0))).toBe(0));
		it("binaryToUInt8 max", () => expect(Crypto.binaryToUInt8(Buffer.alloc(1, 255))).toBe(Math.pow(2, 8) - 1));
		it("binaryToUInt8 too short buffer", () => expect(() => Crypto.binaryToUInt8(Buffer.alloc(0, 0))).toThrow());
		it("binaryToUInt16 0", () => expect(Crypto.binaryToUInt16(Buffer.alloc(2, 0))).toBe(0));
		it("binaryToUInt16 max", () => expect(Crypto.binaryToUInt16(Buffer.alloc(2, 255))).toBe(Math.pow(2, 16) - 1));
		it("binaryToUInt16 too short buffer", () => expect(() => Crypto.binaryToUInt16(Buffer.alloc(1, 0))).toThrow());
		it("binaryToUInt32 0", () => expect(Crypto.binaryToUInt32(Buffer.alloc(4, 0))).toBe(0));
		it("binaryToUInt32 max", () => expect(Crypto.binaryToUInt32(Buffer.alloc(4, 255))).toBe(Math.pow(2, 32) - 1));
		it("binaryToUInt32 too short buffer", () => expect(() => Crypto.binaryToUInt32(Buffer.alloc(3, 0))).toThrow());
	});
	describe("binaryToULong", () => {
		it("binaryToULong 0", () => expect(Crypto.binaryToULong(Buffer.alloc(8, 0))).toBe(0));
		it("binaryToULong max", () => expect(Crypto.binaryToULong(Buffer.from([255, 255, 255, 255, 255, 255, 31, 0]))).toBe(Math.pow(2, 53) - 1));
		it("binaryToULong too short buffer", () => expect(() => Crypto.binaryToULong(Buffer.alloc(7, 0))).toThrow());
		it("binaryToULong number too long", () => expect(() => Crypto.binaryToULong(Buffer.from([0, 0, 0, 0, 0, 0, 32, 0]))).toThrow());
	});
	describe("baseXtoBinary", () => {
		it("utf8", () => expect(Crypto.utf8ToBinary("aA0").equals(Buffer.from([97, 65, 48]))).toBe(true));
		it("utf8 empty", () => expect(Crypto.utf8ToBinary("").equals(Buffer.alloc(0, 0))).toBe(true));
		it("hex", () => expect(Crypto.hexToBinary("00FF").equals(Buffer.from([0, 255]))).toBe(true));
		it("hex empty", () => expect(Crypto.hexToBinary("").equals(Buffer.alloc(0, 0))).toBe(true));
		it("hex invalid should not throw", () => expect(() => Crypto.hexToBinary("g")).not.toThrow()); //Optimalization means it should not throw
		it("base64", () => expect(Crypto.base64ToBinary("abcd").equals(Buffer.from([105, 183, 29]))).toBe(true));
		it("base64 empty", () => expect(Crypto.base64ToBinary("").equals(Buffer.alloc(0, 0))).toBe(true));
		it("base64 invalid should not throw", () => expect(() => Crypto.base64ToBinary("g")).not.toThrow()); //Optimalization means it should not throw
		it("base64url", () => expect(Crypto.base64UrlToBinary("abcd").equals(Buffer.from([105, 183, 29]))).toBe(true));
		it("base64url pad", () => expect(Crypto.base64UrlToBinary("abc").equals(Buffer.from([105, 183]))).toBe(true));
		it("base64url pad2", () => expect(Crypto.base64UrlToBinary("ab").equals(Buffer.from([105]))).toBe(true));
		it("base64url empty", () => expect(Crypto.base64UrlToBinary("").equals(Buffer.alloc(0, 0))).toBe(true));
		it("base64url invalid should not throw", () => expect(() => Crypto.base64UrlToBinary("g")).not.toThrow()); //Optimalization means it should not throw
		it("base58", () => expect(Crypto.base58ToBinary("21").equals(Buffer.from([58]))).toBe(true));
		it("base58 empty", () => expect(Crypto.base58ToBinary("").equals(Buffer.alloc(0, 0))).toBe(true));
		it("base58", () => expect(Crypto.base58ToBinary("121").equals(Buffer.from([0, 58]))).toBe(true));
		it("base58", () => expect(Crypto.base58ToBinary("zz1").equals(Buffer.from([2, 249, 238]))).toBe(true));
		it("base58 invalid should throw", () => expect(() => Crypto.base58ToBinary("@")).toThrow());
	});
	describe("binaryToBaseX", () => {
		it("utf8", () => expect(Crypto.binaryToUtf8(Buffer.from([97, 65, 48]))).toBe("aA0"));
		it("utf8 empty", () => expect(Crypto.binaryToUtf8(Buffer.alloc(0, 0))).toBe(""));
		it("hex empty", () => expect(Crypto.binaryToHex(Buffer.alloc(0))).toBe(""));
		it("hex", () => expect(Crypto.binaryToHex(Buffer.from([0, 255]))).toBe("00ff"));
		it("base64 empty", () => expect(Crypto.binaryToBase64(Buffer.alloc(0))).toBe(""));
		it("base64", () => expect(Crypto.binaryToBase64(Buffer.from([105, 183, 29]))).toBe("abcd"));
		it("base64url empty", () => expect(Crypto.binaryToBase64Url(Buffer.alloc(0))).toBe(""));
		it("base64url", () => expect(Crypto.binaryToBase64Url(Buffer.from([105, 183, 29]))).toBe("abcd"));
		it("base58 empty", () => expect(Crypto.binaryToBase58(Buffer.alloc(0))).toBe(""));
		it("base58 zero", () => expect(Crypto.binaryToBase58(Buffer.alloc(1, 0))).toBe("1"));
		it("base58 58", () => expect(Crypto.binaryToBase58(Buffer.alloc(1, 58))).toBe("21"));
		it("base58 leading zero", () => expect(Crypto.binaryToBase58(Buffer.from([0, 58, 99]))).toBe("15Si"));
	});

	describe("hash", () => {
		it("MD5 of empty string", () => expect(Crypto.md5("").toString("hex")).toBe("d41d8cd98f00b204e9800998ecf8427e"));
		it("MD5", () => expect(Crypto.md5("(*Y%NA*fm79ttayvp20cu)@UNT&($0pcs840nvh@$MP:TSmcg34h7tH@$C*(CT*H $mkswih9@HCTH* NSc").toString("hex"))
			.toBe("9acede4cbc1cb99199eff43efd748a70"));
		it("MD5 of empty buffer", () => expect(Crypto.md5(Buffer.alloc(0)).toString("hex")).toBe("d41d8cd98f00b204e9800998ecf8427e"));
		it("ripemd160 of empty string", () => expect(Crypto.ripemd160("").toString("hex")).toBe("9c1185a5c5e9fc54612808977ee8f548b2258d31"));
		it("ripemd160", () => expect(Crypto.ripemd160("(*Y%NA*fm79ttayvp20cu)@UNT&($0pcs840nvh@$MP:TSmcg34h7tH@$C*(CT*H $mkswih9@HCTH* NSc").toString("hex"))
			.toBe("88b482091e7a2ab8411d715c08835689b4d6da17"));
		it("ripemd160 of empty buffer", () => expect(Crypto.ripemd160(Buffer.alloc(0)).toString("hex")).toBe("9c1185a5c5e9fc54612808977ee8f548b2258d31"));
		it("sha1 of empty string", () => expect(Crypto.sha1("").toString("hex")).toBe("da39a3ee5e6b4b0d3255bfef95601890afd80709"));
		it("sha1", () => expect(Crypto.sha1("(*Y%NA*fm79ttayvp20cu)@UNT&($0pcs840nvh@$MP:TSmcg34h7tH@$C*(CT*H $mkswih9@HCTH* NSc").toString("hex"))
			.toBe("c99c348d1688eef7655c00c2f05161d44b557b4f"));
		it("sha1 of empty buffer", () => expect(Crypto.sha1(Buffer.alloc(0)).toString("hex")).toBe("da39a3ee5e6b4b0d3255bfef95601890afd80709"));
		it("sha256 of empty string", () => expect(Crypto.sha256("").toString("hex")).toBe("e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"));
		it("sha256", () => expect(Crypto.sha256("(*Y%NA*fm79ttayvp20cu)@UNT&($0pcs840nvh@$MP:TSmcg34h7tH@$C*(CT*H $mkswih9@HCTH* NSc").toString("hex"))
			.toBe("b43bf39d860f3d88a45d81f61a5f2c16d8b71d4f0784de78257f231c0b9d659c"));
		it("sha256 of empty buffer", () => expect(Crypto.sha256(Buffer.alloc(0)).toString("hex")).toBe("e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"));
		it("sha512 of empty string", () => expect(Crypto.sha512("").toString("hex"))
			.toBe("cf83e1357eefb8bdf1542850d66d8007d620e4050b5715dc83f4a921d36ce9ce47d0d13c5d85f2b0ff8318d2877eec2f63b931bd47417a81a538327af927da3e"));
		it("sha512", () => expect(Crypto.sha512("(*Y%NA*fm79ttayvp20cu)@UNT&($0pcs840nvh@$MP:TSmcg34h7tH@$C*(CT*H $mkswih9@HCTH* NSc").toString("hex"))
			.toBe("ac20d8507b7c7e83468562bba948be747eb86d7b2c1455e36e5ff58492541787dcac95a2857707731b94d29c89626c658aacdc526254bd0f54d69c8b9cae0c49"));
		it("sha512 of empty buffer", () => expect(Crypto.sha512(Buffer.alloc(0)).toString("hex"))
			.toBe("cf83e1357eefb8bdf1542850d66d8007d620e4050b5715dc83f4a921d36ce9ce47d0d13c5d85f2b0ff8318d2877eec2f63b931bd47417a81a538327af927da3e"));
		it("hash160 of empty string", () => expect(Crypto.hash160("").toString("hex")).toBe("b472a266d0bd89c13706a4132ccfb16f7c3b9fcb"));
		it("hash160", () => expect(Crypto.hash160("(*Y%NA*fm79ttayvp20cu)@UNT&($0pcs840nvh@$MP:TSmcg34h7tH@$C*(CT*H $mkswih9@HCTH* NSc").toString("hex"))
			.toBe("a7f655b8d5101ce8ebe5ba2a2acab0248468a5e0"));
		it("hash160 of empty buffer", () => expect(Crypto.hash160(Buffer.alloc(0)).toString("hex")).toBe("b472a266d0bd89c13706a4132ccfb16f7c3b9fcb"));
		it("hash256 of empty string", () => expect(Crypto.hash256("").toString("hex")).toBe("5df6e0e2761359d30a8275058e299fcc0381534545f55cf43e41983f5d4c9456"));
		it("hash256", () => expect(Crypto.hash256("(*Y%NA*fm79ttayvp20cu)@UNT&($0pcs840nvh@$MP:TSmcg34h7tH@$C*(CT*H $mkswih9@HCTH* NSc").toString("hex"))
			.toBe("1accde84c362fb7beba292969a6bdb051d4db50f278481416b5b166fd7a2f659"));
		it("hash256 of empty buffer", () => expect(Crypto.hash256(Buffer.alloc(0)).toString("hex")).toBe("5df6e0e2761359d30a8275058e299fcc0381534545f55cf43e41983f5d4c9456"));
	});
	describe("hash", () => {
		it("id", () => expect(Crypto.id().length).toBe(16));
	});
});