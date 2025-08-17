const form = document.getElementById('chat-form');
const messageInput = document.getElementById('message-input');
const messages = document.getElementById('messages');

form.addEventListener('submit', (e) => {
    e.preventDefault();

    const message = messageInput.value;
    if (message.trim() === '') return;

    const messageElement = document.createElement('div');
    messageElement.textContent = message;
    messages.appendChild(messageElement);

    // Добавление класса для анимации
    messageElement.classList.add('new-message');

    // Удаление класса после завершения анимации
    setTimeout(() => {
        messageElement.classList.remove('new-message');
    }, 300);

    messageInput.value = '';
    messages.scrollTop = messages.scrollHeight;
});
// Добавлен функционал для удаления всех сообщений
const clearButton = document.createElement('button');
clearButton.textContent = 'Clear Chat';
clearButton.style.marginTop = '10px';
clearButton.style.backgroundColor = '#ff1744';
clearButton.style.color = '#ffffff';
clearButton.style.border = 'none';
clearButton.style.padding = '0.5rem 1rem';
clearButton.style.cursor = 'pointer';
clearButton.style.borderRadius = '4px';

clearButton.addEventListener('click', () => {
    messages.innerHTML = '';
});

document.querySelector('.chat-container main').appendChild(clearButton);
// Функционал для переключения вкладок
const chatTab = document.getElementById('chat-tab');
const mediaTab = document.getElementById('media-tab');
const settingsTab = document.getElementById('settings-tab');
const chatContainer = document.querySelector('.chat-container');
const mediaContainer = document.getElementById('media');
const settingsContainer = document.getElementById('settings');

chatTab.addEventListener('click', () => {
    chatContainer.classList.remove('hidden');
    mediaContainer.classList.add('hidden');
    settingsContainer.classList.add('hidden');
});

mediaTab.addEventListener('click', () => {
    chatContainer.classList.add('hidden');
    mediaContainer.classList.remove('hidden');
    settingsContainer.classList.add('hidden');
});

settingsTab.addEventListener('click', () => {
    chatContainer.classList.add('hidden');
    mediaContainer.classList.add('hidden');
    settingsContainer.classList.remove('hidden');
});

// Функционал для изменения темы
const themeSelect = document.getElementById('theme-select');
themeSelect.addEventListener('change', (e) => {
    if (e.target.value === 'light') {
        document.body.style.backgroundColor = '#ffffff';
        document.body.style.color = '#000000';
    } else {
        document.body.style.backgroundColor = '#121212';
        document.body.style.color = '#ffffff';
    }
});
// Улучшения и расширенный функционал для чата

// Вспомогательные функции
const STORAGE_KEY = 'chat_messages_v1';
const THEME_KEY = 'chat_theme_v1';

function uid() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 9);
}

function formatTime(ts) {
    const d = new Date(ts);
    return d.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'});
}

