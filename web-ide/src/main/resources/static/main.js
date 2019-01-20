const CLIENT_COMPATIBILITY = "0.2.2"

const LAST_COMPATIBILITY = localStorage.getItem("client_compatibility")
if (CLIENT_COMPATIBILITY != LAST_COMPATIBILITY) {
    localStorage.clear();
    localStorage.setItem("client_compatibility", CLIENT_COMPATIBILITY)
}


var editor = ace.edit("editor");
editor.setTheme("ace/theme/eclipse");
editor.session.setMode("ace/mode/c_cpp");


highlight_formats = {
    'cpp': "ace/mode/c_cpp",
    'c': "ace/mode/c_cpp",
    'll': "ace/mode/plain_text"
};

selectedFile = null;

let InterfaceConsole = (function () {
    let _console = $('#console');
    let _data = [];
    let _lastFile = null;

    function _textify(text, jqElement) {
        jqElement.text(text);
        let html = jqElement.html();
        jqElement.html(html.replace(/\r?\n/g, '<br/>'));
        return jqElement;
    }

    function _displayOutput() {
        let data = _data;
        _console.children().remove();

        if (data.length === 0) {
            _console.addClass('unfilled');
        } else {
            _console.removeClass('unfilled');
            data.forEach(function (execData) {
                let title = execData.title;
                let stdout = execData.stdout;
                let stderr = execData.stderr;

                if (title && (stdout || stderr)) {
                    _console.append($('<h4 />').html(title));
                }
                if (stdout) {
                    _console.append(_textify(stdout, $('<div class="console-stdout" />')));
                }
                if (stderr) {
                    _console.append(_textify(stderr, $('<div class="console-stderr" />')));
                }
            });
        }
    }

    let exportInterface = {
        appendData: function (data) {
            if (!data)
                return;
            if (!data.forEach)
                data = [data];

            if (_lastFile != selectedFile) {
                _lastFile = selectedFile;
                _data = [];
            }

            for (let i = 0; i < data.length; i++)
                _data.push(data[i]);

            _displayOutput();

            return this;
        },
        setData: function (data) {
            return this.clear().appendData(data);
        },
        clear: function () {
            _lastFile = null;
            _data = [];
            _displayOutput();
            return this;
        }
    };

    exportInterface.clear();
    return exportInterface;
})();

class File {
    constructor(name) {
        this._data = {
            'name': name
        };
        this.load();
    }

    static getFileNames() {
        var preFiles = localStorage.getItem("filestorage");
        if (preFiles)
            return JSON.parse(preFiles);
        return [];
    }

    static getFiles() {
        return File.getFileNames().map(function (name) {
            return new File(name);
        });
    }

    // next using this object will throw NPE
    delete() {
        localStorage.removeItem("filestorage:" + this._data.name);
        var files = File.getFileNames();
        var index = files.indexOf(this.name);
        if (index >= 0)
            files.splice(index, 1);
        localStorage.setItem("filestorage", JSON.stringify(files));
        this._data = null;
    }

    save() {
        localStorage.setItem("filestorage:" + this._data.name, JSON.stringify(this._data));
        var files = File.getFileNames();
        if (files.indexOf(this.name) < 0)
            files.push(this.name);
        localStorage.setItem("filestorage", JSON.stringify(files));
    }

    load() {
        var preData = localStorage.getItem("filestorage:" + this._data.name);

        if (preData) {
            this._data = JSON.parse(preData);
        } else {
            this._data = {
                'name': this._data.name,
                'code': "",
                'compiled': null
            };
            this.save()
        }
    }

    get name() {
        return this._data.name;
    }

    get code() {
        this.load();
        return this._data.code;
    }

    set code(value) {
        this._data.code = value;
        this.save();
    }

    get maintainId() {
        this.load();
        return this._data.maintainId;
    }

    set maintainId(value) {
        this._data.maintainId = value;
        this.save();
    }

