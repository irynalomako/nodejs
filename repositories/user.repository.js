//описуються запити до бд
const {read, write} = require("../services/fs.service");


class UserRepository {
    async getAll () {
        return read();

} //повертає виконання функції read з сервісів
    async create (user) {
        const users = await read();
        const newUser = {
            id: users.length ? users[users.length-1].id+1 : 1,
            name: user.name,
            surname: user.surname,
            age:user.age
        }
        users.push(newUser);
        await write(users);
        return newUser
    }
}