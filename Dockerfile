FROM maven:3.6.0-jdk-10-slim

RUN apt-get update && apt-get install -y clang-7 clang++-7 llvm-7 make git nano sudo

COPY ./rbvm/llvm-backend /app/llvm-backend
COPY ./rbvm/vm /app/vm
COPY ./rbvm/Makefile ./rbvm/compile-and-run ./rbvm/run-tests /app/
COPY ./lliic /app/lliic
COPY ./web-ide /app/web-ide
EXPOSE 80

WORKDIR /app/llvm-backend
RUN make CXX=clang++-7 -B

WORKDIR /app/vm
RUN make CXX=clang++-7 -B

WORKDIR /app/web-ide
RUN mvn clean install -DskipTests

WORKDIR /app/lliic
RUN chmod u+x run

WORKDIR /app
RUN mkdir web-ide/bin && cp llvm-backend/llvm-rbvm web-ide/bin/ && cp vm/vm web-ide/bin/rbvm && cp vm/da web-ide/bin/da

RUN adduser --system --no-create-home --disabled-password --shell /bin/bash --group unsafe

WORKDIR /app
RUN chmod -R o-rwx ./* && chmod o+rx web-ide && mkdir playground && cp -r /app/lliic/* playground/ && chown -R unsafe:unsafe playground

WORKDIR /app/web-ide
CMD java -jar target/ide.main-0.1.0.jar
