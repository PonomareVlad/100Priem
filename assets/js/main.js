"use strict";

if(!window.version)window.version=[];
window.version.push('main',18);

function validateEmail(email) {
    var re = /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
    //var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
}
function closeReg() {
    document.body.removeChild(regWrapper);
}
function showReg() {
    showNavBar('hide');
    window.regWrapper = document.createElement('div');
    regWrapper.style.position = 'fixed';
    regWrapper.style.width = '100%';
    regWrapper.style.height = '100%';
    regWrapper.style.left = '0';
    regWrapper.style.top = '0';
    regWrapper.style.backgroundColor = 'rgba(55,55,55,0.8)';
    regWrapper.style.zIndex = '1000';
    document.body.appendChild(regWrapper);
    window.regForm = document.createElement('div');
    regForm.id = 'reg-form';
    regForm.style.position = 'fixed';
    regForm.style.width = '400px';
    regForm.style.height = '400px';
    regForm.style.left = 'calc(50% - 200px)';
    regForm.style.top = 'calc(50% - 200px)';
    regForm.style.backgroundColor = '#FFF';
    regForm.innerHTML = '<input type="email" id="email" placeholder="Ваш e-mail"><br><input type="text" id="login" placeholder="Ваше имя"><br><input type="password" id="password" placeholder="Пароль"><br><input type="tel" id="phone" placeholder="Тлф"><br><button class="reg-button2 auth-button" onclick="sendReg();">Зарегистрироваться</button>';
    regWrapper.appendChild(regForm);
    window.closeBtn = document.createElement('div');
    closeBtn.id = 'close-button';
    closeBtn.style.position = 'absolute';
    closeBtn.style.width = '40px';
    closeBtn.style.height = '40px';
    closeBtn.style.top = '-20px';
    closeBtn.style.right = '-20px';
    closeBtn.style.borderRadius = '50%';
    closeBtn.style.cursor = 'pointer';
    closeBtn.onclick = closeReg;
    regForm.appendChild(closeBtn);
    document.getElementById('email').focus();
}
function showAuth() {
    showNavBar('hide');
    window.regWrapper = document.createElement('div');
    regWrapper.style.position = 'fixed';
    regWrapper.style.width = '100%';
    regWrapper.style.height = '100%';
    regWrapper.style.left = '0';
    regWrapper.style.top = '0';
    regWrapper.style.backgroundColor = 'rgba(55,55,55,0.8)';
    regWrapper.style.zIndex = '1000';
    document.body.appendChild(regWrapper);
    window.regForm = document.createElement('div');
    regForm.id = 'reg-form';
    regForm.style.position = 'fixed';
    regForm.style.width = '400px';
    regForm.style.height = '300px';
    regForm.style.left = 'calc(50% - 200px)';
    regForm.style.top = 'calc(50% - 200px)';
    regForm.style.backgroundColor = '#FFF';
    regForm.innerHTML = '<input type="text" id="login" placeholder="Логин (e-mail)"><br><input type="password" id="password" placeholder="Пароль"><br><button class="reg-button2 auth-button" onclick="sendLogin();">Авторизоваться</button>';
    regWrapper.appendChild(regForm);
    window.closeBtn = document.createElement('div');
    closeBtn.id = 'close-button';
    closeBtn.style.position = 'absolute';
    closeBtn.style.width = '40px';
    closeBtn.style.height = '40px';
    closeBtn.style.top = '-20px';
    closeBtn.style.right = '-20px';
    closeBtn.style.borderRadius = '50%';
    closeBtn.style.cursor = 'pointer';
    closeBtn.onclick = closeReg;
    regForm.appendChild(closeBtn);
    document.getElementById('password').addEventListener('keypress', enterPress);
    document.getElementById('login').focus();
}
function enterPress(event) {
    if (event.keyCode === 13) {
        sendLogin();
    }
}
function showNavBar(action) {
    var display = document.body.clientWidth > 924 ? 'flex' : 'block';
    if (action) {
        document.getElementById('nav-bar').style.display = action == 'hide' ? (display == 'flex' ? display : 'none') : display;
        //console.log(action,document.getElementById('nav-bar').style.display)
    } else {
        document.getElementById('nav-bar').style.display = ((document.getElementById('nav-bar').style.display == 'none') || (document.getElementById('nav-bar').style.display == '')) ? display : 'none';
    }
    if (document.getElementById('nav-bar').style.display == 'block') document.getElementById('shadow').style.top = '320px'; else document.getElementById('shadow').style.top = document.body.clientWidth > 924 ? '5%' : '0';
}
function resize() {
    if (document.body.clientWidth > 924) document.getElementById('nav-bar').style.display = 'flex'; else document.getElementById('nav-bar').style.display = 'none';
    if (document.getElementById('nav-bar').style.display == 'block') document.getElementById('shadow').style.top = '320px'; else document.getElementById('shadow').style.top = document.body.clientWidth > 924 ? '5%' : '0';
    if (document.body.clientWidth > 924 && document.getElementsByClassName('highlight-menu-button') && window.defaultPage) {
        hideMenu();
    }
}
function menuIsActive() {
    if (!document.getElementById('linksMenu'))return false;
    return document.getElementById('linksMenu').style.display != 'none';
}
function logout() {
    var data = 'method=logout';
    var xhr = new XMLHttpRequest();
    xhr.open('POST', window.apiUrl.logout||window.apiUrl.default, true);
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    xhr.send(data);
    xhr.onreadystatechange = function () {
        if (this.readyState != 4) return;
        if (this.status != 200) {
            // обработать ошибку
            showMessage('ошибка: ' + (this.status ? this.statusText : 'запрос не удался'), 'red');
        }
        try {
            var response = JSON.parse(this.responseText);
        } catch (e) {
            var response = false;
        }
        sessionStorage.removeItem('login');
        locateTo('index.html');
    }
}
function checkAuth() {
    var authFlip = document.getElementById('auth-flip');
    if (sessionStorage.getItem('login')) {
        document.getElementById('reg-flip').style.display = 'none';
        if (window.defaultPage) {
            authFlip.onclick = logout;
            authFlip.innerHTML = '<img src="'+window.resourcesPatch+'images/enter.png">Выход';
        } else {
            authFlip.onclick = function () {
                if(JSON.parse(sessionStorage.getItem('login')).type&&window.personalUrl[JSON.parse(sessionStorage.getItem('login')).type]){
                    location.href=window.personalUrl[JSON.parse(sessionStorage.getItem('login')).type];
                }else{
                    showMessage('Не найдена информация о типе пользователя','red');
                }
                return false;
            };
            authFlip.innerHTML = '<img src="'+window.resourcesPatch+'images/enter.png">Кабинет';
        }
    } else {
        authFlip.onclick = showAuth;
        authFlip.innerHTML = '<img src="'+window.resourcesPatch+'images/enter.png">Вход';
    }
}
function init() {
    checkAuth();
}
if (window.attachEvent) {
    window.attachEvent('onresize', resize);
    window.attachEvent('onload', init);
}
else if (window.addEventListener) {
    window.addEventListener('resize', resize, true);
    window.addEventListener('load', init, true);
}
function sendLogin() {
    var user = {'login': document.getElementById('login').value, 'password': document.getElementById('password').value};
    if (user.login === '' || user.password === '')return showMessage('Необходимо ввести все данные', 'red');
    var data = 'method=auth&login=' + encodeURIComponent(user.login) + '&password=' + encodeURIComponent(user.password);
    var xhr = new XMLHttpRequest();
    xhr.open('POST', window.apiUrl.auth||window.apiUrl.default, true);
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    xhr.send(data);
    xhr.onreadystatechange = function () {
        if (this.readyState !== 4) return;
        if (this.status !== 200) {
            // обработать ошибку
            showMessage('ошибка: ' + (this.status ? this.statusText : 'запрос не удался'), 'red');
            return;
        }
        try {
            var response = JSON.parse(this.responseText);
            saveLogin(response);
        } catch (e) {
            throw e;
        }
    }
}
function saveLogin(response) {
    if (response) {
        if (!response['status'])return showMessage(response['message']||'Вы ввели неверный Логин/Пароль', 'red');
        if(response.data)sessionStorage.setItem('login', JSON.stringify(response.data));
        closeReg();
        checkAuth();
        if(window.personalUrl){
            if(response.data.type&&window.personalUrl[response.data.type]){
                location.href=window.personalUrl[response.data.type];
            }
        }
    }
}
function sendReg() {
    var user = {
        'login': document.getElementById('login').value,
        'password': document.getElementById('password').value,
        'email': document.getElementById('email').value,
        'phone': document.getElementById('phone').value
    };
    if (user.login === '' || user.password === '' || user.email === '' || user.phone === '')return showMessage('Необходимо ввести все данные', 'red');
    if (!validateEmail(user.email))return showMessage('Неверно указан e-mail', 'red');
    var data = 'method=reg&login=' + encodeURIComponent(user.login) + '&password=' + encodeURIComponent(user.password) + '&email=' + encodeURIComponent(user.email) + '&phone=' + encodeURIComponent(user.phone);
    var xhr = new XMLHttpRequest();
    xhr.open('POST', window.apiUrl.reg||window.apiUrl.default, true);
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    xhr.send(data);
    xhr.onreadystatechange = function () {
        if (this.readyState !== 4) return;
        if (this.status !== 200) {
            // обработать ошибку
            showMessage('ошибка: ' + (this.status ? this.statusText : 'запрос не удался'), 'red');
            //var response = false;
            return;
        }
        try {
            var response = JSON.parse(this.responseText);
            saveReg(response);
        } catch (e) {
            throw e;
        }
    }
}
function saveReg(response) {
    if (response) {
        if (!response['status'])return showMessage(response['message']||'Не удалось зарегистрировать, попробуйте ввести другие данные', 'red');
        if (response.data)sessionStorage.setItem('login', JSON.stringify(response.data));
        closeReg();
        checkAuth();
        if(window.personalUrl){
            if(response.data.type&&window.personalUrl[response.data.type]){
                location.href=window.personalUrl[response.data.type];
            }
        }
    }
}
function showMessage(text, type) {
    var message = document.createElement('div');
    message.id = 'message';
    message.className = type;
    message.innerHTML = text;
    document.body.appendChild(message);
    setTimeout(function () {
        document.getElementById('message').parentNode.removeChild(document.getElementById('message'));
    }, 5000);
}
function buildFAQ(updated) {
    if (localStorage.getItem('FAQ')) {
        var content = '';
        var list = JSON.parse(localStorage.getItem('FAQ'));
        for (var i in list) {
            content += '<div class="small-info"><div class="name">' + list[i].question + '</div></div>' +
                '<div class="workspace"><section class="page"><p>' + list[i].answer + '</p></section></div>';
        }
        content += '<section class="ask"><h1>Не нашли ответа на свой вопрос?</h1>' +
            '<p>Задайте его нам напрямую, заполнив форму ниже</p>' +
            '<textarea id="question" name="question" placeholder="Ваш вопрос"></textarea>' +
            '<input type="text" name="name" id="name" placeholder="Ваше имя">' +
            '<input type="email" name="email" id="email" placeholder="Ваш e-mail"><br>' +
            '<button class="send-button" onclick="ask();">Отправить</button></section>';
        document.getElementById('main').innerHTML = content;
        if (!updated) loadFAQ();
    } else {
        loadFAQ();
    }
}
function loadFAQ() {
    var data = 'method=getFAQ';
    var xhr = new XMLHttpRequest();
    xhr.open('POST', window.apiUrl.faq||window.apiUrl.default, true); //TODO: window.apiUrl
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    xhr.send(data);
    xhr.onreadystatechange = function () {
        if (this.readyState !== 4) return;
        if (this.status !== 200) {
            // обработать ошибку
            showMessage('ошибка: ' + (this.status ? this.statusText : 'запрос не удался'), 'red');
            locateTo('index.html');
        }
        try {
            var build = false;
            var response = JSON.parse(this.responseText);
            if (!localStorage.getItem('FAQ')) build = true;
            if (localStorage.getItem('FAQ') && JSON.parse(localStorage.getItem('FAQ')) !== response) buildFAQ(true);
            localStorage.setItem('FAQ', JSON.stringify(response));
            if (build) buildFAQ(true);
        } catch (e) {
            showMessage('ошибка: не удалось обработать ответ сервера', 'red');
            locateTo('index.html');
        }
    }
}
function ask() {
    if (window.askRequest)return showMessage('Вы уже создали вопрос, дождитесь его обработки', 'red');
    var request = {
        'question': document.getElementById('question').value,
        'name': document.getElementById('name').value,
        'email': document.getElementById('email').value
    };
    if (request.question === '' || request.name === '' || request.email === '')return showMessage('Необходимо заполнить все поля', 'red');
    if (!validateEmail(request.email))return showMessage('Неверно указан e-mail', 'red');
    var data = 'method=ask&question=' + encodeURIComponent(request.question) + '&email=' + encodeURIComponent(request.email) + '&name=' + encodeURIComponent(request.name);
    var xhr = new XMLHttpRequest();
    xhr.open('POST', window.apiUrl.question||window.apiUrl.default, true); //TODO: window.apiUrl
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    xhr.send(data);
    xhr.onreadystatechange = function () {
        if (this.readyState !== 4) return;
        if (this.status !== 200) {
            // обработать ошибку
            showMessage('ошибка: ' + (this.status ? this.statusText : 'запрос не удался'), 'red');
        }
        try {
            var response = JSON.parse(this.responseText);
            if (!response.status)return showMessage('Не удалось создать вопрос', 'red');
            showMessage('Вопрос успешно создан!', 'green');
            document.getElementById('question').value='';
            document.getElementById('name').value='';
            document.getElementById('email').value='';
        } catch (e) {
            showMessage('ошибка: не удалось обработать ответ сервера', 'red');
            throw e;
        }
    }
}
function closeModal() {
    document.getElementById('modalWrapper').parentNode.removeChild(document.getElementById('modalWrapper'));
}
function openModal(id,inputs,callback) {
    if(!id||!inputs||!callback)return console.log('Параметры указанны неверно');
    showNavBar('hide');
    window.modalWrapper = document.createElement('div');
    modalWrapper.style.position = 'fixed';
    modalWrapper.id = 'modalWrapper';
    modalWrapper.style.width = '100%';
    modalWrapper.style.height = '100%';
    modalWrapper.style.left = '0';
    modalWrapper.style.top = '0';
    modalWrapper.style.backgroundColor = 'rgba(55,55,55,0.8)';
    modalWrapper.style.zIndex = '1000';
    document.body.appendChild(modalWrapper);
    window.modal = document.createElement('div');
    modal.id = id;
    modal.style.position = 'fixed';
    modal.style.width = '400px';
    modal.style.height = '300px';
    modal.style.left = 'calc(50% - 200px)';
    modal.style.top = 'calc(50% - 200px)';
    modal.style.backgroundColor = '#FFF';
    for(var i in inputs){
        var input=inputs[i];
        modal.innerHTML += '<input type="'+input.type+'" id="'+input.id+'" placeholder="'+input.title+'" '+(input.params||'')+'><br>';
    }
    modal.innerHTML+='<button class="modalButton" id="modalButton">Продолжить</button>';
    modalWrapper.appendChild(modal);
    document.getElementById('modalButton').addEventListener('click',callback);
    window.closeBtn = document.createElement('div');
    closeBtn.id = 'close-button';
    closeBtn.style.position = 'absolute';
    closeBtn.style.top = '-20px';
    closeBtn.style.right = '-20px';
    closeBtn.style.borderRadius = '50%';
    closeBtn.style.cursor = 'pointer';
    closeBtn.onclick = closeModal;
    modal.appendChild(closeBtn);
    var lastInput=document.getElementById(id).getElementsByTagName('input');
    lastInput=lastInput[lastInput.length-1];
    lastInput.addEventListener('keypress', function (event) {
        if (event.keyCode === 13) {
            callback();
        }
    });
    document.getElementById(id).getElementsByTagName('input')[0].focus();
}

function locateTo(url) {
    if(!localStorage.getItem('debug'))location.href=url;
}