function saveMessagesToStorage() {
    const items = Array.from(messages.children).map(el => ({
        id: el.dataset.id || null,
        text: el.querySelector('.message-text') ? el.querySelector('.message-text').innerText : el.innerText,
        time: el.dataset.time || Date.now()
    })).filter(Boolean);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

function loadMessagesFromStorage() {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    try {
        const items = JSON.parse(raw);
        items.forEach(item => {
            const el = document.createElement('div');
            el.dataset.id = item.id || uid();
            el.dataset.time = item.time || Date.now();
            el.classList.add('restored-message');
            el.textContent = item.text;
            messages.appendChild(el);
        });
        // Прокрутить к последнему
        messages.scrollTop = messages.scrollHeight;
    } catch (e) {
        console.warn('Не удалось загрузить сообщения:', e);
    }
}

// Улучшение одного DOM-элемента сообщения: добавление времени, кнопок, id
function enhanceMessageElement(el) {
    if (!(el instanceof HTMLElement)) return;
    if (el.dataset.enhanced === '1') return;
    el.dataset.enhanced = '1';
    // Ensure id/time
    if (!el.dataset.id) el.dataset.id = uid();
    if (!el.dataset.time) el.dataset.time = Date.now();

    // сохранить сырой текст
    const rawText = el.textContent || '';

    // Очистить элемент и построить структуру
    el.innerHTML = '';
    el.classList.add('message-item');
    el.style.position = 'relative';
    el.style.padding = '0.4rem 0.6rem';
    el.style.margin = '0.35rem 0';
    el.style.borderRadius = '6px';
    el.style.background = 'rgba(255,255,255,0.03)';

    const textDiv = document.createElement('div');
    textDiv.className = 'message-text';
    textDiv.textContent = rawText;
    textDiv.style.whiteSpace = 'pre-wrap';
    el.appendChild(textDiv);

    const meta = document.createElement('div');
    meta.className = 'message-meta';
    meta.style.display = 'flex';
    meta.style.gap = '0.5rem';
    meta.style.alignItems = 'center';
    meta.style.marginTop = '0.25rem';
    meta.style.fontSize = '0.75rem';
    meta.style.opacity = '0.8';

    const timeSpan = document.createElement('span');
    timeSpan.className = 'message-time';
    timeSpan.textContent = formatTime(parseInt(el.dataset.time, 10));
    meta.appendChild(timeSpan);

    // actions container
    const actions = document.createElement('span');
    actions.style.marginLeft = 'auto';
    actions.style.display = 'inline-flex';
    actions.style.gap = '0.25rem';

    const copyBtn = document.createElement('button');
    copyBtn.type = 'button';
    copyBtn.title = 'Copy';
    copyBtn.textContent = '📋';
    copyBtn.style.cursor = 'pointer';
    copyBtn.style.border = 'none';
    copyBtn.style.background = 'transparent';
    copyBtn.style.padding = '0 0.25rem';

    const delBtn = document.createElement('button');
    delBtn.type = 'button';
    delBtn.title = 'Delete';
    delBtn.textContent = '🗑️';
    delBtn.style.cursor = 'pointer';
    delBtn.style.border = 'none';
    delBtn.style.background = 'transparent';
    delBtn.style.padding = '0 0.25rem';

    actions.appendChild(copyBtn);
    actions.appendChild(delBtn);
    meta.appendChild(actions);

    el.appendChild(meta);

    // Animations and handlers
    el.style.transition = 'opacity 220ms ease, transform 220ms ease';
    el.style.transform = 'translateY(0)';
    el.style.opacity = '1';

    copyBtn.addEventListener('click', async () => {
        try {
            await navigator.clipboard.writeText(textDiv.innerText);
            copyBtn.textContent = '✅';
            setTimeout(() => (copyBtn.textContent = '📋'), 900);
        } catch {
            copyBtn.textContent = '❌';
            setTimeout(() => (copyBtn.textContent = '📋'), 900);
        }
    });

    delBtn.addEventListener('click', () => {
        // плавно скрыть и удалить
        el.style.opacity = '0';
        el.style.transform = 'translateX(10px)';
        setTimeout(() => {
            if (el.parentElement) el.parentElement.removeChild(el);
            saveMessagesToStorage();
        }, 220);
    });
}

// Наблюдатель за добавлением новых сообщений (чтобы "улучшить" их)
const observer = new MutationObserver(muts => {
    muts.forEach(m => {
        m.addedNodes.forEach(n => {
            if (n.nodeType !== 1) return;
            enhanceMessageElement(n);
        });
    });
    // Автосохранение после небольшого таймаута (группируем изменения)
    clearTimeout(observer._saveTimeout);
    observer._saveTimeout = setTimeout(saveMessagesToStorage, 150);
});
observer.observe(messages, {childList: true});

// Подгрузить ранее сохранённые сообщения и применить enhancement
loadMessagesFromStorage();
Array.from(messages.children).forEach(el => enhanceMessageElement(el));
saveMessagesToStorage();

// Расширенный обработчик очистки: спросить подтверждение и обновить хранилище
if (typeof clearButton !== 'undefined') {
    clearButton.addEventListener('click', (e) => {
        // Предотвратить существующие обработчики, которые просто чистят DOM без подтверждения
        e.preventDefault();
        e.stopImmediatePropagation && e.stopImmediatePropagation();

        if (!confirm('Удалить все сообщения? Это действие нельзя отменить.')) return;
        messages.querySelectorAll('.message-item').forEach(el => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(-6px)';
        });
        setTimeout(() => {
            messages.innerHTML = '';
            saveMessagesToStorage();
        }, 220);
    }, true);
}

