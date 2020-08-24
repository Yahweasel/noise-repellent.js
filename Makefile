include Makefile.share

EFLAGS=\
	--memory-init-file 0 --post-js post.js \
	-s "EXPORT_NAME='NoiseRepellentFactory'" \
	-s "EXPORTED_FUNCTIONS=@exports.json" \
	-s "EXTRA_EXPORTED_RUNTIME_METHODS=['cwrap']" \
	-s MODULARIZE=1

all: noise-repellent-m.asm.js noise-repellent-m.wasm.js

noise-repellent-m.asm.js: src/libnoise-repellent.a post.js
	$(CC) $(CFLAGS) $(EFLAGS) -s WASM=0 \
		$< $(FFTW3) -o $@
	cat license.js $@ > $@.tmp
	mv $@.tmp $@

noise-repellent-m.wasm.js: src/libnoise-repellent.a post.js
	$(CC) $(CFLAGS) $(EFLAGS) \
		$< $(FFTW3) -o $@
	cat license.js $@ > $@.tmp
	mv $@.tmp $@

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
	rm -f noise-repellent.asm.js noise-repellent.wasm.js noise-repellent.wasm.wasm
