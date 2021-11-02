/*!
 * @license
 * Copyright Coinversable B.V. All Rights Reserved.
 *
 * Use of this source code is governed by a AGPLv3-style license that can be
 * found in the LICENSE file at https://validana.io/license
 */
import { Extra, Primitive, ScopeContext } from "@sentry/types";
export declare class Log {
    private static reportErrors;
    static readonly Debug = 0;
    static readonly Info = 1;
    static readonly Warning = 2;
    static readonly Error = 3;
    static readonly Fatal = 4;
    static readonly None = 5;
    static Level: number;
    static options: Partial<ScopeContext> & {
        tags: {
            [key: string]: Primitive;
        };
        extra: Extra;
    };
    private static release?;
    /**
     * Set this logger to report errors. Does not work in node.js!
     * @param dsn The sentry dsn url.
     * @param ignoreLocalhost Whether to ignore errors that occur at localhost
     * @param version The release version
     * @throws if dsn is not valid.
     */
    static setReportErrors(dsn: string, ignoreLocalhost: boolean, version?: string): void;
    /** Is this logger registerd to report errors. Always returns false for node.js environment. */
    static isReportingErrors(): boolean;
    /**
     * Set the user that is logged in.
     * @param addr the address of the user
     */
    static setUser(addr: string): void;
    /**
    * Set the release version of the dashboard.
    * @param version the version
    * @deprecated Set version in setReportErrors() instead.
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
     * @param msg Description of the issue
     * @param error An optional error that may have arisen
     */
    static error(msg: string, error?: Error): void;
    /**
     * The kind of errors which require immediate fixing due to their severity.
     * @param msg Description of the issue
     * @param error An optional error that may have arisen
     */
    static fatal(msg: string, error?: Error): void;
}