// Если форма/обработчик отправки из исходного кода добавляет сообщение,
// мы хотим, чтобы оно также сохранялось и обрабатывалось. Новые сообщения будут
// подхвачены MutationObserver'ом. Но чтобы сохранить мгновенно, слушаем submit тоже.
form.addEventListener('submit', () => {
    // Откладываем чтобы MutationObserver успел создать элемент
    setTimeout(() => {
        Array.from(messages.children).forEach(el => enhanceMessageElement(el));
        saveMessagesToStorage();
        messages.scrollTop = messages.scrollHeight;
    }, 40);
});

// Поддержка Enter для отправки и Shift+Enter для новой строки (если textarea)
messageInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        // Если input (не textarea), просто сабмит формы — форма уже слушается
        const tag = e.target.tagName.toLowerCase();
        if (tag === 'textarea' || tag === 'input') {
            e.preventDefault();
            form.requestSubmit?.() || form.dispatchEvent(new Event('submit', {cancelable: true}));
        }
    }
});

// Клавиши быстрого доступа
document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        messageInput.focus();
        messageInput.select?.();
    }
});

// Ограничение: макс символов в одном сообщении
messageInput.addEventListener('input', (e) => {
    const MAX = 5000;
    if (e.target.value.length > MAX) {
        e.target.value = e.target.value.slice(0, MAX);
        // Небольшой визуальный фидбек
        e.target.style.borderColor = '#ff1744';
        setTimeout(() => e.target.style.borderColor = '', 600);
    }
});

// Экспорт/импорт чата
const toolsWrap = document.createElement('div');
toolsWrap.style.display = 'flex';
toolsWrap.style.gap = '0.5rem';
toolsWrap.style.marginTop = '10px';

const exportBtn = document.createElement('button');
exportBtn.type = 'button';
exportBtn.textContent = 'Export';
exportBtn.style.padding = '0.4rem 0.6rem';

const importBtn = document.createElement('button');
importBtn.type = 'button';
importBtn.textContent = 'Import';
importBtn.style.padding = '0.4rem 0.6rem';

toolsWrap.appendChild(exportBtn);
toolsWrap.appendChild(importBtn);

document.querySelector('.chat-container main').appendChild(toolsWrap);

exportBtn.addEventListener('click', () => {
    const data = localStorage.getItem(STORAGE_KEY) || '[]';
    const blob = new Blob([data], {type: 'application/json;charset=utf-8'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chat-export-${new Date().toISOString()}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
});

importBtn.addEventListener('click', () => {
    const txt = prompt('Вставьте JSON и нажмите OK (перезапишет текущий чат):');
    if (!txt) return;
    try {
        const parsed = JSON.parse(txt);
        if (!Array.isArray(parsed)) throw new Error('Ожидался массив сообщений');
        // Очистить и загрузить
        messages.innerHTML = '';
        parsed.forEach(item => {
            const el = document.createElement('div');
            el.dataset.id = item.id || uid();
            el.dataset.time = item.time || Date.now();
            el.textContent = item.text || '';
            messages.appendChild(el);
        });
        Array.from(messages.children).forEach(el => enhanceMessageElement(el));
        saveMessagesToStorage();
    } catch (err) {
        alert('Не удалось импортировать: ' + err.message);
    }
});

// Тема: применить сохранённую тему при загрузке и сохранять выбор
function applyTheme(name) {
    if (name === 'light') {
        document.body.style.backgroundColor = '#ffffff';
        document.body.style.color = '#000000';
    } else {
        document.body.style.backgroundColor = '#121212';
        document.body.style.color = '#ffffff';
    }
    localStorage.setItem(THEME_KEY, name);
}

// Инициализация темы из storage
const savedTheme = localStorage.getItem(THEME_KEY);
if (savedTheme) {
    applyTheme(savedTheme);
    if (themeSelect) themeSelect.value = savedTheme;
}

// Слушатель для селекта темы — расширяем существующий (если есть)
if (themeSelect) {
    themeSelect.addEventListener('change', (e) => {
        applyTheme(e.target.value);
    });
}

// Ограничение на количество сообщений в хранилище (чтобы не расти бесконечно)
function enforceMessageLimit(limit = 500) {
    const items = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    if (items.length <= limit) return;
    const trimmed = items.slice(-limit);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
}
setInterval(() => {
    enforceMessageLimit(800);
}, 30_000);

// Небольшая гарантия: перед выгрузкой страницы сохраняем состояние
window.addEventListener('beforeunload', () => {
    saveMessagesToStorage();
});