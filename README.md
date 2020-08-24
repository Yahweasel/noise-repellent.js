NOTE: This is a port of noise-repellent to JavaScript, not the original noise-repellent!


noise-repellent.js
------------------
If you're loading from a subdirectory, set `NoiseRepellent = {base:
"wherever"};`. Load `noise-repellent-m.js`. `NoiseRepellent.NoiseRepellent` is
a function that returns a promise that resolves to a NoiseRepellent instance,
given the sample rate as an argument.

```javascript
NoiseRepellent.NoiseRepellent(sampleRate).then(function(nr) {
    nr.set(NoiseRepellent.N_ADAPTIVE, 1);
    nr.set(NoiseRepellent.WHITENING, 25);
    onframe = function(frameF32) {
        var ret = nr.run(frameF32);
        // Maybe do something with nr.latency
        return ret;
    }
    ...
    nr.cleanup();
});
```

Other settable ports are identical to the original `noise-repellent`. Their
names can be found in `noise-repellent-m.js`.

The remainder of this document is the original `noise-repellent`'s README, and
is not JavaScript-specific.


noise-repellent
-------
An lv2 plug-in for broadband noise reduction.

Short Demo
-------
[![](http://img.youtube.com/vi/iNVxCvgcnig/0.jpg)](http://www.youtube.com/watch?v=iNVxCvgcnig "")

Features
-------
* Spectral gating and spectral subtraction suppression rule
* Adaptive and manual noise thresholds estimation
* Adjustable noise floor
* Adjustable offset of thresholds to perform over-subtraction
* Time smoothing and a masking estimation to reduce artifacts
* Basic onset detector to avoid transients suppression
* Whitening of the noise floor to mask artifacts and to recover higher frequencies
* Option to listen to the residual signal
* Soft bypass
* Noise profile saved with the session

Limitations
-------
* The plug-in will introduce latency so it's not appropriate to be used while recording (35 ms for 44.1 kHz)
* It was developed to be used with Ardour however it is known to work with other hosts

Install
-------
Binaries for most platforms are provided with releases but if you are an experienced user you can go ahead an compile it from source. Just extract the adequate zip file for your platform to your lv2 plugins folder (normally /usr/local/lib/lv2 or $HOME/.lv2)

To compile and install this plug-in you will need the LV2 SDK, Meson build system (use pip3 to install it), ninja compiler, git and fftw3 library (>= 3.3.5 is recommended to avoid threading issues).

Installation:
```bash
  git clone https://github.com/lucianodato/noise-repellent.git
  cd noise-repellent
  meson build --buildtype release --prefix (your-os-appropriate-location-fullpath)
  ninja -v -C build
  sudo ninja -C build install
```
Noise-repellent is on Arch community at https://www.archlinux.org/packages/community/x86_64/noise-repellent/.

Usage Instuctions
-----
Please refer to project's wiki https://github.com/lucianodato/noise-repellent/wiki

Code Documentation
-----
Code is documented using doxygen. To read it be sure to install doxygen in your system and run the following command:

```bash
  doxygen -s doc/doxygen.conf
```
This will generate an html folder inside doc folder. Accessing index.html you can read the documentation.
