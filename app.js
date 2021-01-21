//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const date = require(__dirname + "/date.js");
const _ = require("lodash");

const app = express();



app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));
mongoose.connect("mongodb+srv://admin-dev:devr2gud@cluster0.jldj9.mongodb.net/todolistDB?retryWrites=true&w=majority", {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// DeprecationWarning: Mongoose: findOneAndUpdate() and findOneAndDelete() without the useFindAndModify option set to false are deprecated.
mongoose.set('useFindAndModify', false);

const itemsSchema = new mongoose.Schema({
  name: String
});

const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({
  name: "Click + to Add todolist"
});

const item2 = new Item({
  name: "<-- check this to delete todolist"
});

const item3 = new Item({
  name: "for custom name todolist simply add /<name> to the url"
});





const defaultItems = [item1, item2, item3];
const items = [];
const workItems = [];

const listSchema= new mongoose.Schema({
  name:String,
  item:[itemsSchema]


})

const List=mongoose.model("List",listSchema);

app.get("/", function(req, res) {

  const day = date.getDate();
  Item.find({}, function(err, items) {
    if (items.length === 0) {
      Item.insertMany(defaultItems, function(err) {
        if (err) {
          console.log(err);
        } else {
          res.redirect("/");
        }
      });
    } else {

      res.render("list", {
        listTitle: day,
        newListItems: items
      });
    }
  });
});



app.post("/", function(req, res) {
  const itemName = req.body.newItem;
  const listName = req.body.list;
    const day = date.getDate();

  const itemList=new Item({
    name:itemName
  });


  if(listName === day){
      itemList.save();
    res.redirect("/");
  } else {
    List.findOne({name:listName},function(err,foundList){
      //item is from listSchema
      foundList.item.push(itemList);
      foundList.save();
      res.redirect("/"+listName)
    })
  }

});

app.post("/delete",function(req,res){
  const checkedItemId=req.body.checkbox;
  const listName=req.body.listName;
  const day=date.getDate();

  if(listName===day){
    Item.findByIdAndRemove(checkedItemId,function(err){
      if(err){
        console.log(err);
      } else {
        res.redirect("/");
      }
    })
  } else{  List.findOneAndUpdate({name : listName},{$pull : {item : {_id : checkedItemId}}},function(err,foundList){
    if(!err){
      res.redirect("/"+listName);
    }
  });
}
});

app.get("/:customListName",function(req,res){
  const listName=_.capitalize(req.params.customListName);

List.findOne({name:listName},function(err,foundList){
  if(!err){
    if(!foundList){
    //create new list
    const list=new List({
      name:listName,
      item:defaultItems
    });
    list.save();
    res.redirect("/"+listName);
        } else{
//show existing list
res.render("list", {
  listTitle: foundList.name,
  newListItems: foundList.item
});


    }
  }
});

})

app.get("/about", function(req, res) {
  res.render("about");
});


let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

app.listen(port, function() {
  console.log("Server started successfully");
});
// https://git.heroku.com/sleepy-scrubland-00890.git
