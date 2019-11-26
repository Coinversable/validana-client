
import { Log } from "../index";

// tslint:disable:no-console
describe("Log", () => {
	beforeAll(() => {
		//Do not spam process output. If sandboxing is done first this is no longer needed nor possible.
		try {
			console.debug = () => { };
			console.log = () => { };
			console.info = () => { };
			console.warn = () => { };
			console.error = () => { };
		} catch (error) { }
	});

	describe("Log level none", () => {
		beforeAll(() => Log.Level = Log.None);

		it("Log debug error", () => expect(() => Log.debug("test")).not.toThrow());
		it("Log debug error", () => expect(() => Log.debug("test", new Error("test"))).not.toThrow());
		it("Log info error", () => expect(() => Log.info("test")).not.toThrow());
		it("Log info error", () => expect(() => Log.info("test", new Error("test"))).not.toThrow());
		it("Log warn error", () => expect(() => Log.warn("test")).not.toThrow());
		it("Log warn error", () => expect(() => Log.warn("test", new Error("test"))).not.toThrow());
		it("Log error error", () => expect(() => Log.error("test")).not.toThrow());
		it("Log error error", () => expect(() => Log.error("test", new Error("test123"))).not.toThrow());
		it("Log fatal error", () => expect(() => Log.fatal("test")).not.toThrow());
		it("Log fatal error", () => expect(() => Log.fatal("test", new Error("test123"))).not.toThrow());
	});
	describe("Log level debug", () => {
		beforeAll(() => Log.Level = Log.Debug);

		it("Log debug error", () => expect(() => Log.debug("test")).not.toThrow());
		it("Log debug error", () => expect(() => Log.debug("test", new Error("test"))).not.toThrow());
		it("Log info error", () => expect(() => Log.info("test")).not.toThrow());
		it("Log info error", () => expect(() => Log.info("test", new Error("test"))).not.toThrow());
		it("Log warn error", () => expect(() => Log.warn("test")).not.toThrow());
		it("Log warn error", () => expect(() => Log.warn("test", new Error("test"))).not.toThrow());
		it("Log error error", () => expect(() => Log.error("test")).not.toThrow());
		it("Log error error", () => expect(() => Log.error("test", new Error("test"))).not.toThrow());
		it("Log fatal error", () => expect(() => Log.fatal("test")).not.toThrow());
		it("Log fatal error", () => expect(() => Log.fatal("test", new Error("test"))).not.toThrow());
	});
	describe("Log sentry settings", () => {
		it("Log version", () => expect(Log.options.tags.clientVersion).toBe(require("../../package.json").version));
		it("Log reporting errors", () => expect(Log.isReportingErrors()).toBe(false));
		it("Log set user", () => expect(() => Log.setUser("asdf")).not.toThrow());
		it("Log set release", () => expect(() => Log.setRelease("1.2.3")).not.toThrow());
	});
});