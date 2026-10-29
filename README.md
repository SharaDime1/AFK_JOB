# AziFit Studio

Статический одностраничный сайт на HTML, CSS и классических deferred JavaScript. Без сборки, зависимостей в продакшене, серверной логики, cookies и хранилища заявок. Сайт не опубликован.

## Открыть

Двойной клик по `public/index.html` или:

```powershell
cd public
python -m http.server 8080 --bind 127.0.0.1
```

Открыть http://127.0.0.1:8080. Python нужен только для локального просмотра; хостинг раздаёт готовые файлы. Manifest подключается только через HTTP/HTTPS, поскольку Chromium блокирует его при file://.

## Структура

- `public/index.html`, `404.html` — страницы.
- `public/assets/css/main.css` — палитра, адаптивная вёрстка, анимации.
- `public/assets/js/data.js` — единственный редактируемый источник данных и UI; `app.js` — интерактив.
- `public/assets/img/og.png`, `favicon.svg`, `site.webmanifest` — графика и метаданные.
- `public/_headers`, `robots.txt`, `sitemap.xml` — Cloudflare/SEO.
- `public/assets/img/README.md`, `public/assets/fonts/README.md` — требования к материалам.
- `tools/check-data.js`, `prepare-static.js`, `browser-check.js`, `create-og.ps1` — проверки и обслуживание. `create-data.py` — первоначальная транскрипция ТЗ, повторный запуск перезаписывает данные.
- `tools/screens/` — снимки на 360, 390, 430, 768, 1024 и 1440 px.
- `CONTENT_TODO.md` — полный реестр вопросов владельцу.

## Изменять данные

Редактировать `window.AZIFIT` в `data.js`: SITE, PRICES, SCHEDULE, TRAINERS, SERVICES и UI. Цены — числа, неизвестная цена — null. У Интенсива есть active, детская гимнастика имеет visible:false. SITE.showPerProcedure по умолчанию false. SITE.hours, SITE.pricesUpdatedAt и SITE.url пустые — соответствующие данные не выдумываются.

После изменений выполнить:

```powershell
node tools/prepare-static.js
node tools/check-data.js
```

`prepare-static.js` обновляет видимый без JavaScript прайс и статические секции из data.js. Значения цен в HTML — сгенерированная копия для progressive enhancement, а не второй источник для ручного редактирования. Это согласует требования единого источника и доступности без JS. При согласованной смене цен обновите независимый эталон check-data.js.

Шаблон заявки и служебные строки помечены COPY-DRAFT. Заявка живёт только в памяти страницы. Ничего не отправляется, пока посетитель сам не нажмёт ссылку мессенджера. Отправка самого сообщения происходит в WhatsApp/Instagram. Копирование Instagram имеет ручной резервный вариант.

## Cloudflare Pages

1. Уточнить CONTENT_TODO.md, особенно цены, единицы, Instagram, формулировки LPG и домен.
2. Задать настоящий HTTPS-домен в SITE.url и запустить `node tools/prepare-static.js`. Сейчас sitemap пустой, canonical не добавляется. Не подставлять вымышленный домен.
3. Подключить репозиторий в Cloudflare Pages: **Framework preset: None**, **Build command: пусто**, **Build output directory: public**, **Root directory: корень проекта**. Либо загрузить содержимое public через Direct Upload.
4. Публиковать только public. `tools/` и `reference/` не публиковать. Публикация требует отдельного разрешения владельца по ТЗ.
5. Проверить HTTPS-домен, заголовки ответа `_headers`, canonical и отображение OG в мессенджерах после публикации. Автоматическое подключение Cloudflare Web Analytics отключить; CSP рассчитан на локальные ресурсы.

## Проверки

```powershell
node --check public/assets/js/data.js
node --check public/assets/js/app.js
node tools/check-data.js
```

Браузерная проверка без npm-зависимостей использует установленный Chrome, Node WebSocket и DevTools. При запущенном HTTP-сервере:

```powershell
Start-Process -FilePath 'C:\Program Files\Google\Chrome\Application\chrome.exe' -ArgumentList '--headless=new','--disable-gpu','--no-first-run','--no-default-browser-check','--remote-debugging-port=9222','--user-data-dir=C:\Users\Shara\Documents\PROJECTS\AFK_JOB\tools\chrome-profile','about:blank' -WindowStyle Hidden
node tools/browser-check.js
```

Тест закрывает запущенный тестовый браузер. Проверяет шесть ширин, переключатели, цены АФК/LPG, заявку, кодирование WhatsApp, Instagram (имитация clipboard и открытия вкладки без сетевой отправки), резервное копирование, историю, Asia/Almaty, меню, фокус, Esc, версию без JS, file://, reduced motion, ошибки ресурсов и внешние запросы. Скриншоты показывают первый экран; вся ширина документа проверяется отдельно.

OG можно пересоздать командой `powershell -NoProfile -ExecutionPolicy Bypass -File tools/create-og.ps1`; используется System.Drawing Windows, без скачивания пакетов.

## Ограничения проверки

Montserrat отсутствует: используется Segoe UI/system-ui, без CDN. Реальных фото и логотипа нет — используются фирменные формы, текстовый логотип и именованные picture-слоты без несуществующих запросов. Lighthouse не установлен: Lighthouse mobile, LCP, CLS и формальное соответствие WCAG AA не проверены. Заголовки Cloudflare и SEO на реальном домене проверяются после разрешённого деплоя. Реальные сообщения не отправлялись.
