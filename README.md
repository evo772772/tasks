### Конфигурация
- /web/config.js
- /api/config/index.js
- /api/pm2.config.js
пример конфигурации в одноименых .origin файлах
так же скопировать настройки nginx из файла nginx.conf.origin

### Установка зависимостей
npm i webpack -g
npm i pm2 -g
в директориях web и api выполнить: npm i

### Запуск
в директории web: npm run build
в директории api: node index.js

### Запуск в режиме watch
в директории web: npm run watch
в директории api: pm2 start pm2.config.js
Подробнее про [pm2](https://pm2.keymetrics.io/ "pm2")
