include ../Makefile.share

OBJS=nrepel.o

all: libnoise-repellent.a

libnoise-repellent.a: $(OBJS)
	emar rc $@ $(OBJS)
	emranlib $@

%.o: %.c *.c
	$(CC) $(CFLAGS) -I ../fftw-$(FFTW3_VERSION)/api -c $< -o $@

clean:
	rm -f $(OBJS) libnoise-repellent.a
