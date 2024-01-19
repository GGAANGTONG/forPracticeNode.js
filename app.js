import express from 'express';
import main from './schemas/index.js';
import todosRouter from './routes/todos.router.js';
import errorHandlerMiddleware from './middlewares/error-handler.middleware.js';

const app = express();
const PORT = 5500;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

main();
//static Middleware, express.static()을 사용하여 정적 파일을 제공합니다.
app.use(express.static('./assets'));

const router = express.Router();

router.get('/', (req, res) => {
  return res.json({ message: 'hi!' });
});

app.use('/api', [router, todosRouter]);

app.use(errorHandlerMiddleware);

app.listen(PORT, () => {
  console.log(PORT, '포트로 서버가 열렸어요!');
});
