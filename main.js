const express = require ('express');

const app = express (); //створюємо екземпляр експресу - зазвичай називається арр

//налаштування арр:
app.use (express.json()); //перетворює дані від клієнта в джейсон об'єкти, не потрібно постійно парсити
app.use (express.urlencoded ({extended:true})) //для посилання даних з форми
//діставати інформацію можливо через форми, або задаючи path чи query params:
//app.get('/users:name?key=value&key=value', (req, res)) => {
//req.params.name
//req.query
//})