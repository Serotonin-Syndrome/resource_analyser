#include <stddef.h>
#include <stdio.h>
#include <error.h>
#include <pthread.h>

static
int
fib(int n)
{
    return n < 2 ? 1 : fib(n - 1) + fib(n - 2);
}

static
void *
worker(void *arg)
{
    (void) arg;
    printf("%d\n", fib(10));
    return NULL;
}

int
main()
{
    int r;
#define CHECK(Expr_) if ((r = (Expr_))) error(1, r, "%s", #Expr_)
    enum { NWORKERS = 4 };
    pthread_t t[NWORKERS];
    for (int i = 0; i < NWORKERS; ++i) {
        CHECK(pthread_create(&t[i], NULL, worker, NULL));
    }
    for (int i = 0; i < NWORKERS; ++i) {
        CHECK(pthread_join(t[i], NULL));
    }
}
