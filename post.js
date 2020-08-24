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

// Function wrappers
Module.instantiate = Module.cwrap("nrepel_instantiate", "number", ["number"]);
Module.raw_connect_port = Module.cwrap("nrepel_connect_port", "number", ["number", "number", "number"]);
Module.raw_run = Module.cwrap("nrepel_run", "number", ["number", "number"]);
Module.cleanup = Module.cwrap("nrepel_cleanup", null, ["number"]);
Module.malloc = Module.cwrap("malloc", "number", ["number"]);
Module.realloc = Module.cwrap("realloc", "number", ["number", "number"]);
Module.free = Module.cwrap("free", null, ["number"]);
