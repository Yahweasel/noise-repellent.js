const nrepel = require("./noise-repellent.js");

nrepel.onready = function() {
    // Buffer of nothing
    var buf = [];
    for (var i = 0; i < 48000; i++)
        buf.push(Math.sin(i/109*Math.PI));
    console.log(buf);

    // Make the instance
    var nr = new nrepel.NoiseRepellent(48000);
    nr.set(nrepel.ENABLE, 1);

    // Figure out our latency
    nr.run([0]);
    var latency = nr.latency;
    for (var i = 0; i < latency; i++)
        buf.push(0);
    console.log("Latency is " + latency);

    // Then run it with the real input
    console.log(nr.run(buf).slice(latency+24000));
    nr.cleanup();
};
if (nrepel.ready)
    nrepel.onready();
