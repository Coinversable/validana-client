/*!
 * @license
 * Copyright Coinversable B.V. All Rights Reserved.
 *
 * Use of this source code is governed by a AGPLv3-style license that can be
 * found in the LICENSE file at https://validana.io/license
 */

import * as Raven from "raven-js";

// tslint:disable:no-console
export class Log {
	private static reportErrors: boolean = false;
	public static readonly Debug = 0;
	public static readonly Info = 1;
	public static readonly Warning = 2;
	public static readonly Error = 3;
	public static readonly Fatal = 4;
	public static readonly None = 5;
	public static Level = Log.Warning;
	//We do not include package.json for the version here as this will not work in the browser.
	public static options: Raven.RavenOptions & { tags: {}; extra: {} } = { tags: { clientVersion: "2.0.5" }, extra: {} };

	/**
	 * Set this logger to report errors. Does not work in node.js!
	 * @param dns The sentry dns url.
	 * @param ignoreLocalhost Whether to ignore errors that occure at localhost
	 * @throws if dns is not valid.
	 */
	public static setReportErrors(dns: string, ignoreLocalhost: boolean): void {
		if (typeof window !== "undefined") {
			Log.reportErrors = true;
			Raven.config(dns, {
				autoBreadcrumbs: false,
				ignoreUrls: ignoreLocalhost ? [/localhost/, /127(?:\.\d{1,3}){3}/, /::1/] : []
			}).install();
		}
	}

	/** Is this logger registerd to report errors. Always returns false for node.js environment. */
	public static isReportingErrors(): boolean {
		return Log.reportErrors;
	}

	/**
	 * Set the user that is logged in.
	 * @param addr the address of the user
	 */
	public static setUser(addr: string): void {
		Raven.setUserContext({ id: addr });
	}

	/**
	 * Set the release version of the dashboard.
	 * @param version the version
	 */
	public static setRelease(version: string): void {
		Raven.setRelease(version);
	}

	/**
	 * Detailed information about the program flow that is used for debugging problems.
	 * Will never be logged in a live environment.
	 * @param msg Description of the issue
	 * @param error An optional error that may have arisen
	 */
	public static debug(msg: string, error?: Error): void {
		if (Log.Level <= Log.Debug) {
			//Old version of nodejs don't have the console.debug function
			if (console.debug !== undefined) {
				console.debug(msg + (error !== undefined ? `: ${error.stack}` : ""));
			} else {
				console.info(msg + (error !== undefined ? `: ${error.stack}` : ""));
			}
		}
	}

	/**
	 * Significant things that occur in normal circumstances.
	 * @param msg Description of the issue
	 * @param error An optional error that may have arisen
	 */
	public static info(msg: string, error?: Error): void {
		if (Log.Level <= Log.Info) {
			console.info(msg + (error !== undefined ? `: ${error.stack}` : ""));
			if (Log.reportErrors) {
				//Regex any potential private keys away.
				msg = msg.replace(/[KL][a-zA-Z1-9]{51}/g, "**********");
				if (error !== undefined) {
					error.message = error.message.replace(/[KL][a-zA-Z1-9]{51}/g, "**********");
					Raven.captureBreadcrumb({ level: "info", message: msg, data: { stack: error.stack } });
				} else {
					Raven.captureBreadcrumb({ level: "info", message: msg });
				}
			}
		}
	}

	/**
	 * Problems which may occur in abnormal circumstances (loss of connection, etc), but are dealt with by the program.
	 * @param msg Description of the issue
	 * @param error An optional error that may have arisen
	 */
	public static warn(msg: string, error?: Error): void {
		if (Log.Level <= Log.Warning) {
			console.warn(msg + (error !== undefined ? `: ${error.stack}` : ""));
			if (Log.reportErrors) {
				//Regex any potential private keys away.
				msg = msg.replace(/[KL][a-zA-Z1-9]{51}/g, "**********");
				if (error !== undefined) {
					error.message = error.message.replace(/[KL][a-zA-Z1-9]{51}/g, "**********");
					Raven.captureBreadcrumb({ level: "warning", message: msg, data: { stack: error.stack } });
				} else {
					Raven.captureBreadcrumb({ level: "warning", message: msg });
				}
			}
		}
	}

	/**
	 * Errors which require you to modify the program code, because they should never happen.
	 * @param msg Description of the issue
	 * @param error An optional error that may have arisen
	 */
	public static error(msg: string, error?: Error): void {
		if (Log.Level <= Log.Error) {
			console.error(msg + (error !== undefined ? `: ${error.stack}` : ""));
			if (Log.reportErrors) {
				//Regex any potential private keys away.
				msg = msg.replace(/[KL][a-zA-Z1-9]{51}/g, "**********");
				if (error !== undefined) {
					error.message = error.message.replace(/[KL][a-zA-Z1-9]{51}/g, "**********");
					Raven.captureException(error, { level: "error", extra: { message: msg } });
				} else {
					Raven.captureMessage(msg, { level: "error" });
				}
			}
		}
	}

	/**
	 * The kind of errors which require immediate fixing due to their severity.
	 * @param msg Description of the issue
	 * @param error An optional error that may have arisen
	 */
	public static fatal(msg: string, error?: Error): void {
		if (Log.Level <= Log.Fatal) {
			console.error(msg + (error !== undefined ? `: ${error.stack}` : ""));
			if (Log.reportErrors) {
				//Regex any potential private keys away.
				msg = msg.replace(/[KL][a-zA-Z1-9]{51}/g, "**********");
				if (error !== undefined) {
					error.message = error.message.replace(/[KL][a-zA-Z1-9]{51}/g, "**********");
					//Typecast because of buggy raven js types
					Raven.captureException(error, { level: "fatal" as "critical", extra: { message: msg } });
				} else {
					Raven.captureMessage(msg, { level: "fatal" as "critical" });
				}
			}
		}
	}
}