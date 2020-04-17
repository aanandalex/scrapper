const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');
const bodyParser = require('body-parser');
var moment = require('moment');
const app = express();
app.set('view engine', 'ejs');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
const port = 3000;

var topStoriesLink = [];



//DataBase Connection//
mongoose.connect('mongodb://anand:unicornb1331@cluster0-shard-00-00-0tquo.mongodb.net:27017,cluster0-shard-00-01-0tquo.mongodb.net:27017,cluster0-shard-00-02-0tquo.mongodb.net:27017/reutersTopNews?ssl=true&replicaSet=Cluster0-shard-0&authSource=admin&retryWrites=true&w=majority', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true
}).then(() => {
    console.log("Connected to DataBase");
})
.catch((error) => {
    console.log(error);
    console.log("Connection Failed!!!");
});

// mongoose.connect("mongodb+srv://anand:unicornb1331@cluster0-0tquo.mongodb.net/reutersIndiaDB", {
//     useNewUrlParser: true,
//     useUnifiedTopology: true,
//     useCreateIndex: true
// })
//     .then(() => {
//         console.log("Connected to DataBase");
//     })
//     .catch((error) => {
//         console.log(error);
//         console.log("Connection Failed!!!");
//     });
//Database connection ends here//

//database schema//
const newsSchema = mongoose.Schema({
    date: {
        type: String,
    },
    link: {
        type: String,
        required: true,
        unique: true
    },
    heading: {
        type: String
    },
    article: [{
        type: String
    }],
    imageUrl: {
        type: String
    }
});
//database schema ends here

//unique validator
newsSchema.plugin(uniqueValidator);

//news collection 
var newsCollection = mongoose.model("topnewscollections", newsSchema);

function refresh() {
    console.log('updated at ' + moment(new Date()).format('hh:mm A'));
    axios.get('https://in.reuters.com/news/top-news')
  .then(function (response) {
      console.log(response.status);
    if (response.status == 200) {
        const $ = cheerio.load(response.data);
        const links = [];
        $('.news-headline-list a').each((i,li) => {
            links[i] = $(li).attr('href');
        });
        storyLinks = Array.from(new Set(links));
        topStoriesLink = storyLinks;
    } else {
        console.log(response.data);
        console.log(response.status);
        console.log(response.statusText);
        console.log(response.headers);
        console.log(response.config);
    }
  })
  .catch(function (error) {
    if (error.response) {
        console.log(error.response.data);
        console.log(error.response.status);
        console.log(error.response.headers);
      } else if (error.request) {
        console.log(error.request);
      } else {
        console.log('Error', error.message);
      }
      console.log(error.config);
  });

    setTimeout(() => {
        topStoriesLink.forEach((link) => {
        getEachStory(link);
        });
    }, 5000);
}

setInterval(() => {
   refresh(); 
}, 150000);

function getEachStory(link) {
    axios.get('https://in.reuters.com' + link)
    .then((response) => {
        if (response.status == 200) {
            const $ = cheerio.load(response.data);
            const article = [];
            $('.StandardArticleBody_body p').each((i,el) => {
                article[i] = $(el).text();
            });
            if ($('.LazyImage_container img').attr('src') == undefined) {
                image = null;
            } else {
                image = $('.LazyImage_container img').attr('src');
                image = image.substring(0, image.length - 3);
            }
            
                const newsBody = {
                    "link": link,
                    "heading": $('.ArticleHeader_headline').text(),
                    "article": article,
                    "imageUrl": image
                };
            toCheckLinkInDB(newsBody);
        }
    })
    .catch((error) => {
        if (error.response) {
            console.log(error.response.data);
            console.log(error.response.status);
            console.log(error.response.headers);
          } else if (error.request) {
            console.log(error.request);
          } else {
            console.log('Error', error.message);
          }
          console.log(error.config);
      });
}

function toSaveNewsToDB(newsObject) {
    const news = new newsCollection({
        date: moment(new Date()).format("DD/MM/YYYY"),
        link: newsObject.link,
        heading: newsObject.heading,
        article: newsObject.article,
        imageUrl: newsObject.imageUrl
    });

    news.save().then(() => {
        console.log('saved successfully');
    }).catch((error) => {
        console.log('error in saving', error);
    });
}

function toCheckLinkInDB(newsBody) {
    newsCollection.find({link: newsBody.link})
    .then((resp) => {
        if (resp.length == 1) {
            console.log('link already exsists');
        } else {
            toSaveNewsToDB(newsBody);
        }
    })
    .catch((error) => {
        console.log(error);
    })
}

//webside
app.listen(port, () => console.log(`app listening at http://localhost:${port}`))

app.get('/', function (req, res) {
    newsCollection.find({date: moment(new Date()).format("DD/MM/YYYY")}).sort({ _id: -1 })
    .then((resp) => {
        console.log(resp.length);
        //res.render('index', { title: 'Reuters', news: resp });
        res.render('news', {title: 'Reuters', news: resp});
    })
    .catch((error) => {
        console.log(error);
    });
  });
//webside ends here