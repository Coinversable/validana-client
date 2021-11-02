/*!
 * @license
 * Copyright Coinversable B.V. All Rights Reserved.
 *
 * Use of this source code is governed by a AGPLv3-style license that can be
 * found in the LICENSE file at https://validana.io/license
 */
/* eslint-disable no-console */

import * as Sentry from "@sentry/browser";
import { Extra, Primitive, ScopeContext } from "@sentry/types";

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
	public static options: Partial<ScopeContext> & { tags: { [key: string]: Primitive }, extra: Extra } = { tags: { clientVersion: "2.2.0" }, extra: {} };
	private static release?: string;

	/**
	 * Set this logger to report errors. Does not work in node.js!
	 * @param dsn The sentry dsn url.
	 * @param ignoreLocalhost Whether to ignore errors that occur at localhost
	 * @param version The release version
	 * @throws if dsn is not valid.
	 */
	public static setReportErrors(dsn: string, ignoreLocalhost: boolean, version?: string): void {
		if (typeof window !== "undefined") {
			Log.reportErrors = true;
			Sentry.init({
				dsn,
				defaultIntegrations: false,
				release: version ?? Log.release,
				beforeSend: (event) => {
					if (ignoreLocalhost && window.location.hostname.match(/localhost|127(?:\.\d{1,3}){3}|::1/) !== null) {
						return null;
					}
					return event;
				}
			});
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
		Sentry.setUser({ id: addr });
	}
	
	/**
	* Set the release version of the dashboard.
	* @param version the version
	* @deprecated Set version in setReportErrors() instead.
	*/
	public static setRelease(version: string): void {
		Log.release = version;
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
					//Some browsers/scripts? make error.message readonly, so avoid editing if not needed
					if (error.message.match(/[KL][a-zA-Z1-9]{51}/g) !== null) {
						error.message = error.message.replace(/[KL][a-zA-Z1-9]{51}/g, "**********");
					}
					Sentry.addBreadcrumb({ level: Sentry.Severity.Info, message: msg, data: { stack: error.stack } });
				} else {
					Sentry.addBreadcrumb({ level: Sentry.Severity.Info, message: msg });
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
					//Some browsers/scripts? make error.message readonly, so avoid editing if not needed
					if (error.message.match(/[KL][a-zA-Z1-9]{51}/g) !== null) {
						error.message = error.message.replace(/[KL][a-zA-Z1-9]{51}/g, "**********");
					}
					Sentry.addBreadcrumb({ level: Sentry.Severity.Warning, message: msg, data: { stack: error.stack } });
				} else {
					Sentry.addBreadcrumb({ level: Sentry.Severity.Warning, message: msg });
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
					//Some browsers/scripts? make error.message readonly, so avoid editing if not needed
					if (error.message.match(/[KL][a-zA-Z1-9]{51}/g) !== null) {
						error.message = error.message.replace(/[KL][a-zA-Z1-9]{51}/g, "**********");
					}
					Sentry.captureException(error, Object.assign({ level: Sentry.Severity.Error, extra: { message: msg } }, this.options));
				} else {
					Sentry.captureMessage(msg, Object.assign({ level: Sentry.Severity.Error }, this.options));
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
					//Some browsers/scripts? make error.message readonly, so avoid editing if not needed
					if (error.message.match(/[KL][a-zA-Z1-9]{51}/g) !== null) {
						error.message = error.message.replace(/[KL][a-zA-Z1-9]{51}/g, "**********");
					}
					Sentry.captureException(error, Object.assign({ level: Sentry.Severity.Fatal, extra: { message: msg } }, this.options));
				} else {
					Sentry.captureMessage(msg, Object.assign({ level: Sentry.Severity.Fatal }, this.options));
				}
			}
		}
	}
}