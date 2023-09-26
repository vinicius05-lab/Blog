const express = require("express");
const app = new express();
const bodyParser = require("body-parser");
const connection = require("./database/connect");
const CategoriesController = require("./categories/CategoriesController");
const ArticlesController = require("./articles/ArticlesController");
const UsersController = require("./users/UsersController");
const user = require("./users/user");
const Category = require("./categories/Category");
const Article = require("./articles/Article");
const session = require("express-session");
const porta = 3302;

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use(express.static("public"));
app.use("/", CategoriesController);
app.use("/", ArticlesController);
app.use("/", UsersController);

app.use(session({
    secret: "labtap",
    cookie: {
        maxAge: 60000
    }
}));


connection
    .authenticate().
    then(() => {
        console.log("Conectado com Sucesso ao Banco de Dados");
    }).catch((err) => {
        console.log("Erro: " + err);
    });
    
    app.get("/", (req, res) => {
        Article.findAll({
            order: [["id", "DESC"]],
            limit: 4
        }).then((articles) => {
            Category.findAll().then((categories) => {
                let login = false;
                if(req.session.user != undefined){
                    login = true;
                }
                res.render("index", {
                    articles: articles,
                    categories: categories,
                    login: login
                });
            });
        });
    });
    

app.get("/:slug", (req, res) => {
    const slug = req.params.slug;
    Article.findOne({
        where: {slug: slug}
    }).then((article) => {  
        if(article != undefined){
            Category.findAll().then((categories) => {
                let login = false;
                if(req.session.user != undefined){
                    login = true;
                }
                res.render("article", {
                    article: article,
                    categories: categories,
                    login: login
                });
            });
        }else{
            res.redirect("/");
        }
    }).catch(() => {
        res.redirect("/");
    });
});

app.get("/category/:slug", (req, res) => {
    const slug = req.params.slug;
    Category.findOne({
        where: {slug: slug},
        include: [{model: Article}]
    }).then((category) => {
        if(category != undefined){
            Category.findAll().then((categories) => {
                let login = false;
                if(req.session.user != undefined){
                    login = true;
                }
                res.render("index", {
                    articles: category.articles,
                    categories: categories,
                    login: login
                });
            })
        }else{
            res.redirect("/");
        }
    });
});

app.listen(porta, () => {
    console.log("Servidor rodando na porta: " + porta);
});