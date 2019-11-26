
import { PublicKey, PrivateKey } from "../index";

describe("Keys", () => {
	describe("Create public key", () => {
		it("string", () => expect(() => new PublicKey("abcdef" as any)).toThrow());
		it("too short", () => expect(() => new PublicKey(Buffer.from("1234567890abcdef", "hex"))).toThrow());
		it("wrong compression format", () => expect(() => new PublicKey(Buffer.from("001234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef", "hex"))).toThrow());
		it("wrong compression format", () => expect(() => new PublicKey(Buffer.from("011234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef", "hex"))).toThrow());
		it("wrong compression format", () => expect(() => new PublicKey(Buffer.from("041234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef", "hex"))).toThrow());
		it("outside curve", () => expect(() => new PublicKey(Buffer.from("02ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff", "hex"))).toThrow());
		it("valid key", () => expect(() => new PublicKey(Buffer.from("02c9adbfce335080331a645a8e0e6fb64f4f9edfed24054d07ef2fd849edca292f", "hex"))).not.toThrow());
		it("valid key", () => expect(() => new PublicKey(Buffer.from("03e08161d91ef14036385321d11faee4bc8826997cf679917eb2ab66d1c9591b7b", "hex"))).not.toThrow());
	});
	describe("isValidPublic", () => {
		it("string", () => expect(PublicKey.isValidPublic("abcdef" as any)).toBe(false));
		it("too short", () => expect(PublicKey.isValidPublic(Buffer.from("1234567890abcdef", "hex"))).toBe(false));
		it("too short", () => expect(PublicKey.isValidPublic(Buffer.from("001234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef", "hex"))).toBe(false));
		it("wrong compression format", () => expect(PublicKey.isValidPublic(Buffer.from("011234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef", "hex"))).toBe(false));
		it("wrong compression format", () => expect(PublicKey.isValidPublic(Buffer.from("041234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef", "hex"))).toBe(false));
		it("outside curve", () => expect(PublicKey.isValidPublic(Buffer.from("02ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff", "hex"))).toBe(false));
		it("valid key", () => expect(PublicKey.isValidPublic(Buffer.from("02c9adbfce335080331a645a8e0e6fb64f4f9edfed24054d07ef2fd849edca292f", "hex"))).toBe(true));
		it("valid key", () => expect(PublicKey.isValidPublic(Buffer.from("03e08161d91ef14036385321d11faee4bc8826997cf679917eb2ab66d1c9591b7b", "hex"))).toBe(true));

		for (let i = 0; i < 50; i++) {
			it("random generated", () => {
				expect(PublicKey.isValidPublic(PrivateKey.generate().publicKey)).toBe(true);
			});
		}
	});

	//Is valid address is also used for smart contracts, so check types as well.
	describe("isValidAddress", () => {
		it("invalid type", () => expect(PublicKey.isValidAddress(1 as any)).toBe(false));
		it("too short", () => expect(PublicKey.isValidAddress(Buffer.alloc(19, 0))).toBe(false));
		it("invalid type", () => expect(PublicKey.isValidAddress(Buffer.alloc(20, 0))).toBe(true));
		it("too short", () => expect(PublicKey.isValidAddress("")).toBe(false));
		it("too short", () => expect(PublicKey.isValidAddress("asdf")).toBe(false));
		it("Invalid prefix", () => expect(PublicKey.isValidAddress("oavG8pPU5AjnzBRyvzZu7kspeKU4AMoQK")).toBe(false));
		it("Invalid length", () => expect(PublicKey.isValidAddress("12mcBfjhrQjDMacRM61upctiyvAaYTbhsGzQ")).toBe(false));
		it("Invalid checksum", () => expect(PublicKey.isValidAddress("1QFKH2X6kthryZ3LxWfFQzV6C94XKwnntv")).toBe(false));
		it("Valid address", () => expect(PublicKey.isValidAddress("1APXP1nVn9dUwj4DWkAiw3T6eBJTbHxChH")).toBe(true));
		it("Valid address", () => expect(PublicKey.isValidAddress("1B3pgiZmP9L3EbyR6DaLHeWwXLKn8NMmLK")).toBe(true));
		it("Valid address", () => expect(PublicKey.isValidAddress("1DHWYw1eVnMN289ufkDifCuee3CQuXmuY7")).toBe(true));
		it("Valid address", () => expect(PublicKey.isValidAddress("1Q2JJ1MPRYCTVeF7Yw9niEYFzbDsCLoJ1v")).toBe(true));

		it("random generated", () => {
			for (let i = 0; i < 50; i++) {
				expect(PublicKey.isValidAddress(PrivateKey.generate().getAddress())).toBe(true);
			}
		});
	});
	describe("Address", () => {
		const pubKey = new PublicKey(Buffer.from("03f95c252dbb8ae3d9147a34063e1285a9134d2ece2ba2666dd1e112540a75bbef", "hex"));

		it("invalid address", () => expect(pubKey.getAddress()).toBe("1C8UcXpCD54s2XAUPyAMJiubtkX4NsoUPJ"));
		it("invalid address when called twice", () => expect(pubKey.getAddress()).toBe("1C8UcXpCD54s2XAUPyAMJiubtkX4NsoUPJ"));
		it("Invalid binary address", () => expect(pubKey.getAddressAsBuffer().toString("hex")).toBe("7a13585eee8fc2926c26b9c2597aff93ef28cd11"));
		it("Invalid converting string address to string", () => expect(PublicKey.addressAsString(pubKey.getAddress())).toBe(pubKey.getAddress()));
		it("Invalid converting binary address to string", () => expect(PublicKey.addressAsString(pubKey.getAddressAsBuffer())).toBe(pubKey.getAddress()));
		it("invalid converting binary address to string", () => expect(PublicKey.addressAsBuffer(pubKey.getAddress()).toString("hex"))
			.toBe(pubKey.getAddressAsBuffer().toString("hex")));
		it("invalid converting binary address to binary", () => expect(PublicKey.addressAsBuffer(pubKey.getAddressAsBuffer()).toString("hex"))
			.toBe(pubKey.getAddressAsBuffer().toString("hex")));
		it("Invalid address should not be coinversable to binary", () => expect(() => PublicKey.addressAsBuffer("ajskdfjklajsdf")).toThrow());
		it("Invalid address should not be coinversable to string", () => expect(() => PublicKey.addressAsString("ajskdfjklajsdf")).toThrow());
	});

	describe("Verify", () => {
		//Private key: L18jgwFzGaHNfun15PShzG1ohi6xtEoitzSZUGp9kYmWyaiRxmy7
		const pubKey = new PublicKey(Buffer.from("03987d778d2b560741723ba72dce66947108ae033ddccb94b0aad1ee17eb03c742", "hex"));
		//We want verify to be robust due to it being an important method, so check other types as well
		it("Verify invalid", () => expect(() => pubKey.verify("asdf" as any, Buffer.from("aksdjfkajs"))).toThrow());
		it("Verify invalid signature format", () => expect(() => pubKey.verify(Buffer.from("aksdjfkajs"), "asdf" as any)).toThrow());
		it("Verify invalid signature length", () => expect(() => pubKey.verify(Buffer.from("aksdjfkajs"), Buffer.from("aksdjfkajs"))).toThrow());
		it("Valid", () => expect(pubKey.verify(Buffer.from("test"),
			Buffer.from("16f2f54955ef68d4e933462474b9a9041c0d56f8bcca84962cdb883f90242873f313c6782d28fa0dc0f1afe4289479d208bb72300bd99b5e2deaa0fa2e2566b6", "hex"))).toBe(true));
		//Same data and key may produce different signatures
		it("Valid", () => expect(pubKey.verify(Buffer.from("test"),
			Buffer.from("cf4cc0ff64aae0ae07c69922605b90f5b81013333fec06dd8a9caa8d826eecc9ab6d28a5caa3c1c5cfed9188c8b552d51bd836398d75eecdff399f5813623536", "hex"))).toBe(true));
		it("Valid", () => expect(pubKey.verify(Buffer.from("test2"),
			Buffer.from("41374576729a374be6944f6cf0e12d3d8b4b38c6c25aa76f192789f879808a03ead683489b14d56e7dfccc92645f737567a0e1572721e51153006f710db06014", "hex"))).toBe(true));
		//Multiple leading zero's (make sure it is valid and does not crash)
		it("Valid", () => expect(pubKey.verify(Buffer.from("test2"),
			Buffer.from("0005d9ebc57e22af997bc82a8f32e20f21a3529aa25f87f648427d6db2131aaa0eb651eb394ec56d164666c533d9606ba5eed57982ae2d87d19e1203126c47fb", "hex"))).toBe(true));
		it("Valid", () => expect(pubKey.verify(Buffer.from("test2"),
			Buffer.from("fc19a10aa4afbb6e0641aaeb84143bd547a058f7d607057313f57a4b09607dbe00288a62034136ea0337d64958ae67180adb94e2d8c9b5e05e78ba2ee1d9c942", "hex"))).toBe(true));
		it("All zero", () => expect(pubKey.verify(Buffer.from("test2"),
			Buffer.from("00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000", "hex"))).toBe(false));

		const privKey = PrivateKey.generate();
		const privKey2 = PrivateKey.generate();
		it("Sign and verify correct", () => {
			for (let i = 0; i < 50; i++) {
				const data = Buffer.from(Math.random().toString());
				const data2 = Buffer.from(Math.random().toString());
				//Signatures are random, but they should be valid
				expect(privKey.verify(data, privKey.sign(data))).toBe(true);
				//Signature of an other private key should be invalid
				expect(privKey2.verify(data, privKey.sign(data))).toBe(false);
				//Signature of other data should be invalid
				expect(privKey.verify(data2, privKey.sign(data))).toBe(false);
			}
		});
	});

	describe("Private key", () => {
		it("Generate", () => {
			for (let i = 0; i < 50; i++) {
				expect(() => PrivateKey.generate()).not.toThrow();
			}
		});
		it("Generate non-random", () => expect(PrivateKey.generateNonRandom(Buffer.from("abc"), Buffer.from("def")).toWIF())
			.toBe("L48vP7Bid6PWYmgQFeaQnhWc9acFuY7GvWqw7nrRMRegdWRBqNkr"));
		//We want sign to be robust due to it being an important method, so check other types as well
		it("Signing invalid data does not throw.", () => expect(() => PrivateKey.generate().sign("ajsdfj" as any)).toThrow());
		const privateKey = PrivateKey.generate();
		it("Signing does not produce length 64 signature.", () => expect(privateKey.sign(Buffer.from("test")).length).toBe(64));
		it("Signing twice does not produce length 64 signature.", () => expect(privateKey.sign(Buffer.from("test2")).length).toBe(64));
	});
	describe("Is valid WIF", () => {
		it("Invalid format is valid private key.", () => expect(PrivateKey.isValidWIF(Buffer.from("asdfasdf") as any)).toBe(false));
		it("Invalid key is valid private key.", () => expect(PrivateKey.isValidWIF("adfasdf")).toBe(false));
		it("Invalid key is valid private key.", () => expect(PrivateKey.isValidWIF("L+VdN2oQdaN2sD8zbGFkFvW7GFqckuvAhFYAsmZD8zWzpeRtWVCf")).toBe(false));
		it("Invalid net prefix is valid key.", () => expect(PrivateKey.isValidWIF("LDVdN2oQdaN2sD8zbGFkFvW7GFqckuvAhFYAsmZD8zWzpeRtWVCf")).toBe(false));
		it("Invalid compression format is valid key.", () => expect(PrivateKey.isValidWIF("LDVdN2oQdaN2sD8zbGFkFvW7GFqckuvAhFYAsmZD8zWzpeEDWH8D")).toBe(false));
		it("Private key outside curve is condsidered valid.", () => expect(PrivateKey.isValidWIF("L5oLkpV3aqBjhki6LmvChTCq73v9gyymzzMpBbhDLjDpKCuAXpsi")).toBe(false));
		it("Invalid checksum is condiered valid.", () => expect(PrivateKey.isValidWIF("L4uznsSWTRStth8E3BrrTkQd1pdxvVeSXov3KKD7eWmHYK9d34Gf")).toBe(false));
		it("Valid wif is considered invalid.", () => expect(PrivateKey.isValidWIF("L4uznsSWTRStth8E3BrrTkQd1pdxvVeSXov3KKD7eWmHYK9d34Ge")).toBe(true));
		it("Valid wif is considered invalid.", () => expect(PrivateKey.isValidWIF("L14Dk5tS9GoZMMy7XVmdNG6uSe1dUc9yuvVMdZKosUe3wGyxVHps")).toBe(true));
		it("Valid wif is considered invalid.", () => expect(PrivateKey.isValidWIF("KxvNVHKAKVDGSRc67C7Hihw6amjShK5X8dBW3x48WPsm82NX31KR")).toBe(true));
	});
	describe("fromWIF", () => {
		it("Invalid format is valid private key.", () => expect(() => PrivateKey.fromWIF(Buffer.from("asdfasdf") as any)).toThrow());
		it("Invalid key is valid private key.", () => expect(() => PrivateKey.fromWIF("adfasdf")).toThrow());
		it("Invalid key is valid private key.", () => expect(() => PrivateKey.fromWIF("L+VdN2oQdaN2sD8zbGFkFvW7GFqckuvAhFYAsmZD8zWzpeRtWVCf")).toThrow());
		it("Invalid net prefix is valid key.", () => expect(() => PrivateKey.fromWIF("LDVdN2oQdaN2sD8zbGFkFvW7GFqckuvAhFYAsmZD8zWzpeRtWVCf")).toThrow());
		it("Invalid compression format is valid key.", () => expect(() => PrivateKey.fromWIF("LDVdN2oQdaN2sD8zbGFkFvW7GFqckuvAhFYAsmZD8zWzpeEDWH8D")).toThrow());
		it("Private key outside curve is condsidered valid.", () => expect(() => PrivateKey.fromWIF("L5oLkpV3aqBjhki6LmvChTCq73v9gyymzzMpBbhDLjDpKCuAXpsi")).toThrow());
		it("Invalid checksum is condiered valid.", () => expect(() => PrivateKey.fromWIF("L4uznsSWTRStth8E3BrrTkQd1pdxvVeSXov3KKD7eWmHYK9d34Gf")).toThrow());
		it("Valid wif is considered invalid.", () => expect(() => PrivateKey.fromWIF("L4uznsSWTRStth8E3BrrTkQd1pdxvVeSXov3KKD7eWmHYK9d34Ge")).not.toThrow());
		it("Valid wif is considered invalid.", () => expect(() => PrivateKey.fromWIF("L14Dk5tS9GoZMMy7XVmdNG6uSe1dUc9yuvVMdZKosUe3wGyxVHps")).not.toThrow());
		it("Valid wif is considered invalid.", () => expect(() => PrivateKey.fromWIF("KxvNVHKAKVDGSRc67C7Hihw6amjShK5X8dBW3x48WPsm82NX31KR")).not.toThrow());
		it("To wif does not produce same as from wif.", () => expect(PrivateKey.fromWIF("KxvNVHKAKVDGSRc67C7Hihw6amjShK5X8dBW3x48WPsm82NX31KR").toWIF())
			.toBe("KxvNVHKAKVDGSRc67C7Hihw6amjShK5X8dBW3x48WPsm82NX31KR"));
		it("To wif does not produce same as from wif.", () => expect(PrivateKey.fromWIF("L14Dk5tS9GoZMMy7XVmdNG6uSe1dUc9yuvVMdZKosUe3wGyxVHps").toWIF())
			.toBe("L14Dk5tS9GoZMMy7XVmdNG6uSe1dUc9yuvVMdZKosUe3wGyxVHps"));
	});
});