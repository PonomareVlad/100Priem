'use strict';

if(!window.version)window.version=[];
window.version.push('cabinet',35);

var defaultPage = window.defaultPage||'profile'; // Страница по умолчанию при входе в Панель
var tableStructure = {
    'direction': ['Юриспруденция', 'Жил. Право'],
    'status': ['В разработке', 'Отклонено']
};

function showPage(id) {
    var page = '';
    switch (id) {
        case 'profile': // Страница "Профиль"
            // Содержимое страницы (верстка):
            page = '<h1 class="highlight">Персональные данные</h1>' +
                '<p>Ваше имя: ' + user.name + '</p>' +
                '<p>Ваш персональный телефонный номер: ' + ((!user.phone||user.phone==='')?'Телефон не указан':user.phone) +
                '<button class="highlight-button" onclick="changePhone();">Изменить</button>' +
                '</p>';
            break;
        case 'conversion': // Страница "Обращения с сайта"
            page = genTable(); // Содержимое генерируеться функцией genTable()
            break;
        case 'manager-conversion': // Страница "Обращения с сайта" Для менеджера
            page = '<h1>Кабинет менеджера</h1>'+genTable(true)+'<p class="left-subhead">Города <button onclick="newCity();">Добавить город</button></p><div id="listCity"></div>';
            break;
        case 'money': // Страница "Вывод денег"
            // Содержимое страницы (верстка):
            page = '<h1>Запросить вывод денежных средств</h1>' +
                '<p><label for="yandex">Номер Яндекс кошелька: </label> <input type="number" id="yandex"></p>' +
                '<p><label for="cost">Введите сумму:</label> <input type="number" id="cost" placeholder="' + parseFloat(user.balance) + '"> Руб.</p>' +
                '<p><textarea id="comment" placeholder="Комментарии к операции"></textarea></p>' +
                '<p><button onclick="requestMoney();">Отправить заявку</button></p>';
            break;
    }
    if (document.getElementsByClassName('highlight-menu-button')[0]) document.getElementsByClassName('highlight-menu-button')[0].className = '';
    if(document.getElementById(id + '-link'))document.getElementById(id + '-link').className = 'highlight-menu-button';
    document.getElementById('page').innerHTML = page;
    document.getElementById('user-name').innerHTML = user.name+' ID: '+user.id;
    document.getElementById('user-balance').innerHTML = 'Баланс: ' + parseFloat(user.balance) + ' руб.';
    if(id==='manager-conversion'){document.getElementById('user-balance').style.display='none';buildCityList(true);}
    if(document.getElementsByClassName('highlight-menu-button')[0]) {
        if (!document.getElementsByClassName('highlight-menu-button')[0]['triggered']) {
            window.highlightItem = document.getElementsByClassName('highlight-menu-button')[0];
            highlightItem.triggered = true;
            highlightItem.addEventListener('click', function (e) {
                if (document.body.clientWidth > 924)return hideMenu();
                e.preventDefault();
                if (menuIsActive()) hideMenu(); else showMenu();
            }, false);
        }
    }
    hideMenu();
    if (id === 'conversion'||id==='manager-conversion') sorttableEvent();
}

function genTable(manager) {
    window.tableType=manager;
    var tableSource = '<table id="table" class="sortable"><thead><tr>' +
        // Столбцы в таблице
        '<th>Дата обращения</th>' +
        '<th>Город клиента</th>' +
        '<th>Имя клиента</th>' +
        '<th class="sorttable_nosort">Телефон клиента</th>' +
        '<th>E-mail клиента</th>' +
        '<th>Вопрос</th>' +
        '<th>Направление</th>' +
        '<th>Статус</th>' +
        '<th>Комментарий к статусу</th>' +
        '</tr></thead><tbody>';
    // Обход массива с историей вопросов
    for (var i in user.conversion.table) {
        tableSource += '<tr id="item_' + user.conversion.table[i].id + '">' + genTableItem(user.conversion.table[i]) + '</tr>';
    }

    return tableSource + '</tbody></table>';
}

