include Makefile.share

EFLAGS=\
	--memory-init-file 0 --post-js post.js \
	-s "EXPORT_NAME='NoiseRepellent'" \
	-s "EXPORTED_FUNCTIONS=@exports.json" \
	-s "EXTRA_EXPORTED_RUNTIME_METHODS=['cwrap']" \
	-s MODULARIZE_INSTANCE=1

all: noise-repellent.asm.js noise-repellent.wasm.js

noise-repellent.asm.js: src/libnoise-repellent.a post.js
	$(CC) $(CFLAGS) $(EFLAGS) -s WASM=0 \
		$< $(FFTW3) -o $@

noise-repellent.wasm.js: src/libnoise-repellent.a post.js
	$(CC) $(CFLAGS) $(EFLAGS) \
		$< $(FFTW3) -o $@

$(FFTW3):
	test -e fftw-$(FFTW3_VERSION).tar.gz || wget http://www.fftw.org/fftw-$(FFTW3_VERSION).tar.gz
	test -e fftw-$(FFTW3_VERSION)/configure || tar zxf fftw-$(FFTW3_VERSION).tar.gz
	test -e fftw-$(FFTW3_VERSION)/build/Makefile || ( \
		mkdir -p fftw-$(FFTW3_VERSION)/build ; \
		cd fftw-$(FFTW3_VERSION)/build ; \
		emconfigure ../configure --prefix=/usr --enable-float CFLAGS=-Oz \
	)
	cd fftw-$(FFTW3_VERSION)/build ; $(MAKE)

src/libnoise-repellent.a: $(FFTW3) src/*.c
	cd src ; $(MAKE)

clean:
	rm -rf fftw-$(FFTW3_VERSION)
	cd src ; $(MAKE) clean
