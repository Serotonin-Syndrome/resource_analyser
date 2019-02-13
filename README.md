# This is our solution of the Fantom task on the CryptoBazar Serial Hacking: December.

The task was:
<ul>
    <li> Create resource analyser/predictor, given smart contract—as LLVM IR—predict compute resource usage (Ethereum analogy: gas usage)
    <li> To develop a plugin for this estimator for Atom/VS Code/Jetbrains.
</ul>

It means that we have a smart-contract in LLVM IR language and we need to understand how much memory and and CPU will it use after the deployment and according to this information understand how much gas should the deployment cost.

There are two main ways to solve this task, the first one is to use static estimation (neural nets, k-neighbours, etc) and the second one is to create a simulator. We’ve studied both of them and decided that simulator will be more powerful, more efficient and more scalable solution for this task. Why? We explain our choice below.

# Why?
Let us explain why we have chosen simulator and not the neural network. We are proficient in machine learning but quick research revealed some strong problems. First and the most difficult one is the lack of the training data. According to our estimates, for neural net to be more efficient than our current solution there should be about 10000 different LLVM IR smart contracts with good code.

Second trouble is related to strong dependance between gas usage and VM architecture, so neural net couldn’t take it into consideration and for another architecture we will need another neural net and another data set.

So, these two considerations bring us to the decision to use a simulator.

# Introduction
First of all, for our solution we have mostly used C, Bash, Sed, AWK.

Second interesting question was how to find correct LLVM IR smart contracts. We’ve solved it in this way: in our tests we use C and C++ smart contracts compiled to LLVM IR; of course, pure-LLVM IR smart contract is much simplier than the compiled one and will work absolutely correctly in our infrastructure.
These are the two main points that you need to know in order to understand how our solution works.

# Solution
Our solution is based on a simulation and on the statistic analysis techniques. We execute a given smart contract and calculate parameters, such as memory and CPU usage. Obviously, the main contribution to the estimation of gas the usage is CPU.
So, there are 42 main LLVM IR instructions:

| command   | weight | command         | weight| command    | weight| command     | weight|
|:---------:|:------:|:---------------:|:-----:|:----------:|:-----:|:-----------:|:-----:|
|ret        |   37 |  frem  |        23|icmp       |   2  |fcmp        |  3
|br         |   31 |   and  |  1 |switch     |   31 |indirectbr |  31|
|fneg       |   4  |add        |   2|call       |   37 |select      |  39|
|fadd       |   4  |sub        |   2|fsub       |   4  |mul        |   4|
|fmul       |   8  |udiv       |   1|fpext      |   29 |ptrtoint    | 1|
|sdiv       |   1  |fdiv       |   23|urem       |   11 |srem       |   1|
|shl        |   1  |lshr        |  1|sext       |   1  |fptoui      |  29|
|ashr       |   1  |or          |  1|xor        |   1  |load        |  23|
|store      |   23 |getelementptr| 23|inttoptr   |   1  |bitcast     |  1
|trunc      |   39 |zext        |  1|sitofp     |   29 |
|fptosi     |   29 |uitofp      |  29|
|fptrunc     |  29|

All these instructions have different weights, because of different complexity and resource consumption.
The question how to calculate correct weights is very important because it immediately affect the correctness of a solution.
Here you can see the table with weights if you want to change some weights manually. See how to test our solution locally in [this](#Installation) part of a documentation.

But here we want to make a remark: we think that Fantom developers should recalculate this weights according to the Fantom's infrastructure, because distributed systems and virtual machines are very different from the local machine and processor.

# Solution
So, to begin with we have put all the weights equal to one and try to test our estimator on some very simple examples, such as <a href="/lliic/examples/fib.c"> Hello, World! </a> and <a href="/lliic/examples/fib.c"> Non-recursive Fibonacci numbers </a>
Of course it works, but it does not work adequately with equal weights.

So, we started to study each instruction and understand how complex is it and how costly will it execute them. Go through a lot of documentation and test a variaty of ratios, we finally have found a <a href="/lliic/table">*gold one*</a>.

When all the algorithms have beed debugged, we’ve implemented the second part of the task: the plugins.

We’ve chosen VS Code as the most famous IDE and this is how our plugin looks
<img src="/img/VSCodeView1.png">
<img src="/img/VSCodeView2.png">

 and the live demo is below (it may take a while to load this GIF):
<img src="/img/end3.gif?inline=false">


Moreover, we’ve studied the <a href="https://github.com/Fantom-foundation/serial_hacking_fantom_rbvm">November's winner solution</a>; during the first expert session with Fantom expert Samuel, we were allowed to use this open source solution and decided try to extend Fantom web smart contract IDE functionality. Why? Because you can not only develop code in your classical IDE, but also code in any time with any devices from all over the world. That is how the updated web IDE looks like.

<img src="/img/FantomIDE.png">
You can always check how does it work by yourself on our web-site: <a href="http://fantom-ide.axe.ru/gas-usage#helloworld.ll"> http://fantom-ide.axe.ru/gas-usage#helloworld.ll </a>.


It is very usable because all the main information is in one place: stdout, stderr, gas and memory usage. I think our project will help Fantom rise and attract more developers in their fast DAG ecosystem.

# Installation
### Start smart contract IDE Using Docker
Start docker.
Run this commands in Console/Terminal

```
git clone https://gitlab.com/farwydi/lliic

cd lliic
```

Now you need to start Docker and do this:
```
docker build -t fantom-ide .

docker run -p 80:8080 -d fantom-ide
```
After that, open `http://localhost:80` in your browser and you can see Smart Contract IDE


### Start VS Code extension using Docker

Build docker images:

`docker build . -t lliic`

Run docker:

`docker run -d --rm -p 9001:8080 lliic`

Change setting in vscode:
<img src="/img/VSCodeSettings.png">
Enjoy!

# Team

Leonid Zharikov, @farwydi

mentor: Glushenkov Ivan, @bibloman
