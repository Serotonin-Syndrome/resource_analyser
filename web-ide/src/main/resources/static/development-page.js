$('.compile-button').on('click', function () {
    if (selectedFile) {
        compileCurrentFile();
    }
});

$('.test-button').on('click', function () {
    if (selectedFile) {
        let file = new File(selectedFile);
        runBytecode(file);
    }
});

$('.deploy-button').on('click', function () {
    swal("You're an early bird!", "Sorry, the Fantom Network is still in development.");
});


(function INIT_CONTRACT_TOOLBOX() {
    function getArgNames(element) {
        let attrs = element.dataset.args;
        if (!attrs)
            return 0;
        return attrs.split('|');
    }

    $('.contract-toolbox .method-button').on('click', function (ev) {
        if (!$(ev.target).hasClass('method-button'))
            return;

        let action = ev.target.dataset.action;
        let numArgs = getArgNames(ev.target).length;
        let attrs = new Array(numArgs);
        for (let i = 0; i < numArgs; i++) {
            attrs[i] = $(ev.target).find("input[data-index='" + i + "']").val();
            if (attrs[i] === "") {
                swal({
                    title: 'Fill all arguments',
                    icon: 'warning'
                });
                return;
            }
        }
        console.log(attrs);
        callSmartMethod(action, attrs);
    });

    $('.contract-toolbox .method-button').each(function () {
        let self = this;
        $(self).on('keypress', function (ev) {
            if (ev.which == 13) {
                $(self).click();
            }
        });
    });

    $('.contract-toolbox .method-button').each(function () {
        let argNames = getArgNames(this);
        for (let i = 0; i < argNames.length; i++) {
            $(this).children('span')
                .append($('<input type="text" data-index="' + i + '" placeholder="' + argNames[i] + '"/>'));
            if (i != argNames.length - 1) {
                $(this).children('span').append($('<span>, </span>'));
            }
        }
    });
})();