    get isSmartContract() {
        return $.trim(this.code).startsWith("//!SMART CONTRACT");
    }

    get compiled() {
        this.load();
        return this._data.compiled;
    }

    set compiled(value) {
        this._data.compiled = value;
        this.save();
    }

    get format() {
        let index = this.name.lastIndexOf('.');
        if (index < 0)
            return null;
        return this.name.substring(index + 1).toLowerCase();
    }
}


start_files_data = {
    "helloworld.ll": {
        "code": "; ModuleID = '/home/v/repo/be/examples/helloworld.c'\nsource_filename = \"/home/v/repo/be/examples/helloworld.c\"\ntarget datalayout = \"e-m:e-i64:64-f80:128-n8:16:32:64-S128\"\ntarget triple = \"x86_64-pc-linux-gnu\"\n\n@.str = private unnamed_addr constant [14 x i8] c\"Hello, world!\\00\", align 1\n\n; Function Attrs: noinline nounwind optnone uwtable\ndefine dso_local i32 @main() #0 {\n  %1 = call i32 @puts(i8* getelementptr inbounds ([14 x i8], [14 x i8]* @.str, i32 0, i32 0))\n  ret i32 0\n}\n\ndeclare dso_local i32 @puts(i8*) #1\n\nattributes #0 = { noinline nounwind optnone uwtable \"correctly-rounded-divide-sqrt-fp-math\"=\"false\" \"disable-tail-calls\"=\"false\" \"less-precise-fpmad\"=\"false\" \"no-frame-pointer-elim\"=\"true\" \"no-frame-pointer-elim-non-leaf\" \"no-infs-fp-math\"=\"false\" \"no-jump-tables\"=\"false\" \"no-nans-fp-math\"=\"false\" \"no-signed-zeros-fp-math\"=\"false\" \"no-trapping-math\"=\"false\" \"stack-protector-buffer-size\"=\"8\" \"target-cpu\"=\"x86-64\" \"target-features\"=\"+fxsr,+mmx,+sse,+sse2,+x87\" \"unsafe-fp-math\"=\"false\" \"use-soft-float\"=\"false\" }\nattributes #1 = { \"correctly-rounded-divide-sqrt-fp-math\"=\"false\" \"disable-tail-calls\"=\"false\" \"less-precise-fpmad\"=\"false\" \"no-frame-pointer-elim\"=\"true\" \"no-frame-pointer-elim-non-leaf\" \"no-infs-fp-math\"=\"false\" \"no-nans-fp-math\"=\"false\" \"no-signed-zeros-fp-math\"=\"false\" \"no-trapping-math\"=\"false\" \"stack-protector-buffer-size\"=\"8\" \"target-cpu\"=\"x86-64\" \"target-features\"=\"+fxsr,+mmx,+sse,+sse2,+x87\" \"unsafe-fp-math\"=\"false\" \"use-soft-float\"=\"false\" }\n\n!llvm.module.flags = !{!0}\n!llvm.ident = !{!1}\n\n!0 = !{i32 1, !\"wchar_size\", i32 4}\n!1 = !{!\"clang version 7.0.0-6 (tags/RELEASE_700/final)\"}\n"
    },
    "fib.c": {
        "code": "#include <stdio.h>\n\nstatic\nint\nfib(int n)\n{\n    return n < 2 ? 1 : fib(n - 1) + fib(n - 2);\n}\n\nint\nmain()\n{\n    printf(\"%d\\n\", fib(10));\n}\n"
    },
    "malloc.c": {
        "code": "#include <stdio.h>\n#include <string.h>\n#include <stdlib.h>\n\nvoid\ngreet()\n{\n    char *p = malloc(1024);\n    if (!p) {\n        puts(\"Fail!\");\n    } else {\n        strcpy(p, \"Hello\");\n        puts(p);\n    }\n    free(p);\n}\n\nint\nmain()\n{\n    for (int i = 0; i < 5; ++i) {\n        greet();\n    }\n}\n"
    },
    "parallel_fib.c": {
        "code": "#include <stddef.h>\n#include <stdio.h>\n#include <error.h>\n#include <pthread.h>\n\nstatic\nint\nfib(int n)\n{\n    return n < 2 ? 1 : fib(n - 1) + fib(n - 2);\n}\n\nstatic\nvoid *\nworker(void *arg)\n{\n    (void) arg;\n    printf(\"%d\\n\", fib(10));\n    return NULL;\n}\n\nint\nmain()\n{\n    int r;\n#define CHECK(Expr_) if ((r = (Expr_))) error(1, r, \"%s\", #Expr_)\n    enum { NWORKERS = 4 };\n    pthread_t t[NWORKERS];\n    for (int i = 0; i < NWORKERS; ++i) {\n        CHECK(pthread_create(&t[i], NULL, worker, NULL));\n    }\n    for (int i = 0; i < NWORKERS; ++i) {\n        CHECK(pthread_join(t[i], NULL));\n    }\n}\n"
    }
};

