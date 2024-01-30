const express = require("express")
const app = express()
const handlebars = require("express-handlebars")
const bodyParser = require("body-parser")
const path = require("path")
const fs = require('fs');
const Post = require("./models/Post")

const flash = require("connect-flash")
const session = require("express-session")
const multer = require("multer")
const { get } = require("http")


app.use(express.static("upload"))
app.use(express.static(path.join(__dirname, "public")))
app.engine("handlebars", handlebars.engine({ defaultLayout: "main" }))
app.set("view engine", "handlebars")
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use(flash())

app.use(session({
    secret:"nodejs",
    resave: true,
    saveUninitialized: true
}))
app.use((req,res,next)=>
{
    res.locals.success_msg = req.flash("success_msg")
    res.locals.error_msg = req.flash("error_msg")
    next()
})

app.get("/", (req, res,) => {
    Post.findAll().then((Postagem) => {
        res.render("index", { Postagem: Postagem })
    }).catch(() => {
        req.flash("error_msg","Ouve um erro ao listar o Post-card")
        res.redirect("/cadastrarPost")
    })
})
app.get("/cadastrarPost", (req, res) => {
    res.render("formulario")
})
app.get("/editpost/:id", (req, res) => {
    Post.findOne({where: {'id': req.params.id}}).then((postagem) => {
        res.render("editpost", { postagem: postagem })
    }).catch((err) => {
        req.flash("error_msg","Ouve um erro ao editar o Post-card")
    })
})
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'upload')
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname))
    }
})
const uploads = multer({ storage: storage })

app.post("/Data", uploads.single('image'), (req, res) => {

    Post.create({
        titulo: req.body.titulo,
        descricao: req.body.descricao,
        comentario: req.body.comentario,
        image: req.file.filename
    })  
    .then(() => {
        req.flash("success_msg","Post-card criado com sucesso!")
        res.redirect("/")
    }).catch((err) => {
        req.flash("error_msg","Erro ao cria Post-card, post não cadastrado!")
        res.redirect("/cadastrarPost")
    })
})

app.post("/updatePost/:id", (req, res) => {
 
    Post.findOne({where: {'id': req.params.id}}).then((postagem) => {

        postagem.titulo = req.body.titulo
        postagem.descricao = req.body.descricao
        postagem.comentario = req.body.comentario

            Post.update({
                titulo: req.body.titulo,
                descricao:req.body.descricao,
                comentario:req.body.comentario
            },{where: {'id': req.params.id}}).then(() => {
                req.flash("success_msg","Post-card atualizado com sucesso!")
                console.log("update sucess")
                res.redirect("/")
            }).catch((err) => {
                req.flash("error_msg","Ouve um erro ao atualizar o Post-card")
            })
    })
})
app.get("/deleta/:id", (req, res) => {

    const post = Post.findOne({ where: { 'id': req.params.id } }).then((postagem)=>{
        const imagensDoPost = postagem.image;

        if (imagensDoPost ) {
            const imagePath = path.join(__dirname, "./upload", imagensDoPost);
            if (fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath); 
            }
        };
    })
    Post.destroy({where: {'id': req.params.id}}).then(() => {
        req.flash("success_msg","Post-card deletado com sucesso!")
        res.redirect("/")
        console.log("post sql deleted")
    }).catch((err) => {
        req.flash("error_msg","Ouve um erro ao excluir o Post-card")
    })
})
app.get("/viewpostweb/:id", (req, res) => {
    Post.findOne({where: {'id': req.params.id}}).then((Postagem) => {
        res.render("viewpost", { Postagem: Postagem })
    }).catch((err) => {
        req.flash("error_msg","Ouve um erro ao mostra o Post-card")
    })
})

const PORT = 1010
app.listen(PORT, function () {
    console.log("rodando")
})