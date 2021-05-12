const http = require('http');
const express = require('express');// requisicoes via framework
const app = express();
const path = require('path')

var bodyParser = require('body-parser'); //modulo para receber parametros no body
app.use(bodyParser.json()); // suporte corpos codificados json
app.use(bodyParser.urlencoded({ extended: true })); // suporte corpos codificados


const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/persons');

const Schema = mongoose.Schema;

const persons = new Schema({

    name: {
        type: String,
        required: [true, "Nome Obrigatório"]

    },
    number: {
        type: String,
        required: [true, "Numero Obrigatório"]

    }
});

const Name = mongoose.model("name", persons);
//var name1 = new Name({name: 'teste', number: 'test2'});
//name1.save()

//mongoose.connect('mongodb://localhost:27017/persons');//conectar

/* APP express 
O Roteamento refere-se à definição de terminais do aplicativo (URIs) 
e como eles respondem às solicitações do cliente.
Para obter uma introdução a roteamento
*/


app.set('views', path.join(__dirname, 'views'));
//app.set('view engine', 'hbs');
/*O uso de hbs como o mecanismo de exibição padrão requer apenas uma linha de código 
na configuração do aplicativo. Isso renderizará os .hbs arquivos quando res.render for chamado*/
app.set('view engine','html'); //aqui irei usar exibicao com html
app.engine('html',require('hbs').__express);// transfiro a exibicao hbs para html

app.use(express.static(path.join(__dirname, 'public'))); //usamos esta linha para ler arquivo static, imagem, css, javascript



app.get('/', (req, res)=> {//Solicitação GET para a página inicial
   res.render('persons');
    
})

app.get('/persons', (req, res)=>{//retorna json para chamar ajax

    var filtro=req.param("filtro");
    //filtro = '/'+ filtro+'/';
    var inicio = req.param("inicio");
    var s = (inicio-1)*5;
    if(s<0){
        s=0;
    }

   // Name.find({'name':{'$regex': filtro, '$options': '1'}}).then(function(name){ //like no banco
      //  res.send(name);

        Name.find({'name':{ '$regex' : filtro, '$options':'i'}}).skip(s).limit(5).then(function (name) {
            Name.find({'name':{ '$regex' : filtro, '$options':'i'}}).count().then(function(valortotal){
                var info = {
                    name:name,
                    valor:valortotal
                }
                res.send(info);
            });
    })

})


app.get('/buscando', (req, res)=>{
    res.render('index');
})
app.get('/buscandocadastro', (req, res)=>{
    res.render('persons');
})
/*app.get('/buscar', (req, res)=>{
    res.render('index');
})*/

app.post('/confirmar', (req, res)=>{
    var name = req.body.name;
    var number = req.body.number;
    var name1 = new Name({name:name, number:number});
    name1.save();
    
    res.send('OK');
    
})

app.post('/excluir',(req,res)=>{
    var _id = req.body.id;
    Name.findByIdAndRemove(_id).exec();
    res.send('OK');


    
})

app.get('/atualizar', (req, res)=>{
    var id=req.param("id")
    Name.findById(id).then(function(name){
        res.render('atualizar', {name:name});
    })
    
})

app.put('/confirmaralteracao', (req, res)=>{
    var _id = req.body.id;

    var name = {
        name:req.body.name,
        number:req.body.number,
        
    }
    Name.update({_id:_id},{$set: name},function(){
        res.send('OK');
    });

    /*
  Name.findByIdAndUpdate(id,name);
  name1.save();
  res.send('OK');
*/
  
})





http.createServer(app).listen(3000);