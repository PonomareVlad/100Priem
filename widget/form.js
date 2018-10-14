;(function () {
    'use strict';
    var conf = {
        'apiUrl': 'api.php', // Адрес API
        'resourcePath': 'http://lapastudio.xyz/widget/', // Каталог в котором размещены CSS и SVG файлы
        'minLetters': 0, // Минимальное количество слов, разрешенное к отправке
        'fetchForm': 'feedback-form'
    };
    var data = {
        'domain': location.hostname
    };

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

    function validateEmail(email) {
        var re = /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
        //var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(email);
    }

    function cleanForm() {
        if (!conf.activeForm)return;
        conf.activeForm.message.value = '';
        conf.activeForm.name.value = '';
        conf.activeForm.city.value = '';
        conf.activeForm.phone.value = '';
        conf.activeForm.email.value = '';
        delete conf.activeForm;
    }

    function sendData() {
        log('Sending form data...');
        var prepairedData='source=form';
        for (var i in data) {
            prepairedData += '&' + i + '=' + encodeURIComponent(data[i]);
        }
        var xhr = new XMLHttpRequest();
        xhr.open('POST', conf.apiUrl, true);
        xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
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
                if(!response.status)return alert('Сервер отклонил запрос, попробуйте отправить форму позднее');
                cleanForm();
                alert('Спасибо! Скоро с Вами свяжется наш менеджер и поможет с Вашим вопросом');
            } catch (e) {
                log('Parse failed', e);
                throw e;
            }
        };
    }

    function error(message, consoleMsg) {
        //if (document.getElementById(conf.widgetId)) document.body.removeChild(document.getElementById(conf.widgetId));
        if (window['designerError'] && message) {
            window['designerError'](message);
        }
        if (consoleMsg) log(consoleMsg);
    }

    function sendInPageForm(id) {
        var formData = {
            'message': feedbackForms[id].message.value,
            'name': feedbackForms[id].name.value,
            'city': feedbackForms[id].city.value,
            'phone': feedbackForms[id].phone.value,
            'email': feedbackForms[id].email.value
        };
        for (var i in formData) {
            if (formData[i].length < 1)return alert('Необходимо заполнить все поля');
        }
        if (!validateEmail(formData.email))return alert('Некорректный e-mail адрес');
        if (conf.partnerID) data['partner'] = conf.partnerID;
        Object.assign(data, formData);
        conf.activeForm = feedbackForms[id];
        sendData(true);
    }

    function init(rebuild) {
        if (window.formConf && !rebuild) Object.assign(conf, window.formConf);
        if (conf.debug) {
            window.form = {
                'init': init,
                'conf': conf
            };
        }
        if (!conf.partnerID || conf.partnerID === '') return error('Не указан ID партнера!', 'Partner ID is not defined!');
        if (rebuild) delete window.feedbackForms;
        if (conf.fetchForm) {
            log('Fetching forms..');
            var formNode = document.getElementsByClassName(conf.fetchForm);
            for (var i in formNode) {
                if (formNode.hasOwnProperty(i)) {
                    debug('Fetching form', formNode[i]);
                    var form = {'node': formNode[i]};
                    var buttons = formNode[i].getElementsByTagName('button');
                    if (buttons.length > 0) {
                        buttons[buttons.length - 1].onclick = sendInPageForm;
                        form.send = buttons[buttons.length - 1];
                        debug('Send button found', form.send);
                    } else {
                        log('No Send buttons in this Form, skipping...');
                        delete this.form;
                        continue;
                    }
                    var inputs = formNode[i].getElementsByTagName('input');
                    for (var j in inputs) {
                        if (inputs[j].type === 'text' || inputs[j].type === 'email' || inputs[j].type === 'tel') {
                            if (inputs[j].name === 'message' || inputs[j].id === 'message') {
                                inputs[j].id = 'form-message';
                                form.message = inputs[j];
                                debug('Message block found', form.message);
                                continue;
                            }
                            if (inputs[j].name === 'name' || inputs[j].id === 'name') {
                                inputs[j].id = 'form-name';
                                form.name = inputs[j];
                                debug('Name block found', form.name);
                                continue;
                            }
                            if (inputs[j].name === 'email' || inputs[j].id === 'email') {
                                inputs[j].id = 'form-email';
                                form.email = inputs[j];
                                debug('Email block found', form.email);
                                continue;
                            }
                            if (inputs[j].name === 'city' || inputs[j].id === 'city') {
                                inputs[j].id = 'form-city';
                                form.city = inputs[j];
                                debug('City block found', form.city);
                                continue;
                            }
                            if (inputs[j].name === 'phone' || inputs[j].id === 'phone') {
                                inputs[j].id = 'form-phone';
                                form.phone = inputs[j];
                                debug('Phone block found', form.phone);
                                continue;
                            }
                        }
                    }
                    var textareas = formNode[i].getElementsByTagName('textarea');
                    for (var j in textareas) {
                        if (textareas[j].name === 'message' || textareas[j].id === 'message') {
                            textareas[j].id = 'form-message';
                            form.message = textareas[j];
                            debug('Message block found', form.message);
                        }
                    }
                    if (!form.name || !form.message || !form.email || !form.phone || !form.city) {
                        log('Some Required blocks not exist in this Form, skipping...');
                        delete this.form;
                        continue;
                    }
                    if (!window.feedbackForms) window.feedbackForms = [];
                    form.id = window.feedbackForms.length;
                    form.name.id += form.id;
                    form.message.id += form.id;
                    form.email.id += form.id;
                    form.phone.id += form.id;
                    form.city.id += form.id;
                    window.feedbackForms.push(form);
                    form.send.onclick = function () {
                        sendInPageForm(form.id);
                    };
                    debug('Fetching form complete', form);
                }
            }
            if (!window.feedbackForms)return log('Forms not found!');
            debug('Fetched forms:', feedbackForms.length, feedbackForms);
        }
    }

    if (window.formConf) Object.assign(conf, window.formConf);
    log('%cFeedBack Forms v.1.0', 'color:orange');
    window.addEventListener('load', init);
})();