if (File.getFileNames().length == 0) {
    for (filename in start_files_data) {
        if (!start_files_data.hasOwnProperty(filename)) {
            continue;
        }

        var file = new File(filename);
        file.code = start_files_data[filename].code;
    }
}

File.getFiles().forEach(function (f) {
    f.maintainId = null;
});


function updateFilesList() {
    ul = $('#files ul');
    ul.children().remove();

    File.getFiles().forEach(function (file) {
        let filename = file.name;

        listElement = $('<li>' + filename + '</li>');
        if (selectedFile == filename)
            listElement.addClass('current');
        ul.append(listElement);

        listElement.on('click', function () {
            let doClearSelection = (filename != selectedFile);
            fileSelected(filename);
            if (doClearSelection)
                editor.session.getSelection().clearSelection();
        });
    });
}

function displayCompiled(text, isSmartContract) {
    let area = $('.compiled-area');
    if (text == null) {
        area.html("");
        area.addClass('unfilled');

        $('.deploy-button, .test-button').fadeOut();
    } else {
        area.html(text.replace(/\r?\n/g, '<br/>'));
        area.removeClass('unfilled');

        $('.deploy-button, .test-button').fadeIn();
    }
}

function fileSelected(name) {
    selectedFile = name;
    if (location.hash != "#" + name) {
        location.hash = "#" + name;
    }
    updateFilesList();

    var file = new File(name);
    var format = file.format;

    editor.session.setMode(highlight_formats[format]);
    console.log(format);

    var cacheCompiled = file.compiled;
    editor.setValue(file.code);
    file.compiled = cacheCompiled;
    displayCompiled(file.compiled && file.compiled.disassembler && file.compiled.disassembler.stdout);

    let toolbox = $('.contract-toolbox');
    if (file.isSmartContract && file.maintainId) {
        toolbox.fadeIn();
    } else {
        toolbox.fadeOut();
    }
}

function displayCompilationWaste(compilationResponse) {
    let data = []
    if (compilationResponse) {
        if (compilationResponse.llvmExecution)
            data.push({
                title: "LLVM:",
                stdout: compilationResponse.llvmExecution.stdout,
                stderr: compilationResponse.llvmExecution.stderr
            });
        if (compilationResponse.translatorExecution)
            data.push({
                title: "LLVM -> RBVM Translator:",
                // stdout : compilationResponse.translatorExecution.stdout,
                stderr: compilationResponse.translatorExecution.stderr
            });
    }
    InterfaceConsole.setData(data);
}

function compileCurrentFile() {
    InterfaceConsole.clear();
    displayCompiled(null);
    var file = new File(selectedFile);
    file.maintainId = null;
    fileSelected(selectedFile);
    $.ajax("/api/compile", {
        data: {
            'code': file.code,
            'format': file.format,
            'smart': file.isSmartContract ? "smart_contract" : null
        },
        method: "POST"
    }).done(function (result) {
        if (result && result.bytecode) {
            console.log(result);
            file.compiled = {
                bytecode: result.bytecode,
                disassembler: result.disassemblerExecution
            };
            displayCompiled(file.compiled.disassembler && file.compiled.disassembler.stdout);
        }
        displayCompilationWaste(result);
    });
}