function genTableItem(item, id) {
    var itemSource = '';
    var date = item.date.split('.');
    date = date[2] + date[1] + date[0];
    var direction = '';
    var directionExist = false;
    for (var i in tableStructure['direction']) {
        if (tableStructure['direction'][i] === item.direction) directionExist = true;
        direction += '<option value="' + tableStructure['direction'][i] + '" ' + (tableStructure['direction'][i] === item.direction ? 'selected="selected"' : '') + '>' + tableStructure['direction'][i] + '</option>';
    }
    if (!directionExist) {
        direction = '<option value="' + item.direction + '">' + item.direction + '</option>' + direction;
    }
    direction = '<select onchange="changeData(\'' + item.id + '\',\'direction\',this.value);">' + direction + '</select>';
    var status = '';
    var statusExist = false;
    for (var i in tableStructure['status']) {
        if (tableStructure['status'][i] === item.status) statusExist = true;
        status += '<option value="' + tableStructure['status'][i] + '" ' + (tableStructure['status'][i] === item.status ? 'selected="selected"' : '') + '>' + tableStructure['status'][i] + '</option>';
    }
    if (!statusExist) {
        status = '<option value="' + item.status + '">' + item.status + '</option>' + status;
    }
    status = '<select onchange="changeData(\'' + item.id + '\',\'status\',this.value);">' + status + '</select>';
    var comment = '<textarea placeholder="Нет комментариев" onchange="changeData(\'' + item.id + '\',\'comment\',this.value);">' + item.comment + '</textarea>';
    // Разметка строки ячейки
    itemSource += '<td sorttable_customkey="' + date + '">' + item.date + '</td>' +
        '<td>' + item.city + '</td>' +
        '<td>' + item.name + '</td>' +
        '<td>' + item.phone + '</td>' +
        '<td>' + item.email + '</td>' +
        '<td>' + item.question + '</td>' +
        '<td sorttable_customkey="' + item.direction + '">' + (window.tableType?direction:item.direction) + '</td>' +
        '<td sorttable_customkey="' + item.status + '">' + (window.tableType?status:item.status) + '</td>' +
        '<td>' + (window.tableType?comment:item.comment) + '</td>';
    if (!id)return itemSource;
    document.getElementById('item_' + id).innerHTML = itemSource;
}

function changeData(id, type, value) {
    for (var i in user.conversion.table) {
        if (user.conversion.table[i].id === id) {
            user.conversion.table[i][type] = value;
            //sendData(id, user.conversion.table[i]);
            var object={'id':id};
            object[type]=value;
            sendData(id, object,type);
            break;
        }
    }
}

function sorttableEvent() {
    sorttable.init();
    Array.prototype.slice.call(document.getElementsByTagName('table')).forEach(function (t) {
        sorttable.makeSortable(t);
    });
}

function loadData() {
    var data = 'method=getData';
    var xhr = new XMLHttpRequest();
    xhr.open('POST', window.apiUrl.cabinetData||window.apiUrl.default, true);
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    xhr.send(data);
    xhr.onreadystatechange = function () {
        if (this.readyState !== 4) return;
        if (this.status !== 200) {
            // обработать ошибку
            showMessage('ошибка: ' + (this.status ? this.statusText : 'запрос не удался'), 'red');
            locateTo('/');
        }
        try {
            var response = JSON.parse(this.responseText);
            Object.assign(user, response);
            sessionStorage.setItem('login', JSON.stringify(user));
            if (!document.getElementsByClassName('highlight-menu-button')[0]) showPage(defaultPage);
        } catch (e) {
            showMessage('ошибка: не удалось обработать ответ сервера', 'red');
            locateTo('/');
            throw e;
        }
    }
}

function loadCityList() {
    var data = 'method=getCityList';
    var xhr = new XMLHttpRequest();
    xhr.open('POST', window.apiUrl.cityList||window.apiUrl.default, true);
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    xhr.send(data);
    xhr.onreadystatechange = function () {
        if (this.readyState !== 4) return;
        if (this.status !== 200) {
            // обработать ошибку
            showMessage('ошибка: ' + (this.status ? this.statusText : 'запрос не удался'), 'red');
            locateTo('/');
        }
        try {
            var response = JSON.parse(this.responseText);
            if (!response.status) return showMessage('Не удалось получить список городов от сервера', 'red');
            window.listCity=response.data;
            buildCityList(true);
        } catch (e) {
            showMessage('ошибка: не удалось обработать ответ сервера', 'red');
            locateTo('/');
            throw e;
        }
    }
}

function buildCityList(rebuild) {
    if(!window.listCity)return;
    var contetnt='';
    for(var i in window.listCity){
        if(window.listCity.hasOwnProperty(i)) contetnt+='<p>'+window.listCity[i].name+'<p/>';
    }
    if(rebuild)document.getElementById('listCity').innerHTML=contetnt;
    return '<div id="listCity">'+contetnt+'</div>';
}

