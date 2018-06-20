/**
 * @license
 * Copyright Coinversable B.V. All Rights Reserved.
 *
 * Use of this source code is governed by a AGPLv3-style license that can be
 * found in the LICENSE file at https://validana.io/license
 */
import * as Raven from "raven-js";
export declare class Log {
    private static reportErrors;
    static readonly Debug: number;
    static readonly Info: number;
    static readonly Warning: number;
    static readonly Error: number;
    static readonly Fatal: number;
    static readonly None: number;
    static Level: number;
    static options: Raven.RavenOptions;
    /** Set this logger to report errors. Will throw an error if there are problems with the url. */
    static setReportErrors(dns: string, ignoreLocalhost: boolean): void;
    /**  Is this logger registerd to report errors. */
    static isReportingErrors(): boolean;
    /**
     * Set the user that is logged in.
     * @param addr the address of the user
     */
    static setUser(addr: string): void;
    /**
     * Set the release version of the dashboard.
     * @param version the version
     */
    static setRelease(version: string): void;
    /**
     * Detailed information about the program flow that is used for debugging problems.
     * Will never be logged in a live environment.
     * @param msg Description of the issue
     * @param error An optional error that may have arisen
     */
    static debug(msg: string, error?: Error): void;
    /**
     * Significant things that occur in normal circumstances.
     * @param msg Description of the issue
     * @param error An optional error that may have arisen
     */
    static info(msg: string, error?: Error): void;
    /**
     * Problems which may occur in abnormal circumstances (loss of connection, etc), but are dealt with by the program.
     * @param msg Description of the issue
     * @param error An optional error that may have arisen
     */
    static warn(msg: string, error?: Error): void;
    /**
     * Errors which require you to modify the program code, because they should never happen.
     * You will always be notified if this occurs.
     * @param msg Description of the issue
     * @param error An optional error that may have arisen
     */
    static error(msg: string, error?: Error): void;
    /**
     * The kind of errors for which you should be waken up at night. Like a live backend going down.
     * You will always be immediately notified if this occurs.
     * @param msg Description of the issue
     * @param error An optional error that may have arisen
     */
    static fatal(msg: string, error?: Error): void;
}
