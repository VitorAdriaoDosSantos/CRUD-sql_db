const db = require('./db')

const Post = db.sequelize.define('postagens',{
titulo:{
    type:db.Sequelize.STRING
},
descricao:{
    type:db.Sequelize.STRING
},
image:{
    type:db.Sequelize.STRING
},
comentario:{
    type:db.Sequelize.STRING
},
date:{
    type: db.Sequelize.DATE,
    defaultValue: db.Sequelize.literal('CURRENT_TIMESTAMP')
}
}
)

module.exports = Post