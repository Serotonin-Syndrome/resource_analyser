#include <stdio.h>
#include <string.h>
#include <stdlib.h>

void
greet()
{
    char *p = malloc(1024);
    if (!p) {
        puts("Fail!");
    } else {
        strcpy(p, "Hello");
        puts(p);
    }
    free(p);
}

int
main()
{
    for (int i = 0; i < 5; ++i) {
        greet();
    }
}
