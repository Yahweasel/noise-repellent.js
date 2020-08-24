/*
 * Copyright (C) 2020 Yahweasel
 *
 * Permission to use, copy, modify, and/or distribute this software for any
 * purpose with or without fee is hereby granted.
 *
 * THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
 * WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
 * MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY
 * SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
 * WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION
 * OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF OR IN
 * CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
 */

(function() {
    function isWebAssemblySupported() {
        try {
            if (typeof WebAssembly === "object" &&
                typeof WebAssembly.instantiate === "function") {
                var module = new WebAssembly.Module(
                    new Uint8Array([0x0, 0x61, 0x73, 0x6d, 0x01, 0x00, 0x00, 0x00]));
                if (module instanceof WebAssembly.Module)
                    return new WebAssembly.Instance(module) instanceof WebAssembly.Instance;
            }
        } catch (e) {
        }
        return false;
    }

    var nrepel;
    var base = ".";
    var nodejs = (typeof process !== "undefined");
    var wasm = isWebAssemblySupported();

    if (typeof NoiseRepellent === "undefined")
        NoiseRepellent = {};
    nrepel = NoiseRepellent;
    if (nrepel.base)
        base = nrepel.base;

    // Port names are global, so we put them here
    nrepel.AMOUNT = 0;
    nrepel.NOFFSET = 1;
    nrepel.RELEASE = 2;
    nrepel.MASKING = 3;
    nrepel.T_PROTECT = 4;
    nrepel.WHITENING = 5;
    nrepel.N_LEARN = 6;
    nrepel.N_ADAPTIVE = 7;
    nrepel.RESET = 8;
    nrepel.RESIDUAL_LISTEN = 9;
    nrepel.ENABLE = 10;
    nrepel.LATENCY = 11;
    nrepel.INPUT = 12;
    nrepel.OUTPUT = 13;

    // We wrap NoiseRepellent in a convenience class
    function NoiseRepellentW(nr, rate) {
        // Create the instance itself
        this.nr = nr;
        this.instance = nr.instantiate(rate);
        if (this.instance === 0)
            throw new Error("Failed to create noise repellent instance.");

        // And enough space for a float
        this.settingBufPtr = nr.malloc(4);
        if (this.settingBufPtr === 0)
            throw new Error("Failed to create noise repellent setting buffer.");
        this.settingBuffer = new Float32Array(nr.HEAPU8.buffer, this.settingBufPtr, 1);

        // We also use the setting buffer to transfer latency info
        nr.raw_connect_port(this.instance, nr.LATENCY, this.settingBufPtr);
        this.latency = 0;

        // Our input and output buffers start at size 0
        this.inputPtr = this.outputPtr = 0;
        this.inputBuf = this.outputBuf = null;
        this.bufSz = 0;
    }
    nrepel.NoiseRepellentW = NoiseRepellentW;

    NoiseRepellentW.prototype = {
        // Set a setting
        set: function(port, value) {
            // Put it in the buffer
            this.settingBuffer[0] = value;

            // And set it
            this.nr.raw_connect_port(this.instance, port, this.settingBufPtr);
        },

        // Run noise reduction
        run: function(buffer) {
            // Expand if needed
            if (buffer.length > this.bufSz)
                this.expand(buffer.length);

            // Copy in
            this.inputBuf.set(buffer);

            // Run it
            this.nr.raw_run(this.instance, buffer.length);

            // Get the latency
            this.latency = Math.round(this.settingBuffer[0]);

            // And give the result
            return this.outputBuf.subarray(0, buffer.length);
        },

        // Clean up this instance when we're done with it
        cleanup: function() {
            // Clean up the instance itself
            this.nr.cleanup(this.instance);

            // Free our stuff
            this.nr.free(this.settingBufPtr);
            if (this.inputPtr)
                this.nr.free(this.inputPtr);
            if (this.outputPtr)
                this.nr.free(this.outputPtr);
        },

        // Expand the buffer large enough to fit this many samples
        expand: function(sz) {
            var self = this;
            if (sz < 1024) sz = 1024;
            function expand(member) {
                self[member+"Ptr"] = self.nr.realloc(self[member+"Ptr"], sz*4);
                if (self[member+"Ptr"] === 0)
                    throw new Error("Failed to expand " + member + " buffer!");
                self[member+"Buf"] = new Float32Array(self.nr.HEAPU8.buffer, self[member+"Ptr"], sz);
            }
            expand("input");
            this.nr.raw_connect_port(this.instance, this.nr.INPUT, this.inputPtr);
            expand("output");
            this.nr.raw_connect_port(this.instance, this.nr.OUTPUT, this.outputPtr);
            this.bufSz = sz;
        }
    };

    // Make our own constructor
    nrepel.NoiseRepellent = function(rate) {
        return Promise.all([]).then(function() {
            // 1: Load the library
            if (!NoiseRepellent.NoiseRepellentFactory) {
                if (!nodejs) {
                    // As a script
                    return new Promise(function(res, rej) {
                        var scr = document.createElement("script");
                        scr.addEventListener("load", res);
                        scr.addEventListener("error", rej);
                        scr.src = base + "/noise-repellent-m." + (wasm?"w":"") + "asm.js";
                        scr.async = true;
                        document.body.appendChild(scr);
                    }).then(function() {
                        nrepel.NoiseRepellentFactory = NoiseRepellentFactory;
                    });

                } else {
                    // Just load it directly
                    nrepel.NoiseRepellentFactory = require("./noise-repellent-m." + (wasm?"w":"") + "asm.js");

                }
            }

        }).then(function() {
            // Now create a NoiseRepellent instance
            return nrepel.NoiseRepellentFactory();

        }).then(function(nr) {
            // And wrap that
            return new NoiseRepellentW(nr, rate);

        });
    };

    if (nodejs)
        module.exports = nrepel;
})();