function runBytecodeInOneShotMode(bytecode) {
    $.ajax("/api/run", {
        data: {
            'bytecode': bytecode
        },
        method: "POST"
    }).done(function (result) {
        if (result) {
            console.log(result);
            InterfaceConsole.setData(result);
        }
    });
}

function runBytecodeInMaintainMode(bytecode, file) {
    $.ajax("/api/run-maintain", {
        data: {
            'bytecode': bytecode
        },
        method: "POST"
    }).done(function (result) {
        console.log(result);
        file.maintainId = result.maintainId;
        fileSelected(selectedFile);
        InterfaceConsole.setData(result.executionResponse);
    });
}

function runBytecode(file) {
    let bytecode = file && file.compiled && file.compiled.bytecode;
    if (!bytecode)
        return;

    InterfaceConsole.clear();

    if (file.isSmartContract) {
        runBytecodeInMaintainMode(bytecode, file);
    } else {
        runBytecodeInOneShotMode(bytecode, file);
    }
}


function callSmartMethod(action, attrs) {
    let callString = action + '\n' + attrs.join(' ');
    let file = new File(selectedFile);
    $.ajax("/api/communicate-maintain", {
        data: {
            'id': file.maintainId,
            'line': callString
        },
        method: "POST"
    }).done(function (result) {
        console.log(result);
        InterfaceConsole.appendData(result);
        if (result.stderr) {
            file.maintainId = null;
            fileSelected(file.name);
        }
    });
}

function calculateGasUsage(file) {
    InterfaceConsole.clear()
    $.ajax("/api/run-count-operations", {
        data: {
            'code': file.code,
            'format': file.format
        },
        method: "POST"
    }).done(function (result) {
        if (result) {
            console.log(result);
            InterfaceConsole.setData(result);
        }
    });
}

function tryCreateFile(name) {
    var alreadyExists = File.getFileNames().indexOf(name) >= 0;
    if (alreadyExists) {
        swal({
            title: "File " + name + " already exists",
            icon: 'warning'
        });
    } else {
        let file = new File(name);
        if (!file.format || !highlight_formats.hasOwnProperty(file.format)) {
            file.delete();
            swal({
                title: 'Wrong file extension',
                text: 'Only .c, .cpp and .ll formats are supported.',
                icon: 'warning'
            });
        } else {
            fileSelected(name); // this function calls updateFileList()
        }
    }
}


function selectFileAccordingToLocationHash() {
    let hash = location.hash;
    hash = hash && hash.substr(1);

    let list = File.getFileNames();
    console.log(list + " " + hash);
    if (list.indexOf(hash) >= 0) {
        if (selectedFile != hash)
            fileSelected(hash);
    } else {
        location.hash = "#" + selectedFile;
    }
}


editor.session.on('change', function () {
    if (selectedFile != null) {
        var file = new File(selectedFile);
        file.code = editor.getValue();
        file.compiled = null;
        displayCompiled(null);
    }
});

$(window).on('hashchange', function () {
    console.log("Changed");
    selectFileAccordingToLocationHash();
});

$('.create-button').on('click', function () {
    swal({
        content: {
            element: 'input',
            attributes: {
                placeholder: 'Type file name here'
            }
        },
        title: 'Create new file',
        text: 'Use .c, .cpp or .ll extension.',
        buttons: {
            cancel: true,
            confirm: true
        }
    }).then(function (value) {
        if (value)
            tryCreateFile(value);
    });
});

selectFileAccordingToLocationHash();
if (!selectedFile) {
    fileSelected(File.getFileNames()[0]);
}

// TODO think about reactive architecture
