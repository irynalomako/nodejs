const express = require ('express');
const {userService} = require("./services/user.service");

const app = express (); //створюємо екземпляр експресу - зазвичай називається арр

//налаштування арр:
app.use (express.json()); //перетворює дані від клієнта в джейсон об'єкти, не потрібно постійно парсити
app.use (express.urlencoded ({extended:true})) //для посилання даних з форми
//діставати інформацію можливо через форми, або задаючи path чи query params:
//app.get('/users:name?key=value&key=value', (req, res)) => {
//req.params.name
//req.query
//})

app.post ('/users', async (req, res) => {
    const user = req.body;
    const data = await userService.create(user);
    res.json (data);
});

app.get ('/users', async (req, res) =>{
    const data = await userService.getAll();
    res.json (data);
})
app.get ('/users/:id', async(req, res) => {
    const id = req.params.id;
    const data = await userService.getById(id);
    res.json (data);
})
app.put ('/users/:id', async(req, res) => {
    const user = req.body;
    const id = req.params.id;
    const data = await userService.updateById(id, user);
    res.json (data);
})
app.delete ('/user/:id', async (req, res) => {
    const {id} = req.params;
    await userService.deleteById(id);
    res.end();
})

app.listen(5000);