function sendCity() {
    var name=document.getElementById('city-name').value;
    if(!name||name==='')return showMessage('Вы не указали название города','red');
    var multiplier=document.getElementById('city-multiplier').value;
    if(!multiplier||multiplier===''||parseFloat(multiplier)<1)return showMessage('Вы не верно указали коэффициент','red');
    var data = 'method=newCity&name='+encodeURIComponent(name)+'&multiplier='+encodeURIComponent(multiplier);
    var xhr = new XMLHttpRequest();
    xhr.open('POST', window.apiUrl.cityCreate||window.apiUrl.default, true); // TODO: window.apiUrl
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
            if (response.status === true){
                closeModal();
                window.listCity.push({'name':name});
                buildCityList(true);
            }
        } catch (e) {
            showMessage('Ошибка разбора ответа сервера!', 'red');
            throw e;
        }
    }
}

function newCity() {
    openModal('newCity',[{'id':'city-name','title':'Название города','type':'text'},{'id':'city-multiplier','title':'Коэффициент города (минимум 1.0)','type':'number','params':'step="0.01" min="1.0" max="2.0"'}],sendCity);
}

function sendData(id, object, type) {
    if (!object) {
        for (var i in user.conversion.table) {
            if (user.conversion.table[i].id === id) {
                object = user.conversion.table[i];
            }
        }
    }
    var data = 'method=changeData';
    for (var i in object) {
        data += '&' + i + '=' + encodeURIComponent(object[i]);
    }
    var xhr = new XMLHttpRequest();
    var api=type?window.apiUrl['change_'+type]:false;
    api=api||(window.apiUrl.cabinetData||window.apiUrl.default);
    xhr.open('POST', api, true); // TODO: window.apiUrl
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
            if (response.status === true) return saveData(); //saveData(object, response.data);
            if (response.message) return showMessage(response.message, 'red');
        } catch (e) {
            showMessage('Ошибка разбора ответа сервера!', 'red');
            throw e;
        }
    }
}

function saveData(object, response) {
    //genTableItem(response, object.id);
    //Object.assign(object, response);
    sessionStorage.setItem('login', JSON.stringify(user));
    showMessage('Данные успешно сохранены!', 'green');
}
function genMenu() {
    var links = document.getElementById('submenu').getElementsByTagName('a');
    var linksMenu = document.createElement('div');
    linksMenu.id = 'linksMenu';
    for (var i in links) {
        if (links.hasOwnProperty(i)) {
            linksMenu.innerHTML += '<div><a href="' + links[i].href + '">' + links[i].innerText + '</a></div>';
        }
    }
    document.getElementById('submenu').parentNode.insertBefore(linksMenu, document.getElementById('submenu').nextSibling);
    hideMenu();
}
function showMenu() {
    if (document.getElementById('linksMenu')) document.getElementById('linksMenu').style.display = 'block';
}
function hideMenu() {
    if (document.getElementById('linksMenu')) document.getElementById('linksMenu').style.display = 'none';
}

function requestMoney() {
    var request = {
        'yandex': document.getElementById('yandex').value,
        'cost': parseInt(document.getElementById('cost').value),
        'comment': document.getElementById('comment').value
    };
    if (request.yandex.toString().length === 14 && request.cost > 0 && request.cost <= parseInt(user.balance)) {
        var data = 'method=requestMoney&yandex=' + encodeURIComponent(request.yandex) + '&cost=' + encodeURIComponent(request.cost) + '&comment=' + encodeURIComponent(request.comment);
        var xhr = new XMLHttpRequest();
        xhr.open('POST', window.apiUrl.moneyRequest||window.apiUrl.default, true);
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
                if (response.status === true) showMessage('Ваша заявка принята!', 'green');
            } catch (e) {
                showMessage('Ошибка разбора ответа сервера!', 'red');
                throw e;
            }
        }
    } else {
        showMessage('Вы указали неверные данные!', 'red');
    }
}
function changePhone() {
    openModal('changePhone',[{'id':'phone','title':'Ваш новый номер телефона','type':'text'}],sendPhone);
}
function sendPhone() {
    var phone=document.getElementById('phone').value;
    if(!phone||phone==='')return showMessage('Вы не указали номер телефона','red');
    var data = 'method=changePhone&phone='+encodeURIComponent(phone);
    var xhr = new XMLHttpRequest();
    xhr.open('POST', window.apiUrl.phoneChange||window.apiUrl.default, true); // TODO: window.apiUrl
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
            if (response.status === true){
                closeModal();
                window.user.phone=phone;
                sessionStorage.setItem('login', JSON.stringify(user));
                showPage('profile');
            }
        } catch (e) {
            showMessage('Ошибка разбора ответа сервера!', 'red');
            throw e;
        }
    }
}

if (!sessionStorage.getItem('login')) {
    locateTo('/');
}

try {
    if (sessionStorage.getItem('login')) window.user = JSON.parse(sessionStorage.getItem('login')); else logout();
    loadData();
} catch (e) {
    logout();
}