"use strict";
/*!
 * @license
 * Copyright Coinversable B.V. All Rights Reserved.
 *
 * Use of this source code is governed by a AGPLv3-style license that can be
 * found in the LICENSE file at https://validana.io/license
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.Log = void 0;
const Sentry = require("@sentry/browser");
class Log {
    static setReportErrors(dsn, ignoreLocalhost, version) {
        if (typeof window !== "undefined") {
            Log.reportErrors = true;
            Sentry.init({
                dsn,
                defaultIntegrations: false,
                release: version !== null && version !== void 0 ? version : Log.release,
                beforeSend: (event) => {
                    if (ignoreLocalhost && window.location.hostname.match(/localhost|127(?:\.\d{1,3}){3}|::1/) !== null) {
                        return null;
                    }
                    return event;
                }
            });
        }
    }
    static isReportingErrors() {
        return Log.reportErrors;
    }
    static setUser(addr) {
        Sentry.setUser({ id: addr });
    }
    static setRelease(version) {
        Log.release = version;
    }
    static debug(msg, error) {
        if (Log.Level <= Log.Debug) {
            if (console.debug !== undefined) {
                console.debug(msg + (error !== undefined ? `: ${error.stack}` : ""));
            }
            else {
                console.info(msg + (error !== undefined ? `: ${error.stack}` : ""));
            }
        }
    }
    static info(msg, error) {
        if (Log.Level <= Log.Info) {
            console.info(msg + (error !== undefined ? `: ${error.stack}` : ""));
            if (Log.reportErrors) {
                msg = msg.replace(/[KL][a-zA-Z1-9]{51}/g, "**********");
                if (error !== undefined) {
                    if (error.message.match(/[KL][a-zA-Z1-9]{51}/g) !== null) {
                        error.message = error.message.replace(/[KL][a-zA-Z1-9]{51}/g, "**********");
                    }
                    Sentry.addBreadcrumb({ level: Sentry.Severity.Info, message: msg, data: { stack: error.stack } });
                }
                else {
                    Sentry.addBreadcrumb({ level: Sentry.Severity.Info, message: msg });
                }
            }
        }
    }
    static warn(msg, error) {
        if (Log.Level <= Log.Warning) {
            console.warn(msg + (error !== undefined ? `: ${error.stack}` : ""));
            if (Log.reportErrors) {
                msg = msg.replace(/[KL][a-zA-Z1-9]{51}/g, "**********");
                if (error !== undefined) {
                    if (error.message.match(/[KL][a-zA-Z1-9]{51}/g) !== null) {
                        error.message = error.message.replace(/[KL][a-zA-Z1-9]{51}/g, "**********");
                    }
                    Sentry.addBreadcrumb({ level: Sentry.Severity.Warning, message: msg, data: { stack: error.stack } });
                }
                else {
                    Sentry.addBreadcrumb({ level: Sentry.Severity.Warning, message: msg });
                }
            }
        }
    }
    static error(msg, error) {
        if (Log.Level <= Log.Error) {
            console.error(msg + (error !== undefined ? `: ${error.stack}` : ""));
            if (Log.reportErrors) {
                msg = msg.replace(/[KL][a-zA-Z1-9]{51}/g, "**********");
                if (error !== undefined) {
                    if (error.message.match(/[KL][a-zA-Z1-9]{51}/g) !== null) {
                        error.message = error.message.replace(/[KL][a-zA-Z1-9]{51}/g, "**********");
                    }
                    Sentry.captureException(error, Object.assign({ level: Sentry.Severity.Error, extra: { message: msg } }, this.options));
                }
                else {
                    Sentry.captureMessage(msg, Object.assign({ level: Sentry.Severity.Error }, this.options));
                }
            }
        }
    }
    static fatal(msg, error) {
        if (Log.Level <= Log.Fatal) {
            console.error(msg + (error !== undefined ? `: ${error.stack}` : ""));
            if (Log.reportErrors) {
                msg = msg.replace(/[KL][a-zA-Z1-9]{51}/g, "**********");
                if (error !== undefined) {
                    if (error.message.match(/[KL][a-zA-Z1-9]{51}/g) !== null) {
                        error.message = error.message.replace(/[KL][a-zA-Z1-9]{51}/g, "**********");
                    }
                    Sentry.captureException(error, Object.assign({ level: Sentry.Severity.Fatal, extra: { message: msg } }, this.options));
                }
                else {
                    Sentry.captureMessage(msg, Object.assign({ level: Sentry.Severity.Fatal }, this.options));
                }
            }
        }
    }
}
exports.Log = Log;
Log.reportErrors = false;
Log.Debug = 0;
Log.Info = 1;
Log.Warning = 2;
Log.Error = 3;
Log.Fatal = 4;
Log.None = 5;
Log.Level = Log.Warning;
Log.options = { tags: { clientVersion: "2.2.0" }, extra: {} };
