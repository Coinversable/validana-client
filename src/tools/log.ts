/**
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
	public static Level = Log.Error;
	public static options: Raven.RavenOptions = { tags: { clientVersion: "1.0.0" }, extra: {} };

	/** Set this logger to report errors. Will throw an error if there are problems with the url. */
	public static setReportErrors(dns: string, ignoreLocalhost: boolean): void {
		Log.reportErrors = true;
		Raven.config(dns, { autoBreadcrumbs: false, ignoreUrls: ignoreLocalhost ? [/localhost/] : [] }).install();
	}

	/**  Is this logger registerd to report errors. */
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
				if (error !== undefined) {
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
				if (error !== undefined) {
					Raven.captureBreadcrumb({ level: "warning", message: msg, data: { stack: error.stack } });
				} else {
					Raven.captureBreadcrumb({ level: "warning", message: msg });
				}
			}
		}
	}

	/**
	 * Errors which require you to modify the program code, because they should never happen.
	 * You will always be notified if this occurs.
	 * @param msg Description of the issue
	 * @param error An optional error that may have arisen
	 */
	public static error(msg: string, error?: Error): void {
		if (Log.Level <= Log.Error) {
			console.error(msg + (error !== undefined ? `: ${error.stack}` : ""));
			if (Log.reportErrors) {
				if (error !== undefined) {
					Raven.captureException(error, { level: "error", extra: { message: msg } });
				} else {
					Raven.captureMessage(msg, { level: "error" });
				}
			}
		}
	}

	/**
	 * The kind of errors for which you should be waken up at night. Like a live backend going down.
	 * You will always be immediately notified if this occurs.
	 * @param msg Description of the issue
	 * @param error An optional error that may have arisen
	 */
	public static fatal(msg: string, error?: Error): void {
		if (Log.Level <= Log.Fatal) {
			console.error(msg + (error !== undefined ? `: ${error.stack}` : ""));
			if (Log.reportErrors) {
				if (error !== undefined) {
					//Typecast because of buggy raven js types
					Raven.captureException(error, { level: "fatal" as "critical", extra: { message: msg } });
				} else {
					Raven.captureMessage(msg, { level: "fatal" as "critical" });
				}
			}
		}
	}
}