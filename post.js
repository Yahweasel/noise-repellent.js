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

// Port names
Module.AMOUNT = 0;
Module.NOFFSET = 1;
Module.RELEASE = 2;
Module.MASKING = 3;
Module.T_PROTECT = 4;
Module.WHITENING = 5;
Module.N_LEARN = 6;
Module.N_ADAPTIVE = 7;
Module.RESET = 8;
Module.RESIDUAL_LISTEN = 9;
Module.ENABLE = 10;
Module.LATENCY = 11;
Module.INPUT = 12;
Module.OUTPUT = 13;

// Function wrappers
Module.instantiate = Module.cwrap("nrepel_instantiate", "number", ["number"]);
Module.raw_connect_port = Module.cwrap("nrepel_connect_port", "number", ["number", "number", "number"]);
Module.raw_run = Module.cwrap("nrepel_run", "number", ["number", "number"]);
Module.cleanup = Module.cwrap("nrepel_cleanup", null, ["number"]);
Module.malloc = Module.cwrap("malloc", "number", ["number"]);
Module.realloc = Module.cwrap("realloc", "number", ["number", "number"]);
Module.free = Module.cwrap("free", null, ["number"]);

// We wrap that in a convenience class
function NoiseRepellentW(rate) {
    // Create the instance itself
    this.instance = Module.instantiate(rate);
    if (this.instance === 0)
        throw new Error("Failed to create noise repellent instance.");

    // And enough space for a float
    this.settingBufPtr = Module.malloc(4);
    if (this.settingBufPtr === 0)
        throw new Error("Failed to create noise repellent setting buffer.");
    this.settingBuffer = new Float32Array(Module.HEAPU8.buffer, this.settingBufPtr, 1);

    // We also use the setting buffer to transfer latency info
    Module.raw_connect_port(this.instance, Module.LATENCY, this.settingBufPtr);
    this.latency = 0;

    // Our input and output buffers start at size 0
    this.inputPtr = this.outputPtr = 0;
    this.inputBuf = this.outputBuf = null;
    this.bufSz = 0;
}
Module.NoiseRepellent = NoiseRepellentW;

NoiseRepellentW.prototype = {
    // Set a setting
    set: function(port, value) {
        // Put it in the buffer
        this.settingBuffer[0] = value;

        // And set it
        Module.raw_connect_port(this.instance, port, this.settingBufPtr);
    },

    // Run noise reduction
    run: function(buffer) {
        // Expand if needed
        if (buffer.length > this.bufSz)
            this.expand(buffer.length);

        // Copy in
        this.inputBuf.set(buffer);

        // Run it
        Module.raw_run(this.instance, buffer.length);

        // Get the latency
        this.latency = Math.round(this.settingBuffer[0]);

        // And give the result
        return this.outputBuf.subarray(0, buffer.length);
    },

    // Clean up this instance when we're done with it
    cleanup: function() {
        // Clean up the instance itself
        Module.cleanup(this.instance);

        // Free our stuff
        Module.free(this.settingBufPtr);
        if (this.inputPtr)
            Module.free(this.inputPtr);
        if (this.outputPtr)
            Module.free(this.outputPtr);
    },

    // Expand the buffer large enough to fit this many samples
    expand: function(sz) {
        var self = this;
        if (sz < 1024) sz = 1024;
        function expand(member) {
            self[member+"Ptr"] = Module.realloc(self[member+"Ptr"], sz*4);
            if (self[member+"Ptr"] === 0)
                throw new Error("Failed to expand " + member + " buffer!");
            self[member+"Buf"] = new Float32Array(Module.HEAPU8.buffer, self[member+"Ptr"], sz);
        }
        expand("input");
        Module.raw_connect_port(this.instance, Module.INPUT, this.inputPtr);
        expand("output");
        Module.raw_connect_port(this.instance, Module.OUTPUT, this.outputPtr);
        this.bufSz = sz;
    }
};
