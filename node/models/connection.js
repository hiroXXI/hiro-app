const mongoose = require('mongoose');

module.exports.dbConnection = () => {
  if(process.env.NODE_ENV === 'production') {
    mongoose
    .connect(`mongodb://${process.env.DBUSER}:${process.env.DBPASSWORD}@${process.env.DBHOST}/?tls=true&tlsCAFile=global-bundle.pem&replicaSet=rs0&readPreference=secondaryPreferred&retryWrites=false`,
    {
      tlsCAFile: 'global-bundle.pem'
    })
    .then(() => {
      console.log('コネクションOK!!!');
    })
    .catch((err) => {
      console.log('接続に失敗しました！！！！！！！');
      console.log(err);
    });
  } else {
    mongoose
    .connect('mongodb://mongo:27017/express')
    .then(() => {
      console.log('コネクションOK!!!');
    })
    .catch((err) => {
      console.log('接続に失敗しました！！！！！！！');
      console.log(err);
    });
  };
};
