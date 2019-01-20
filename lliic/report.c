#define _GNU_SOURCE
#include <stdio.h>
#include <stdlib.h>
#include <limits.h>
#include <errno.h>
#include <inttypes.h>
#include <sys/mman.h>

static _Atomic size_t tot_nalloc = 0;
static _Atomic size_t cur_nalloc = 0;
static _Atomic size_t max_nalloc = 0;

static
void
update_max_nalloc(void)
{
    if (cur_nalloc > max_nalloc) {
        max_nalloc = cur_nalloc;
    }
}

enum { NHEADER = sizeof(size_t), };

static
void *
skip_header(void *p)
{
    return (char *) p + NHEADER;
}

static
void *
unskip_header(void *p)
{
    return (char *) p - NHEADER;
}

static
void
write_header(void *p, size_t x)
{
    * (size_t *) p = x;
}

static
size_t
read_header(void *p)
{
    return * (size_t *) p;
}

void *
malloc(size_t n)
{
    if (!n) {
        return NULL;
    }
    if (n > SIZE_MAX - NHEADER) {
        errno = ENOMEM;
        return NULL;
    }
    void *r = mmap(
        NULL,
        n + NHEADER,
        PROT_READ | PROT_WRITE,
        MAP_PRIVATE | MAP_ANONYMOUS,
        -1, 0);
    if (r == MAP_FAILED) {
        return NULL;
    }
    write_header(r, n);

    tot_nalloc += n;
    cur_nalloc += n;
    update_max_nalloc();

    return skip_header(r);
}

void *
calloc(size_t n, size_t m)
{
    if (m && n > SIZE_MAX / m) {
        errno = ENOMEM;
        return NULL;
    }
    return malloc(n * m);
}

void
free(void *p)
{
    if (!p) {
        return;
    }
    p = unskip_header(p);
    const size_t old_sz = read_header(p);
    cur_nalloc -= old_sz;
    munmap(p, old_sz + NHEADER);
}

void *
realloc(void *p, size_t n)
{
    if (!n) {
        free(p);
        return NULL;
    }
    if (n > SIZE_MAX - NHEADER) {
        errno = ENOMEM;
        return NULL;
    }
    p = unskip_header(p);
    const size_t old_sz = read_header(p);
    void *r = mremap(p, old_sz + NHEADER, n + NHEADER, MREMAP_MAYMOVE);
    if (r == MAP_FAILED) {
        return NULL;
    }
    write_header(r, n);

    if (n > old_sz) {
        tot_nalloc += n - old_sz;
    }
    cur_nalloc += n - old_sz;
    update_max_nalloc();

    return skip_header(r);
}

void
$$report(uint64_t gas)
{
    fprintf(stderr, "GAS CONSUMED: %" PRIu64 "\n", gas);
    fprintf(stderr, "MEMORY CONSUMED (TOTAL/PEAK): %zu/%zu\n", tot_nalloc, max_nalloc);
}
