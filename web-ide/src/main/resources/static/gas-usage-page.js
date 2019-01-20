InterfaceConsole = (function () {
    let _stderrEl = $('.tools-stderr');
    let _stdoutEl = $('.tools-stdout');
    let _gasEl = $('.tools-gas');
    let _memEl = $('.tools-memory');
    let _containerEl = $('.tools-console');
    let _allEls = _containerEl.children('div');
    let _gasRe = /GAS CONSUMED:\s+(\d+)/m
    let _memRe = /MEMORY\s+CONSUMED\s+\(TOTAL\/PEAK\):\s+(\d+\/\d+)/m

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
        _allEls.children().remove();
        _allEls.addClass('unfilled');

        if (data.length !== 0) {
            _allEls.removeClass('unfilled');
            data.forEach(function (execData) {
                let title = execData.title;
                let stdout = execData.stdout;
                let stderr = execData.stderr;

                // if (title && (stdout || stderr)) {
                //     _console.append($('<h4 />').html(title));
                // }
                if (stdout) {
                    _stdoutEl.removeClass('unfilled');
                    _stdoutEl.append(_textify(stdout, $('<div class="console-stdout" />')));
                }
                if (stderr) {
                    _stderrEl.removeClass('unfilled');
                    _stderrEl.append(_textify(stderr, $('<div class="console-stderr" />')));

                    let gas = stderr.match(_gasRe);
                    let mem = stderr.match(_memRe);
                    gas = gas && gas[1]
                    mem = mem && mem[1]
                    console.log(gas + ' : ' + mem);
                    _gasEl.append(_textify(gas, $('<span />')));
                    _memEl.append(_textify(mem, $('<span />')));
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

InterfaceConsole.clear()

$('.calculate-gas-button').on('click', function () {
    if (selectedFile) {
        let file = new File(selectedFile);
        calculateGasUsage(file)
    }
});