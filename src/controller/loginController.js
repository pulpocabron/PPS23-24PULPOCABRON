const bcrypt = require('bcryptjs');// Añade la importación de bcrypt
const connection = require('../conexion');

const getIndex = (req, res) => {
    res.render('index',{ mensaje: '' });
};

const login = (req, res) => {
    const username = req.body.username;
    const password = req.body.contraseña;
    const query = 'SELECT * FROM usuarios WHERE BINARY username = ?';
   
    connection.query(query, [username], (err, results) => {
        if (err) throw err;
        if (results.length > 0) {
            // Verificar si la contraseña coincide utilizando bcrypt.compare()
            bcrypt.compare(password, results[0].contraseña, (err, validPassword) => {
                if (validPassword) {
                    req.session.loggedIn = true; // Establece la sesión como iniciada
                    req.session.username = username; // Guarda el nombre de usuario en la sesión
                    res.redirect('/dashboard'); // Redirige al usuario al panel de control (dashboard)
                } else {
                    res.render('index', { mensaje: 'Contraseña inválida' });
                }
            });
        } else {
            res.render('index', { mensaje: 'Usuario no valido' }); // Redirige al usuario de vuelta al formulario de inicio de sesión con un mensaje de error
        }
    });
};

const logout = (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Error destroying session:', err);
        }
        
        res.redirect('/');
    });
};

const getDashboard = (req, res) => {
    if (req.session.loggedIn) {
     res.render('dashboard', { username: req.session.username });
 } else {
     res.render('error');
 }
 };

 const postRegister = async (req, res) => {
    const { name, apellido, username, password, fecha_nacimiento, phone } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const insertQuery ='INSERT INTO usuarios (nombre, apellido, username, contraseña, fecha_nacimiento, telefono) VALUES (?, ?, ?, ?, ?, ?)';
    const values = [name, apellido, username, hashedPassword, fecha_nacimiento, phone];
    connection.query(insertQuery, values, function(error, results, fields) {
    if (error) {
        console.error('Error al insertar usuario:', error);
        return;
    }
    res.render('index',{ mensaje: 'Usuario registrado' });
    });
};

 const postLogin =(req, res) => {
    const username = req.body.username;
    const password = req.body.contraseña;
    const query = 'SELECT * FROM usuarios WHERE BINARY username = ?';
   
    connection.query(query, [username], (err, results) => {
        if (err) throw err;
        if (results.length > 0) {
            bcrypt.compare(password, results[0].contraseña, (err, validPassword) => {
                if (validPassword) {
                    req.session.loggedIn = true;
                    req.session.username = username;
                    res.redirect('/dashboard');
                } else {
                    res.render('index', { mensaje: 'Contraseña inválida' });
                }
            });
        } else {
            res.render('index', { mensaje: 'Usuario no valido' });
        }
    });
};

const getRegistro = (req, res) => {
    res.render('registro');
};

const getComentarios = (req, res) => {
    res.render('comentarios',{ username: req.session.username });
};

const getError = (req, res) => {
    res.render('error');
};

const getPerfil = (req, res) => {
    const username = req.session.username;
    const mensaje = req.query.mensaje;
    const sql = 'SELECT * FROM usuarios WHERE BINARY username = ?';
    connection.query(sql, [username], (err, results) => {
        if (err) {
            console.error('Error al obtener datos del perfil:', err);
            res.status(500).send('Error al obtener datos del perfil');
            return;
        }
        const usuario = results[0];
        if (results.length > 0) {
            const sqlseguidores = 'SELECT COUNT(*) FROM usuarios u INNER JOIN seguimiento s ON s.seguidor_id = u.id WHERE u.username = ?';
            connection.query(sqlseguidores, [username], (err, results) => {
                if (err) {
                    console.error('Error al obtener datos:', err);
                    res.status(500).send('Error al obtener datos');
                    return;
                }
                const seguidos = results[0]['COUNT(*)'];

                const sqlseguidos = 'SELECT COUNT(*) FROM usuarios u INNER JOIN seguimiento s ON s.seguido_id  = u.id WHERE u.username  = ?';
                connection.query(sqlseguidos, [username], (err, results) => {
                    if (err) {
                        console.error('Error al obtener datos:', err);
                        res.status(500).send('Error al obtener datos');
                        return;
                    }
                    const seguidores = results[0]['COUNT(*)'];
                    res.render('perfil', { username, usuario, seguidos, seguidores, mensaje});
                });
            });
        } else {
            res.status(404).send('Usuario no encontrado');
        }
    });
};

module.exports = {
    getIndex,
    login,
    logout,
    getDashboard,
    postLogin,
    getRegistro,
    getComentarios,
    postRegister,
    getError,
    getPerfil
};
