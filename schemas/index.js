import mongoose from 'mongoose';

main().catch((err) => console.log(err));

async function main() {
  await mongoose
    .connect(
      'mongodb+srv://sparta-user:tksqnr111@express-mongo.x3m1uh5.mongodb.net/?retryWrites=true&w=majority',
      { dbName: 'todo_memo' }
    )
    .then(() => {
      console.log('MongoDB 연결에 성공했습니다.');
    })
    .catch((err) => console.err(`MongoDB 연결에  실패하였습니다. ${err}`));

  mongoose.connection.on('error', (err) => {
    console.error('MongoDB 연결 에러', err);
  }); // 서비스 중 에러 발생 시
}

export default main;
