"use strict";
/*!
 * @license
 * Copyright Coinversable B.V. All Rights Reserved.
 *
 * Use of this source code is governed by a AGPLv3-style license that can be
 * found in the LICENSE file at https://validana.io/license
 */
Object.defineProperty(exports, "__esModule", { value: true });
var Raven = require("raven-js");
var Log = (function () {
    function Log() {
    }
    Log.setReportErrors = function (dns, ignoreLocalhost) {
        if (typeof window !== "undefined") {
            Log.reportErrors = true;
            Raven.config(dns, {
                autoBreadcrumbs: false,
                ignoreUrls: ignoreLocalhost ? [/localhost/, /127(?:\.\d{1,3}){3}/, /::1/] : []
            }).install();
        }
    };
    Log.isReportingErrors = function () {
        return Log.reportErrors;
    };
    Log.setUser = function (addr) {
        Raven.setUserContext({ id: addr });
    };
    Log.setRelease = function (version) {
        Raven.setRelease(version);
    };
    Log.debug = function (msg, error) {
        if (Log.Level <= Log.Debug) {
            if (console.debug !== undefined) {
                console.debug(msg + (error !== undefined ? ": " + error.stack : ""));
            }
            else {
                console.info(msg + (error !== undefined ? ": " + error.stack : ""));
            }
        }
    };
    Log.info = function (msg, error) {
        if (Log.Level <= Log.Info) {
            console.info(msg + (error !== undefined ? ": " + error.stack : ""));
            if (Log.reportErrors) {
                msg = msg.replace(/[KL][a-zA-Z1-9]{51}/g, "**********");
                if (error !== undefined) {
                    error.message = error.message.replace(/[KL][a-zA-Z1-9]{51}/g, "**********");
                    Raven.captureBreadcrumb({ level: "info", message: msg, data: { stack: error.stack } });
                }
                else {
                    Raven.captureBreadcrumb({ level: "info", message: msg });
                }
            }
        }
    };
    Log.warn = function (msg, error) {
        if (Log.Level <= Log.Warning) {
            console.warn(msg + (error !== undefined ? ": " + error.stack : ""));
            if (Log.reportErrors) {
                msg = msg.replace(/[KL][a-zA-Z1-9]{51}/g, "**********");
                if (error !== undefined) {
                    error.message = error.message.replace(/[KL][a-zA-Z1-9]{51}/g, "**********");
                    Raven.captureBreadcrumb({ level: "warning", message: msg, data: { stack: error.stack } });
                }
                else {
                    Raven.captureBreadcrumb({ level: "warning", message: msg });
                }
            }
        }
    };
    Log.error = function (msg, error) {
        if (Log.Level <= Log.Error) {
            console.error(msg + (error !== undefined ? ": " + error.stack : ""));
            if (Log.reportErrors) {
                msg = msg.replace(/[KL][a-zA-Z1-9]{51}/g, "**********");
                if (error !== undefined) {
                    error.message = error.message.replace(/[KL][a-zA-Z1-9]{51}/g, "**********");
                    Raven.captureException(error, { level: "error", extra: { message: msg } });
                }
                else {
                    Raven.captureMessage(msg, { level: "error" });
                }
            }
        }
    };
    Log.fatal = function (msg, error) {
        if (Log.Level <= Log.Fatal) {
            console.error(msg + (error !== undefined ? ": " + error.stack : ""));
            if (Log.reportErrors) {
                msg = msg.replace(/[KL][a-zA-Z1-9]{51}/g, "**********");
                if (error !== undefined) {
                    error.message = error.message.replace(/[KL][a-zA-Z1-9]{51}/g, "**********");
                    Raven.captureException(error, { level: "fatal", extra: { message: msg } });
                }
                else {
                    Raven.captureMessage(msg, { level: "fatal" });
                }
            }
        }
    };
    Log.reportErrors = false;
    Log.Debug = 0;
    Log.Info = 1;
    Log.Warning = 2;
    Log.Error = 3;
    Log.Fatal = 4;
    Log.None = 5;
    Log.Level = Log.Warning;
    Log.options = { tags: { clientVersion: "2.0.5" }, extra: {} };
    return Log;
}());
exports.Log = Log;
