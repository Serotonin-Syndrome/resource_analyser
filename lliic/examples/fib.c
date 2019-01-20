#include <stdio.h>

static
int
fib(int n)
{
    return n < 2 ? 1 : fib(n - 1) + fib(n - 2);
}

int
main()
{
    printf("%d\n", fib(10));
}
