const nrepel = require("./noise-repellent-m.js");

nrepel.NoiseRepellent(48000).then(function(nr) {
    // Buffer of nothing
    var buf = [];
    for (var i = 0; i < 48000; i++)
        buf.push(Math.sin(i/109*Math.PI));
    console.log(buf);

    // Enable
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
});
