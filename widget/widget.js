;(function () {
    'use strict';
    var conf = {
        'apiUrl': 'http://www.100priem.ru/swap/widget.php', // Адрес API
        'resourcePath': 'http://lapastudio.xyz/widget/', // Каталог в котором размещены CSS и SVG файлы
        'widgetId': 'widgetBlock', // DOM ID контейнера виджета
        'formId': 'formWrapper', // DOM ID контейнера всплывающей формы
        'cssFile': 'widget.css', // Путь к CSS относительно каталога с ресурсами (resourcePath)
        'minLetters': 0, // Минимальное количество слов, разрешенное к отправке
        'defaultUserIcon': 'user.svg', // Путь к Изображению менеджера по умолчанию относительно каталога с ресурсами (resourcePath)
        'formTitle': 'Мы гарантированно свяжемся с вами, подскажите как к вам обратиться?',
        'showWidget': true,
        'colours': {
            '--widget-primary-text': 'var(--widget-primary-text)',
            '--widget-secondary-text': 'var(--widget-secondary-text)',
            '--widget-primary-background': 'var(--widget-primary-background)',
            '--widget-secondary-background': 'var(--widget-secondary-background)',
            '--widget-client-message': 'var(--widget-client-message)',
            '--widget-client-text': 'var(--widget-client-text)',
            '--widget-manager-message': 'var(--widget-manager-message)',
            '--widget-manager-text': 'var(--widget-manager-text)',
            '--widget-form-text': 'var(--widget-form-text)',
            '--widget-form-background': 'var(--widget-form-background)'
        }
    };
    var data = {
        'domain': location.hostname
    };

    function injectCSS(url) {
        url = url || conf.resourcePath + conf.cssFile;
        if (document.getElementById('byFeedbackWidget'))return;
        var styleTag = document.createElement('link');
        styleTag.rel = 'stylesheet';
        styleTag.href = url;
        styleTag.id = 'byFeedbackWidget';
        document.head.appendChild(styleTag);
        debug('CSS Injected to HEAD', styleTag);
    }

    function log() {
        if (conf.debug) console.log.apply(console, arguments);
    }

    function debug() {
        if (conf.debug) console.debug.apply(console, arguments);
    }

    function status(response) {
        if (response.status >= 200 && response.status < 300) {
            return Promise.resolve(response)
        } else {
            return Promise.reject(new Error(response.statusText))
        }
    }

    function json(response) {
        return response.json()
    }

    function getRandomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    function validateEmail(email) {
        var re = /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
        //var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(email);
    }

    function sendData() {
        log('Sending form data...');
        var prepairedData='source=widget';
        for (var i in data) {
            prepairedData += '&' + i + '=' + encodeURIComponent(data[i]);
        }
        var xhr = new XMLHttpRequest();
        xhr.open('POST', conf.apiUrl, true);
        xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
        //xhr.setRequestHeader("Access-Control-Allow-Origin", "*");
        //xhr.setRequestHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
        xhr.send(prepairedData);
        xhr.onreadystatechange = function () {
            if (this.readyState !== 4) return;
            if (this.status !== 200) {
                log('Request failed', (this.status ? this.statusText : 'запрос не удался'));
                if (confirm('Не удалось отправить данные, возможно, проблема с подключением к сети. Повторить?')) sendData();
            }
            try {
                var response = JSON.parse(this.responseText);
                debug('Request successful, retrieved:', response);
                document.getElementById('messageDialog').innerHTML = '<div id="final-message">Спасибо! Скоро с Вами свяжется наш менеджер и поможет с Вашим вопросом</div>';
                setTimeout(function () {
                    closeWidget();
                }, 5000);
            } catch (e) {
                log('Parse failed', e);
            }
        };
    }

    function getManager() {
        if (!conf.managers[conf.managerId])return false;
        var manager = conf.managers[conf.managerId];
        if (!manager.name || manager.name == '') {
            manager.name = 'Консультант';
        }
        if (!manager.pic || manager.pic == '') {
            manager.pic = conf.resourcePath + conf.defaultUserIcon;
        }
        if (!manager.intro || manager.intro == '') {
            manager.intro = 'Готов ответить на ваши вопросы!';
        }
        if (!manager.messages || manager.messages.length == 0) {
            manager.messages = ['Доброго времени!', 'Я готов ответить на ваши вопросы прямо сейчас'];
        }
        return manager;
    }

    function sendForm(event) {
        var formData = {
            'name': document.getElementById('name').value,
            'city': document.getElementById('city').value,
            'phone': document.getElementById('phone').value,
            'email': document.getElementById('email').value
        };
        for (var i in formData) {
            if (formData[i].length < 1)return alert('Необходимо заполнить все поля');
        }
        if(!validateEmail(formData.email))return alert('Некорректный e-mail адрес');
        if (conf.partnerID) data['partner'] = conf.partnerID;
        Object.assign(data, formData);
        document.getElementById(conf.widgetId).formComplete = true;
        closePopupForm();
        sendData();
    }

    function showPopupForm() {
        log('Building form...');
        var formNode = document.createElement('div');
        formNode.id = conf.formId;
        document.body.appendChild(formNode);
        formNode.innerHTML = '<div id="formBlock" style="background-color: ' + conf.colours['--widget-form-background'] + '"><img id="closeForm" src="' + conf.resourcePath + 'close.svg"><h2 style="color: ' + conf.colours['--widget-form-text'] + '">' + conf.formTitle + '</h2><br><section><label for="name" style="color: ' + conf.colours['--widget-form-text'] + '">Ваше имя</label> <input type="text" id="name"><br><label for="city" style="color: ' + conf.colours['--widget-form-text'] + '">Город</label> <input type="text" id="city"><br><label for="phone" style="color: ' + conf.colours['--widget-form-text'] + '">Телефон</label> <input type="tel" id="phone"><br><label for="email" style="color: ' + conf.colours['--widget-form-text'] + '">E-mail</label> <input type="email" id="email"><br></section><br><button id="sendForm">Сохранить</button></div>';
        document.getElementById('name').focus();
        document.getElementById('email').addEventListener('keypress', function (event) {
            if (event.keyCode == 13) sendForm();
        });
        document.getElementById('sendForm').addEventListener('click', sendForm);
        document.getElementById('closeForm').addEventListener('click', closePopupForm);
        debug('Form ready', formNode);
    }

    function closePopupForm() {
        log('Destroying form...');
        document.getElementById(conf.formId).parentNode.removeChild(document.getElementById(conf.formId));
        log('Form destroyed');
        if (document.getElementById(conf.widgetId).formComplete != true) {
            putManagerMessage('Пожалуйста укажите ваши данные, чтобы мы могли вас проконсультировать', 1000);
        }
    }

    function messageEnter(event) {
        if (!event || event.keyCode === 13) {
            var messageNode = event ? event.target : document.getElementById('widgetMessage');
            if (messageNode.value.length === 0 || messageNode.value.split(' ').length < conf.minLetters)return false;
            data['message'] = messageNode.value;
            messageNode.value = '';
            document.getElementById('messageDialog').innerHTML += '<div class="dialogMessageContainer"><div class="dialogClientMessage" style="color:' + conf.colours['--widget-client-text'] + ';background-color: ' + conf.colours['--widget-client-message'] + '">' + data['message'] + '</div></div>';
            if (data['message'] === 'author') {
                return putManagerMessage(decodeURI('%3Ca%20href=%22http://%D0%9F%D0%BE%D0%BD%D0%BE%D0%BC%D0%B0%D1%80%D1%91%D0%B2.%D1%80%D1%83%D1%81%22%3E%D0%9F%D0%BE%D0%BD%D0%BE%D0%BC%D0%B0%D1%80%D0%B5%D0%B2%20%D0%92%D0%BB%D0%B0%D0%B4%D0%B8%D1%81%D0%BB%D0%B0%D0%B2%3C/a%3E'));
            }
            document.getElementById('messageDialog').scrollTop = document.getElementById('messageDialog').scrollTopMax;
            if (!document.getElementById(conf.widgetId)['formComplete'])return showPopupForm();
            sendData();
        }
    }

    window.messageEnter = messageEnter;

    function closeWidget() {
        var widgetNode = document.getElementById(conf.widgetId);
        widgetNode.className = '';
        widgetNode.state = 'closed';
        setTimeout(function () {
            var widgetNode = document.getElementById(conf.widgetId);
            widgetNode.innerHTML = '<img src="' + getManager().pic + '" id="managerPic"><span id="managerName" style="color:' + conf.colours['--widget-primary-text'] + ';">' + getManager().name + ': </span><span id="managerMessage" style="color:' + conf.colours['--widget-primary-text'] + ';">' + getManager().intro + '</span>';
            log('Widget deactivated');
        },300);
    }

    function putManagerMessage(message, delay) {
        var widgetNode = document.getElementById(conf.widgetId);
        if (delay) {
            typingIndicator('show');
            setTimeout(function () {
                log('Manager message send:', message, delay);
                typingIndicator('hide');
                document.getElementById('messageDialog').innerHTML += '<div class="dialogMessageContainer"><div class="dialogManagerMessage" style="color:' + conf.colours['--widget-manager-text'] + ';background-color: ' + conf.colours['--widget-manager-message'] + '">' + message + '</div></div>';
                document.getElementById('messageDialog').scrollTop = document.getElementById('messageDialog').scrollTopMax;
                widgetNode.intro++;
            }, delay);
        } else {
            log('Manager message send:', message);
            document.getElementById('messageDialog').innerHTML += '<div class="dialogMessageContainer"><div class="dialogManagerMessage" style="color:' + conf.colours['--widget-manager-text'] + ';background-color: ' + conf.colours['--widget-manager-message'] + '">' + message + '</div></div>';
            document.getElementById('messageDialog').scrollTop = document.getElementById('messageDialog').scrollTopMax;
        }
    }

    function typingIndicator(state) {
        if(state=='show'){
            window.widgetIndi=window.widgetIndi?window.widgetIndi+1:1;
            document.getElementById('typing-indicator').className='show';
        }
        if(state=='hide'){
            if(window.widgetIndi){
                window.widgetIndi--;
                if(window.widgetIndi!=0)return;
            }
            document.getElementById('typing-indicator').className='';
        }
    }

    function widgetClick(event) {
        if (event.target.id == 'closeWidget')return false;
        var widgetNode = document.getElementById(conf.widgetId);
        if (widgetNode.state == 'opened')return false;
        widgetNode.state = 'opened';
        log('Widget activated');
        //widgetNode.style.cursor = 'default';
        //widgetNode.style.height = '500px';
        widgetNode.className = 'opened-widget';
        widgetNode.innerHTML = '<div id="widgetDialogHeader"><img src="' + getManager().pic + '" id="managerLargePic"><img id="closeWidget" src="' + conf.resourcePath + 'minimize.svg"><span id="managerNameTitle" style="color:' + conf.colours['--widget-secondary-text'] + ';">' + getManager().name + '</span><span id="managerTitle" style="color:' + conf.colours['--widget-secondary-text'] + ';">Консультант</span><span id="online-status">Online</span></div><div id="messageDialog"></div><div id="typing-indicator" class=""><div class="loader"></div></div><div id="widgetDialogBottom" style="background-color: ' + conf.colours['--widget-secondary-background'] + '"><input type="text" id="widgetMessage" placeholder="Введите ваше сообщение"><div id="enter-icon" onclick="messageEnter();"><img src="' + conf.resourcePath + 'enter.png"></div></div>';
        var inputMessage = document.getElementById('widgetMessage');
        document.getElementById('closeWidget').addEventListener('click', closeWidget);
        inputMessage.addEventListener('keypress', messageEnter);
        inputMessage.addEventListener('click', function (e) {
            document.getElementById('messageDialog').scrollTop = document.getElementById('messageDialog').scrollTopMax;
        });
        inputMessage.focus();
        for (var i in getManager().messages) {
            if (widgetNode.intro > i) {
                putManagerMessage(getManager().messages[i]);
            } else {
                var delay = 1000 * i + 1000;
                putManagerMessage(getManager().messages[i], delay);
            }

        }
    }

    function build(rebuild) {
        log('Building node...');
        var id = conf.widgetId;
        if (document.getElementById(id)) {
            if (rebuild) {
                document.body.removeChild(document.getElementById(id));
            } else {
                return document.getElementById(id);
            }
        }
        var widgetNode = document.createElement('div');
        widgetNode.id = id;
        widgetNode.state = 'closed';
        widgetNode.intro = 0;
        widgetNode.style['backgroundColor'] = conf.colours['--widget-primary-background'];
        widgetNode.innerHTML = '<img src="' + getManager().pic + '" id="managerPic"><span id="managerName" style="color:' + conf.colours['--widget-primary-text'] + ';">' + getManager().name + ': </span><span id="managerMessage"  style="color:' + conf.colours['--widget-primary-text'] + ';">' + getManager().intro + '</span>';
        widgetNode.addEventListener('click', widgetClick);
        document.body.appendChild(widgetNode);
        debug('Building complete:', widgetNode);
        return widgetNode;
    }

    function error(message, consoleMsg) {
        if (document.getElementById(conf.widgetId)) document.body.removeChild(document.getElementById(conf.widgetId));
        if (window['designerError'] && message) {
            window['designerError'](message);
        }
        if (consoleMsg) log(consoleMsg);
    }

    function init(rebuild) {
        if (window.widgetConf && !rebuild) Object.assign(conf, window.widgetConf);
        if (conf.showWidget) {
            conf.managerId = getRandomInt(0, conf.managers.length - 1);
            debug('Selected manager:', getManager());
            if (conf.debug) {
                window.widget = {
                    'init': init,
                    'conf': conf
                };
            }
            if (!conf.partnerID || conf.partnerID == '') return error('Не указан ID партнера!', 'Partner ID is not defined!');
            if (!conf.managers || conf.managers.length == 0) return error('Не указано ни одного менеджера!', 'Managers is not defined!');
            if (!conf.formTitle || conf.formTitle == '') return error('Не указан заголовок формы!', 'Form title is not defined!');
            build(rebuild);
        }
    }

    if (window.widgetConf) {if (!window.widgetConf.colours)window.widgetConf.colours={};Object.assign(conf.colours,window.widgetConf.colours);delete window.widgetConf.colours;Object.assign(conf, window.widgetConf);}
    log('%cWidget v.1.4', 'color:orange');
    injectCSS();
    window.addEventListener('load', init);
})();