# AziFit Studio

Статический сайт на HTML, CSS и JavaScript. Без сборки и зависимостей.

## Версии

| Папка | Назначение |
| --- | --- |
| `public/` | Полная версия для разработки |
| `azifit-full/` | Сохранённая копия полной версии |
| `azifit-demo/` | Прототип для показа заказчику |
| `cloudflare-pages/` | Полная версия для публикации |
| `cloudflare-demo/` | Прототип для публикации |

Папки независимы: изменения между ними автоматически не переносятся.

## Просмотр

Откройте `index.html` в нужной папке или запустите из неё:

```sh
python -m http.server 8080
```

Адрес: http://localhost:8080.

## Публикация

Перетащите `cloudflare-demo/` или `cloudflare-pages/` в Cloudflare Pages Direct Upload. Команды и сборка не нужны.

Для Git-деплоя полной версии: Framework — **None**, Build command — пусто, Output directory — **public**.

## Данные

Цены и контакты полной версии: `public/assets/js/data.js`. После изменений:

```sh
node tools/prepare-static.js
node tools/check-data.js
```

Вопросы перед публикацией — [CONTENT_TODO.md](CONTENT_TODO.md). Проверки и скриншоты — в `tools/`, публиковать их не нужно.
